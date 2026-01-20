// packages/types/index.ts
// Central export for all type definitions
// Import from '@/types' or 'packages/types'

// User & Roles
export { UserRole, type User, type LanguageCode } from './user';

// School
export type { SchoolConfig } from './school';

// Auth
export type { AuthResponse } from './auth';

// Academics
export type { AttendanceRecord, ExamComponent, StudentResult } from './academics';

// Finance & HR
export type { Invoice, BankTransaction, Employee, SalarySlip } from './finance';

// Operations
export type {
    BusLocation,
    Bus,
    Book,
    HostelRoom,
    MedicalLog,
    AuditLog
} from './operations';
