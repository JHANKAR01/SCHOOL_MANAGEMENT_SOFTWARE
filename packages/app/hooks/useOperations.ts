/**
 * useOperations Hook
 * Component-level data fetching for Operations module (Visitors, Tickets, GateLogs)
 * Migrated from InteractionContext (Batch 2)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';

// Types
export interface Visitor {
    id: number;
    name: string;
    student?: string;
    purpose: string;
    time: string;
    status: 'WAITING' | 'APPROVED' | 'COMPLETED';
}

export interface Ticket {
    id: string;
    location: string;
    issue: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'OPEN' | 'RESOLVED' | 'ASSIGNED' | 'PENDING';
    reportedBy: string;
}

export interface GateLog {
    id: number;
    type: string;
    name: string;
    purpose: string;
    time: string;
    status: 'INSIDE' | 'EXITED';
    date: string;
}

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

const QUERY_OPTIONS = {
    initialData: [] as any[],
    staleTime: STALE_TIME,
    retry: false,
    refetchOnWindowFocus: false
};

// ============================================================================
// QUERIES
// ============================================================================

export const useVisitors = () => {
    return useQuery<Visitor[]>({
        queryKey: ['visitors'],
        queryFn: async () => (await client.get('/operations/visitors')).data,
        ...QUERY_OPTIONS
    });
};

export const useTickets = () => {
    return useQuery<Ticket[]>({
        queryKey: ['tickets'],
        queryFn: async () => (await client.get('/operations/tickets')).data,
        ...QUERY_OPTIONS
    });
};

export const useGateLogs = () => {
    return useQuery<GateLog[]>({
        queryKey: ['gateLogs'],
        queryFn: async () => (await client.get('/operations/gate-logs')).data,
        ...QUERY_OPTIONS
    });
};

// ============================================================================
// MUTATIONS - Visitors
// ============================================================================

export const useAddVisitor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newVis: Omit<Visitor, 'id' | 'status' | 'time'>) =>
            client.post('/operations/visitors', newVis),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['visitors'] })
    });
};

export const useApproveVisitor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) =>
            client.patch(`/operations/visitors/${id}/approve`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['visitors'] })
    });
};

// ============================================================================
// MUTATIONS - Tickets
// ============================================================================

export const useAddTicket = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newTic: Omit<Ticket, 'id' | 'status'>) =>
            client.post('/operations/tickets', newTic),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] })
    });
};

export const useResolveTicket = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) =>
            client.patch(`/operations/tickets/${id}/resolve`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] })
    });
};

// ============================================================================
// MUTATIONS - Gate Logs
// ============================================================================

export const useLogGateEntry = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (entry: Omit<GateLog, 'id' | 'time' | 'date'>) =>
            client.post('/operations/gate-logs', entry),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gateLogs'] })
    });
};

// ============================================================================
// COMBINED HOOKS
// ============================================================================

/**
 * Hook for Reception Dashboard (visitors only)
 */
export const useReception = () => {
    const { data: visitors = [], isLoading, error } = useVisitors();
    const addVisitorMutation = useAddVisitor();
    const approveVisitorMutation = useApproveVisitor();

    return {
        visitors,
        isLoading,
        error,
        addVisitor: (vis: Omit<Visitor, 'id' | 'status' | 'time'>) => addVisitorMutation.mutate(vis),
        approveVisitor: (id: number) => approveVisitorMutation.mutate(id),
        isAddingVisitor: addVisitorMutation.isPending,
        isApproving: approveVisitorMutation.isPending
    };
};

/**
 * Hook for Security Dashboard (gate logs)
 */
export const useSecurity = () => {
    const { data: gateLogs = [], isLoading, error } = useGateLogs();
    const logEntryMutation = useLogGateEntry();

    return {
        gateLogs,
        isLoading,
        error,
        logGateEntry: (entry: Omit<GateLog, 'id' | 'time' | 'date'>) => logEntryMutation.mutate(entry),
        isLogging: logEntryMutation.isPending
    };
};

/**
 * Hook for Estate Dashboard (tickets)
 */
export const useEstate = () => {
    const { data: tickets = [], isLoading, error } = useTickets();
    const addTicketMutation = useAddTicket();
    const resolveTicketMutation = useResolveTicket();

    return {
        tickets,
        isLoading,
        error,
        addTicket: (ticket: Omit<Ticket, 'id' | 'status'>) => addTicketMutation.mutate(ticket),
        resolveTicket: (id: string) => resolveTicketMutation.mutate(id),
        isAddingTicket: addTicketMutation.isPending,
        isResolving: resolveTicketMutation.isPending
    };
};

/**
 * Full Operations hook (all data - use sparingly)
 */
export const useOperations = () => {
    const { visitors, addVisitor, approveVisitor, isLoading: visitorsLoading } = useReception();
    const { tickets, addTicket, resolveTicket, isLoading: ticketsLoading } = useEstate();
    const { gateLogs, logGateEntry, isLoading: gateLogsLoading } = useSecurity();

    return {
        visitors,
        tickets,
        gateLogs,
        addVisitor,
        approveVisitor,
        addTicket,
        resolveTicket,
        logGateEntry,
        isLoading: visitorsLoading || ticketsLoading || gateLogsLoading
    };
};
