/**
 * InteractionContext.tsx
 * 
 * SLIMMED DOWN VERSION (Batch 1 Migration Complete)
 * 
 * Migrated to hooks:
 * - Transport (buses, updateBusStatus, assignBusDriver) → useTransport.ts
 * - Academics (homeworks, exams, syllabus, leaves, liveClasses) → useAcademics.ts
 * 
 * Remaining modules (to be migrated in future batches):
 * - Operations (inquiries, visitors, tickets, gateLogs)
 * - Finance (invoices, expenses) → already has FinanceDashboard component-level fetching
 * - Library (books)
 * - Health (medicalLogs)
 * - Hostel (hostelRooms)
 */
import React, { createContext, useContext, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import { UserRole, Invoice, Book, HostelRoom, MedicalLog } from '../../../types';

// --- OPERATIONS TYPES ---
export interface Inquiry {
  id: number;
  parent_name: string;
  phone: string;
  target_class: string;
  status: 'NEW' | 'FOLLOW_UP' | 'CONVERTED';
}

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

// --- FINANCE TYPES ---
export interface Expense {
  id: string;
  category: 'UTILITY' | 'VENDOR' | 'SALARY' | 'MAINTENANCE';
  amount: number;
  description: string;
  date: string;
}

// ============================================================================
// PERMISSION GROUPS - Covers all 22 System Roles (Source of Truth)
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
// CONTEXT TYPE - Slimmed down, only includes remaining modules
// ============================================================================
export interface InteractionContextType {
  // Global State
  lockdownMode: boolean;
  toggleLockdown: () => void;

  // Students & Staff (HR)
  students: StudentProfile[];
  localStaff: LocalStaff[];
  addStaff: (staff: Omit<LocalStaff, 'id'>) => void;

  // Operations (Batch 2)
  inquiries: Inquiry[];
  visitors: Visitor[];
  tickets: Ticket[];
  gateLogs: GateLog[];
  addInquiry: (inq: Omit<Inquiry, 'id' | 'status'>) => void;
  convertInquiry: (id: number) => void;
  addVisitor: (vis: Omit<Visitor, 'id' | 'status' | 'time'>) => void;
  approveVisitor: (id: number) => void;
  addTicket: (ticket: Omit<Ticket, 'id' | 'status'>) => void;
  resolveTicket: (id: string) => void;
  logGateEntry: (entry: Omit<GateLog, 'id' | 'time' | 'date'>) => void;

  // Finance (Batch 2 - keep until FinanceDashboard is fully migrated)
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
    staleTime: 1000 * 60 * 5,
  };

  // =========================================================================
  // REMAINING QUERIES (Transport & Academics moved to hooks)
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

  // Operations
  const { data: inquiries = [] } = useQuery({
    queryKey: ['inquiries'],
    queryFn: async () => (await client.get('/operations/inquiries')).data,
    enabled: canAccess(PERMISSIONS.ADMISSIONS),
    ...queryOptions
  });

  const { data: visitors = [] } = useQuery({
    queryKey: ['visitors'],
    queryFn: async () => (await client.get('/operations/visitors')).data,
    enabled: canAccess([UserRole.RECEPTIONIST, UserRole.SECURITY_HEAD, UserRole.SCHOOL_ADMIN]),
    ...queryOptions
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => (await client.get('/operations/tickets')).data,
    enabled: canAccess([UserRole.ESTATE_MANAGER, UserRole.SCHOOL_ADMIN]),
    ...queryOptions
  });

  const { data: gateLogs = [] } = useQuery({
    queryKey: ['gateLogs'],
    queryFn: async () => (await client.get('/operations/gate-logs')).data,
    enabled: canAccess([UserRole.SECURITY_HEAD, UserRole.SCHOOL_ADMIN]),
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

  const addInquiryMutation = useMutation({
    mutationFn: (newInq: Omit<Inquiry, 'id' | 'status'>) => client.post('/operations/inquiries', newInq),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inquiries'] })
  });
  const addInquiry = (inq: Omit<Inquiry, 'id' | 'status'>) => addInquiryMutation.mutate(inq);

  const addVisitorMutation = useMutation({
    mutationFn: (newVis: Omit<Visitor, 'id' | 'status' | 'time'>) => client.post('/operations/visitors', newVis),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['visitors'] })
  });
  const addVisitor = (vis: Omit<Visitor, 'id' | 'status' | 'time'>) => addVisitorMutation.mutate(vis);

  const addTicketMutation = useMutation({
    mutationFn: (newTic: Omit<Ticket, 'id' | 'status'>) => client.post('/operations/tickets', newTic),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] })
  });
  const addTicket = (ticket: Omit<Ticket, 'id' | 'status'>) => addTicketMutation.mutate(ticket);

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

  // Stubs
  const resolveTicket = (id: string) => { };
  const logGateEntry = (entry: Omit<GateLog, 'id' | 'time' | 'date'>) => { };
  const convertInquiry = (id: number) => { };
  const approveVisitor = (id: number) => { };
  const addBook = (book: Book) => { };
  const issueBook = (isbn: string, studentId: string) => { };
  const addMedicalLog = (log: any) => { };
  const allocateRoom = (roomNumber: string, studentId: string) => { };

  return (
    <InteractionContext.Provider value={{
      lockdownMode, toggleLockdown,
      students, localStaff, addStaff,
      inquiries, visitors, tickets, gateLogs,
      addInquiry, convertInquiry, addVisitor, approveVisitor, addTicket, resolveTicket, logGateEntry,
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
