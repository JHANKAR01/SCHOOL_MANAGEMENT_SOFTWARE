/**
 * useHealth Hook
 * Component-level data fetching for Health module (Medical Logs)
 * Migrated from InteractionContext (Batch 3)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import { MedicalLog } from '../../../types';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// QUERIES
// ============================================================================

export const useMedicalLogs = () => {
    return useQuery<MedicalLog[]>({
        queryKey: ['medicalLogs'],
        queryFn: async () => (await client.get('/health/logs')).data,
        initialData: [],
        staleTime: STALE_TIME,
        retry: false,
        refetchOnWindowFocus: false
    });
};

// ============================================================================
// MUTATIONS
// ============================================================================

export const useAddMedicalLog = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (log: Omit<MedicalLog, 'id' | 'time' | 'date'>) =>
            client.post('/health/logs', log),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['medicalLogs'] })
    });
};

// ============================================================================
// COMBINED HOOK
// ============================================================================

export const useHealth = () => {
    const { data: medicalLogs = [], isLoading, error } = useMedicalLogs();
    const addMedicalLogMutation = useAddMedicalLog();

    return {
        // Data
        medicalLogs,
        isLoading,
        error,

        // Mutations
        addMedicalLog: (log: Omit<MedicalLog, 'id' | 'time' | 'date'>) => addMedicalLogMutation.mutate(log),

        // Mutation states
        isAddingLog: addMedicalLogMutation.isPending
    };
};
