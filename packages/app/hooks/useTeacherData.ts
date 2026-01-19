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
    className: string;
    grade: string;
    section: string;
    subjectId: string;
    subjectName: string;
    period: number;
    startTime: string;
    endTime: string;
    attendanceMarked: boolean;
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

async function fetchMyClassesToday(): Promise<TeacherClass[]> {
    const response = await fetch(`${API_BASE}/teacher/my-classes-today`);
    if (!response.ok) throw new Error('Failed to fetch classes');
    return response.json();
}

async function fetchMyExams(status?: string): Promise<TeacherExam[]> {
    const url = status
        ? `${API_BASE}/teacher/my-exams?status=${status}`
        : `${API_BASE}/teacher/my-exams`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch exams');
    return response.json();
}

async function fetchStudentsForClass(classId: string): Promise<StudentRoster[]> {
    const response = await fetch(`${API_BASE}/teacher/class/${classId}/students`);
    if (!response.ok) throw new Error('Failed to fetch students');
    return response.json();
}

async function fetchAttendanceStatus(
    classId: string,
    date: string,
    period: number
): Promise<{ marked: boolean; records: StudentForAttendance[] }> {
    const response = await fetch(
        `${API_BASE}/teacher/attendance/${classId}/${date}/${period}`
    );
    if (!response.ok) throw new Error('Failed to fetch attendance');
    return response.json();
}

async function fetchLeaveBalances(): Promise<LeaveBalance[]> {
    const response = await fetch(`${API_BASE}/teacher/leave-balances`);
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
                    classId: c.id,
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
                    className: slot.className,
                    grade: '',
                    section: '',
                    subjectId: slot.subjectId,
                    subjectName: slot.subjectName,
                    period: slot.period,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    attendanceMarked: false,
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
            const response = await fetch(`${API_BASE}/teacher/marks/${examId}`);
            if (!response.ok) throw new Error('Failed to fetch marks');
            return response.json();
        },
        enabled: !!examId,
        staleTime: 2 * 60 * 1000,
    });
}

// ============================================================================
// RE-EXPORT SYNC STATUS
// ============================================================================

export { useSyncQueue } from './useSyncQueue';
