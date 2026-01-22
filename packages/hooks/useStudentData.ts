// packages/hooks/useStudentData.ts
// Student-scoped data fetching hooks for Student Dashboard
// Follows pattern from useTeacherData.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../app/api/client';

// ============================================================================
// TYPES
// ============================================================================

export interface StudentProfile {
    id: string;
    admission_no: string;
    name: string;
    email: string | null;
    phone: string | null;
    photo_url: string | null;
    gender: string | null;
    date_of_birth: string | null;
    blood_group: string | null;
    father_name: string | null;
    mother_name: string | null;
    address: {
        line1: string | null;
        line2: string | null;
        city: string | null;
        state: string | null;
        pincode: string | null;
    };
    current_class: {
        class_id: string;
        grade: string;
        section: string;
        roll_number: number;
        academic_year: string;
    } | null;
}

export interface TimetableEntry {
    id: string;
    day_of_week: number;
    period: number;
    subject: string;
    subject_code: string;
    teacher: string;
    start_time: string;
    end_time: string;
}

export interface HomeworkItem {
    id: string;
    title: string;
    description: string | null;
    subject: string;
    subject_code: string;
    due_date: string;
    created_at: string;
    status: 'pending' | 'submitted' | 'graded' | 'overdue';
    submission: {
        id: string;
        submitted_at: string;
        is_late: boolean;
        grade: string | null;
        feedback: string | null;
    } | null;
}

export interface AttendanceRecord {
    date: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE';
    period: number;
}

export interface AttendanceSummary {
    present: number;
    absent: number;
    late: number;
    total: number;
    percentage: number;
}

export interface ExamResult {
    id: string;
    exam: {
        name: string;
        type: string;
        date: string;
    };
    total_percentage: number | null;
    grade: string | null;
    remarks: string | null;
    subjects: {
        name: string;
        code: string;
        marks_obtained: number;
        max_marks: number;
        grade: string | null;
        remarks: string | null;
    }[];
}

export interface LiveClass {
    id: string;
    subject: string;
    subject_code: string;
    teacher: string;
    meeting_link: string;
    is_active: boolean;
    start_time: string;
    can_join: boolean;
}

export interface Announcement {
    id: string;
    title: string;
    message: string;
    author: string;
    author_role: string;
    is_public: boolean;
    created_at: string;
    expires_at: string | null;
    is_new: boolean;
}

export interface MyDayData {
    student: {
        name: string;
        class: string;
        roll_number: number;
    };
    timetable: {
        period: number;
        subject: string;
        teacher: string;
        start_time: string;
        end_time: string;
    }[];
    attendance: {
        marked: boolean;
        status: 'PRESENT' | 'ABSENT' | 'LATE' | null;
    };
    pending_homework: {
        id: string;
        title: string;
        subject: string;
        due_date: string;
        is_overdue: boolean;
    }[];
    live_classes: {
        id: string;
        subject: string;
        teacher: string;
        meeting_link: string;
        is_active: boolean;
        start_time: string;
    }[];
    announcements: {
        id: string;
        title: string;
        message: string;
        created_at: string;
    }[];
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Fetch student profile with current enrollment
 */
export function useStudentProfile() {
    return useQuery<StudentProfile>({
        queryKey: ['student', 'profile'],
        queryFn: async () => {
            const response = await client.get('/student/me');
            if (!response.data.success) {
                throw new Error(response.data.error);
            }
            return response.data.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Fetch "My Day" consolidated view for student landing screen
 */
export function useMyDay() {
    return useQuery<MyDayData>({
        queryKey: ['student', 'my-day'],
        queryFn: async () => {
            const response = await client.get('/student/my-day');
            if (!response.data.success) {
                throw new Error(response.data.error);
            }
            return response.data.data;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes - refresh more often
        refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    });
}

/**
 * Fetch weekly timetable, optionally filtered by day
 */
export function useStudentTimetable(day?: number) {
    return useQuery<{ class: string; timetable: TimetableEntry[]; substitutions: any[] }>({
        queryKey: ['student', 'timetable', day],
        queryFn: async () => {
            const url = day !== undefined ? `/student/timetable?day=${day}` : '/student/timetable';
            const response = await client.get(url);
            if (!response.data.success) {
                throw new Error(response.data.error);
            }
            return response.data.data;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

/**
 * Fetch homework list with optional status filter
 */
export function useStudentHomework(status?: 'pending' | 'submitted' | 'graded' | 'overdue') {
    return useQuery<HomeworkItem[]>({
        queryKey: ['student', 'homework', status],
        queryFn: async () => {
            const url = status ? `/student/homework?status=${status}` : '/student/homework';
            const response = await client.get(url);
            if (!response.data.success) {
                throw new Error(response.data.error);
            }
            return response.data.data;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

/**
 * Submit homework mutation
 */
export function useSubmitHomework() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: {
            homeworkId: string;
            submission_text?: string;
            submission_url?: string;
        }) => {
            const response = await client.post(`/student/homework/${params.homeworkId}/submit`, {
                submission_text: params.submission_text,
                submission_url: params.submission_url,
            });
            if (!response.data.success) {
                throw new Error(response.data.error);
            }
            return response.data.data;
        },
        onSuccess: () => {
            // Invalidate homework queries to refresh the list
            queryClient.invalidateQueries({ queryKey: ['student', 'homework'] });
            queryClient.invalidateQueries({ queryKey: ['student', 'my-day'] });
        },
    });
}

/**
 * Fetch attendance history for a month
 */
export function useStudentAttendance(month?: string) {
    return useQuery<{
        month: string;
        summary: AttendanceSummary;
        records: AttendanceRecord[];
    }>({
        queryKey: ['student', 'attendance', month],
        queryFn: async () => {
            const url = month ? `/student/attendance?month=${month}` : '/student/attendance';
            const response = await client.get(url);
            if (!response.data.success) {
                throw new Error(response.data.error);
            }
            return response.data.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Request leave mutation
 */
export function useRequestLeave() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: {
            type: 'SICK' | 'CASUAL' | 'EARNED';
            start_date: string;
            end_date: string;
            reason?: string;
        }) => {
            const response = await client.post('/student/leave-request', params);
            if (!response.data.success) {
                throw new Error(response.data.error);
            }
            return response.data.data;
        },
        onSuccess: () => {
            // Could invalidate a leave requests query if we add one
        },
    });
}

/**
 * Fetch published exam results
 */
export function useStudentResults() {
    return useQuery<ExamResult[]>({
        queryKey: ['student', 'results'],
        queryFn: async () => {
            const response = await client.get('/student/results');
            if (!response.data.success) {
                throw new Error(response.data.error);
            }
            return response.data.data;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes - results don't change often
    });
}

/**
 * Fetch live/upcoming classes
 */
export function useStudentLiveClasses() {
    return useQuery<LiveClass[]>({
        queryKey: ['student', 'live-classes'],
        queryFn: async () => {
            const response = await client.get('/student/live-classes');
            if (!response.data.success) {
                throw new Error(response.data.error);
            }
            return response.data.data;
        },
        staleTime: 1 * 60 * 1000, // 1 minute - refresh often for live status
        refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    });
}

/**
 * Fetch announcements/notifications for student
 */
export function useStudentNotifications() {
    return useQuery<Announcement[]>({
        queryKey: ['student', 'notifications'],
        queryFn: async () => {
            const response = await client.get('/student/notifications');
            if (!response.data.success) {
                throw new Error(response.data.error);
            }
            return response.data.data;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

/**
 * Update student profile (only phone for V1)
 */
export function useUpdateStudentProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: { phone: string }) => {
            const response = await client.patch('/student/profile', params);
            if (!response.data.success) {
                throw new Error(response.data.error);
            }
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student', 'profile'] });
        },
    });
}
