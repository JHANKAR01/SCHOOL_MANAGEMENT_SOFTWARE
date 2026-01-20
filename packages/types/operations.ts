// packages/types/operations.ts
// Operational types (transport, library, hostel, health, security)

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
    issuedTo?: string;
}

// --- HOSTEL ---
export interface HostelRoom {
    roomNumber: string;
    capacity: number;
    occupied: number;
    gender: 'BOYS' | 'GIRLS';
    students: string[];
}

// --- HEALTH ---
export interface MedicalLog {
    id: number;
    time: string;
    date: string;
    student: string;
    issue: string;
    action: string;
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
    old_data?: any;
    new_data?: any;
}
