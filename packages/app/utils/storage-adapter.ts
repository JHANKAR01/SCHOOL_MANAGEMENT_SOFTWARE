// packages/app/utils/storage-adapter.ts
// Platform-agnostic storage abstraction for offline-first Teacher Dashboard
// Uses IndexedDB on Web, expo-sqlite on Native

import { Platform } from 'react-native';

// ============================================================================
// TYPES
// ============================================================================

export interface AttendanceRecord {
    classId: string;
    date: string; // YYYY-MM-DD
    period: number;
    studentId: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE';
}

export interface QueuedOperation {
    id: string;
    idempotencyKey: string;
    action: 'ATTENDANCE' | 'MARKS_DRAFT' | 'MARKS_SUBMIT' | 'HOMEWORK' | 'LEAVE';
    payload: Record<string, unknown>;
    createdAt: number;
    retryCount: number;
    lastError?: string;
}

export interface TimetableSlot {
    id: string;
    classId: string;
    className: string;
    subjectId: string;
    subjectName: string;
    period: number;
    startTime: string;
    endTime: string;
    dayOfWeek: number;
}

export interface StudentRoster {
    id: string;
    name: string;
    rollNumber: number;
    photoUrl?: string;
}

export interface SyncStatus {
    online: boolean;
    pending: number;
    lastSync: Date | null;
}

// ============================================================================
// STORAGE ADAPTER INTERFACE
// ============================================================================

export interface StorageAdapter {
    // Attendance
    saveAttendanceBatch(records: AttendanceRecord[]): Promise<void>;
    getAttendance(classId: string, date: string, period: number): Promise<AttendanceRecord[]>;

    // Student Roster
    saveStudentRoster(classId: string, students: StudentRoster[]): Promise<void>;
    getStudentRoster(classId: string): Promise<StudentRoster[]>;

    // Timetable
    saveTimetable(slots: TimetableSlot[]): Promise<void>;
    getTodayTimetable(): Promise<TimetableSlot[]>;

    // Sync Queue
    queueOperation(op: QueuedOperation): Promise<void>;
    getPendingOperations(): Promise<QueuedOperation[]>;
    updateOperation(id: string, updates: Partial<QueuedOperation>): Promise<void>;
    clearOperation(idempotencyKey: string): Promise<void>;

    // Utils
    clear(): Promise<void>;
}

// ============================================================================
// INDEXEDDB ADAPTER (WEB)
// ============================================================================

const DB_NAME = 'sovereign_teacher_offline';
const DB_VERSION = 1;

class IndexedDBAdapter implements StorageAdapter {
    private db: IDBDatabase | null = null;
    private initPromise: Promise<void> | null = null;

    private async init(): Promise<void> {
        if (this.db) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Attendance store
                if (!db.objectStoreNames.contains('attendance')) {
                    const store = db.createObjectStore('attendance', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('by_class_date_period', ['classId', 'date', 'period']);
                }

                // Student roster store
                if (!db.objectStoreNames.contains('roster')) {
                    const store = db.createObjectStore('roster', { keyPath: 'classId' });
                }

                // Timetable store
                if (!db.objectStoreNames.contains('timetable')) {
                    db.createObjectStore('timetable', { keyPath: 'id' });
                }

                // Sync queue store
                if (!db.objectStoreNames.contains('queue')) {
                    const store = db.createObjectStore('queue', { keyPath: 'id' });
                    store.createIndex('by_idempotency', 'idempotencyKey', { unique: true });
                }
            };
        });

        return this.initPromise;
    }

    private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
        await this.init();
        const tx = this.db!.transaction(storeName, mode);
        return tx.objectStore(storeName);
    }

    async saveAttendanceBatch(records: AttendanceRecord[]): Promise<void> {
        const store = await this.getStore('attendance', 'readwrite');
        for (const record of records) {
            store.put({ ...record, id: `${record.classId}_${record.date}_${record.period}_${record.studentId}` });
        }
    }

    async getAttendance(classId: string, date: string, period: number): Promise<AttendanceRecord[]> {
        const store = await this.getStore('attendance');
        const index = store.index('by_class_date_period');
        return new Promise((resolve, reject) => {
            const request = index.getAll([classId, date, period]);
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    async saveStudentRoster(classId: string, students: StudentRoster[]): Promise<void> {
        const store = await this.getStore('roster', 'readwrite');
        store.put({ classId, students, updatedAt: Date.now() });
    }

    async getStudentRoster(classId: string): Promise<StudentRoster[]> {
        const store = await this.getStore('roster');
        return new Promise((resolve, reject) => {
            const request = store.get(classId);
            request.onsuccess = () => resolve(request.result?.students || []);
            request.onerror = () => reject(request.error);
        });
    }

    async saveTimetable(slots: TimetableSlot[]): Promise<void> {
        const store = await this.getStore('timetable', 'readwrite');
        for (const slot of slots) {
            store.put(slot);
        }
    }

    async getTodayTimetable(): Promise<TimetableSlot[]> {
        const store = await this.getStore('timetable');
        const today = new Date().getDay(); // 0 = Sunday
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => {
                const slots = (request.result || []).filter((s: TimetableSlot) => s.dayOfWeek === today);
                resolve(slots.sort((a: TimetableSlot, b: TimetableSlot) => a.period - b.period));
            };
            request.onerror = () => reject(request.error);
        });
    }

    async queueOperation(op: QueuedOperation): Promise<void> {
        const store = await this.getStore('queue', 'readwrite');
        store.put(op);
    }

    async getPendingOperations(): Promise<QueuedOperation[]> {
        const store = await this.getStore('queue');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    async updateOperation(id: string, updates: Partial<QueuedOperation>): Promise<void> {
        const store = await this.getStore('queue', 'readwrite');
        return new Promise((resolve, reject) => {
            const getReq = store.get(id);
            getReq.onsuccess = () => {
                if (getReq.result) {
                    store.put({ ...getReq.result, ...updates });
                }
                resolve();
            };
            getReq.onerror = () => reject(getReq.error);
        });
    }

    async clearOperation(idempotencyKey: string): Promise<void> {
        const store = await this.getStore('queue', 'readwrite');
        const index = store.index('by_idempotency');
        return new Promise((resolve, reject) => {
            const request = index.getKey(idempotencyKey);
            request.onsuccess = () => {
                if (request.result) {
                    store.delete(request.result);
                }
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

    async clear(): Promise<void> {
        await this.init();
        const storeNames = ['attendance', 'roster', 'timetable', 'queue'];
        for (const name of storeNames) {
            const store = await this.getStore(name, 'readwrite');
            store.clear();
        }
    }
}

// ============================================================================
// NATIVE ADAPTER (STUB - expo-sqlite)
// ============================================================================

class NativeStorageAdapter implements StorageAdapter {
    // Note: This is a stub. In production, implement using expo-sqlite
    // with proper SQL queries for efficient data access on low-end devices.

    private data: Map<string, unknown> = new Map();

    async saveAttendanceBatch(records: AttendanceRecord[]): Promise<void> {
        const key = 'attendance';
        const existing = (this.data.get(key) as AttendanceRecord[]) || [];
        this.data.set(key, [...existing, ...records]);
    }

    async getAttendance(classId: string, date: string, period: number): Promise<AttendanceRecord[]> {
        const all = (this.data.get('attendance') as AttendanceRecord[]) || [];
        return all.filter(r => r.classId === classId && r.date === date && r.period === period);
    }

    async saveStudentRoster(classId: string, students: StudentRoster[]): Promise<void> {
        this.data.set(`roster_${classId}`, students);
    }

    async getStudentRoster(classId: string): Promise<StudentRoster[]> {
        return (this.data.get(`roster_${classId}`) as StudentRoster[]) || [];
    }

    async saveTimetable(slots: TimetableSlot[]): Promise<void> {
        this.data.set('timetable', slots);
    }

    async getTodayTimetable(): Promise<TimetableSlot[]> {
        const today = new Date().getDay();
        const all = (this.data.get('timetable') as TimetableSlot[]) || [];
        return all.filter(s => s.dayOfWeek === today).sort((a, b) => a.period - b.period);
    }

    async queueOperation(op: QueuedOperation): Promise<void> {
        const queue = (this.data.get('queue') as QueuedOperation[]) || [];
        queue.push(op);
        this.data.set('queue', queue);
    }

    async getPendingOperations(): Promise<QueuedOperation[]> {
        return (this.data.get('queue') as QueuedOperation[]) || [];
    }

    async updateOperation(id: string, updates: Partial<QueuedOperation>): Promise<void> {
        const queue = (this.data.get('queue') as QueuedOperation[]) || [];
        const idx = queue.findIndex(op => op.id === id);
        if (idx >= 0) {
            queue[idx] = { ...queue[idx], ...updates };
            this.data.set('queue', queue);
        }
    }

    async clearOperation(idempotencyKey: string): Promise<void> {
        const queue = (this.data.get('queue') as QueuedOperation[]) || [];
        this.data.set('queue', queue.filter(op => op.idempotencyKey !== idempotencyKey));
    }

    async clear(): Promise<void> {
        this.data.clear();
    }
}

// ============================================================================
// FACTORY
// ============================================================================

let adapterInstance: StorageAdapter | null = null;

export function createStorageAdapter(): StorageAdapter {
    if (adapterInstance) return adapterInstance;

    if (Platform.OS === 'web') {
        adapterInstance = new IndexedDBAdapter();
    } else {
        adapterInstance = new NativeStorageAdapter();
    }

    return adapterInstance;
}

export function getStorageAdapter(): StorageAdapter {
    if (!adapterInstance) {
        return createStorageAdapter();
    }
    return adapterInstance;
}
