
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
  // Academic Data
  homeworks: Homework[];
  leaves: LeaveApplication[];
  liveClasses: Record<string, boolean>;
  syllabus: any[]; // Missing Type
  exams: Exam[];
  students: StudentProfile[];

  // Operations Data
  inquiries: Inquiry[];
  visitors: Visitor[];
  tickets: Ticket[];
  gateLogs: GateLog[];
  localStaff: LocalStaff[];
  lockdownMode: boolean;

  // Finance Data
  invoices: Invoice[];
  expenses: Expense[];

  // Facilities Data
  buses: LiveBus[];
  books: Book[];
  medicalLogs: MedicalLog[];
  hostelRooms: HostelRoom[];

  // Academic Actions (Stubs for now)
  addHomework: (hw: Omit<Homework, 'id' | 'status'>) => void;
  submitHomework: (id: string) => void;
  applyLeave: (leave: Omit<LeaveApplication, 'id' | 'status' | 'teacherName'>) => void;
  updateLeaveStatus: (id: string, status: 'APPROVED' | 'REJECTED') => void;
  toggleLiveClass: (subject: string, isActive: boolean) => void;
  approveSyllabus: (id: number) => void;
  addExam: (exam: Omit<Exam, 'id'>) => void;

  // Operations Actions
  addInquiry: (inq: Omit<Inquiry, 'id' | 'status'>) => void;
  convertInquiry: (id: number) => void;
  addVisitor: (vis: Omit<Visitor, 'id' | 'status' | 'time'>) => void;
  approveVisitor: (id: number) => void;
  addTicket: (ticket: Omit<Ticket, 'id' | 'status'>) => void;
  resolveTicket: (id: string) => void;
  logGateEntry: (entry: Omit<GateLog, 'id' | 'time' | 'date'>) => void;
  addStaff: (staff: Omit<LocalStaff, 'id'>) => void;
  toggleLockdown: () => void;

  // Finance Actions
  addInvoice: (inv: Omit<Invoice, 'id' | 'status'>) => void;
  markInvoicePaid: (id: string, method: 'CASH' | 'CHEQUE' | 'ONLINE') => void;
  addExpense: (exp: Omit<Expense, 'id' | 'date'>) => void;

  // Facilities Actions
  updateBusStatus: (id: string, status: LiveBus['status']) => void;
  assignBusDriver: (busId: string, driverName: string) => void;

  // Library Actions
  addBook: (book: Book) => void;
  issueBook: (isbn: string, studentId: string) => void;
  returnBook: (isbn: string) => void;

  // Health Actions
  addMedicalLog: (log: Omit<MedicalLog, 'id' | 'time' | 'date'>) => void;

  // Hostel Actions
  allocateRoom: (roomNumber: string, studentId: string) => void;
}


const InteractionContext = createContext<InteractionContextType | undefined>(undefined);

interface InteractionProviderProps {
  children: React.ReactNode;
  isAuthenticated?: boolean;
}

export const InteractionProvider: React.FC<InteractionProviderProps> = ({ children, isAuthenticated = false }) => {
  const queryClient = useQueryClient();

  // --- 1. REAL DATA FETCHING (QUERIES) ---
  // All queries use 'enabled: isAuthenticated' to prevent 401s before login

  // Students
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      // Assuming GET /students exists or using GET /academics/students
      // If not yet implemented, this will fail or return 404. 
      // User asked to replace with useQuery.
      const res = await client.get('/students'); // Adjust route if needed
      return res.data;
    },
    initialData: [],
    enabled: isAuthenticated
  });

  // Staff (Users)
  const { data: localStaff = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const res = await client.get('/staff');
      return res.data;
    },
    initialData: [],
    enabled: isAuthenticated
  });

  // Invoices
  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const res = await client.get('/finance/invoices'); // Adjust route if needed
      return res.data;
    },
    initialData: [],
    enabled: isAuthenticated
  });

  // Expenses
  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const res = await client.get('/finance/expenses');
      return res.data;
    },
    initialData: [],
    enabled: isAuthenticated
  });

  // Buses (Logistics)
  const { data: buses = [] } = useQuery({
    queryKey: ['buses'],
    queryFn: async () => {
      const res = await client.get('/logistics/buses');
      return res.data;
    },
    initialData: [],
    enabled: isAuthenticated
  });

  // Books (Logistics)
  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const res = await client.get('/logistics/books');
      return res.data;
    },
    initialData: [],
    enabled: isAuthenticated
  });

  // Hostel Rooms (Logistics)
  const { data: hostelRooms = [] } = useQuery({
    queryKey: ['hostelRooms'],
    queryFn: async () => {
      const res = await client.get('/logistics/rooms');
      return res.data;
    },
    initialData: [],
    enabled: isAuthenticated
  });

  // Medical Logs (Health)
  const { data: medicalLogs = [] } = useQuery({
    queryKey: ['medicalLogs'],
    queryFn: async () => {
      const res = await client.get('/health/logs');
      return res.data;
    },
    initialData: [],
    enabled: isAuthenticated
  });

  // Homework
  const { data: homeworks = [] } = useQuery({
    queryKey: ['homeworks'],
    queryFn: async () => {
      const res = await client.get('/academics/homework');
      return res.data;
    },
    initialData: [],
    enabled: isAuthenticated
  });

  // Operations
  const { data: inquiries = [] } = useQuery({
    queryKey: ['inquiries'],
    queryFn: async () => {
      const res = await client.get('/operations/inquiries');
      return res.data;
    },
    initialData: [],
    enabled: isAuthenticated
  });

  const { data: visitors = [] } = useQuery({
    queryKey: ['visitors'],
    queryFn: async () => {
      const res = await client.get('/operations/visitors');
      return res.data;
    },
    initialData: [],
    enabled: isAuthenticated
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const res = await client.get('/operations/tickets');
      return res.data;
    },
    initialData: [],
    enabled: isAuthenticated
  });

  // Exams
  const { data: exams = [] } = useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      const res = await client.get('/academics/exams');
      return res.data;
    },
    initialData: [],
    enabled: isAuthenticated
  });

  // Syllabus
  const { data: syllabus = [] } = useQuery({
    queryKey: ['syllabus'],
    queryFn: async () => {
      const res = await client.get('/academics/syllabus');
      return res.data;
    },
    initialData: [],
    enabled: isAuthenticated
  });

  // Gate Logs
  const { data: gateLogs = [] } = useQuery({
    queryKey: ['gateLogs'],
    queryFn: async () => {
      const res = await client.get('/operations/gate-logs');
      return res.data;
    },
    initialData: [],
    enabled: isAuthenticated
  });

  // System Settings (Lockdown Mode)
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await client.get('/operations/settings');
      return res.data;
    },
    initialData: { lockdown_mode: false },
    enabled: isAuthenticated
  });
  const lockdownMode = settings?.lockdown_mode || false;

  // Leaves
  const { data: leaves = [] } = useQuery({
    queryKey: ['leaves'],
    queryFn: async () => {
      const res = await client.get('/academics/leaves');
      return res.data;
    },
    initialData: [],
    enabled: isAuthenticated
  });

  // Live Classes
  const { data: liveClassesList = [] } = useQuery({
    queryKey: ['liveClasses'],
    queryFn: async () => {
      const res = await client.get('/academics/live-classes');
      return res.data as LiveClass[];
    },
    initialData: [],
    enabled: isAuthenticated
  });

  // Map Array to Record<Subject, Boolean>
  const liveClasses = useMemo(() => {
    const map: Record<string, boolean> = {};
    liveClassesList.forEach((c: any) => {
      if (c.subject) map[c.subject] = c.is_active;
    });
    return map;
  }, [liveClassesList]);


  // --- 3. MUTATIONS (REAL) ---

  // Settings Mutation
  const toggleLockdownMutation = useMutation({
    mutationFn: (enabled: boolean) => client.post('/operations/settings/toggle-lockdown', { enabled }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] })
  });
  const toggleLockdown = () => toggleLockdownMutation.mutate(!lockdownMode);

  // Exam Mutation
  const addExamMutation = useMutation({
    mutationFn: (newExam: any) => client.post('/academics/exams', newExam),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exams'] })
  });
  const addExam = (exam: Omit<Exam, 'id'>) => addExamMutation.mutate(exam);

  // Attendance Mutation
  const markAttendanceMutation = useMutation({
    mutationFn: (data: { date: Date, records: any[] }) => client.post('/attendance', data),
    onSuccess: () => console.log("Attendance Marked")
  });
  const markAttendance = (data: { date: Date, records: any[] }) => markAttendanceMutation.mutate(data);

  // Homework Mutation
  const addHomeworkMutation = useMutation({
    mutationFn: (newHw: Omit<Homework, 'id' | 'status'>) => client.post('/academics/homework', newHw),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['homeworks'] })
  });
  const addHomework = (hw: Omit<Homework, 'id' | 'status'>) => addHomeworkMutation.mutate(hw);

  // Expense Mutation
  const addExpenseMutation = useMutation({
    mutationFn: (newExp: Omit<Expense, 'id' | 'date'>) => client.post('/finance/expenses', { ...newExp, date: new Date() }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] })
  });
  const addExpense = (exp: Omit<Expense, 'id' | 'date'>) => addExpenseMutation.mutate(exp);

  // Inquiry Mutation
  const addInquiryMutation = useMutation({
    mutationFn: (newInq: Omit<Inquiry, 'id' | 'status'>) => client.post('/operations/inquiries', newInq),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inquiries'] })
  });
  const addInquiry = (inq: Omit<Inquiry, 'id' | 'status'>) => addInquiryMutation.mutate(inq);

  // Visitor Mutation
  const addVisitorMutation = useMutation({
    mutationFn: (newVis: Omit<Visitor, 'id' | 'status' | 'time'>) => client.post('/operations/visitors', newVis),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['visitors'] })
  });
  const addVisitor = (vis: Omit<Visitor, 'id' | 'status' | 'time'>) => addVisitorMutation.mutate(vis);

  // Ticket Mutation
  const addTicketMutation = useMutation({
    mutationFn: (newTic: Omit<Ticket, 'id' | 'status'>) => client.post('/operations/tickets', newTic),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] })
  });
  const addTicket = (ticket: Omit<Ticket, 'id' | 'status'>) => addTicketMutation.mutate(ticket);

  // Staff Mutation
  const addStaffMutation = useMutation({
    mutationFn: (newStaff: Omit<LocalStaff, 'id'>) => client.post('/staff', newStaff),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] })
  });
  const addStaff = (staff: Omit<LocalStaff, 'id'>) => addStaffMutation.mutate(staff);

  // Library Mutation
  const returnBookMutation = useMutation({
    mutationFn: (bookId: string) => client.post('/logistics/return-book', { bookId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['books'] })
  });
  const returnBook = (isbn: string) => returnBookMutation.mutate(isbn);

  // Hostel Mutation
  const allocateRoomMutation = useMutation({
    mutationFn: (data: { roomId: string, studentId: string }) => client.post('/logistics/allocate-room', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hostelRooms'] })
  });
  const allocateRoom = (roomNumber: string, studentId: string) => {
    console.warn("allocateRoom: Requires Room ID, only Number provided.");
  };

  // Medical Mut
  const addMedicalLogMutation = useMutation({
    mutationFn: (log: any) => client.post('/health/log', { ...log, studentId: 'TODO_PASS_ID', condition: log.issue, treatment: log.action }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['medicalLogs'] })
  });
  const addMedicalLog = (log: Omit<MedicalLog, 'id' | 'time' | 'date'>) => {
    // Stub
  };

  // --- NEW MUTATIONS (PHASE 7) ---

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
  const toggleLiveClass = (subject: string, isActive: boolean) => toggleLiveClassMutation.mutate({ subject, isActive, classId: '10A' }); // Default Class

  // Invoice Mutation
  const addInvoiceMutation = useMutation({
    mutationFn: (newInv: Omit<Invoice, 'id' | 'status'>) => client.post('/finance/invoices', newInv),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] })
  });
  const addInvoice = (inv: Omit<Invoice, 'id' | 'status'>) => addInvoiceMutation.mutate(inv);

  // Stubs for others
  const submitHomework = (id: string) => { };
  const resolveTicket = (id: string) => { };
  const logGateEntry = (entry: Omit<GateLog, 'id' | 'time' | 'date'>) => { };
  const convertInquiry = (id: number) => { };
  const approveVisitor = (id: number) => { };
  const updateBusStatus = (id: string, status: LiveBus['status']) => { };
  const assignBusDriver = (busId: string, driverName: string) => { };
  const addBook = (book: Book) => { };
  const issueBook = (isbn: string, studentId: string) => { };

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
