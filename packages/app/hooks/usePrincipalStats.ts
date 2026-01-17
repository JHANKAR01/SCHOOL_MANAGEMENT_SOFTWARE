// packages/app/hooks/usePrincipalStats.ts
// Principal Dashboard Data Hook - Provides aggregated stats for command center
import { useState, useEffect, useCallback } from 'react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface AttendanceStats {
    studentPct: number;      // e.g., 94.5
    staffPct: number;        // e.g., 96.0
    lowClasses: number;      // Classes with < 85% attendance
}

export interface PendingResults {
    count: number;           // Batches awaiting approval
    latestExam: string;      // e.g., "Unit Test 2"
}

export interface AlertStats {
    critical: number;        // Safety/Medical
    medium: number;          // Operational
}

export interface RiskMetrics {
    atRiskAttendance: number;   // Students < 75% attendance
    academicWarning: number;    // Students failing > 2 subjects
}

export type ApprovalType = 'RESULT_PUBLISH' | 'LEAVE_REQUEST' | 'DEMASK_PII';
export type UrgencyLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ApprovalRequest {
    id: string;
    type: ApprovalType;
    title: string;
    subtitle: string;
    requester: string;
    requesterId: string;
    timestamp: string;          // ISO string
    urgency: UrgencyLevel;
    metadata?: Record<string, any>;
}

export interface DashboardStats {
    attendance: AttendanceStats;
    pendingResults: PendingResults;
    alerts: AlertStats;
    approvals: ApprovalRequest[];
    riskMetrics: RiskMetrics;
}

export interface UsePrincipalStatsReturn {
    stats: DashboardStats | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK DATA (Will be replaced by API in Phase 5)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MOCK_STATS: DashboardStats = {
    attendance: {
        studentPct: 94.5,
        staffPct: 96.0,
        lowClasses: 2,
    },
    pendingResults: {
        count: 3,
        latestExam: 'Unit Test 2',
    },
    alerts: {
        critical: 1,
        medium: 4,
    },
    approvals: [
        {
            id: 'apr_001',
            type: 'RESULT_PUBLISH',
            title: 'Class 10-A Mathematics',
            subtitle: 'Unit Test 2 • 42 students',
            requester: 'Mrs. Sharma',
            requesterId: 'usr_t001',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
            urgency: 'HIGH',
            metadata: { examId: 'exam_001', classId: 'cls_10a', subjectId: 'sub_math' }
        },
        {
            id: 'apr_002',
            type: 'LEAVE_REQUEST',
            title: 'Sick Leave (3 days)',
            subtitle: 'Jan 20 - Jan 22, 2026',
            requester: 'Mr. Kumar',
            requesterId: 'usr_t002',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1d ago
            urgency: 'MEDIUM',
            metadata: { leaveId: 'leave_001', type: 'SICK', days: 3 }
        },
        {
            id: 'apr_003',
            type: 'RESULT_PUBLISH',
            title: 'Class 9-B Science',
            subtitle: 'Midterm Exam • 38 students',
            requester: 'Mr. Verma',
            requesterId: 'usr_t003',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3h ago
            urgency: 'HIGH',
            metadata: { examId: 'exam_002', classId: 'cls_9b', subjectId: 'sub_sci' }
        },
        {
            id: 'apr_004',
            type: 'LEAVE_REQUEST',
            title: 'Casual Leave (1 day)',
            subtitle: 'Jan 25, 2026',
            requester: 'Ms. Patel',
            requesterId: 'usr_t004',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4h ago
            urgency: 'LOW',
            metadata: { leaveId: 'leave_002', type: 'CASUAL', days: 1 }
        },
        {
            id: 'apr_005',
            type: 'RESULT_PUBLISH',
            title: 'Class 8-C English',
            subtitle: 'Weekly Test • 35 students',
            requester: 'Mrs. Gupta',
            requesterId: 'usr_t005',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5h ago
            urgency: 'MEDIUM',
            metadata: { examId: 'exam_003', classId: 'cls_8c', subjectId: 'sub_eng' }
        },
    ],
    riskMetrics: {
        atRiskAttendance: 12,
        academicWarning: 8,
    },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOOK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function usePrincipalStats(): UsePrincipalStatsReturn {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Try real API first
            const res = await fetch('/api/principal/stats', {
                headers: { Authorization: `Bearer ${localStorage.getItem('sovereign_token')}` }
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setStats(data.stats);
                    return;
                }
            }

            // Fallback to mock data if API fails (for development)
            console.warn('[usePrincipalStats] API failed, using mock data');
            await new Promise(resolve => setTimeout(resolve, 300));
            setStats(MOCK_STATS);
        } catch (err: any) {
            // Use mock data as fallback
            console.warn('[usePrincipalStats] Network error, using mock data:', err.message);
            setStats(MOCK_STATS);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, loading, error, refetch: fetchStats };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UTILITY FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Formats an ISO timestamp to a human-readable "time ago" string
 */
export function formatTimeAgo(isoString: string): string {
    const now = new Date();
    const date = new Date(isoString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

/**
 * Returns the icon name for a given approval type
 */
export function getApprovalIconName(type: ApprovalType): string {
    switch (type) {
        case 'RESULT_PUBLISH': return 'ClipboardCheck';
        case 'LEAVE_REQUEST': return 'Calendar';
        case 'DEMASK_PII': return 'Shield';
        default: return 'FileText';
    }
}

/**
 * Returns the color scheme for a given approval type
 */
export function getApprovalColor(type: ApprovalType): { bg: string; text: string; darkBg: string; darkText: string } {
    switch (type) {
        case 'RESULT_PUBLISH':
            return {
                bg: 'bg-indigo-50',
                text: 'text-indigo-500',
                darkBg: 'dark:bg-indigo-900/30',
                darkText: 'dark:text-indigo-400'
            };
        case 'LEAVE_REQUEST':
            return {
                bg: 'bg-teal-50',
                text: 'text-teal-500',
                darkBg: 'dark:bg-teal-900/30',
                darkText: 'dark:text-teal-400'
            };
        case 'DEMASK_PII':
            return {
                bg: 'bg-amber-50',
                text: 'text-amber-500',
                darkBg: 'dark:bg-amber-900/30',
                darkText: 'dark:text-amber-400'
            };
        default:
            return {
                bg: 'bg-slate-50',
                text: 'text-slate-500',
                darkBg: 'dark:bg-slate-800',
                darkText: 'dark:text-slate-400'
            };
    }
}

/**
 * Returns the urgency color for badges
 */
export function getUrgencyColor(urgency: UrgencyLevel): { bg: string; text: string } {
    switch (urgency) {
        case 'HIGH':
            return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' };
        case 'MEDIUM':
            return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' };
        case 'LOW':
            return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' };
        default:
            return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' };
    }
}
