/**
 * InteractionContext.tsx
 * 
 * SLIMMED DOWN VERSION (Batch 1 & 2 Migration Complete)
 * 
 * Migrated to hooks:
 * - Transport → useTransport.ts
 * - Academics → useAcademics.ts
 * - Operations → useOperations.ts
 * - Admissions → useAdmissions.ts
 * 
 * Remaining modules (Batch 3):
 * - Library (books)
 * - Health (medicalLogs)
 * - Hostel (hostelRooms)
 * 
 * Global State (kept here):
 * - lockdownMode / toggleLockdown
 * - students / localStaff (HR)
 * - Finance (addExpense - used by BusFleet for fuel logging)
 */
import React, { createContext, useContext, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import { UserRole, Invoice, Book, HostelRoom, MedicalLog } from '../../../types';

// Types
export interface LocalStaff {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  joinedAt: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  class: string;
  roll: number;
}

export interface Expense {
  id: string;
  category: 'UTILITY' | 'VENDOR' | 'SALARY' | 'MAINTENANCE';
  amount: number;
  description: string;
  date: string;
}

// ============================================================================
// PERMISSION GROUPS - Source of Truth (exported for hooks)
// ============================================================================
export const PERMISSIONS = {
  FINANCE: [UserRole.ACCOUNTANT, UserRole.FINANCE_MANAGER, UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL, UserRole.SUPER_ADMIN],
  ACADEMICS: [UserRole.TEACHER, UserRole.HOD, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL, UserRole.STUDENT, UserRole.PARENT, UserRole.EXAM_CELL],
  OPERATIONS: [UserRole.RECEPTIONIST, UserRole.SCHOOL_ADMIN, UserRole.ESTATE_MANAGER, UserRole.SECURITY_HEAD, UserRole.PRINCIPAL, UserRole.IT_ADMIN],
  HR: [UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN, UserRole.PRINCIPAL],
  TRANSPORT: [UserRole.FLEET_MANAGER, UserRole.SCHOOL_ADMIN, UserRole.PARENT, UserRole.STUDENT, UserRole.PRINCIPAL],
  LIBRARY: [UserRole.LIBRARIAN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PRINCIPAL],
  HEALTH: [UserRole.NURSE, UserRole.SCHOOL_ADMIN, UserRole.COUNSELOR, UserRole.PRINCIPAL],
  HOSTEL: [UserRole.WARDEN, UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL],
  ADMISSIONS: [UserRole.ADMISSIONS_OFFICER, UserRole.SCHOOL_ADMIN, UserRole.RECEPTIONIST, UserRole.PRINCIPAL],
  INVENTORY: [UserRole.INVENTORY_MANAGER, UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL],
  IT_SYSTEMS: [UserRole.IT_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN]
};

// ============================================================================
// CONTEXT TYPE - Minimal (Global + Batch 3 only)
// ============================================================================
export interface InteractionContextType {
  // Global State
  lockdownMode: boolean;
  toggleLockdown: () => void;

  // HR (Students & Staff)
  students: StudentProfile[];
  localStaff: LocalStaff[];
  addStaff: (staff: Omit<LocalStaff, 'id'>) => void;

  // Finance - Keep addExpense for BusFleet fuel logging
  invoices: Invoice[];
  expenses: Expense[];
  addInvoice: (inv: Omit<Invoice, 'id' | 'status'>) => void;
  markInvoicePaid: (id: string, method: 'CASH' | 'CHEQUE' | 'ONLINE') => void;
  addExpense: (exp: Omit<Expense, 'id' | 'date'>) => void;

  // Library (Batch 3)
  books: Book[];
  addBook: (book: Book) => void;
  issueBook: (isbn: string, studentId: string) => void;
  returnBook: (isbn: string) => void;

  // Health (Batch 3)
  medicalLogs: MedicalLog[];
  addMedicalLog: (log: Omit<MedicalLog, 'id' | 'time' | 'date'>) => void;

  // Hostel (Batch 3)
  hostelRooms: HostelRoom[];
  allocateRoom: (roomNumber: string, studentId: string) => void;
}

const InteractionContext = createContext<InteractionContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================
export const InteractionProvider: React.FC<{
  children: React.ReactNode;
  isAuthenticated: boolean;
  role?: UserRole;
}> = ({ children, isAuthenticated, role }) => {
  const queryClient = useQueryClient();

  const canAccess = (allowedRoles: UserRole[]): boolean => {
    return isAuthenticated && !!role && allowedRoles.includes(role);
  };

  useEffect(() => {
    console.log(`[InteractionContext] Auth: ${isAuthenticated}, Role: ${role || 'NONE'}`);
  }, [isAuthenticated, role]);

  const queryOptions = {
    initialData: [] as any[],
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  };

  // =========================================================================
  // QUERIES - Only remaining modules
  // =========================================================================

  // Students
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: async () => (await client.get('/students')).data,
    enabled: canAccess([UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL, UserRole.TEACHER, UserRole.HOD, UserRole.SUPER_ADMIN]),
    ...queryOptions
  });

  // Staff
  const { data: localStaff = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => (await client.get('/staff')).data,
    enabled: canAccess(PERMISSIONS.HR),
    ...queryOptions
  });

  // Finance
  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => (await client.get('/finance/invoices')).data,
    enabled: canAccess(PERMISSIONS.FINANCE),
    ...queryOptions
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => (await client.get('/finance/expenses')).data,
    enabled: canAccess(PERMISSIONS.FINANCE),
    ...queryOptions
  });

  // Library
  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: async () => (await client.get('/logistics/books')).data,
    enabled: canAccess(PERMISSIONS.LIBRARY),
    ...queryOptions
  });

  // Hostel
  const { data: hostelRooms = [] } = useQuery({
    queryKey: ['hostelRooms'],
    queryFn: async () => (await client.get('/logistics/rooms')).data,
    enabled: canAccess(PERMISSIONS.HOSTEL),
    ...queryOptions
  });

  // Health
  const { data: medicalLogs = [] } = useQuery({
    queryKey: ['medicalLogs'],
    queryFn: async () => (await client.get('/health/logs')).data,
    enabled: canAccess(PERMISSIONS.HEALTH),
    ...queryOptions
  });

  // Global Settings
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await client.get('/operations/settings')).data,
    initialData: { lockdown_mode: false },
    enabled: isAuthenticated,
    retry: false,
    refetchOnWindowFocus: false
  });
  const lockdownMode = settings?.lockdown_mode || false;

  // =========================================================================
  // MUTATIONS
  // =========================================================================

  const toggleLockdownMutation = useMutation({
    mutationFn: (enabled: boolean) => client.post('/operations/settings/toggle-lockdown', { enabled }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] })
  });
  const toggleLockdown = () => toggleLockdownMutation.mutate(!lockdownMode);

  const addExpenseMutation = useMutation({
    mutationFn: (newExp: Omit<Expense, 'id' | 'date'>) => client.post('/finance/expenses', { ...newExp, date: new Date() }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] })
  });
  const addExpense = (exp: Omit<Expense, 'id' | 'date'>) => addExpenseMutation.mutate(exp);

  const addStaffMutation = useMutation({
    mutationFn: (newStaff: Omit<LocalStaff, 'id'>) => client.post('/staff', newStaff),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] })
  });
  const addStaff = (staff: Omit<LocalStaff, 'id'>) => addStaffMutation.mutate(staff);

  const returnBookMutation = useMutation({
    mutationFn: (bookId: string) => client.post('/logistics/return-book', { bookId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['books'] })
  });
  const returnBook = (isbn: string) => returnBookMutation.mutate(isbn);

  const markInvoicePaidMutation = useMutation({
    mutationFn: ({ id, method }: { id: string, method: string }) => client.patch(`/finance/invoices/${id}/pay`, { method }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] })
  });
  const markInvoicePaid = (id: string, method: 'CASH' | 'CHEQUE' | 'ONLINE') => markInvoicePaidMutation.mutate({ id, method });

  const addInvoiceMutation = useMutation({
    mutationFn: (newInv: Omit<Invoice, 'id' | 'status'>) => client.post('/finance/invoices', newInv),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] })
  });
  const addInvoice = (inv: Omit<Invoice, 'id' | 'status'>) => addInvoiceMutation.mutate(inv);

  // Stubs (Batch 3 - to be implemented)
  const addBook = (book: Book) => { };
  const issueBook = (isbn: string, studentId: string) => { };
  const addMedicalLog = (log: any) => { };
  const allocateRoom = (roomNumber: string, studentId: string) => { };

  return (
    <InteractionContext.Provider value={{
      lockdownMode, toggleLockdown,
      students, localStaff, addStaff,
      invoices, expenses, addInvoice, markInvoicePaid, addExpense,
      books, addBook, issueBook, returnBook,
      medicalLogs, addMedicalLog,
      hostelRooms, allocateRoom
    }}>
      {children}
    </InteractionContext.Provider>
  );
};

export const useInteraction = () => {
  const context = useContext(InteractionContext);
  if (!context) throw new Error("useInteraction must be used within InteractionProvider");
  return context;
};
