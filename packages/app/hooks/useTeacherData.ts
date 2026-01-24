// packages/app/hooks/useTeacherData.ts
// Teacher-scoped data fetching hook with offline fallback
// Core data layer for Teacher Dashboard

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStorageAdapter, TimetableSlot, StudentRoster } from '../utils/storage-adapter';
import { useSyncQueue, generateAttendanceIdempotencyKey } from './useSyncQueue';

// ============================================================================
// TYPES
// ============================================================================

export interface TeacherClass {
    id: string;
    classId: string;
    className: string;
    grade: string;
    section: string;
    subjectId: string;
    subjectName: string;
    period: number;
    startTime: string;
    endTime: string;
    attendanceMarked: boolean;
    isSubstitution?: boolean;
    isLive?: boolean;
    isCovered?: boolean;
    coveredBy?: string;
}

export interface TeacherExam {
    id: string;
    name: string;
    subjectId: string;
    subjectName: string;
    classId: string;
    className: string;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'PUBLISHED';
    maxMarks: number;
    date: string;
}

export interface StudentForAttendance {
    id: string;
    name: string;
    rollNumber: number;
    photoUrl?: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE';
}

export interface LeaveBalance {
    type: 'SICK' | 'CASUAL' | 'EARNED';
    totalAllowed: number;
    used: number;
    remaining: number;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const API_BASE = '/api';

// ============================================================================
// AUTH HELPER - Dynamic token retrieval from storage
// ============================================================================

async function getAuthHeaders(): Promise<Record<string, string>> {
    let token: string | null = null;

    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && window.localStorage) {
        token = localStorage.getItem('sovereign_token');
    }
    // For React Native, expo-secure-store would be used here:
    // else {
    //     const SecureStore = require('expo-secure-store');
    //     token = await SecureStore.getItemAsync('sovereign_token');
    // }

    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

async function fetchMyClassesToday(): Promise<TeacherClass[]> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/teacher/my-classes-today`, {
        headers
    });
    if (!response.ok) throw new Error('Failed to fetch classes');
    return response.json();
}

async function fetchMyExams(status?: string): Promise<TeacherExam[]> {
    const headers = await getAuthHeaders();
    const url = status
        ? `${API_BASE}/teacher/my-exams?status=${status}`
        : `${API_BASE}/teacher/my-exams`;
    const response = await fetch(url, {
        headers
    });
    if (!response.ok) throw new Error('Failed to fetch exams');
    return response.json();
}

async function fetchStudentsForClass(classId: string): Promise<StudentRoster[]> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/teacher/class/${classId}/students`, {
        headers
    });
    if (!response.ok) throw new Error('Failed to fetch students');
    return response.json();
}

async function fetchAttendanceStatus(
    classId: string,
    date: string,
    period: number
): Promise<{ marked: boolean; records: StudentForAttendance[] }> {
    const headers = await getAuthHeaders();
    const response = await fetch(
        `${API_BASE}/teacher/attendance/${classId}/${date}/${period}`,
        { headers }
    );
    if (!response.ok) throw new Error('Failed to fetch attendance');
    return response.json();
}

async function fetchLeaveBalances(): Promise<LeaveBalance[]> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/teacher/leave-balances`, {
        headers
    });
    if (!response.ok) throw new Error('Failed to fetch leave balances');
    return response.json();
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Fetch teacher's classes for today
 */
export function useMyClassesToday() {
    const storage = getStorageAdapter();

    return useQuery({
        queryKey: ['teacher', 'classes-today'],
        queryFn: async () => {
            try {
                const data = await fetchMyClassesToday();
                // Cache timetable for offline
                const slots: TimetableSlot[] = data.map(c => ({
                    id: c.id,
                    classId: c.classId,
                    className: c.className,
                    subjectId: c.subjectId,
                    subjectName: c.subjectName,
                    period: c.period,
                    startTime: c.startTime,
                    endTime: c.endTime,
                    dayOfWeek: new Date().getDay(),
                }));
                await storage.saveTimetable(slots);
                return data;
            } catch (error) {
                // Fallback to cached data
                console.warn('[useTeacherData] Falling back to cached timetable');
                const cached = await storage.getTodayTimetable();
                return cached.map(slot => ({
                    id: slot.id,
                    classId: slot.classId,
                    className: slot.className,
                    grade: '',
                    section: '',
                    subjectId: slot.subjectId,
                    subjectName: slot.subjectName,
                    period: slot.period,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    attendanceMarked: false,
                    isLive: false,
                    isCovered: false,
                    coveredBy: undefined
                }));
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    });
}

/**
 * Fetch teacher's exams with optional status filter
 */
export function useMyExams(status?: string) {
    return useQuery({
        queryKey: ['teacher', 'exams', status],
        queryFn: () => fetchMyExams(status),
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Fetch students for a specific class
 */
export function useStudentsForClass(classId: string) {
    const storage = getStorageAdapter();

    return useQuery({
        queryKey: ['teacher', 'students', classId],
        queryFn: async () => {
            try {
                const data = await fetchStudentsForClass(classId);
                // Cache for offline
                await storage.saveStudentRoster(classId, data);
                return data;
            } catch (error) {
                // Fallback to cached
                console.warn('[useTeacherData] Falling back to cached roster');
                return storage.getStudentRoster(classId);
            }
        },
        enabled: !!classId,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

/**
 * Check attendance status for a class/date/period
 */
export function useAttendanceStatus(classId: string, date: string, period: number) {
    return useQuery({
        queryKey: ['teacher', 'attendance', classId, date, period],
        queryFn: () => fetchAttendanceStatus(classId, date, period),
        enabled: !!classId && !!date && period > 0,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

/**
 * Fetch leave balances for current teacher
 */
export function useLeaveBalances() {
    return useQuery({
        queryKey: ['teacher', 'leave-balances'],
        queryFn: fetchLeaveBalances,
        staleTime: 30 * 60 * 1000, // 30 minutes
    });
}

/**
 * Submit attendance with offline support
 */
export function useSubmitAttendance() {
    const queryClient = useQueryClient();
    const storage = getStorageAdapter();
    const { queueOperation, status } = useSyncQueue();

    return useMutation({
        mutationFn: async (params: {
            classId: string;
            date: string;
            period: number;
            records: Array<{ studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' }>;
        }) => {
            const idempotencyKey = generateAttendanceIdempotencyKey(
                params.classId,
                params.date,
                params.period
            );

            // Save to local storage immediately
            await storage.saveAttendanceBatch(
                params.records.map(r => ({
                    classId: params.classId,
                    date: params.date,
                    period: params.period,
                    studentId: r.studentId,
                    status: r.status,
                }))
            );

            // Queue for sync
            await queueOperation('ATTENDANCE', params, idempotencyKey);

            return { success: true, queued: !status.online };
        },
        onSuccess: (_, variables) => {
            // Invalidate attendance queries
            queryClient.invalidateQueries({
                queryKey: ['teacher', 'attendance', variables.classId],
            });
            queryClient.invalidateQueries({
                queryKey: ['teacher', 'classes-today'],
            });
        },
    });
}

/**
 * Get marks entry status for an exam
 */
export function useMarksEntryStatus(examId: string) {
    return useQuery({
        queryKey: ['teacher', 'marks', examId],
        queryFn: async () => {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE}/teacher/marks/${examId}`, {
                headers
            });
            if (!response.ok) throw new Error('Failed to fetch marks');
            return response.json();
        },
        enabled: !!examId,
        staleTime: 2 * 60 * 1000,
    });
}

/**
 * Save marks (draft or submit for approval)
 */
export function useSaveMarks() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: {
            examId: string;
            records: Array<{ studentId: string; marks: number }>;
            action: 'DRAFT' | 'SUBMIT';
        }) => {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE}/teacher/marks`, {
                method: 'POST',
                headers,
                body: JSON.stringify(params),
            });
            if (!response.ok) throw new Error('Failed to save marks');
            return response.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['teacher', 'marks', variables.examId],
            });
            queryClient.invalidateQueries({
                queryKey: ['teacher', 'exams'],
            });
        },
    });
}

/**
 * Fetch homework list
 */
export function useHomework(classId?: string, status?: 'ACTIVE' | 'PAST') {
    return useQuery({
        queryKey: ['teacher', 'homework', classId, status],
        queryFn: async () => {
            let url = `${API_BASE}/teacher/homework`;
            const params = new URLSearchParams();
            if (classId) params.append('classId', classId);
            if (status) params.append('status', status);
            if (params.toString()) url += `?${params.toString()}`;

            const headers = await getAuthHeaders();
            const response = await fetch(url, { headers });
            if (!response.ok) throw new Error('Failed to fetch homework');
            return response.json();
        },
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Create new homework
 */
export function useCreateHomework() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: {
            title: string;
            description?: string;
            subjectId?: string;
            classId: string;
            dueDate: string;
        }) => {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE}/teacher/homework`, {
                method: 'POST',
                headers,
                body: JSON.stringify(params),
            });
            if (!response.ok) throw new Error('Failed to create homework');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teacher', 'homework'] });
        },
    });
}

/**
 * Update existing homework
 */
export function useUpdateHomework() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: {
            id: string;
            title?: string;
            description?: string;
            subjectId?: string;
            classId?: string;
            dueDate?: string;
        }) => {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE}/teacher/homework/${params.id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(params),
            });
            if (!response.ok) throw new Error('Failed to update homework');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teacher', 'homework'] });
        },
    });
}

/**
 * Copy homework to another class
 */
export function useCopyHomework() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: { homeworkId: string; targetClassId: string }) => {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE}/teacher/homework/${params.homeworkId}/copy`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ targetClassId: params.targetClassId }),
            });
            if (!response.ok) throw new Error('Failed to copy homework');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teacher', 'homework'] });
        },
    });
}

/**
 * Delete homework
 */
export function useDeleteHomework() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (homeworkId: string) => {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE}/teacher/homework/${homeworkId}`, {
                method: 'DELETE',
                headers
            });
            if (!response.ok) throw new Error('Failed to delete homework');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teacher', 'homework'] });
        },
    });
}

/**
 * Fetch leave history
 */
export function useLeaveHistory() {
    return useQuery({
        queryKey: ['teacher', 'leave'],
        queryFn: async () => {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE}/teacher/leave`, { headers });
            if (!response.ok) throw new Error('Failed to fetch leave history');
            return response.json();
        },
        staleTime: 10 * 60 * 1000,
    });
}

/**
 * Apply for leave
 */
export function useApplyLeave() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: {
            type: 'SICK' | 'CASUAL' | 'EARNED';
            startDate: string;
            endDate: string;
            reason: string;
        }) => {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE}/teacher/leave`, {
                method: 'POST',
                headers,
                body: JSON.stringify(params),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to apply for leave');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teacher', 'leave'] });
            queryClient.invalidateQueries({ queryKey: ['teacher', 'leave-balances'] });
        },
    });
}


/**
 * Start Live Class
 */
export function useStartLiveClass() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (classId: string) => {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE}/teacher/live-class/start`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ classId }),
            });
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teacher', 'classes-today'] });
        }
    });
}

/**
 * End Live Class
 */
export function useEndLiveClass() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (classId: string) => {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE}/teacher/live-class/end`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ classId }),
            });
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teacher', 'classes-today'] });
        }
    });
}

/**
 * Fetch Announcements
 */
export function useAnnouncements() {
    return useQuery({
        queryKey: ['teacher', 'announcements'],
        queryFn: async () => {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE}/teacher/announcements`, { headers });
            if (!response.ok) throw new Error('Failed to fetch announcements');
            return response.json();
        },
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Send Announcement
 */
export function useSendAnnouncement() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (params: { title: string; message: string; targetClassIds: string[] }) => {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE}/teacher/announcements`, {
                method: 'POST',
                headers,
                body: JSON.stringify(params),
            });
            if (!response.ok) throw new Error('Failed to send announcement');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teacher', 'announcements'] });
        }
    });
}

/**
 * Get live class room ID
 */
export function useLiveClassRoom(classId: string, period: number) {
    return useQuery({
        queryKey: ['teacher', 'live-class', classId, period],
        queryFn: async () => {
            const headers = await getAuthHeaders();
            const response = await fetch(
                `${API_BASE}/teacher/live-class/room-id?classId=${classId}&period=${period}`,
                { headers }
            );
            if (!response.ok) throw new Error('Failed to get room ID');
            return response.json();
        },
        enabled: !!classId && period > 0,
        staleTime: 30 * 60 * 1000, // Room ID valid for session
    });
}

// ============================================================================
// RE-EXPORT SYNC STATUS
// ============================================================================

export { useSyncQueue } from './useSyncQueue';
