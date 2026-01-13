/**
 * useHostel Hook
 * Component-level data fetching for Hostel module (Rooms)
 * Migrated from InteractionContext (Batch 3)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import { HostelRoom } from '../../../types';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// QUERIES
// ============================================================================

export const useHostelRooms = () => {
    return useQuery<HostelRoom[]>({
        queryKey: ['hostelRooms'],
        queryFn: async () => (await client.get('/logistics/rooms')).data,
        initialData: [],
        staleTime: STALE_TIME,
        retry: false,
        refetchOnWindowFocus: false
    });
};

// ============================================================================
// MUTATIONS
// ============================================================================

export const useAllocateRoom = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ roomNumber, studentId }: { roomNumber: string; studentId: string }) =>
            client.post('/logistics/rooms/allocate', { roomNumber, studentId }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hostelRooms'] })
    });
};

// ============================================================================
// COMBINED HOOK
// ============================================================================

export const useHostel = () => {
    const { data: hostelRooms = [], isLoading, error } = useHostelRooms();
    const allocateRoomMutation = useAllocateRoom();

    return {
        // Data
        hostelRooms,
        isLoading,
        error,

        // Mutations
        allocateRoom: (roomNumber: string, studentId: string) => allocateRoomMutation.mutate({ roomNumber, studentId }),

        // Mutation states
        isAllocating: allocateRoomMutation.isPending
    };
};
