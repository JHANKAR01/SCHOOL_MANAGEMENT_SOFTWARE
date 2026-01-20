/**
 * useTransport Hook
 * Component-level data fetching for Transport/Fleet module
 * Migrated from InteractionContext (Batch 1)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import { Bus } from '../../../types';

// Types
export interface LiveBus extends Bus {
    status: 'IDLE' | 'ON_ROUTE' | 'MAINTENANCE';
    lat: number;
    lng: number;
    speed: number;
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Fetch all buses for the current school
 */
export const useBuses = () => {
    return useQuery<LiveBus[]>({
        queryKey: ['buses'],
        queryFn: async () => (await client.get('/logistics/buses')).data,
        initialData: [],
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: false,
        refetchOnWindowFocus: false
    });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Update bus status (IDLE | ON_ROUTE | MAINTENANCE)
 */
export const useUpdateBusStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ busId, status }: { busId: string; status: LiveBus['status'] }) => {
            return client.patch(`/logistics/buses/${busId}`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['buses'] });
        }
    });
};

/**
 * Assign a driver to a bus
 */
export const useAssignBusDriver = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ busId, driverName }: { busId: string; driverName: string }) => {
            return client.patch(`/logistics/buses/${busId}/assign-driver`, { driverName });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['buses'] });
        }
    });
};

// ============================================================================
// COMBINED HOOK (Convenience wrapper)
// ============================================================================

/**
 * Combined hook that provides all transport data and mutations
 * Use this for simpler component code
 */
export const useTransport = () => {
    const { data: buses = [], isLoading, error } = useBuses();
    const updateStatusMutation = useUpdateBusStatus();
    const assignDriverMutation = useAssignBusDriver();

    return {
        // Data
        buses,
        isLoading,
        error,

        // Mutations (simplified API matching old Context)
        updateBusStatus: (busId: string, status: LiveBus['status']) => {
            updateStatusMutation.mutate({ busId, status });
        },
        assignBusDriver: (busId: string, driverName: string) => {
            assignDriverMutation.mutate({ busId, driverName });
        },

        // Mutation states (for loading spinners)
        isUpdatingStatus: updateStatusMutation.isPending,
        isAssigningDriver: assignDriverMutation.isPending
    };
};
