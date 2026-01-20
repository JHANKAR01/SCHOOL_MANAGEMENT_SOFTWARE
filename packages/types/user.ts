// packages/types/user.ts
// User and role types

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

export interface User {
    id: string;
    name: string;
    role: UserRole;
    school_id: string;
    department?: string;
}

export type LanguageCode = 'en' | 'hi' | 'mr';
