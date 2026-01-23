// server/src/routes/parent.ts
// Parent Dashboard API - Multi-child view with fee payments and academic tracking
// Security: All endpoints scoped to authenticated parent's linked children via ParentStudent

import { Hono } from 'hono';
import { stream } from 'hono/streaming';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import prisma from '../db';
import { authMiddleware, requireRole } from '../middleware/auth';
import { UserRole } from '../../../packages/types';

// Typed variables for context
type Variables = {
    user: {
        id: string;
        role: UserRole;
        school_id: string;
        phone?: string;
    };
};

const parentRouter = new Hono<{ Variables: Variables }>();

// Apply auth to all routes
parentRouter.use('*', authMiddleware);

// ============================================================================
// HELPER: Get linked children for parent with auto-linking
// ============================================================================
async function getLinkedChildren(parentId: string, schoolId: string, parentPhone?: string) {
    // First, check existing links
    let links = await prisma.parentStudent.findMany({
        where: {
            parent_id: parentId,
            school_id: schoolId
        },
        include: {
            student: {
                include: {
                    enrollments: {
                        where: {
                            academic_year: { is_current: true }
                        },
                        include: {
                            class: {
                                include: {
                                    academic_year: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    // Auto-link: If no links and parent has phone, find students by phone
    if (links.length === 0 && parentPhone) {
        const studentsWithPhone = await prisma.student.findMany({
            where: {
                school_id: schoolId,
                OR: [
                    { phone: parentPhone },
                    { alternate_phone: parentPhone },
                    { emergency_contact_phone: parentPhone }
                ]
            }
        });

        // Create links for found students
        if (studentsWithPhone.length > 0) {
            await prisma.parentStudent.createMany({
                data: studentsWithPhone.map((student) => ({
                    parent_id: parentId,
                    student_id: student.id,
                    school_id: schoolId,
                    relation: 'Guardian', // Default, can be updated later
                    is_primary: true,
                    can_pickup: true,
                    has_custody: true
                })),
                skipDuplicates: true
            });

            // Refetch links with full data
            links = await prisma.parentStudent.findMany({
                where: {
                    parent_id: parentId,
                    school_id: schoolId
                },
                include: {
                    student: {
                        include: {
                            enrollments: {
                                where: {
                                    academic_year: { is_current: true }
                                },
                                include: {
                                    class: {
                                        include: {
                                            academic_year: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    return links;
}

// ============================================================================
// HELPER: Verify parent has access to student
// ============================================================================
async function verifyParentChildLink(parentId: string, studentId: string, schoolId: string) {
    const link = await prisma.parentStudent.findFirst({
        where: {
            parent_id: parentId,
            student_id: studentId,
            school_id: schoolId
        }
    });
    return link !== null;
}

// ============================================================================
// HELPER: Create audit log entry
// ============================================================================
async function createAuditLog(
    schoolId: string,
    userId: string,
    action: string,
    targetType?: string,
    targetId?: string,
    metadata?: object,
    ipAddress?: string
) {
    await prisma.auditLog.create({
        data: {
            school_id: schoolId,
            user_id: userId,
            action,
            target_type: targetType,
            target_id: targetId,
            metadata: metadata || {},
            ip_address: ipAddress
        }
    });
}

// ============================================================================
// GET /api/parent/dashboard - Aggregated overview for all linked children
// ============================================================================
parentRouter.get('/dashboard',
    requireRole([UserRole.PARENT]),
    async (c) => {
        try {
            const user = c.get('user');

            // Get parent profile for terms acceptance
            const parentUser = await prisma.user.findUnique({
                where: { id: user.id },
                select: { id: true, name: true, phone: true, terms_accepted_at: true }
            });

            if (!parentUser) {
                return c.json({ success: false, error: 'User not found' }, 404);
            }

            // Get linked children with auto-linking
            const links = await getLinkedChildren(user.id, user.school_id, parentUser.phone || undefined);

            if (links.length === 0) {
                return c.json({
                    success: true,
                    data: {
                        parent: {
                            id: parentUser.id,
                            name: parentUser.name,
                            phone: parentUser.phone,
                            terms_accepted: !!parentUser.terms_accepted_at
                        },
                        children: [],
                        kpis: {
                            total_due: 0,
                            next_due_date: null,
                            unread_notifications: 0,
                            recent_result: null
                        }
                    }
                });
            }

            const studentIds = links.map(l => l.student_id);
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

            // Batch fetch data for all children
            const [attendanceToday, invoices, liveClasses, homeworkCounts, recentResults] = await Promise.all([
                // Today's attendance for all children
                prisma.attendance.findMany({
                    where: {
                        student_id: { in: studentIds },
                        date: { gte: startOfDay, lte: endOfDay }
                    }
                }),
                // Outstanding invoices for all children
                prisma.invoice.findMany({
                    where: {
                        student_id: { in: studentIds },
                        balance_amount: { gt: 0 }
                    },
                    orderBy: { due_date: 'asc' }
                }),
                // Active/upcoming live classes
                prisma.liveClass.findMany({
                    where: {
                        school_id: user.school_id,
                        class_id: {
                            in: links
                                .filter(l => l.student.enrollments[0])
                                .map(l => l.student.enrollments[0].class_id)
                        },
                        OR: [
                            { is_active: true },
                            { start_time: { gte: new Date(), lte: new Date(Date.now() + 2 * 60 * 60 * 1000) } }
                        ]
                    },
                    include: { subject: { select: { name: true } } },
                    take: 5
                }),
                // Pending homework count per child (from enrollments)
                prisma.homework.groupBy({
                    by: ['class_id'],
                    where: {
                        school_id: user.school_id,
                        class_id: {
                            in: links
                                .filter(l => l.student.enrollments[0])
                                .map(l => l.student.enrollments[0].class_id)
                        },
                        due_date: { gte: new Date() },
                        status: 'PENDING'
                    },
                    _count: true
                }),
                // Most recent published result
                prisma.result.findFirst({
                    where: {
                        student_id: { in: studentIds },
                        status: 'PUBLISHED'
                    },
                    include: { Exam: { select: { name: true } } },
                    orderBy: { approved_at: 'desc' }
                })
            ]);

            // Build attendance lookup
            const attendanceLookup = new Map<string, string>();
            attendanceToday.forEach(a => {
                attendanceLookup.set(a.student_id, a.status);
            });

            // Build invoice totals per student
            const invoiceLookup = new Map<string, number>();
            invoices.forEach(inv => {
                const current = invoiceLookup.get(inv.student_id) || 0;
                invoiceLookup.set(inv.student_id, current + inv.balance_amount);
            });

            // Build homework count lookup
            const homeworkLookup = new Map<string, number>();
            homeworkCounts.forEach(hw => {
                homeworkLookup.set(hw.class_id, hw._count);
            });

            // Build live class lookup by class
            const liveClassLookup = new Map<string, typeof liveClasses[0]>();
            liveClasses.forEach(lc => {
                if (!liveClassLookup.has(lc.class_id)) {
                    liveClassLookup.set(lc.class_id, lc);
                }
            });

            // Calculate term attendance percentage (approximate)
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const monthlyAttendance = await prisma.attendance.groupBy({
                by: ['student_id', 'status'],
                where: {
                    student_id: { in: studentIds },
                    date: { gte: startOfMonth }
                },
                _count: true
            });

            const attendancePercentLookup = new Map<string, number>();
            const attendanceTotals = new Map<string, { present: number; total: number }>();
            monthlyAttendance.forEach(a => {
                const current = attendanceTotals.get(a.student_id) || { present: 0, total: 0 };
                current.total += a._count;
                if (a.status === 'PRESENT') current.present += a._count;
                attendanceTotals.set(a.student_id, current);
            });
            attendanceTotals.forEach((value, key) => {
                attendancePercentLookup.set(key, value.total > 0 ? Math.round((value.present / value.total) * 100) : 0);
            });

            // Build children data
            const children = links.map(link => {
                const enrollment = link.student.enrollments[0];
                const classId = enrollment?.class_id;
                const liveClass = classId ? liveClassLookup.get(classId) : null;

                return {
                    student_id: link.student.id,
                    name: link.student.name,
                    class: enrollment
                        ? `${enrollment.class.grade}-${enrollment.class.section}`
                        : 'Not Enrolled',
                    photo_url: link.student.photo_url,
                    attendance_today: attendanceLookup.get(link.student.id) || 'NOT_MARKED',
                    attendance_percent: attendancePercentLookup.get(link.student.id) || 0,
                    pending_homework: classId ? (homeworkLookup.get(classId) || 0) : 0,
                    outstanding_fees: invoiceLookup.get(link.student.id) || 0,
                    next_live_class: liveClass ? {
                        subject: liveClass.subject.name,
                        start_time: liveClass.start_time,
                        meeting_link: liveClass.meeting_link,
                        is_active: liveClass.is_active
                    } : null,
                    relation: link.relation
                };
            });

            // Calculate KPIs
            const totalDue = invoices.reduce((sum, inv) => sum + inv.balance_amount, 0);
            const nextDueInvoice = invoices[0];

            // Get unread notifications count
            const unreadNotifications = await prisma.announcement.count({
                where: {
                    school_id: user.school_id,
                    OR: [
                        { target_roles: { has: 'PARENT' } },
                        { target_roles: { isEmpty: true } }
                    ],
                    created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
                }
            });

            return c.json({
                success: true,
                data: {
                    parent: {
                        id: parentUser.id,
                        name: parentUser.name,
                        phone: parentUser.phone,
                        terms_accepted: !!parentUser.terms_accepted_at
                    },
                    children,
                    kpis: {
                        total_due: totalDue,
                        next_due_date: nextDueInvoice?.due_date || null,
                        unread_notifications: unreadNotifications,
                        recent_result: recentResults ? {
                            exam_name: recentResults.Exam.name,
                            percentage: recentResults.total_percentage,
                            published_at: recentResults.approved_at
                        } : null
                    }
                }
            });
        } catch (error) {
            console.error('[PARENT_DASHBOARD_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// GET /api/parent/children - List all linked children (simple)
// ============================================================================
parentRouter.get('/children',
    requireRole([UserRole.PARENT]),
    async (c) => {
        try {
            const user = c.get('user');

            const parentUser = await prisma.user.findUnique({
                where: { id: user.id },
                select: { phone: true }
            });

            const links = await getLinkedChildren(user.id, user.school_id, parentUser?.phone || undefined);

            return c.json({
                success: true,
                data: {
                    children: links.map(link => {
                        const enrollment = link.student.enrollments[0];
                        return {
                            student_id: link.student.id,
                            name: link.student.name,
                            admission_no: link.student.admission_no,
                            class: enrollment
                                ? `${enrollment.class.grade}-${enrollment.class.section}`
                                : 'Not Enrolled',
                            photo_url: link.student.photo_url,
                            relation: link.relation,
                            is_primary: link.is_primary
                        };
                    })
                }
            });
        } catch (error) {
            console.error('[PARENT_CHILDREN_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// GET /api/parent/child/:studentId - Detailed view of single child
// ============================================================================
parentRouter.get('/child/:studentId',
    requireRole([UserRole.PARENT]),
    async (c) => {
        try {
            const user = c.get('user');
            const studentId = c.req.param('studentId');

            // Verify parent has access to this child
            const hasAccess = await verifyParentChildLink(user.id, studentId, user.school_id);
            if (!hasAccess) {
                return c.json({ success: false, error: 'Access denied' }, 403);
            }

            const student = await prisma.student.findFirst({
                where: {
                    id: studentId,
                    school_id: user.school_id
                },
                include: {
                    enrollments: {
                        where: {
                            academic_year: { is_current: true }
                        },
                        include: {
                            class: {
                                include: {
                                    academic_year: true,
                                    class_teacher: { select: { name: true } }
                                }
                            }
                        }
                    }
                }
            });

            if (!student) {
                return c.json({ success: false, error: 'Student not found' }, 404);
            }

            const enrollment = student.enrollments[0];

            return c.json({
                success: true,
                data: {
                    student: {
                        id: student.id,
                        admission_no: student.admission_no,
                        name: student.name,
                        class: enrollment
                            ? `${enrollment.class.grade}-${enrollment.class.section}`
                            : 'Not Enrolled',
                        roll_number: enrollment?.roll_number,
                        date_of_birth: student.date_of_birth,
                        photo_url: student.photo_url,
                        blood_group: student.blood_group,
                        emergency_contact: student.emergency_contact_phone
                    },
                    class_teacher: enrollment?.class.class_teacher ? {
                        name: enrollment.class.class_teacher.name
                    } : null
                }
            });
        } catch (error) {
            console.error('[PARENT_CHILD_DETAIL_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// GET /api/parent/child/:studentId/invoices - List invoices for a child
// ============================================================================
parentRouter.get('/child/:studentId/invoices',
    requireRole([UserRole.PARENT]),
    async (c) => {
        try {
            const user = c.get('user');
            const studentId = c.req.param('studentId');

            // Verify access
            const hasAccess = await verifyParentChildLink(user.id, studentId, user.school_id);
            if (!hasAccess) {
                return c.json({ success: false, error: 'Access denied' }, 403);
            }

            const invoices = await prisma.invoice.findMany({
                where: {
                    student_id: studentId,
                    school_id: user.school_id
                },
                include: {
                    items: {
                        include: {
                            feeStructure: { select: { category: true } }
                        }
                    },
                    academicYear: { select: { name: true } }
                },
                orderBy: { due_date: 'desc' }
            });

            // Calculate summary
            const totalOutstanding = invoices
                .filter(inv => inv.balance_amount > 0)
                .reduce((sum, inv) => sum + inv.balance_amount, 0);

            const overdueAmount = invoices
                .filter(inv => inv.status === 'OVERDUE' || (inv.balance_amount > 0 && new Date(inv.due_date) < new Date()))
                .reduce((sum, inv) => sum + inv.balance_amount, 0);

            return c.json({
                success: true,
                data: {
                    invoices: invoices.map(inv => ({
                        id: inv.id,
                        description: inv.description,
                        academic_year: inv.academicYear.name,
                        total_amount: inv.total_amount,
                        discount_amount: inv.discount_amount,
                        amount_paid: inv.amount_paid,
                        balance_amount: inv.balance_amount,
                        status: inv.status,
                        due_date: inv.due_date,
                        items: inv.items.map(item => ({
                            title: item.title,
                            amount: item.amount,
                            category: item.feeStructure?.category || 'MISC'
                        }))
                    })),
                    summary: {
                        total_outstanding: totalOutstanding,
                        overdue_amount: overdueAmount
                    }
                }
            });
        } catch (error) {
            console.error('[PARENT_INVOICES_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// GET /api/parent/invoice/:invoiceId - Invoice details
// ============================================================================
parentRouter.get('/invoice/:invoiceId',
    requireRole([UserRole.PARENT]),
    async (c) => {
        try {
            const user = c.get('user');
            const invoiceId = c.req.param('invoiceId');

            const invoice = await prisma.invoice.findFirst({
                where: {
                    id: invoiceId,
                    school_id: user.school_id
                },
                include: {
                    student: { select: { id: true, name: true } },
                    items: true,
                    transactions: {
                        orderBy: { created_at: 'desc' }
                    },
                    academicYear: { select: { name: true } }
                }
            });

            if (!invoice) {
                return c.json({ success: false, error: 'Invoice not found' }, 404);
            }

            // Verify parent has access to this student
            const hasAccess = await verifyParentChildLink(user.id, invoice.student_id, user.school_id);
            if (!hasAccess) {
                return c.json({ success: false, error: 'Access denied' }, 403);
            }

            return c.json({
                success: true,
                data: {
                    id: invoice.id,
                    student: invoice.student,
                    academic_year: invoice.academicYear.name,
                    description: invoice.description,
                    total_amount: invoice.total_amount,
                    discount_amount: invoice.discount_amount,
                    amount_paid: invoice.amount_paid,
                    balance_amount: invoice.balance_amount,
                    status: invoice.status,
                    due_date: invoice.due_date,
                    items: invoice.items.map(item => ({
                        title: item.title,
                        amount: item.amount
                    })),
                    transactions: invoice.transactions.map(txn => ({
                        id: txn.id,
                        amount: txn.amount,
                        mode: txn.mode,
                        date: txn.date,
                        reference_no: txn.reference_no,
                        status: txn.status,
                        verification_note: txn.verification_note
                    }))
                }
            });
        } catch (error) {
            console.error('[PARENT_INVOICE_DETAIL_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// POST /api/parent/invoice/:invoiceId/submit-utr - Submit payment UTR
// ============================================================================
parentRouter.post('/invoice/:invoiceId/submit-utr',
    requireRole([UserRole.PARENT]),
    async (c) => {
        try {
            const user = c.get('user');
            const invoiceId = c.req.param('invoiceId');
            const body = await c.req.json();
            const { utr, payment_date, payment_method, amount, proof_url } = body;

            // Validation
            if (!utr || !amount) {
                return c.json({ success: false, error: 'UTR and amount are required' }, 400);
            }

            // Validate UTR format (alphanumeric, 12-22 characters)
            const utrRegex = /^[A-Za-z0-9]{12,22}$/;
            if (!utrRegex.test(utr)) {
                return c.json({ success: false, error: 'Invalid UTR format. Must be 12-22 alphanumeric characters.' }, 400);
            }

            // Get invoice
            const invoice = await prisma.invoice.findFirst({
                where: {
                    id: invoiceId,
                    school_id: user.school_id
                }
            });

            if (!invoice) {
                return c.json({ success: false, error: 'Invoice not found' }, 404);
            }

            // Verify parent has access
            const hasAccess = await verifyParentChildLink(user.id, invoice.student_id, user.school_id);
            if (!hasAccess) {
                return c.json({ success: false, error: 'Access denied' }, 403);
            }

            // Validate amount
            if (amount <= 0 || amount > invoice.balance_amount) {
                return c.json({
                    success: false,
                    error: `Amount must be between 1 and ${invoice.balance_amount}`
                }, 400);
            }

            // Check for duplicate UTR
            const existingTransaction = await prisma.paymentTransaction.findFirst({
                where: {
                    school_id: user.school_id,
                    reference_no: utr
                }
            });

            if (existingTransaction) {
                return c.json({ success: false, error: 'This UTR has already been submitted' }, 400);
            }

            // Parse payment mode
            let paymentMode: 'UPI' | 'BANK_TRANSFER' | 'CASH' | 'CHEQUE' | 'DEMAND_DRAFT' = 'UPI';
            if (payment_method) {
                const upperMethod = payment_method.toUpperCase();
                if (['UPI', 'BANK_TRANSFER', 'CASH', 'CHEQUE', 'DEMAND_DRAFT'].includes(upperMethod)) {
                    paymentMode = upperMethod as typeof paymentMode;
                }
            }

            // Create transaction
            const transaction = await prisma.paymentTransaction.create({
                data: {
                    invoice_id: invoiceId,
                    school_id: user.school_id,
                    student_id: invoice.student_id,
                    amount,
                    mode: paymentMode,
                    date: payment_date ? new Date(payment_date) : new Date(),
                    reference_no: utr,
                    proof_url,
                    status: 'PENDING',
                    remarks: `Submitted by parent via app`
                }
            });

            // Audit log
            await createAuditLog(
                user.school_id,
                user.id,
                'SUBMIT_UTR',
                'Invoice',
                invoiceId,
                { utr, amount, payment_method: paymentMode },
                c.req.header('x-forwarded-for') || 'unknown'
            );

            return c.json({
                success: true,
                data: {
                    transaction_id: transaction.id,
                    status: 'PENDING',
                    message: 'Payment submitted for verification. You will be notified once verified.'
                }
            }, 201);
        } catch (error) {
            console.error('[PARENT_SUBMIT_UTR_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// GET /api/parent/upi-link/:invoiceId - Generate UPI deep link
// ============================================================================
parentRouter.get('/upi-link/:invoiceId',
    requireRole([UserRole.PARENT]),
    async (c) => {
        try {
            const user = c.get('user');
            const invoiceId = c.req.param('invoiceId');

            const invoice = await prisma.invoice.findFirst({
                where: {
                    id: invoiceId,
                    school_id: user.school_id
                },
                include: {
                    student: { select: { id: true, name: true } }
                }
            });

            if (!invoice) {
                return c.json({ success: false, error: 'Invoice not found' }, 404);
            }

            // Verify access
            const hasAccess = await verifyParentChildLink(user.id, invoice.student_id, user.school_id);
            if (!hasAccess) {
                return c.json({ success: false, error: 'Access denied' }, 403);
            }

            if (invoice.balance_amount <= 0) {
                return c.json({ success: false, error: 'Invoice is already paid' }, 400);
            }

            // Get school UPI VPA from settings
            const school = await prisma.school.findUnique({
                where: { id: user.school_id },
                select: { name: true, settings_json: true }
            });

            const settings = (school?.settings_json || {}) as Record<string, unknown>;
            const upiVpa = settings.upi_vpa as string || 'school@upi';
            const schoolName = school?.name || 'School';

            // Build UPI deep link
            const amount = invoice.balance_amount.toFixed(2);
            const transactionNote = `${invoice.student.id}-${invoice.id}`;
            const encodedName = encodeURIComponent(schoolName);

            const upiLink = `upi://pay?pa=${upiVpa}&pn=${encodedName}&am=${amount}&tn=${transactionNote}&cu=INR`;

            return c.json({
                success: true,
                data: {
                    upi_link: upiLink,
                    qr_data: upiLink, // Same data for QR code generation
                    amount: invoice.balance_amount,
                    payee_name: schoolName,
                    payee_vpa: upiVpa,
                    transaction_note: transactionNote
                }
            });
        } catch (error) {
            console.error('[PARENT_UPI_LINK_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// GET /api/parent/child/:studentId/transactions - Payment history
// ============================================================================
parentRouter.get('/child/:studentId/transactions',
    requireRole([UserRole.PARENT]),
    async (c) => {
        try {
            const user = c.get('user');
            const studentId = c.req.param('studentId');

            // Verify access
            const hasAccess = await verifyParentChildLink(user.id, studentId, user.school_id);
            if (!hasAccess) {
                return c.json({ success: false, error: 'Access denied' }, 403);
            }

            const transactions = await prisma.paymentTransaction.findMany({
                where: {
                    student_id: studentId,
                    school_id: user.school_id
                },
                include: {
                    invoice: { select: { description: true } }
                },
                orderBy: { created_at: 'desc' }
            });

            return c.json({
                success: true,
                data: transactions.map(txn => ({
                    id: txn.id,
                    invoice_description: txn.invoice.description,
                    amount: txn.amount,
                    mode: txn.mode,
                    date: txn.date,
                    reference_no: txn.reference_no,
                    status: txn.status,
                    verification_note: txn.verification_note,
                    verified_at: txn.verified_at
                }))
            });
        } catch (error) {
            console.error('[PARENT_TRANSACTIONS_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// GET /api/parent/child/:studentId/attendance - Attendance summary
// ============================================================================
parentRouter.get('/child/:studentId/attendance',
    requireRole([UserRole.PARENT]),
    async (c) => {
        try {
            const user = c.get('user');
            const studentId = c.req.param('studentId');
            const month = c.req.query('month'); // Format: YYYY-MM

            // Verify access
            const hasAccess = await verifyParentChildLink(user.id, studentId, user.school_id);
            if (!hasAccess) {
                return c.json({ success: false, error: 'Access denied' }, 403);
            }

            // Default to current month
            const targetDate = month ? new Date(`${month}-01`) : new Date();
            const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
            const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

            const attendance = await prisma.attendance.findMany({
                where: {
                    student_id: studentId,
                    date: {
                        gte: startOfMonth,
                        lte: endOfMonth
                    }
                },
                orderBy: { date: 'asc' }
            });

            // Calculate summary
            const present = attendance.filter(a => a.status === 'PRESENT').length;
            const absent = attendance.filter(a => a.status === 'ABSENT').length;
            const late = attendance.filter(a => a.status === 'LATE').length;
            const total = attendance.length;

            return c.json({
                success: true,
                data: {
                    month: `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`,
                    summary: {
                        total_days: total,
                        present,
                        absent,
                        late,
                        percentage: total > 0 ? Math.round((present / total) * 100 * 10) / 10 : 0
                    },
                    daily: attendance.map(a => ({
                        date: a.date,
                        status: a.status
                    }))
                }
            });
        } catch (error) {
            console.error('[PARENT_ATTENDANCE_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// GET /api/parent/child/:studentId/results - Published results only
// ============================================================================
parentRouter.get('/child/:studentId/results',
    requireRole([UserRole.PARENT]),
    async (c) => {
        try {
            const user = c.get('user');
            const studentId = c.req.param('studentId');

            // Verify access
            const hasAccess = await verifyParentChildLink(user.id, studentId, user.school_id);
            if (!hasAccess) {
                return c.json({ success: false, error: 'Access denied' }, 403);
            }

            // Only get PUBLISHED results
            const results = await prisma.result.findMany({
                where: {
                    student_id: studentId,
                    school_id: user.school_id,
                    status: 'PUBLISHED'
                },
                include: {
                    Exam: { select: { id: true, name: true, type: true, start_date: true } },
                    marks: {
                        include: {
                            subject: { select: { name: true, code: true } }
                        }
                    }
                },
                orderBy: { approved_at: 'desc' }
            });

            return c.json({
                success: true,
                data: results.map(r => ({
                    result_id: r.id,
                    exam_id: r.Exam.id,
                    exam_name: r.Exam.name,
                    exam_type: r.Exam.type,
                    total_percentage: r.total_percentage,
                    grade: r.grade,
                    remarks: r.remarks,
                    published_at: r.approved_at,
                    marks: r.marks.map(m => ({
                        subject: m.subject.name,
                        subject_code: m.subject.code,
                        obtained: m.marks_obtained,
                        max: m.max_marks,
                        grade: m.grade
                    })),
                    report_card_url: `/api/parent/child/${studentId}/report-card/${r.Exam.id}`
                }))
            });
        } catch (error) {
            console.error('[PARENT_RESULTS_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// GET /api/parent/child/:studentId/timetable - Weekly timetable
// ============================================================================
parentRouter.get('/child/:studentId/timetable',
    requireRole([UserRole.PARENT]),
    async (c) => {
        try {
            const user = c.get('user');
            const studentId = c.req.param('studentId');

            // Verify access
            const hasAccess = await verifyParentChildLink(user.id, studentId, user.school_id);
            if (!hasAccess) {
                return c.json({ success: false, error: 'Access denied' }, 403);
            }

            // Get student's current class
            const student = await prisma.student.findFirst({
                where: { id: studentId, school_id: user.school_id },
                include: {
                    enrollments: {
                        where: { academic_year: { is_current: true } },
                        include: { class: true }
                    }
                }
            });

            if (!student?.enrollments[0]) {
                return c.json({ success: false, error: 'Student not enrolled in current year' }, 404);
            }

            const classId = student.enrollments[0].class_id;

            const timetable = await prisma.timetable.findMany({
                where: {
                    school_id: user.school_id,
                    class_id: classId
                },
                include: {
                    subject: { select: { name: true, code: true } },
                    User: { select: { name: true } }
                },
                orderBy: [
                    { day_of_week: 'asc' },
                    { period: 'asc' }
                ]
            });

            return c.json({
                success: true,
                data: {
                    class: `${student.enrollments[0].class.grade}-${student.enrollments[0].class.section}`,
                    timetable: timetable.map(t => ({
                        day_of_week: t.day_of_week,
                        period: t.period,
                        subject: t.subject.name,
                        subject_code: t.subject.code,
                        teacher: t.User?.name || 'TBA',
                        start_time: t.start_time,
                        end_time: t.end_time
                    }))
                }
            });
        } catch (error) {
            console.error('[PARENT_TIMETABLE_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// GET /api/parent/child/:studentId/homework - Pending homework
// ============================================================================
parentRouter.get('/child/:studentId/homework',
    requireRole([UserRole.PARENT]),
    async (c) => {
        try {
            const user = c.get('user');
            const studentId = c.req.param('studentId');

            // Verify access
            const hasAccess = await verifyParentChildLink(user.id, studentId, user.school_id);
            if (!hasAccess) {
                return c.json({ success: false, error: 'Access denied' }, 403);
            }

            // Get student's current class
            const student = await prisma.student.findFirst({
                where: { id: studentId, school_id: user.school_id },
                include: {
                    enrollments: {
                        where: { academic_year: { is_current: true } }
                    }
                }
            });

            if (!student?.enrollments[0]) {
                return c.json({ success: false, error: 'Student not enrolled' }, 404);
            }

            const classId = student.enrollments[0].class_id;

            const homework = await prisma.homework.findMany({
                where: {
                    school_id: user.school_id,
                    class_id: classId
                },
                include: {
                    subject: { select: { name: true, code: true } },
                    submissions: {
                        where: { student_id: studentId }
                    }
                },
                orderBy: { due_date: 'desc' },
                take: 20
            });

            return c.json({
                success: true,
                data: homework.map(h => {
                    const submission = h.submissions[0];
                    let status: 'pending' | 'submitted' | 'graded' | 'overdue';

                    if (submission?.grade) {
                        status = 'graded';
                    } else if (submission) {
                        status = 'submitted';
                    } else if (new Date(h.due_date) < new Date()) {
                        status = 'overdue';
                    } else {
                        status = 'pending';
                    }

                    return {
                        id: h.id,
                        title: h.title,
                        description: h.description,
                        subject: h.subject.name,
                        due_date: h.due_date,
                        status,
                        submission: submission ? {
                            submitted_at: submission.submitted_at,
                            is_late: submission.is_late,
                            grade: submission.grade,
                            feedback: submission.feedback
                        } : null
                    };
                })
            });
        } catch (error) {
            console.error('[PARENT_HOMEWORK_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// GET /api/parent/notifications - Notification center
// ============================================================================
parentRouter.get('/notifications',
    requireRole([UserRole.PARENT]),
    async (c) => {
        try {
            const user = c.get('user');

            const announcements = await prisma.announcement.findMany({
                where: {
                    school_id: user.school_id,
                    OR: [
                        { target_roles: { has: 'PARENT' } },
                        { target_roles: { isEmpty: true } }
                    ]
                },
                include: {
                    author: { select: { name: true, role: true } }
                },
                orderBy: { created_at: 'desc' },
                take: 30
            });

            return c.json({
                success: true,
                data: announcements.map(a => ({
                    id: a.id,
                    title: a.title,
                    message: a.message,
                    author: a.author.name,
                    author_role: a.author.role,
                    created_at: a.created_at,
                    expires_at: a.expires_at,
                    is_new: new Date(a.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                }))
            });
        } catch (error) {
            console.error('[PARENT_NOTIFICATIONS_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// GET /api/parent/profile - Parent profile with consent status
// ============================================================================
parentRouter.get('/profile',
    requireRole([UserRole.PARENT]),
    async (c) => {
        try {
            const user = c.get('user');

            const parentUser = await prisma.user.findUnique({
                where: { id: user.id },
                include: {
                    parent_profile: true
                }
            });

            if (!parentUser) {
                return c.json({ success: false, error: 'User not found' }, 404);
            }

            return c.json({
                success: true,
                data: {
                    id: parentUser.id,
                    name: parentUser.name,
                    email: parentUser.email,
                    phone: parentUser.phone,
                    terms_accepted: !!parentUser.terms_accepted_at,
                    terms_accepted_at: parentUser.terms_accepted_at,
                    profile: parentUser.parent_profile ? {
                        occupation: parentUser.parent_profile.occupation,
                        organization: parentUser.parent_profile.organization,
                        address: {
                            line1: parentUser.parent_profile.address_line1,
                            line2: parentUser.parent_profile.address_line2,
                            city: parentUser.parent_profile.city,
                            state: parentUser.parent_profile.state,
                            pincode: parentUser.parent_profile.pincode
                        },
                        language_preference: parentUser.parent_profile.language_preference,
                        notification_prefs: parentUser.parent_profile.notification_prefs
                    } : null
                }
            });
        } catch (error) {
            console.error('[PARENT_PROFILE_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// PATCH /api/parent/profile - Update contact info
// ============================================================================
parentRouter.patch('/profile',
    requireRole([UserRole.PARENT]),
    async (c) => {
        try {
            const user = c.get('user');
            const body = await c.req.json();
            const { phone, address, language_preference, notification_prefs } = body;

            const updateData: any = {};

            if (phone) {
                updateData.phone = phone;
            }

            if (Object.keys(updateData).length === 0 && !address) {
                return c.json({ success: false, error: 'No valid fields to update' }, 400);
            }

            // Update user
            if (Object.keys(updateData).length > 0) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: updateData
                });
            }

            // Update profile address if provided


            // Update profile preferences/address if provided
            if (address || language_preference || notification_prefs) {
                const profileUpdate: any = {};

                if (address) {
                    profileUpdate.address_line1 = address.line1;
                    profileUpdate.address_line2 = address.line2;
                    profileUpdate.city = address.city;
                    profileUpdate.state = address.state;
                    profileUpdate.pincode = address.pincode;
                }

                if (language_preference) profileUpdate.language_preference = language_preference;
                if (notification_prefs) profileUpdate.notification_prefs = notification_prefs;

                await prisma.parentProfile.updateMany({
                    where: { user_id: user.id },
                    data: profileUpdate
                });
            }

            // Audit log
            await createAuditLog(
                user.school_id,
                user.id,
                'UPDATE_PROFILE',
                'User',
                user.id,
                { updated_fields: Object.keys(updateData).concat(address ? ['address'] : []) },
                c.req.header('x-forwarded-for') || 'unknown'
            );

            return c.json({
                success: true,
                message: 'Profile updated successfully'
            });
        } catch (error) {
            console.error('[PARENT_PROFILE_UPDATE_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// POST /api/parent/accept-terms - Record terms acceptance
// ============================================================================
parentRouter.post('/accept-terms',
    requireRole([UserRole.PARENT]),
    async (c) => {
        try {
            const user = c.get('user');

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    terms_accepted_at: new Date()
                }
            });

            // Audit log
            await createAuditLog(
                user.school_id,
                user.id,
                'ACCEPT_TERMS',
                'User',
                user.id,
                { version: '1.0', timestamp: new Date().toISOString() },
                c.req.header('x-forwarded-for') || 'unknown'
            );

            return c.json({
                success: true,
                message: 'Terms accepted successfully'
            });
        } catch (error) {
            console.error('[PARENT_ACCEPT_TERMS_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// POST /api/parent/child/:studentId/leave-request - Request student leave
// ============================================================================
parentRouter.post('/child/:studentId/leave-request',
    requireRole([UserRole.PARENT]),
    async (c) => {
        try {
            const user = c.get('user');
            const studentId = c.req.param('studentId');
            const body = await c.req.json();
            const { type, start_date, end_date, reason, attachment_url } = body;

            if (!type || !start_date || !end_date) {
                return c.json({ success: false, error: 'Type, start_date, and end_date are required' }, 400);
            }

            // Verify access
            const hasAccess = await verifyParentChildLink(user.id, studentId, user.school_id);
            if (!hasAccess) {
                return c.json({ success: false, error: 'Access denied' }, 403);
            }

            // Validate dates
            const startDateObj = new Date(start_date);
            const endDateObj = new Date(end_date);

            if (startDateObj < new Date()) {
                return c.json({ success: false, error: 'Start date must be in the future' }, 400);
            }

            if (endDateObj < startDateObj) {
                return c.json({ success: false, error: 'End date must be after start date' }, 400);
            }

            // Create leave request
            const leaveRequest = await prisma.leaveApplication.create({
                data: {
                    id: `LEAVE_PARENT_${Date.now()}`,
                    school_id: user.school_id,
                    student_id: studentId,
                    type,
                    start_date: startDateObj,
                    end_date: endDateObj,
                    reason,
                    attachment_url,
                    requested_by: user.id, // Parent who requested
                    status: 'PENDING'
                }
            });

            // Audit log
            await createAuditLog(
                user.school_id,
                user.id,
                'REQUEST_LEAVE',
                'LeaveApplication',
                leaveRequest.id,
                { student_id: studentId, type, start_date, end_date },
                c.req.header('x-forwarded-for') || 'unknown'
            );

            return c.json({
                success: true,
                data: {
                    id: leaveRequest.id,
                    status: leaveRequest.status,
                    message: 'Leave request submitted for approval'
                }
            }, 201);
        } catch (error) {
            console.error('[PARENT_LEAVE_REQUEST_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// GET /api/parent/receipt/:transactionId/download - Download Payment Receipt PDF
// ============================================================================
parentRouter.get('/receipt/:transactionId/download',
    requireRole([UserRole.PARENT]),
    async (c) => {
        try {
            const user = c.get('user');
            const transactionId = c.req.param('transactionId');

            const transaction = await prisma.paymentTransaction.findFirst({
                where: {
                    id: transactionId,
                    school_id: user.school_id
                },
                include: {
                    invoice: {
                        include: {
                            student: {
                                include: {
                                    enrollments: {
                                        where: { academic_year: { is_current: true } },
                                        include: { class: true }
                                    }
                                }
                            },
                            academicYear: true,
                            items: true
                        }
                    }
                }
            });

            if (!transaction) {
                return c.json({ success: false, error: 'Transaction not found' }, 404);
            }

            // Verify access
            const hasAccess = await verifyParentChildLink(user.id, transaction.invoice.student.id, user.school_id);
            if (!hasAccess) {
                return c.json({ success: false, error: 'Access denied' }, 403);
            }

            // Get School Info
            const school = await prisma.school.findUnique({
                where: { id: user.school_id },
                select: { name: true, settings_json: true }
            });

            const settings = (school?.settings_json as any) || {};
            const address = settings.address || '';
            const email = settings.email || '';
            const phone = settings.phone || '';

            // Create PDF
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([595.28, 841.89]); // A4
            const { width, height } = page.getSize();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

            let y = height - 50;

            // Header
            page.drawText(school?.name || 'School Name', { x: 50, y, size: 20, font: boldFont });
            y -= 25;
            page.drawText(address, { x: 50, y, size: 10, font });
            y -= 15;
            page.drawText(`Email: ${email} | Phone: ${phone}`, { x: 50, y, size: 10, font });

            y -= 40;
            page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0, 0, 0) });
            y -= 30;

            // Receipt Title
            page.drawText('PAYMENT RECEIPT', { x: 50, y, size: 16, font: boldFont });
            y -= 30;

            // Details
            const drawField = (label: string, value: string, x: number, y: number) => {
                page.drawText(label, { x, y, size: 10, font: boldFont });
                page.drawText(value, { x: x + 100, y, size: 10, font });
            };

            drawField('Receipt No:', transaction.id.substring(0, 8).toUpperCase(), 50, y);
            drawField('Date:', new Date(transaction.date).toLocaleDateString(), 300, y);
            y -= 20;
            drawField('Student Name:', transaction.invoice.student.name, 50, y);
            drawField('Admission No:', transaction.invoice.student.admission_no, 300, y);
            y -= 20;
            drawField('Class:', transaction.invoice.student.enrollments?.[0]?.class ? `${transaction.invoice.student.enrollments[0].class.grade}-${transaction.invoice.student.enrollments[0].class.section}` : 'N/A', 50, y);
            drawField('Academic Year:', transaction.invoice.academicYear.name, 300, y);
            y -= 20;
            drawField('Payment Mode:', transaction.mode, 50, y);
            drawField('Reference No:', transaction.reference_no, 300, y);

            y -= 40;

            // Table Header
            page.drawRectangle({ x: 50, y: y - 5, width: width - 100, height: 20, color: rgb(0.9, 0.9, 0.9) });
            page.drawText('Description', { x: 60, y, size: 10, font: boldFont });
            page.drawText('Amount', { x: width - 100, y, size: 10, font: boldFont });
            y -= 25;

            // Invoice Items
            transaction.invoice.items.forEach(item => {
                page.drawText(item.title, { x: 60, y, size: 10, font });
                page.drawText(item.amount.toFixed(2), { x: width - 100, y, size: 10, font });
                y -= 20;
            });

            y -= 10;
            page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1 });
            y -= 25;

            // Total Paid
            page.drawText('Total Paid:', { x: 300, y, size: 12, font: boldFont });
            page.drawText(transaction.amount.toFixed(2), { x: width - 100, y, size: 12, font: boldFont });

            y -= 50;
            page.drawText('This is a computer generated receipt.', { x: 50, y, size: 8, font, color: rgb(0.5, 0.5, 0.5) });

            const pdfBytes = await pdfDoc.save();

            c.header('Content-Type', 'application/pdf');
            c.header('Content-Disposition', `attachment; filename="Receipt-${transaction.id}.pdf"`);

            return stream(c, async (stream) => {
                await stream.write(pdfBytes);
            });

        } catch (error) {
            console.error('[RECEIPT_DOWNLOAD_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// GET /api/parent/child/:studentId/report-card/:examId/download - Download Report Card PDF
// ============================================================================
parentRouter.get('/child/:studentId/report-card/:examId/download',
    requireRole([UserRole.PARENT]),
    async (c) => {
        try {
            const user = c.get('user');
            const { studentId, examId } = c.req.param();

            // Verify access
            const hasAccess = await verifyParentChildLink(user.id, studentId, user.school_id);
            if (!hasAccess) {
                return c.json({ success: false, error: 'Access denied' }, 403);
            }

            const result = await prisma.result.findFirst({
                where: {
                    student_id: studentId,
                    exam_id: examId,
                    status: 'PUBLISHED'
                },
                include: {
                    Exam: true,
                    Student: {
                        include: {
                            enrollments: {
                                where: {
                                    academic_year: { is_current: true }
                                },
                                include: {
                                    class: true
                                }
                            }
                        }
                    },
                    marks: {
                        include: {
                            subject: true
                        }
                    }
                }
            });

            if (!result) {
                return c.json({ success: false, error: 'Result not found' }, 404);
            }

            const school = await prisma.school.findUnique({
                where: { id: user.school_id },
                select: { name: true, settings_json: true }
            });

            const settings = (school?.settings_json as any) || {};
            const address = settings.address || '';

            // Create PDF
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([595.28, 841.89]);
            const { width, height } = page.getSize();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

            let y = height - 50;

            // Header
            page.drawText(school?.name || 'School Name', { x: 50, y, size: 20, font: boldFont, color: rgb(0, 0, 0.6) });
            y -= 25;
            page.drawText(address, { x: 50, y, size: 10, font });
            y -= 40;

            page.drawText('REPORT CARD', { x: width / 2 - 50, y, size: 18, font: boldFont });
            y -= 25;
            page.drawText(result.Exam.name, { x: width / 2 - (result.Exam.name.length * 3), y, size: 14, font: boldFont });

            y -= 40;

            // Student Info
            const student = result.Student;
            const className = student.enrollments[0] ? `${student.enrollments[0].class.grade}-${student.enrollments[0].class.section}` : 'N/A';

            page.drawRectangle({ x: 50, y: y - 10, width: width - 100, height: 60, color: rgb(0.95, 0.95, 0.95) });

            page.drawText(`Name: ${student.name}`, { x: 60, y: y + 30, size: 12, font });
            page.drawText(`Class: ${className}`, { x: 300, y: y + 30, size: 12, font });
            page.drawText(`Roll No: ${student.enrollments[0]?.roll_number || '-'}`, { x: 60, y: y + 10, size: 12, font });
            page.drawText(`Admission No: ${student.admission_no}`, { x: 300, y: y + 10, size: 12, font });

            y -= 50;

            // Marks Table
            const startX = 50;
            const col1 = 50;
            const col2 = 300;
            const col3 = 400;
            const col4 = 500;

            // Table Header
            page.drawRectangle({ x: startX, y: y - 5, width: width - 100, height: 25, color: rgb(0.2, 0.2, 0.2) });
            page.drawText('Subject', { x: col1 + 10, y: y + 5, size: 12, font: boldFont, color: rgb(1, 1, 1) });
            page.drawText('Max', { x: col2, y: y + 5, size: 12, font: boldFont, color: rgb(1, 1, 1) });
            page.drawText('Obtained', { x: col3, y: y + 5, size: 12, font: boldFont, color: rgb(1, 1, 1) });
            page.drawText('Grade', { x: col4, y: y + 5, size: 12, font: boldFont, color: rgb(1, 1, 1) });

            y -= 30;

            result.marks.forEach(mark => {
                page.drawText(mark.subject.name, { x: col1 + 10, y, size: 11, font });
                page.drawText(mark.max_marks.toString(), { x: col2, y, size: 11, font });
                page.drawText(mark.marks_obtained.toString(), { x: col3, y, size: 11, font });
                page.drawText(mark.grade || '-', { x: col4, y, size: 11, font });

                // Line
                page.drawLine({ start: { x: startX, y: y - 5 }, end: { x: width - 50, y: y - 5 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
                y -= 25;
            });

            y -= 20;

            // Totals
            page.drawText('Total Percentage:', { x: 300, y, size: 12, font: boldFont });
            page.drawText(`${result.total_percentage.toFixed(2)}%`, { x: 450, y, size: 12, font: boldFont, color: rgb(0, 0, 0.6) });

            y -= 25;
            page.drawText('Result:', { x: 300, y, size: 12, font: boldFont });
            page.drawText(result.remarks || 'PASSED', { x: 450, y, size: 12, font: boldFont });

            y -= 80;

            // Signatures
            page.drawLine({ start: { x: 50, y }, end: { x: 200, y }, thickness: 1 });
            page.drawText('Class Teacher', { x: 80, y: y - 15, size: 10, font });

            page.drawLine({ start: { x: 350, y }, end: { x: 500, y }, thickness: 1 });
            page.drawText('Principal', { x: 400, y: y - 15, size: 10, font });

            const pdfBytes = await pdfDoc.save();

            c.header('Content-Type', 'application/pdf');
            c.header('Content-Disposition', `attachment; filename="ReportCard-${student.name}-${result.Exam.name}.pdf"`);

            return stream(c, async (stream) => {
                await stream.write(pdfBytes);
            });

        } catch (error) {
            console.error('[REPORT_CARD_DOWNLOAD_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// GET /api/parent/tickets - List support tickets
// ============================================================================
parentRouter.get('/tickets',
    requireRole([UserRole.PARENT]),
    async (c) => {
        try {
            const user = c.get('user');

            const tickets = await prisma.ticket.findMany({
                where: {
                    reported_by: user.id,
                    school_id: user.school_id
                },
                orderBy: { created_at: 'desc' }
            });

            return c.json({
                success: true,
                data: {
                    tickets: tickets.map(t => ({
                        id: t.id,
                        issue: t.issue,
                        priority: t.priority,
                        status: t.status,
                        created_at: t.created_at,
                        location: t.location
                    }))
                }
            });
        } catch (error) {
            console.error('[PARENT_TICKETS_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// POST /api/parent/ticket - Create support ticket
// ============================================================================
parentRouter.post('/ticket',
    requireRole([UserRole.PARENT]),
    async (c) => {
        try {
            const user = c.get('user');
            const body = await c.req.json();
            const { issue, priority, location } = body;

            // Simple validation
            if (!issue || !location) {
                return c.json({ success: false, error: 'Issue and location are required' }, 400);
            }

            const ticket = await prisma.ticket.create({
                data: {
                    id: `TKT-${Date.now()}`, // Simple ID generation
                    school_id: user.school_id,
                    reported_by: user.id,
                    issue,
                    priority: priority || 'MEDIUM',
                    status: 'OPEN',
                    location
                }
            });

            return c.json({
                success: true,
                data: {
                    ticket_id: ticket.id,
                    message: 'Support ticket created successfully'
                }
            }, 201);
        } catch (error) {
            console.error('[PARENT_CREATE_TICKET_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// GET /api/parent/child/:studentId/live-classes - List live classes
// ============================================================================
parentRouter.get('/child/:studentId/live-classes',
    requireRole([UserRole.PARENT]),
    async (c) => {
        try {
            const user = c.get('user');
            const studentId = c.req.param('studentId');

            // Verify access
            const hasAccess = await verifyParentChildLink(user.id, studentId, user.school_id);
            if (!hasAccess) {
                return c.json({ success: false, error: 'Access denied' }, 403);
            }

            // Get student's class
            const student = await prisma.student.findFirst({
                where: { id: studentId },
                include: {
                    enrollments: {
                        where: { academic_year: { is_current: true } }
                    }
                }
            });

            if (!student || !student.enrollments[0]) {
                return c.json({ success: false, error: 'Student not enrolled in any class' }, 404);
            }

            const classId = student.enrollments[0].class_id;

            // Fetch live classes
            const liveClasses = await prisma.liveClass.findMany({
                where: {
                    school_id: user.school_id,
                    class_id: classId,
                    start_time: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Show from last 24h onwards
                },
                include: {
                    subject: { select: { name: true } },
                    User: { select: { name: true } } // Relation is User, not teacher
                },
                orderBy: { start_time: 'asc' }
            });

            return c.json({
                success: true,
                data: {
                    live_classes: liveClasses.map(lc => ({
                        id: lc.id,
                        subject: lc.subject.name,
                        teacher: lc.User.name,
                        start_time: lc.start_time,
                        meeting_link: lc.meeting_link,
                        is_active: lc.is_active
                    }))
                }
            });
        } catch (error) {
            console.error('[PARENT_LIVE_CLASSES_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

export { parentRouter };
