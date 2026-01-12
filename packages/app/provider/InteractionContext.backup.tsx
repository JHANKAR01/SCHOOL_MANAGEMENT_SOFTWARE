import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import { UserRole, Invoice, Bus, Book, HostelRoom, MedicalLog } from '../../../types';

// --- ACADEMIC TYPES ---
export interface Homework {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED';
  classId: string;
}

export interface LiveClass {
  id: string;
  subject: string;
  class_id: string;
  is_active: boolean;
  meeting_link: string;
}

export interface LeaveApplication {
  id: string;
  teacherName: string;
  type: 'SICK' | 'CASUAL' | 'EARNED';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Exam {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  classes: string[];
}

export interface StudentProfile {
  id: string;
  name: string;
  class: string;
  roll: number;
}

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

// --- FINANCE TYPES ---
export interface Expense {
  id: string;
  category: 'UTILITY' | 'VENDOR' | 'SALARY' | 'MAINTENANCE';
  amount: number;
  description: string;
  date: string;
}

// --- FLEET TYPES ---
export interface LiveBus extends Bus {
  status: 'IDLE' | 'ON_ROUTE' | 'MAINTENANCE';
  lat: number;
  lng: number;
  speed: number;
}

export interface InteractionContextType {
  homeworks: Homework[];
  leaves: LeaveApplication[];
  liveClasses: Record<string, boolean>;
  syllabus: any[];
  exams: Exam[];
  students: StudentProfile[];
  inquiries: Inquiry[];
  visitors: Visitor[];
  tickets: Ticket[];
  gateLogs: GateLog[];
  localStaff: LocalStaff[];
  lockdownMode: boolean;
  invoices: Invoice[];
  expenses: Expense[];
  buses: LiveBus[];
  books: Book[];
  medicalLogs: MedicalLog[];
  hostelRooms: HostelRoom[];

  addHomework: (hw: Omit<Homework, 'id' | 'status'>) => void;
  submitHomework: (id: string) => void;
  applyLeave: (leave: Omit<LeaveApplication, 'id' | 'status' | 'teacherName'>) => void;
  updateLeaveStatus: (id: string, status: 'APPROVED' | 'REJECTED') => void;
  toggleLiveClass: (subject: string, isActive: boolean) => void;
  approveSyllabus: (id: number) => void;
  addExam: (exam: Omit<Exam, 'id'>) => void;
  addInquiry: (inq: Omit<Inquiry, 'id' | 'status'>) => void;
  convertInquiry: (id: number) => void;
  addVisitor: (vis: Omit<Visitor, 'id' | 'status' | 'time'>) => void;
  approveVisitor: (id: number) => void;
  addTicket: (ticket: Omit<Ticket, 'id' | 'status'>) => void;
  resolveTicket: (id: string) => void;
  logGateEntry: (entry: Omit<GateLog, 'id' | 'time' | 'date'>) => void;
  addStaff: (staff: Omit<LocalStaff, 'id'>) => void;
  toggleLockdown: () => void;
  addInvoice: (inv: Omit<Invoice, 'id' | 'status'>) => void;
  markInvoicePaid: (id: string, method: 'CASH' | 'CHEQUE' | 'ONLINE') => void;
  addExpense: (exp: Omit<Expense, 'id' | 'date'>) => void;
  updateBusStatus: (id: string, status: LiveBus['status']) => void;
  assignBusDriver: (busId: string, driverName: string) => void;
  addBook: (book: Book) => void;
  issueBook: (isbn: string, studentId: string) => void;
  returnBook: (isbn: string) => void;
  addMedicalLog: (log: Omit<MedicalLog, 'id' | 'time' | 'date'>) => void;
  allocateRoom: (roomNumber: string, studentId: string) => void;
}

const InteractionContext = createContext<InteractionContextType | undefined>(undefined);

// EXPLICITLY DESTRUCTURE isAuthenticated with proper typing
export const InteractionProvider: React.FC<{ children: React.ReactNode; isAuthenticated: boolean }> = ({ children, isAuthenticated }) => {
  const queryClient = useQueryClient();

  // DEBUG LOG - Shows in console to verify auth state
  useEffect(() => {
    console.log(`[InteractionContext] Auth State: ${isAuthenticated} (Queries ${isAuthenticated ? 'ENABLED' : 'DISABLED'})`);
  }, [isAuthenticated]);

  // COMMON QUERY OPTIONS - retry: false prevents 401 flood
  const queryOptions = {
    enabled: isAuthenticated === true, // Explicit check
    initialData: [] as any[],
    retry: false,
    refetchOnWindowFocus: false
  };

  // --- DATA FETCHING (QUERIES) ---

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: async () => (await client.get('/students')).data,
    ...queryOptions
  });

  const { data: localStaff = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => (await client.get('/staff')).data,
    ...queryOptions
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => (await client.get('/finance/invoices')).data,
    ...queryOptions
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => (await client.get('/finance/expenses')).data,
    ...queryOptions
  });

  const { data: buses = [] } = useQuery({
    queryKey: ['buses'],
    queryFn: async () => (await client.get('/logistics/buses')).data,
    ...queryOptions
  });

  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: async () => (await client.get('/logistics/books')).data,
    ...queryOptions
  });

  const { data: hostelRooms = [] } = useQuery({
    queryKey: ['hostelRooms'],
    queryFn: async () => (await client.get('/logistics/rooms')).data,
    ...queryOptions
  });

  const { data: medicalLogs = [] } = useQuery({
    queryKey: ['medicalLogs'],
    queryFn: async () => (await client.get('/health/logs')).data,
    ...queryOptions
  });

  const { data: homeworks = [] } = useQuery({
    queryKey: ['homeworks'],
    queryFn: async () => (await client.get('/academics/homework')).data,
    ...queryOptions
  });

  const { data: inquiries = [] } = useQuery({
    queryKey: ['inquiries'],
    queryFn: async () => (await client.get('/operations/inquiries')).data,
    ...queryOptions
  });

  const { data: visitors = [] } = useQuery({
    queryKey: ['visitors'],
    queryFn: async () => (await client.get('/operations/visitors')).data,
    ...queryOptions
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => (await client.get('/operations/tickets')).data,
    ...queryOptions
  });

  const { data: exams = [] } = useQuery({
    queryKey: ['exams'],
    queryFn: async () => (await client.get('/academics/exams')).data,
    ...queryOptions
  });

  const { data: syllabus = [] } = useQuery({
    queryKey: ['syllabus'],
    queryFn: async () => (await client.get('/academics/syllabus')).data,
    ...queryOptions
  });

  const { data: gateLogs = [] } = useQuery({
    queryKey: ['gateLogs'],
    queryFn: async () => (await client.get('/operations/gate-logs')).data,
    ...queryOptions
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await client.get('/operations/settings')).data,
    initialData: { lockdown_mode: false },
    enabled: isAuthenticated === true,
    retry: false,
    refetchOnWindowFocus: false
  });
  const lockdownMode = settings?.lockdown_mode || false;

  const { data: leaves = [] } = useQuery({
    queryKey: ['leaves'],
    queryFn: async () => (await client.get('/academics/leaves')).data,
    ...queryOptions
  });

  const { data: liveClassesList = [] } = useQuery({
    queryKey: ['liveClasses'],
    queryFn: async () => (await client.get('/academics/live-classes')).data,
    initialData: [] as any[],
    enabled: isAuthenticated === true,
    retry: false,
    refetchOnWindowFocus: false
  });

  const liveClasses = useMemo(() => {
    const map: Record<string, boolean> = {};
    liveClassesList.forEach((c: any) => {
      if (c.subject) map[c.subject] = c.is_active;
    });
    return map;
  }, [liveClassesList]);

  // --- MUTATIONS ---
  const toggleLockdownMutation = useMutation({
    mutationFn: (enabled: boolean) => client.post('/operations/settings/toggle-lockdown', { enabled }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] })
  });
  const toggleLockdown = () => toggleLockdownMutation.mutate(!lockdownMode);

  const addExamMutation = useMutation({
    mutationFn: (newExam: any) => client.post('/academics/exams', newExam),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exams'] })
  });
  const addExam = (exam: Omit<Exam, 'id'>) => addExamMutation.mutate(exam);

  const addHomeworkMutation = useMutation({
    mutationFn: (newHw: Omit<Homework, 'id' | 'status'>) => client.post('/academics/homework', newHw),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['homeworks'] })
  });
  const addHomework = (hw: Omit<Homework, 'id' | 'status'>) => addHomeworkMutation.mutate(hw);

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

  const applyLeaveMutation = useMutation({
    mutationFn: (leave: Omit<LeaveApplication, 'id' | 'status' | 'teacherName'>) => client.post('/academics/leaves', leave),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaves'] })
  });
  const applyLeave = (leave: Omit<LeaveApplication, 'id' | 'status' | 'teacherName'>) => applyLeaveMutation.mutate(leave);

  const updateLeaveStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'APPROVED' | 'REJECTED' }) => client.patch(`/academics/leaves/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaves'] })
  });
  const updateLeaveStatus = (id: string, status: 'APPROVED' | 'REJECTED') => updateLeaveStatusMutation.mutate({ id, status });

  const approveSyllabusMutation = useMutation({
    mutationFn: (id: number) => client.patch(`/academics/syllabus/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['syllabus'] })
  });
  const approveSyllabus = (id: number) => approveSyllabusMutation.mutate(id);

  const markInvoicePaidMutation = useMutation({
    mutationFn: ({ id, method }: { id: string, method: string }) => client.patch(`/finance/invoices/${id}/pay`, { method }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] })
  });
  const markInvoicePaid = (id: string, method: 'CASH' | 'CHEQUE' | 'ONLINE') => markInvoicePaidMutation.mutate({ id, method });

  const toggleLiveClassMutation = useMutation({
    mutationFn: (data: { subject: string, isActive: boolean, classId: string }) => client.post('/academics/live-classes/toggle', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['liveClasses'] })
  });
  const toggleLiveClass = (subject: string, isActive: boolean) => toggleLiveClassMutation.mutate({ subject, isActive, classId: '10A' });

  const addInvoiceMutation = useMutation({
    mutationFn: (newInv: Omit<Invoice, 'id' | 'status'>) => client.post('/finance/invoices', newInv),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] })
  });
  const addInvoice = (inv: Omit<Invoice, 'id' | 'status'>) => addInvoiceMutation.mutate(inv);

  // Stubs
  const submitHomework = (id: string) => { };
  const resolveTicket = (id: string) => { };
  const logGateEntry = (entry: Omit<GateLog, 'id' | 'time' | 'date'>) => { };
  const convertInquiry = (id: number) => { };
  const approveVisitor = (id: number) => { };
  const updateBusStatus = (id: string, status: LiveBus['status']) => { };
  const assignBusDriver = (busId: string, driverName: string) => { };
  const addBook = (book: Book) => { };
  const issueBook = (isbn: string, studentId: string) => { };
  const addMedicalLog = (log: any) => { };
  const allocateRoom = (roomNumber: string, studentId: string) => { };

  return (
    <InteractionContext.Provider value={{
      homeworks, leaves, liveClasses, syllabus, exams, students,
      inquiries, visitors, tickets, gateLogs, localStaff, lockdownMode,
      invoices, expenses,
      buses, books, medicalLogs, hostelRooms,
      addHomework, submitHomework, applyLeave, updateLeaveStatus, toggleLiveClass, approveSyllabus, addExam,
      addInquiry, convertInquiry, addVisitor, approveVisitor, addTicket, resolveTicket, logGateEntry, addStaff, toggleLockdown,
      addInvoice, markInvoicePaid, addExpense,
      updateBusStatus, assignBusDriver,
      addBook, issueBook, returnBook,
      addMedicalLog, allocateRoom
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
