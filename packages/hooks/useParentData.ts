// packages/hooks/useParentData.ts
// Parent Dashboard data hooks - Aggregated student, fee, and academic data
// Uses TanStack Query for caching and offline support

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// API base URL - uses environment variable or default
const API_BASE = typeof window !== 'undefined'
    ? (window as any).__API_URL__ || '/api'
    : '/api';

// Helper to get auth token
function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('sovereign_token');
}

// Generic fetch wrapper with auth
async function fetchWithAuth<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...(options?.headers || {}),
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || error.message || 'Request failed');
    }

    return response.json();
}

// ============================================================================
// TYPES
// ============================================================================

export interface ParentChild {
    student_id: string;
    name: string;
    class: string;
    photo_url: string | null;
    attendance_today: string;
    attendance_percent: number;
    pending_homework: number;
    outstanding_fees: number;
    next_live_class: {
        subject: string;
        start_time: string;
        meeting_link: string;
        is_active: boolean;
    } | null;
    relation: string;
}

export interface ParentDashboardData {
    parent: {
        id: string;
        name: string;
        phone: string | null;
        terms_accepted: boolean;
    };
    children: ParentChild[];
    kpis: {
        total_due: number;
        next_due_date: string | null;
        unread_notifications: number;
        recent_result: {
            exam_name: string;
            percentage: number;
            published_at: string;
        } | null;
    };
}

export interface Invoice {
    id: string;
    description: string | null;
    academic_year: string;
    total_amount: number;
    discount_amount: number;
    amount_paid: number;
    balance_amount: number;
    status: string;
    due_date: string;
    items: {
        title: string;
        amount: number;
        category?: string;
    }[];
}

export interface Transaction {
    id: string;
    invoice_description: string | null;
    amount: number;
    mode: string;
    date: string;
    reference_no: string | null;
    status: string;
    verification_note: string | null;
    verified_at: string | null;
}

export interface AttendanceData {
    month: string;
    summary: {
        total_days: number;
        present: number;
        absent: number;
        late: number;
        percentage: number;
    };
    daily: {
        date: string;
        status: string;
    }[];
}

export interface ExamResult {
    result_id: string;
    exam_id: string;
    exam_name: string;
    exam_type: string;
    total_percentage: number | null;
    grade: string | null;
    remarks: string | null;
    published_at: string | null;
    marks: {
        subject: string;
        subject_code: string;
        obtained: number;
        max: number;
        grade: string | null;
    }[];
    report_card_url: string;
}

export interface TimetableEntry {
    day_of_week: number;
    period: number;
    subject: string;
    subject_code: string;
    teacher: string;
    start_time: string;
    end_time: string;
}

export interface Homework {
    id: string;
    title: string;
    description: string | null;
    subject: string;
    due_date: string;
    status: 'pending' | 'submitted' | 'graded' | 'overdue';
    submission: {
        submitted_at: string;
        is_late: boolean;
        grade: string | null;
        feedback: string | null;
    } | null;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    author: string;
    author_role: string;
    created_at: string;
    expires_at: string | null;
    is_new: boolean;
}

export interface ParentProfile {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    terms_accepted: boolean;
    terms_accepted_at: string | null;
    profile: {
        occupation: string | null;
        organization: string | null;
        address: {
            line1: string | null;
            line2: string | null;
            city: string | null;
            state: string | null;
            pincode: string | null;
        };
        language_preference?: string;
        notification_prefs?: any;
    } | null;
}

export interface UpiLinkData {
    upi_link: string;
    qr_data: string;
    amount: number;
    payee_name: string;
    payee_vpa: string;
    transaction_note: string;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Parent Dashboard - Main aggregated data
 */
export function useParentDashboard() {
    return useQuery<{ success: boolean; data: ParentDashboardData }>({
        queryKey: ['parent', 'dashboard'],
        queryFn: () => fetchWithAuth('/parent/dashboard'),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour cache
    });
}

/**
 * List of linked children (simpler version)
 */
export function useParentChildren() {
    return useQuery<{ success: boolean; data: { children: ParentChild[] } }>({
        queryKey: ['parent', 'children'],
        queryFn: () => fetchWithAuth('/parent/children'),
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}

/**
 * Single child details
 */
export function useChildDetails(studentId: string | null) {
    return useQuery({
        queryKey: ['parent', 'child', studentId],
        queryFn: () => fetchWithAuth(`/parent/child/${studentId}`),
        enabled: !!studentId,
        staleTime: 1000 * 60 * 10,
    });
}

/**
 * Invoices for a specific child
 */
export function useChildInvoices(studentId: string | null) {
    return useQuery<{ success: boolean; data: { invoices: Invoice[]; summary: { total_outstanding: number; overdue_amount: number } } }>({
        queryKey: ['parent', 'child', studentId, 'invoices'],
        queryFn: () => fetchWithAuth(`/parent/child/${studentId}/invoices`),
        enabled: !!studentId,
        staleTime: 1000 * 60 * 2, // 2 minutes (financial data)
    });
}

/**
 * Invoice detail
 */
export function useInvoiceDetail(invoiceId: string | null) {
    return useQuery({
        queryKey: ['parent', 'invoice', invoiceId],
        queryFn: () => fetchWithAuth(`/parent/invoice/${invoiceId}`),
        enabled: !!invoiceId,
    });
}

/**
 * Payment transactions for a child
 */
export function useChildTransactions(studentId: string | null) {
    return useQuery<{ success: boolean; data: Transaction[] }>({
        queryKey: ['parent', 'child', studentId, 'transactions'],
        queryFn: () => fetchWithAuth(`/parent/child/${studentId}/transactions`),
        enabled: !!studentId,
        staleTime: 1000 * 60 * 2,
    });
}

/**
 * Generate UPI payment link
 */
export function useUpiLink(invoiceId: string | null) {
    return useQuery<{ success: boolean; data: UpiLinkData }>({
        queryKey: ['parent', 'upi-link', invoiceId],
        queryFn: () => fetchWithAuth(`/parent/upi-link/${invoiceId}`),
        enabled: !!invoiceId,
        staleTime: 1000 * 60 * 30, // 30 minutes (amount rarely changes)
    });
}

/**
 * Submit UTR for payment verification
 */
export function useSubmitUTR() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            invoiceId: string;
            utr: string;
            amount: number;
            payment_date?: string;
            payment_method?: string;
            proof_url?: string;
        }) =>
            fetchWithAuth(`/parent/invoice/${data.invoiceId}/submit-utr`, {
                method: 'POST',
                body: JSON.stringify({
                    utr: data.utr,
                    amount: data.amount,
                    payment_date: data.payment_date,
                    payment_method: data.payment_method,
                    proof_url: data.proof_url,
                }),
            }),
        onSuccess: (_, variables) => {
            // Invalidate related queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['parent', 'dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['parent', 'child'] });
            queryClient.invalidateQueries({ queryKey: ['parent', 'invoice', variables.invoiceId] });
        },
    });
}

/**
 * Child attendance data
 */
export function useChildAttendance(studentId: string | null, month?: string) {
    const monthParam = month ? `?month=${month}` : '';
    return useQuery<{ success: boolean; data: AttendanceData }>({
        queryKey: ['parent', 'child', studentId, 'attendance', month],
        queryFn: () => fetchWithAuth(`/parent/child/${studentId}/attendance${monthParam}`),
        enabled: !!studentId,
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Child published results
 */
export function useChildResults(studentId: string | null) {
    return useQuery<{ success: boolean; data: ExamResult[] }>({
        queryKey: ['parent', 'child', studentId, 'results'],
        queryFn: () => fetchWithAuth(`/parent/child/${studentId}/results`),
        enabled: !!studentId,
        staleTime: 1000 * 60 * 30, // 30 minutes (rarely changes)
    });
}

/**
 * Child weekly timetable
 */
export function useChildTimetable(studentId: string | null) {
    return useQuery<{ success: boolean; data: { class: string; timetable: TimetableEntry[] } }>({
        queryKey: ['parent', 'child', studentId, 'timetable'],
        queryFn: () => fetchWithAuth(`/parent/child/${studentId}/timetable`),
        enabled: !!studentId,
        staleTime: 1000 * 60 * 60, // 1 hour (rarely changes)
    });
}

/**
 * Child homework list
 */
export function useChildHomework(studentId: string | null) {
    return useQuery<{ success: boolean; data: Homework[] }>({
        queryKey: ['parent', 'child', studentId, 'homework'],
        queryFn: () => fetchWithAuth(`/parent/child/${studentId}/homework`),
        enabled: !!studentId,
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Parent notifications
 */
export function useParentNotifications() {
    return useQuery<{ success: boolean; data: Notification[] }>({
        queryKey: ['parent', 'notifications'],
        queryFn: () => fetchWithAuth('/parent/notifications'),
        staleTime: 1000 * 60 * 2,
    });
}

/**
 * Mark notification as read
 */
export function useMarkNotificationRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => fetchWithAuth(`/parent/notifications/${id}/read`, { method: 'POST' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parent', 'notifications'] });
            // Also invalidate dashboard KPIS as it has unread count
            queryClient.invalidateQueries({ queryKey: ['parent', 'dashboard'] });
        },
    });
}

/**
 * Parent profile
 */
export function useParentProfile() {
    return useQuery<{ success: boolean; data: ParentProfile }>({
        queryKey: ['parent', 'profile'],
        queryFn: () => fetchWithAuth('/parent/profile'),
        staleTime: 1000 * 60 * 10,
    });
}

/**
 * Update parent profile
 */
export function useUpdateParentProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            phone?: string;
            address?: {
                line1?: string;
                line2?: string;
                city?: string;
                state?: string;
                pincode?: string;
            };
            language_preference?: string;
            notification_prefs?: any;
        }) =>
            fetchWithAuth('/parent/profile', {
                method: 'PATCH',
                body: JSON.stringify(data),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parent', 'profile'] });
        },
    });
}

/**
 * Accept terms and conditions
 */
export function useAcceptTerms() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () =>
            fetchWithAuth('/parent/accept-terms', {
                method: 'POST',
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parent', 'profile'] });
            queryClient.invalidateQueries({ queryKey: ['parent', 'dashboard'] });
        },
    });
}

/**
 * Request student leave
 */
export function useRequestLeave() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            studentId: string;
            type: 'SICK' | 'CASUAL' | 'EARNED';
            start_date: string;
            end_date: string;
            reason?: string;
            attachment_url?: string;
        }) =>
            fetchWithAuth(`/parent/child/${data.studentId}/leave-request`, {
                method: 'POST',
                body: JSON.stringify({
                    type: data.type,
                    start_date: data.start_date,
                    end_date: data.end_date,
                    reason: data.reason,
                    attachment_url: data.attachment_url,
                }),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parent'] });
        },
    });
}
