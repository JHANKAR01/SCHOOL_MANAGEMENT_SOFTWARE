/**
 * useLibrary Hook
 * Component-level data fetching for Library module (Books)
 * Migrated from InteractionContext (Batch 3)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import { Book } from '../../../types';

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

export const useBooks = () => {
    return useQuery<Book[]>({
        queryKey: ['books'],
        queryFn: async () => (await client.get('/logistics/books')).data,
        ...QUERY_OPTIONS
    });
};

// ============================================================================
// MUTATIONS
// ============================================================================

export const useAddBook = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newBook: Omit<Book, 'id'> & { isbn: string; title: string; author: string }) =>
            client.post('/logistics/books', newBook),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['books'] })
    });
};

export const useIssueBook = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ isbn, studentId }: { isbn: string; studentId: string }) =>
            client.post('/logistics/books/issue', { isbn, studentId }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['books'] })
    });
};

export const useReturnBook = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (isbn: string) =>
            client.post('/logistics/return-book', { bookId: isbn }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['books'] })
    });
};

// ============================================================================
// COMBINED HOOK
// ============================================================================

export const useLibrary = () => {
    const { data: books = [], isLoading, error } = useBooks();
    const addBookMutation = useAddBook();
    const issueBookMutation = useIssueBook();
    const returnBookMutation = useReturnBook();

    return {
        // Data
        books,
        isLoading,
        error,

        // Mutations (matching old Context API)
        addBook: (book: Book) => addBookMutation.mutate(book as any),
        issueBook: (isbn: string, studentId: string) => issueBookMutation.mutate({ isbn, studentId }),
        returnBook: (isbn: string) => returnBookMutation.mutate(isbn),

        // Mutation states
        isAddingBook: addBookMutation.isPending,
        isIssuing: issueBookMutation.isPending,
        isReturning: returnBookMutation.isPending
    };
};
