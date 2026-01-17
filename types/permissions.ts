// Granular Permissions for SCHOOL_ADMIN sub-roles
// These are stored in User.permissions[] and checked by requirePermission() middleware

export const PERMISSIONS = {
    // HR & Staff
    MANAGE_HR: 'MANAGE_HR',           // View/Edit Salary
    VIEW_PAYROLL: 'VIEW_PAYROLL',     // View-only salary (read)

    // Finance
    MANAGE_FINANCE: 'MANAGE_FINANCE', // View Bank Details, Approve Reconciliations
    COLLECT_FEES: 'COLLECT_FEES',     // Accept Cash at Counter

    // Academics
    MANAGE_ACADEMICS: 'MANAGE_ACADEMICS', // Edit Timetable/Curriculum
    VIEW_ACADEMICS: 'VIEW_ACADEMICS',     // View-only

    // Users & Security
    MANAGE_USERS: 'MANAGE_USERS',         // Grant/Revoke Logins
    VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
    DEMASK_PII: 'DEMASK_PII',             // View unmasked Aadhaar/Bank (5-min window)

    // Admissions
    MANAGE_ADMISSIONS: 'MANAGE_ADMISSIONS',

    // Operations
    MANAGE_TRANSPORT: 'MANAGE_TRANSPORT',
    MANAGE_HOSTEL: 'MANAGE_HOSTEL',
    MANAGE_LIBRARY: 'MANAGE_LIBRARY',

    // Principal-specific
    APPROVE_RESULTS: 'APPROVE_RESULTS',   // Approve & publish exam results
    APPROVE_LEAVES: 'APPROVE_LEAVES',     // Approve staff leave applications
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Default permissions for SCHOOL_ADMIN role
export const SCHOOL_ADMIN_DEFAULT_PERMISSIONS: Permission[] = [
    PERMISSIONS.MANAGE_HR,
    PERMISSIONS.MANAGE_FINANCE,
    PERMISSIONS.COLLECT_FEES,
    PERMISSIONS.MANAGE_ACADEMICS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.MANAGE_ADMISSIONS,
    PERMISSIONS.MANAGE_TRANSPORT,
    PERMISSIONS.MANAGE_HOSTEL,
    PERMISSIONS.MANAGE_LIBRARY,
];

// Default permissions for PRINCIPAL role
export const PRINCIPAL_DEFAULT_PERMISSIONS: Permission[] = [
    PERMISSIONS.MANAGE_ACADEMICS,
    PERMISSIONS.VIEW_ACADEMICS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.DEMASK_PII,
    PERMISSIONS.APPROVE_RESULTS,
    PERMISSIONS.APPROVE_LEAVES,
];
