/**
 * useHR Hook
 * Component-level data fetching for HR module (Students & Staff)
 * Migrated from InteractionContext (Batch 4)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import { UserRole } from '../../../types';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

// Types
export interface StudentProfile {
    id: string;
    name: string;
    class: string;
    roll: number;
}

export interface LocalStaff {
    id: string;
    name: string;
    role: UserRole;
    department: string;
    joinedAt: string;
}

const QUERY_OPTIONS = {
    initialData: [] as any[],
    staleTime: STALE_TIME,
    retry: false,
    refetchOnWindowFocus: false
};

// ============================================================================
// QUERIES
// ============================================================================

export const useStudents = () => {
    return useQuery<StudentProfile[]>({
        queryKey: ['students'],
        queryFn: async () => (await client.get('/students')).data,
        ...QUERY_OPTIONS
    });
};

export const useStaff = () => {
    return useQuery<LocalStaff[]>({
        queryKey: ['staff'],
        queryFn: async () => (await client.get('/staff')).data,
        ...QUERY_OPTIONS
    });
};

// ============================================================================
// MUTATIONS
// ============================================================================

export const useAddStaff = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newStaff: Omit<LocalStaff, 'id'>) =>
            client.post('/staff', newStaff),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] })
    });
};

// ============================================================================
// COMBINED HOOK
// ============================================================================

export const useHR = () => {
    const { data: students = [], isLoading: studentsLoading, error: studentsError } = useStudents();
    const { data: localStaff = [], isLoading: staffLoading, error: staffError } = useStaff();
    const addStaffMutation = useAddStaff();

    return {
        // Data
        students,
        localStaff,

        // Loading states
        isLoading: studentsLoading || staffLoading,
        studentsLoading,
        staffLoading,

        // Errors
        error: studentsError || staffError,

        // Mutations
        addStaff: (staff: Omit<LocalStaff, 'id'>) => addStaffMutation.mutate(staff),

        // Mutation states
        isAddingStaff: addStaffMutation.isPending
    };
};
