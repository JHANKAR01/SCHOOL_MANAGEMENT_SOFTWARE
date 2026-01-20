/**
 * useFinance Hook
 * Component-level data fetching for Finance module (Invoices & Expenses)
 * Migrated from InteractionContext (Batch 4)
 * 
 * Note: FinanceDashboard already has its own component-level fetching
 * with pagination. This hook is for simpler use cases (e.g., BusFleet addExpense).
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import { Invoice } from '../../../types';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

// Types
export interface Expense {
    id: string;
    category: 'UTILITY' | 'VENDOR' | 'SALARY' | 'MAINTENANCE';
    amount: number;
    description: string;
    date: string;
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

export const useInvoices = () => {
    return useQuery<Invoice[]>({
        queryKey: ['invoices'],
        queryFn: async () => (await client.get('/finance/invoices')).data,
        ...QUERY_OPTIONS
    });
};

export const useExpenses = () => {
    return useQuery<Expense[]>({
        queryKey: ['expenses'],
        queryFn: async () => (await client.get('/finance/expenses')).data,
        ...QUERY_OPTIONS
    });
};

// ============================================================================
// MUTATIONS
// ============================================================================

export const useAddInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newInv: Omit<Invoice, 'id' | 'status'>) =>
            client.post('/finance/invoices', newInv),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] })
    });
};

export const useMarkInvoicePaid = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, method }: { id: string; method: 'CASH' | 'CHEQUE' | 'ONLINE' }) =>
            client.patch(`/finance/invoices/${id}/pay`, { method }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] })
    });
};

export const useAddExpense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newExp: Omit<Expense, 'id' | 'date'>) =>
            client.post('/finance/expenses', { ...newExp, date: new Date() }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] })
    });
};

// ============================================================================
// COMBINED HOOK
// ============================================================================

export const useFinance = () => {
    const { data: invoices = [], isLoading: invoicesLoading } = useInvoices();
    const { data: expenses = [], isLoading: expensesLoading } = useExpenses();

    const addInvoiceMutation = useAddInvoice();
    const markPaidMutation = useMarkInvoicePaid();
    const addExpenseMutation = useAddExpense();

    return {
        // Data
        invoices,
        expenses,

        // Loading
        isLoading: invoicesLoading || expensesLoading,

        // Mutations (matching old Context API)
        addInvoice: (inv: Omit<Invoice, 'id' | 'status'>) => addInvoiceMutation.mutate(inv),
        markInvoicePaid: (id: string, method: 'CASH' | 'CHEQUE' | 'ONLINE') => markPaidMutation.mutate({ id, method }),
        addExpense: (exp: Omit<Expense, 'id' | 'date'>) => addExpenseMutation.mutate(exp),

        // Mutation states
        isAddingInvoice: addInvoiceMutation.isPending,
        isMarkingPaid: markPaidMutation.isPending,
        isAddingExpense: addExpenseMutation.isPending
    };
};
