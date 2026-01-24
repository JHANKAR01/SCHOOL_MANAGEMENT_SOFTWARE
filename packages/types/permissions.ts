// packages/types/permissions.ts
// Permission types and role-based access control definitions

import { UserRole } from './user';

/**
 * Permission enum for granular access control
 */
export enum Permission {
    // Finance
    VIEW_FINANCES = 'VIEW_FINANCES',
    MANAGE_FINANCES = 'MANAGE_FINANCES',
    CREATE_INVOICES = 'CREATE_INVOICES',
    APPROVE_EXPENSES = 'APPROVE_EXPENSES',

    // Academics
    VIEW_STUDENTS = 'VIEW_STUDENTS',
    MANAGE_STUDENTS = 'MANAGE_STUDENTS',
    VIEW_GRADES = 'VIEW_GRADES',
    MANAGE_GRADES = 'MANAGE_GRADES',

    // Operations
    VIEW_OPERATIONS = 'VIEW_OPERATIONS',
    MANAGE_OPERATIONS = 'MANAGE_OPERATIONS',
    TOGGLE_LOCKDOWN = 'TOGGLE_LOCKDOWN',

    // HR
    VIEW_STAFF = 'VIEW_STAFF',
    MANAGE_STAFF = 'MANAGE_STAFF',

    // System
    MANAGE_SETTINGS = 'MANAGE_SETTINGS',
    VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS',
    MANAGE_USERS = 'MANAGE_USERS',

    // VP Specific
    CAN_APPROVE_RESULTS = 'CAN_APPROVE_RESULTS',
    CAN_APPROVE_LEAVES = 'CAN_APPROVE_LEAVES',
}

/**
 * Permission groups by domain
 * Maps which roles have access to which permissions
 */
export const PERMISSIONS = {
    FINANCE: [UserRole.ACCOUNTANT, UserRole.FINANCE_MANAGER, UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL, UserRole.SUPER_ADMIN] as UserRole[],
    ACADEMICS: [UserRole.TEACHER, UserRole.HOD, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL, UserRole.STUDENT, UserRole.PARENT, UserRole.EXAM_CELL] as UserRole[],
    OPERATIONS: [UserRole.RECEPTIONIST, UserRole.SCHOOL_ADMIN, UserRole.ESTATE_MANAGER, UserRole.SECURITY_HEAD, UserRole.PRINCIPAL, UserRole.IT_ADMIN] as UserRole[],
    HR: [UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN, UserRole.PRINCIPAL] as UserRole[],
    TRANSPORT: [UserRole.FLEET_MANAGER, UserRole.SCHOOL_ADMIN, UserRole.PARENT, UserRole.STUDENT, UserRole.PRINCIPAL] as UserRole[],
    LIBRARY: [UserRole.LIBRARIAN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PRINCIPAL] as UserRole[],
    HEALTH: [UserRole.NURSE, UserRole.SCHOOL_ADMIN, UserRole.COUNSELOR, UserRole.PRINCIPAL] as UserRole[],
    HOSTEL: [UserRole.WARDEN, UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL] as UserRole[],
    ADMISSIONS: [UserRole.ADMISSIONS_OFFICER, UserRole.SCHOOL_ADMIN, UserRole.RECEPTIONIST, UserRole.PRINCIPAL] as UserRole[],
    INVENTORY: [UserRole.INVENTORY_MANAGER, UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL] as UserRole[],
    IT_SYSTEMS: [UserRole.IT_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN] as UserRole[],
};

/**
 * Check if a role has permission for a domain
 */
export function hasPermission(role: UserRole, domain: keyof typeof PERMISSIONS): boolean {
    return PERMISSIONS[domain].includes(role);
}
