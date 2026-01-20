/**
 * useAcademics Hook
 * Component-level data fetching for Academics module (Homework, Exams, Syllabus, Leaves, LiveClasses)
 * Migrated from InteractionContext (Batch 1)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import client from '../api/client';

// Types
export interface Homework {
    id: string;
    title: string;
    subject: string;
    description: string;
    dueDate: string;
    status: 'PENDING' | 'SUBMITTED' | 'GRADED';
    classId: string;
}

export interface Exam {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    classes: string[];
}

export interface LeaveApplication {
    id: string;
    teacherName: string;
    type: 'SICK' | 'CASUAL' | 'EARNED';
    startDate: string;
    endDate: string;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface LiveClass {
    id: string;
    subject: string;
    class_id: string;
    is_active: boolean;
    meeting_link: string;
}

// Common query options
const QUERY_OPTIONS = {
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
    refetchOnWindowFocus: false
};

// ============================================================================
// QUERIES
// ============================================================================

export const useHomeworks = () => {
    return useQuery<Homework[]>({
        queryKey: ['homeworks'],
        queryFn: async () => (await client.get('/academics/homework')).data,
        initialData: [],
        ...QUERY_OPTIONS
    });
};

export const useExams = () => {
    return useQuery<Exam[]>({
        queryKey: ['exams'],
        queryFn: async () => (await client.get('/academics/exams')).data,
        initialData: [],
        ...QUERY_OPTIONS
    });
};

export const useSyllabus = () => {
    return useQuery<any[]>({
        queryKey: ['syllabus'],
        queryFn: async () => (await client.get('/academics/syllabus')).data,
        initialData: [],
        ...QUERY_OPTIONS
    });
};

export const useLeaves = () => {
    return useQuery<LeaveApplication[]>({
        queryKey: ['leaves'],
        queryFn: async () => (await client.get('/academics/leaves')).data,
        initialData: [],
        ...QUERY_OPTIONS
    });
};

export const useLiveClasses = () => {
    return useQuery<LiveClass[]>({
        queryKey: ['liveClasses'],
        queryFn: async () => (await client.get('/academics/live-classes')).data,
        initialData: [],
        ...QUERY_OPTIONS
    });
};

// ============================================================================
// MUTATIONS
// ============================================================================

export const useAddHomework = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newHw: Omit<Homework, 'id' | 'status'>) => client.post('/academics/homework', newHw),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['homeworks'] })
    });
};

export const useAddExam = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newExam: Omit<Exam, 'id'>) => client.post('/academics/exams', newExam),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exams'] })
    });
};

export const useApplyLeave = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (leave: Omit<LeaveApplication, 'id' | 'status' | 'teacherName'>) => client.post('/academics/leaves', leave),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaves'] })
    });
};

export const useUpdateLeaveStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: 'APPROVED' | 'REJECTED' }) =>
            client.patch(`/academics/leaves/${id}`, { status }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaves'] })
    });
};

export const useToggleLiveClass = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { subjectId: string; isActive: boolean; classId: string }) =>
            client.post('/academics/live-classes/toggle', data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['liveClasses'] })
    });
};

export const useApproveSyllabus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => client.patch(`/academics/syllabus/${id}/approve`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['syllabus'] })
    });
};

// ============================================================================
// COMBINED HOOK (Convenience wrapper for TeacherDashboard)
// ============================================================================

export const useAcademics = () => {
    // Queries
    const { data: homeworks = [], isLoading: homeworksLoading } = useHomeworks();
    const { data: exams = [], isLoading: examsLoading } = useExams();
    const { data: syllabus = [], isLoading: syllabusLoading } = useSyllabus();
    const { data: leaves = [], isLoading: leavesLoading } = useLeaves();
    const { data: liveClassesList = [], isLoading: liveClassesLoading } = useLiveClasses();

    // Mutations
    const addHomeworkMutation = useAddHomework();
    const addExamMutation = useAddExam();
    const applyLeaveMutation = useApplyLeave();
    const updateLeaveStatusMutation = useUpdateLeaveStatus();
    const toggleLiveClassMutation = useToggleLiveClass();
    const approveSyllabusMutation = useApproveSyllabus();

    // Transform liveClasses array into a map for quick lookup
    const liveClasses = useMemo(() => {
        const map: Record<string, boolean> = {};
        liveClassesList.forEach((c) => {
            if (c.subject) map[c.subject] = c.is_active;
        });
        return map;
    }, [liveClassesList]);

    return {
        // Data
        homeworks,
        exams,
        syllabus,
        leaves,
        liveClasses,
        liveClassesList,

        // Loading states
        isLoading: homeworksLoading || examsLoading || syllabusLoading || leavesLoading || liveClassesLoading,

        // Mutations (simplified API matching old Context)
        addHomework: (hw: Omit<Homework, 'id' | 'status'>) => addHomeworkMutation.mutate(hw),
        addExam: (exam: Omit<Exam, 'id'>) => addExamMutation.mutate(exam),
        applyLeave: (leave: Omit<LeaveApplication, 'id' | 'status' | 'teacherName'>) => applyLeaveMutation.mutate(leave),
        updateLeaveStatus: (id: string, status: 'APPROVED' | 'REJECTED') => updateLeaveStatusMutation.mutate({ id, status }),
        toggleLiveClass: (subject: string, isActive: boolean, classId: string = '10A') =>
            toggleLiveClassMutation.mutate({ subjectId: subject, isActive, classId }),
        approveSyllabus: (id: number) => approveSyllabusMutation.mutate(id),

        // Mutation states
        isAddingHomework: addHomeworkMutation.isPending,
        isApplyingLeave: applyLeaveMutation.isPending
    };
};
