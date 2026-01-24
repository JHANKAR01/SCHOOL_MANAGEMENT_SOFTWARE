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
    // Implementation in Phase 3
    return c.json([]);
});

export { vicePrincipalRouter };
