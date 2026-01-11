
import React, { createContext, useContext, useState, useEffect } from 'react';
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

export const InteractionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  // --- 1. REAL DATA FETCHING (QUERIES) ---

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
    initialData: []
  });

  // Staff (Users)
  const { data: localStaff = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const res = await client.get('/staff');
      return res.data;
    },
    initialData: []
  });

  // Invoices
  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const res = await client.get('/finance/invoices'); // Adjust route if needed
      return res.data;
    },
    initialData: []
  });

  // Buses
  const { data: buses = [] } = useQuery({
    queryKey: ['buses'],
    queryFn: async () => {
      const res = await client.get('/transport/buses'); // Adjust route if needed
      return res.data;
    },
    initialData: []
  });

  // --- 2. MISSING TABLES (EMPTY ARRAYS + TODOS) ---
  const homeworks: Homework[] = []; // TODO: DB Table Missing
  const leaves: LeaveApplication[] = []; // TODO: DB Table Missing
  const liveClasses: Record<string, boolean> = {}; // TODO: DB Table Missing
  const syllabus: any[] = []; // TODO: DB Table Missing
  const exams: Exam[] = []; // TODO: DB Table Missing

  const inquiries: Inquiry[] = []; // TODO: DB Table Missing
  const visitors: Visitor[] = []; // TODO: DB Table Missing
  const tickets: Ticket[] = []; // TODO: DB Table Missing
  const gateLogs: GateLog[] = []; // TODO: DB Table Missing
  const lockdownMode = false; // TODO: DB Table Missing (Settings)

  const expenses: Expense[] = []; // TODO: DB Table Missing

  const books: Book[] = []; // TODO: DB Table Missing in Queries (Exists in Schema though)
  const medicalLogs: MedicalLog[] = []; // TODO: DB Table Missing in Queries (Exists in Schema though)
  const hostelRooms: HostelRoom[] = []; // TODO: DB Table Missing


  // --- 3. MUTATIONS (STUBS OR REAL) ---
  const addHomework = (hw: Omit<Homework, 'id' | 'status'>) => {
    console.log('addHomework not implemented (DB Missing)');
  };
  const submitHomework = (id: string) => { };
  const applyLeave = (leave: Omit<LeaveApplication, 'id' | 'status' | 'teacherName'>) => { };
  const updateLeaveStatus = (id: string, status: 'APPROVED' | 'REJECTED') => { };
  const toggleLiveClass = (subject: string, isActive: boolean) => { };
  const approveSyllabus = (id: number) => { };
  const addExam = (exam: Omit<Exam, 'id'>) => { };

  const addInquiry = (inq: Omit<Inquiry, 'id' | 'status'>) => { };
  const convertInquiry = (id: number) => { };
  const addVisitor = (vis: Omit<Visitor, 'id' | 'status' | 'time'>) => { };
  const approveVisitor = (id: number) => { };
  const addTicket = (ticket: Omit<Ticket, 'id' | 'status'>) => { };
  const resolveTicket = (id: string) => { };
  const logGateEntry = (entry: Omit<GateLog, 'id' | 'time' | 'date'>) => { };

  const addStaffMutation = useMutation({
    mutationFn: (newStaff: Omit<LocalStaff, 'id'>) => client.post('/staff', newStaff),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] })
  });
  const addStaff = (staff: Omit<LocalStaff, 'id'>) => addStaffMutation.mutate(staff);

  const toggleLockdown = () => { };

  const addInvoice = (inv: Omit<Invoice, 'id' | 'status'>) => { };
  const markInvoicePaid = (id: string, method: 'CASH' | 'CHEQUE' | 'ONLINE') => { };
  const addExpense = (exp: Omit<Expense, 'id' | 'date'>) => { };

  const updateBusStatus = (id: string, status: LiveBus['status']) => { };
  const assignBusDriver = (busId: string, driverName: string) => { };

  const addBook = (book: Book) => { };
  const issueBook = (isbn: string, studentId: string) => { };
  const returnBook = (isbn: string) => { };

  const addMedicalLog = (log: Omit<MedicalLog, 'id' | 'time' | 'date'>) => { };
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
