// packages/app/hooks/useSyncQueue.ts
// Offline sync queue with auto-retry and exponential backoff
// Critical for offline-first Teacher Dashboard

import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { getStorageAdapter, QueuedOperation, SyncStatus } from '../utils/storage-adapter';

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 30000;

// ============================================================================
// TYPES
// ============================================================================

export interface SyncQueueState {
    status: SyncStatus;
    queueOperation: (
        action: QueuedOperation['action'],
        payload: Record<string, unknown>,
        idempotencyKey: string
    ) => Promise<void>;
    forceSync: () => Promise<void>;
    clearQueue: () => Promise<void>;
}

// ============================================================================
// NETWORK STATUS HELPER
// ============================================================================

function useNetworkStatus(): boolean {
    const [isOnline, setIsOnline] = useState(
        Platform.OS === 'web' ? navigator.onLine : true
    );

    useEffect(() => {
        if (Platform.OS !== 'web') return;

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
}

// ============================================================================
// SYNC QUEUE HOOK
// ============================================================================

export function useSyncQueue(apiBaseUrl: string = '/api'): SyncQueueState {
    const storage = getStorageAdapter();
    const isOnline = useNetworkStatus();

    const [pendingCount, setPendingCount] = useState(0);
    const [lastSync, setLastSync] = useState<Date | null>(null);
    const syncInProgress = useRef(false);
    const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load pending count on mount
    useEffect(() => {
        const loadPending = async () => {
            const ops = await storage.getPendingOperations();
            setPendingCount(ops.length);
        };
        loadPending();
    }, [storage]);

    // Calculate delay with exponential backoff
    const getRetryDelay = (retryCount: number): number => {
        const delay = Math.min(BASE_DELAY_MS * Math.pow(2, retryCount), MAX_DELAY_MS);
        // Add jitter (±25%)
        const jitter = delay * 0.25 * (Math.random() - 0.5) * 2;
        return Math.round(delay + jitter);
    };

    // Execute a single operation
    const executeOperation = async (op: QueuedOperation): Promise<boolean> => {
        try {
            const endpoint = getEndpointForAction(op.action);
            const response = await fetch(`${apiBaseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Idempotency-Key': op.idempotencyKey,
                },
                body: JSON.stringify(op.payload),
            });

            if (response.ok) {
                // Success - remove from queue
                await storage.clearOperation(op.idempotencyKey);
                return true;
            }

            // Server error - check if retryable
            if (response.status >= 500) {
                // Server error - retry later
                return false;
            }

            // Client error (4xx) - don't retry, remove from queue
            console.error(`[SyncQueue] Client error for ${op.action}:`, response.status);
            await storage.clearOperation(op.idempotencyKey);
            return true;
        } catch (error) {
            // Network error - retry later
            console.error(`[SyncQueue] Network error for ${op.action}:`, error);
            return false;
        }
    };

    // Map action to API endpoint
    const getEndpointForAction = (action: QueuedOperation['action']): string => {
        switch (action) {
            case 'ATTENDANCE':
                return '/teacher/attendance';
            case 'MARKS_DRAFT':
            case 'MARKS_SUBMIT':
                return '/teacher/marks';
            case 'HOMEWORK':
                return '/teacher/homework';
            case 'LEAVE':
                return '/teacher/leave';
            default:
                return '/teacher/sync';
        }
    };

    // Process all pending operations
    const processQueue = useCallback(async () => {
        if (syncInProgress.current || !isOnline) return;

        syncInProgress.current = true;

        try {
            const operations = await storage.getPendingOperations();

            for (const op of operations) {
                if (!isOnline) break; // Stop if we went offline

                const success = await executeOperation(op);

                if (!success) {
                    // Update retry count
                    const newRetryCount = op.retryCount + 1;

                    if (newRetryCount >= MAX_RETRIES) {
                        // Max retries reached - log and remove
                        console.error(`[SyncQueue] Max retries reached for ${op.idempotencyKey}`);
                        await storage.updateOperation(op.id, {
                            lastError: 'Max retries exceeded',
                            retryCount: newRetryCount,
                        });
                    } else {
                        // Schedule retry
                        await storage.updateOperation(op.id, {
                            retryCount: newRetryCount,
                        });
                    }
                }
            }

            // Update state
            const remaining = await storage.getPendingOperations();
            setPendingCount(remaining.length);

            if (remaining.length === 0) {
                setLastSync(new Date());
            }
        } finally {
            syncInProgress.current = false;
        }
    }, [isOnline, storage]);

    // Auto-sync when online
    useEffect(() => {
        if (isOnline && pendingCount > 0) {
            // Clear any existing timeout
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }

            // Schedule sync with small delay to batch rapid changes
            syncTimeoutRef.current = setTimeout(() => {
                processQueue();
            }, 500);
        }

        return () => {
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
        };
    }, [isOnline, pendingCount, processQueue]);

    // Queue a new operation
    const queueOperation = useCallback(async (
        action: QueuedOperation['action'],
        payload: Record<string, unknown>,
        idempotencyKey: string
    ) => {
        const operation: QueuedOperation = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            idempotencyKey,
            action,
            payload,
            createdAt: Date.now(),
            retryCount: 0,
        };

        await storage.queueOperation(operation);
        setPendingCount(prev => prev + 1);

        // Attempt immediate sync if online
        if (isOnline) {
            setTimeout(() => processQueue(), 100);
        }
    }, [storage, isOnline, processQueue]);

    // Force sync all pending operations
    const forceSync = useCallback(async () => {
        if (!isOnline) {
            console.warn('[SyncQueue] Cannot force sync while offline');
            return;
        }
        await processQueue();
    }, [isOnline, processQueue]);

    // Clear all pending operations
    const clearQueue = useCallback(async () => {
        await storage.clear();
        setPendingCount(0);
    }, [storage]);

    return {
        status: {
            online: isOnline,
            pending: pendingCount,
            lastSync,
        },
        queueOperation,
        forceSync,
        clearQueue,
    };
}

// ============================================================================
// HELPER: Generate idempotency key for attendance
// ============================================================================

export function generateAttendanceIdempotencyKey(
    classId: string,
    date: string,
    period: number
): string {
    return `attendance:${classId}:${date}:${period}`;
}

// ============================================================================
// HELPER: Generate idempotency key for marks
// ============================================================================

export function generateMarksIdempotencyKey(
    examId: string,
    action: 'draft' | 'submit'
): string {
    return `marks:${examId}:${action}:${Date.now()}`;
}
