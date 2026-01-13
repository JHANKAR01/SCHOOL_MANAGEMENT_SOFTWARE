/**
 * useAdmissions Hook
 * Component-level data fetching for Admissions module (Inquiries)
 * Migrated from InteractionContext (Batch 2)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';

// Types
export interface Inquiry {
    id: number;
    parent_name: string;
    phone: string;
    target_class: string;
    status: 'NEW' | 'FOLLOW_UP' | 'CONVERTED';
}

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// QUERIES
// ============================================================================

export const useInquiries = () => {
    return useQuery<Inquiry[]>({
        queryKey: ['inquiries'],
        queryFn: async () => (await client.get('/operations/inquiries')).data,
        initialData: [],
        staleTime: STALE_TIME,
        retry: false,
        refetchOnWindowFocus: false
    });
};

// ============================================================================
// MUTATIONS
// ============================================================================

export const useAddInquiry = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newInq: Omit<Inquiry, 'id' | 'status'>) =>
            client.post('/operations/inquiries', newInq),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inquiries'] })
    });
};

export const useConvertInquiry = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) =>
            client.patch(`/operations/inquiries/${id}/convert`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inquiries'] })
    });
};

// ============================================================================
// COMBINED HOOK
// ============================================================================

export const useAdmissions = () => {
    const { data: inquiries = [], isLoading, error } = useInquiries();
    const addInquiryMutation = useAddInquiry();
    const convertInquiryMutation = useConvertInquiry();

    return {
        // Data
        inquiries,
        isLoading,
        error,

        // Mutations (simplified API matching old Context)
        addInquiry: (inq: Omit<Inquiry, 'id' | 'status'>) => addInquiryMutation.mutate(inq),
        convertInquiry: (id: number) => convertInquiryMutation.mutate(id),

        // Mutation states
        isAddingInquiry: addInquiryMutation.isPending,
        isConverting: convertInquiryMutation.isPending
    };
};
