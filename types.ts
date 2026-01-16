
export const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',      // Platform Owner
  SCHOOL_ADMIN: 'SCHOOL_ADMIN',    // HR & Access Control (HR Manager)
  PRINCIPAL: 'PRINCIPAL',          // Academic Head (Results, Timetables)
  VICE_PRINCIPAL: 'VICE_PRINCIPAL', // Academic Ops (Substitutions, Syllabus)

  // DEPARTMENT HEADS
  HOD: 'HOD',                      // Head of Department (Subject Quality)
  FINANCE_MANAGER: 'FINANCE_MANAGER', // Accountant (Fees, Payroll)
  FLEET_MANAGER: 'FLEET_MANAGER',  // Transport Head

  // OPERATIONS & ADMIN
  ADMISSIONS_OFFICER: 'ADMISSIONS_OFFICER', // Lead Management
  EXAM_CELL: 'EXAM_CELL',          // Exam Scheduling & Printing
  LIBRARIAN: 'LIBRARIAN',          // Library Head
  WARDEN: 'WARDEN',                // Hostel Head
  NURSE: 'NURSE',                  // Infirmary Head
  INVENTORY_MANAGER: 'INVENTORY_MANAGER', // Assets & Stationery
  RECEPTIONIST: 'RECEPTIONIST',    // Front Desk
  IT_ADMIN: 'IT_ADMIN',            // System Admin

  // FACILITIES & SECURITY
  SECURITY_HEAD: 'SECURITY_HEAD',  // Gate & Safety
  ESTATE_MANAGER: 'ESTATE_MANAGER', // Maintenance

  // STUDENT SUPPORT
  COUNSELOR: 'COUNSELOR',          // Special Educator/Wellness

  // GENERAL USERS
  TEACHER: 'TEACHER',              // Classroom Staff
  ACCOUNTANT: 'ACCOUNTANT',        // Junior Finance Staff
  PARENT: 'PARENT',
  STUDENT: 'STUDENT'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export type LanguageCode = 'en' | 'hi' | 'mr';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  school_id: string;
  department?: string; // e.g., "Mathematics", "Transport"
}

export interface AuthResponse {
  user: User;
  school: SchoolConfig;
  token: string;
}

export interface SchoolConfig {
  school_id: string;
  name: string;
  logo_url: string;
  primary_color: string;
  features: {
    attendance: boolean;
    fees: boolean;
    transport: boolean;
    library: boolean;
    hostel: boolean;
  };
  location: {
    lat: number;
    lng: number;
  };
  upi_vpa: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  synced: boolean;
}

// --- ACADEMICS ---
export interface ExamComponent {
  id: string;
  name: string; // e.g., "Unit Test 1"
  maxMarks: number;
  weightage: number; // Percentage (0-100)
}

export interface StudentResult {
  studentId: string;
  studentName: string;
  marks: Record<string, number>; // examComponentId -> marksObtained
}

// --- FINANCE ---
export interface Invoice {
  id: string;
  studentId: string;
  amount: number;
  description: string;
  dueDate: string;
  status: 'PENDING' | 'VERIFIED' | 'PAID';
  utr?: string; // User submitted UTR
}

export interface BankTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'CR' | 'DR';
  refNo: string; // Extracted UTR from bank statement
}

// --- HR & PAYROLL ---
export interface Employee {
  id: string;
  name: string;
  role: UserRole;
  basicSalary: number;
  allowances: number;
  pfEnabled: boolean;
  esiEnabled: boolean;
  // removed empty line
}

export interface SalarySlip {
  employeeId: string;
  month: string;
  totalDays: number;
  workingDays: number;
  leaveDays: number; // LOP
  basicPay: number;
  allowances: number;
  deductions: {
    pf: number;
    esi: number;
    lop: number; // Loss of Pay
    tax: number;
  };
  netSalary: number;
}

// --- TRANSPORT ---
export interface BusLocation {
  busId: string;
  lat: number;
  lng: number;
  speed: number;
  timestamp: number;
}

export interface Bus {
  id: string;
  plateNumber: string;
  driverName: string;
  capacity: number;
  routeId: string;
  insuranceExpiry: string;
}

// --- LIBRARY ---
export interface Book {
  isbn: string;
  title: string;
  author: string;
  status: 'AVAILABLE' | 'ISSUED';
  dueDate?: string;
  issuedTo?: string; // Student ID
}

// --- HOSTEL ---
export interface HostelRoom {
  roomNumber: string;
  capacity: number;
  occupied: number;
  gender: 'BOYS' | 'GIRLS';
  students: string[]; // List of Student IDs
}

// --- HEALTH ---
export interface MedicalLog {
  id: number;
  time: string;
  date: string;
  student: string;
  issue: string;
  action: string;
  // removed empty line
}

// --- SECURITY & AUDIT ---
export interface AuditLog {
  id: string;
  school_id: string;
  timestamp: string;
  action: 'FEE_PAYMENT' | 'INVOICE_GEN' | 'GRADE_CHANGE' | 'LOGIN' | 'CREATE_STAFF' | 'TERMINATE_STAFF' | 'RESULTS_PUBLISH';
  entity: 'INVOICE' | 'STUDENT' | 'USER' | 'EXAM' | 'SYSTEM';
  entity_id?: string;
  actor_id: string;
  details: string;
  ip_hash: string;
  old_data?: any; // JSONB
  new_data?: any; // JSONB
}
