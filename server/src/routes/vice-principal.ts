// server/src/routes/vice-principal.ts
import { Hono } from 'hono';
import prisma from '../db';
import { authMiddleware, requireRole } from '../middleware/auth';
import { UserRole } from '../../../packages/types';

// Define context type for Hono to include the user object
type Variables = {
    user: {
        id: string;
        role: UserRole;
        school_id: string;
        permissions: string[];
        name: string;
    };
};

const vicePrincipalRouter = new Hono<{ Variables: Variables }>();

// Globale middleware: Check Auth & VP Role
vicePrincipalRouter.use('*', authMiddleware);
vicePrincipalRouter.use('*', requireRole([UserRole.VICE_PRINCIPAL, UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN]));

// ============================================================================
// DASHBOARD STATS (KPIs)
// ============================================================================
vicePrincipalRouter.get('/stats', async (c) => {
    const user = c.get('user');

    const [pendingApprovals, urgentIncidents, substitutionNeeds, staffOnLeave] = await Promise.all([
        prisma.approvalRequest.count({
            where: { school_id: user.school_id, status: 'PENDING', assigned_role: 'VICE_PRINCIPAL' }
        }),
        prisma.studentIncident.count({
            where: { school_id: user.school_id, status: 'REPORTED' }
        }),
        prisma.substitution.count({
            where: { school_id: user.school_id, status: 'PENDING' }
        }),
        prisma.leaveApplication.count({
            where: {
                school_id: user.school_id,
                status: 'APPROVED',
                start_date: { lte: new Date() },
                end_date: { gte: new Date() }
            }
        })
    ]);

    return c.json({
        pendingApprovals,
        urgentIncidents,
        substitutionNeeds,
        staffOnLeave
    });
});

// ============================================================================
// APPROVAL WORKFLOW
// ============================================================================
vicePrincipalRouter.get('/approvals', async (c) => {
    const user = c.get('user');
    const status = c.req.query('status') || 'PENDING';

    const requests = await prisma.approvalRequest.findMany({
        where: {
            school_id: user.school_id,
            assigned_role: 'VICE_PRINCIPAL',
            status: status
        },
        include: {
            requester: { select: { id: true, name: true, role: true } }
        },
        orderBy: { created_at: 'desc' }
    });
    return c.json(requests);
});

vicePrincipalRouter.post('/approvals/:id/decision', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const { decision, comment } = await c.req.json();

    if (!['APPROVED', 'REJECTED'].includes(decision)) {
        return c.json({ error: 'Invalid decision' }, 400);
    }

    const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.approvalRequest.update({
            where: { id, school_id: user.school_id },
            data: {
                status: decision,
                decision_by_id: user.id,
                decision_at: new Date(),
                decision_comment: comment
            }
        });

        await tx.auditLog.create({
            data: {
                school_id: user.school_id,
                user_id: user.id,
                action: `APPROVAL_${decision}`,
                target_type: 'ApprovalRequest',
                target_id: id,
                metadata: { resource_type: updated.resource_type }
            }
        });
        return updated;
    });

    return c.json(result);
});

// ============================================================================
// SUBSTITUTIONS
// ============================================================================
vicePrincipalRouter.get('/substitutions', async (c) => {
    const user = c.get('user');
    const subs = await prisma.substitution.findMany({
        where: { school_id: user.school_id, status: 'PENDING' },
        include: {
            originalTeacher: {
                select: {
                    user: { select: { name: true } }
                }
            },
            class: { select: { grade: true, section: true } }
        },
        orderBy: { date: 'asc' }
    });
    // Flatten result for frontend convenience if needed, or handle in UI
    const flattened = subs.map(s => ({
        ...s,
        originalTeacherName: s.originalTeacher?.user?.name,
        className: s.class ? `${s.class.grade}-${s.class.section}` : 'N/A'
    }));
    return c.json(flattened);
});

vicePrincipalRouter.post('/substitutions/confirm', async (c) => {
    const user = c.get('user');
    const { substitutionId, substituteTeacherId } = await c.req.json();

    const updated = await prisma.substitution.update({
        where: { id: substitutionId, school_id: user.school_id },
        data: {
            status: 'ASSIGNED',
            substituteTeacherId: substituteTeacherId
        }
    });

    return c.json({ success: true, substitution: updated });
});

// ============================================================================
// INCIDENTS (DISCIPLINE)
// ============================================================================
vicePrincipalRouter.get('/incidents', async (c) => {
    const user = c.get('user');
    const status = c.req.query('status');

    const incidents = await prisma.studentIncident.findMany({
        where: {
            school_id: user.school_id,
            ...(status ? { status: status as any } : {})
        },
        include: {
            student: { select: { name: true, admission_no: true } },
            reporter: { select: { name: true } }
        },
        orderBy: { created_at: 'desc' }
    });
    return c.json(incidents);
});

vicePrincipalRouter.post('/incidents/:id/triage', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const { status, note } = await c.req.json();

    const updated = await prisma.studentIncident.update({
        where: { id, school_id: user.school_id },
        data: {
            status: status,
            confidential_notes: note
        }
    });
    return c.json(updated);
});

// ============================================================================
// TEACHER PERFORMANCE
// ============================================================================
vicePrincipalRouter.get('/teacher-performance', async (c) => {
    const user = c.get('user');

    // Fetch all teachers in the school
    const teachers = await prisma.user.findMany({
        where: { school_id: user.school_id, role: 'TEACHER' },
        select: { id: true, name: true }
    });

    // Mock logic for performance metrics
    // In a real scenario, this would aggregate data from ExamResults, Attendance, etc.
    const performanceData = await Promise.all(teachers.map(async (teacher) => {
        // Mock: Late Submissions (randomized for demo)
        const lateSubmissions = Math.floor(Math.random() * 5);

        // Real: Substitution Load
        const substitutionLoad = await prisma.substitution.count({
            where: { school_id: user.school_id, substituteTeacherId: teacher.id }
        });

        return {
            id: teacher.id,
            name: teacher.name,
            lateSubmissions, // Mocked for now until Exam Module is fully linked
            substitutionLoad
        };
    }));

    return c.json(performanceData);
});

// ============================================================================
// STUDENT SEARCH (ROSTER)
// ============================================================================
vicePrincipalRouter.get('/students/search', async (c) => {
    const user = c.get('user');
    const query = c.req.query('query') || '';

    if (query.length < 2) return c.json([]);

    const students = await prisma.student.findMany({
        where: {
            school_id: user.school_id,
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { admission_no: { contains: query, mode: 'insensitive' } }
            ]
        },
        take: 10,
        select: {
            id: true,
            name: true,
            admission_no: true,

            enrollments: {
                take: 1,
                orderBy: { created_at: 'desc' },
                select: {
                    class: {
                        select: {
                            grade: true,
                            section: true
                        }
                    }
                }
            }
        }
    });

    return c.json(students);
});

// ============================================================================
// COMMUNICATIONS (NOTIFICATIONS)
// ============================================================================
vicePrincipalRouter.post('/communications/send', async (c) => {
    const user = c.get('user');
    const { targetType, targetId, message } = await c.req.json();

    // In a real implementation, this would trigger NotificationService
    // For now, we'll log it or create a placeholder record if Notification model exists
    // Assuming a simple success response for the MVP phase
    console.log(`[Notification] VP ${user.name} sent to ${targetType} ${targetId || 'ALL'}: ${message}`);

    return c.json({ success: true, message: 'Notification queued' });
});

// ============================================================================
// ATTENDANCE MONITOR
// ============================================================================
vicePrincipalRouter.get('/attendance/monitor', async (c) => {
    const user = c.get('user');

    // enhance: authentic attendance logic would aggregate ClassAttendance records
    // Returning mock trend data for the chart
    const last5Days = Array.from({ length: 5 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (4 - i));
        return {
            date: d.toISOString().split('T')[0],
            percentage: 85 + Math.floor(Math.random() * 10) // Mock 85-95%
        };
    });

    return c.json(last5Days);
});

export { vicePrincipalRouter };
