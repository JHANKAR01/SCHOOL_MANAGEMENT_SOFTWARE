// server/src/routes/principal.ts
// Principal Dashboard API - Aggregated stats and approval actions
import { Hono } from 'hono';
import prisma from '../db';
import { authMiddleware, requireRole } from '../middleware/auth';
import { UserRole } from '../../../packages/types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type Variables = {
    user: {
        id: string;
        role: UserRole;
        school_id: string;
        permissions?: string[];
    };
};

type ApprovalType = 'RESULT_PUBLISH' | 'LEAVE_REQUEST' | 'DEMASK_PII';
type UrgencyLevel = 'HIGH' | 'MEDIUM' | 'LOW';

interface ApprovalRequest {
    id: string;
    type: ApprovalType;
    title: string;
    subtitle: string;
    requester: string;
    requesterId: string;
    timestamp: string;
    urgency: UrgencyLevel;
    metadata?: Record<string, any>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Get today's attendance statistics for the school
 */
async function getAttendanceStats(schoolId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        const [presentCount, totalCount] = await Promise.all([
            prisma.attendance.count({
                where: {
                    school_id: schoolId,
                    date: today,
                    status: 'PRESENT',
                    period: 0  // Daily summary
                }
            }),
            prisma.attendance.count({
                where: {
                    school_id: schoolId,
                    date: today,
                    period: 0
                }
            })
        ]);

        const studentPct = totalCount > 0 ? Math.round((presentCount / totalCount) * 1000) / 10 : 0;

        // TODO: Count classes with < 85% attendance (requires groupBy query)
        const lowClasses = 0;

        // TODO: Implement staff attendance tracking
        const staffPct = 96.0;

        return {
            studentPct: studentPct || 94.5, // Fallback for demo
            staffPct,
            lowClasses
        };
    } catch (error) {
        console.error('[Principal] Attendance stats error:', error);
        return { studentPct: 0, staffPct: 0, lowClasses: 0 };
    }
}

/**
 * Get pending leave applications for approval
 */
async function getPendingLeaveApprovals(schoolId: string): Promise<ApprovalRequest[]> {
    try {
        const pendingLeaves = await prisma.leaveApplication.findMany({
            where: {
                school_id: schoolId,
                status: 'PENDING'
            },
            include: {
                User: { select: { id: true, name: true } }
            },
            orderBy: { created_at: 'desc' },
            take: 10
        });

        return pendingLeaves.map(leave => {
            // Determine urgency based on start date proximity
            const startDate = new Date(leave.start_date);
            const daysUntilStart = Math.ceil((startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            let urgency: UrgencyLevel = 'LOW';
            if (daysUntilStart <= 1) urgency = 'HIGH';
            else if (daysUntilStart <= 3) urgency = 'MEDIUM';

            return {
                id: leave.id,
                type: 'LEAVE_REQUEST' as const,
                title: `${leave.type} Leave`,
                subtitle: `${leave.start_date.toLocaleDateString()} - ${leave.end_date.toLocaleDateString()}`,
                requester: leave.User.name,
                requesterId: leave.User.id,
                timestamp: leave.created_at?.toISOString() || new Date().toISOString(),
                urgency,
                metadata: {
                    leaveId: leave.id,
                    type: leave.type,
                    reason: leave.reason,
                    startDate: leave.start_date.toISOString(),
                    endDate: leave.end_date.toISOString()
                }
            };
        });
    } catch (error) {
        console.error('[Principal] Pending leaves error:', error);
        return [];
    }
}

/**
 * Get pending result batches for approval
 * NOTE: Uses mock data until schema changes are applied via `npx prisma db push`
 * After schema push, run `npx prisma generate` to update Prisma client
 */
async function getPendingResultApprovals(schoolId: string): Promise<ApprovalRequest[]> {
    // TODO: Enable real queries after running:
    // 1. npx prisma db push (apply schema)
    // 2. npx prisma generate (regenerate client)

    // Return mock data for demo
    return [
        {
            id: 'result_demo_001',
            type: 'RESULT_PUBLISH',
            title: 'Class 10-A Mathematics',
            subtitle: 'Unit Test 2 • 42 students',
            requester: 'Mrs. Sharma',
            requesterId: 'teacher_demo',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            urgency: 'HIGH',
            metadata: { examId: 'exam_demo', studentCount: 42 }
        },
        {
            id: 'result_demo_002',
            type: 'RESULT_PUBLISH',
            title: 'Class 9-B Science',
            subtitle: 'Midterm Exam • 38 students',
            requester: 'Mr. Verma',
            requesterId: 'teacher_demo2',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            urgency: 'HIGH',
            metadata: { examId: 'exam_demo2', studentCount: 38 }
        }
    ];
}

/**
 * Get risk metrics (students at risk)
 */
async function getRiskMetrics(schoolId: string) {
    // Hardcoded thresholds for Phase 1
    const ATTENDANCE_THRESHOLD = 75;
    const ACADEMIC_THRESHOLD = 35;

    try {
        // TODO: Implement proper rolling window attendance calculation
        // This requires aggregating attendance over the last 30 days per student
        // and counting those below threshold

        // TODO: Implement academic risk calculation
        // This requires analyzing ResultMark to find students failing > 2 subjects

        // For now, return placeholder values
        return {
            atRiskAttendance: 12,
            academicWarning: 8
        };
    } catch (error) {
        console.error('[Principal] Risk metrics error:', error);
        return { atRiskAttendance: 0, academicWarning: 0 };
    }
}

/**
 * Get pending results count for KPI display
 * NOTE: Uses mock data until schema changes are applied
 */
async function getPendingResultsCount(schoolId: string) {
    // TODO: Enable real queries after schema update
    // Return mock count for demo
    return {
        count: 3,
        latestExam: 'Unit Test 2'
    };
}

/**
 * Get critical alerts (medical emergencies, security incidents)
 */
async function getCriticalAlerts(schoolId: string) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Count today's medical logs as potential critical alerts
        const medicalCount = await prisma.medicalLog.count({
            where: {
                school_id: schoolId,
                time: { gte: today }
            }
        });

        return {
            critical: medicalCount > 2 ? 1 : 0, // Flag if multiple medical incidents today
            medium: medicalCount
        };
    } catch (error) {
        console.error('[Principal] Critical alerts error:', error);
        return { critical: 0, medium: 0 };
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTER SETUP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const principalRouter = new Hono<{ Variables: Variables }>();

// Apply auth middleware to all routes
principalRouter.use('*', authMiddleware);
principalRouter.use('*', requireRole([UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL]));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * GET /api/principal/stats
 * Aggregated dashboard statistics for the command center
 */
principalRouter.get('/stats', async (c) => {
    const user = c.get('user');

    try {
        // Parallel queries for performance
        const [
            attendance,
            pendingResults,
            alerts,
            leaveApprovals,
            resultApprovals,
            riskMetrics
        ] = await Promise.all([
            getAttendanceStats(user.school_id),
            getPendingResultsCount(user.school_id),
            getCriticalAlerts(user.school_id),
            getPendingLeaveApprovals(user.school_id),
            getPendingResultApprovals(user.school_id),
            getRiskMetrics(user.school_id)
        ]);

        // Combine all approvals
        const approvals = [...resultApprovals, ...leaveApprovals]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return c.json({
            success: true,
            stats: {
                attendance,
                pendingResults,
                alerts,
                approvals,
                riskMetrics
            }
        });
    } catch (error) {
        console.error('[Principal] Stats fetch error:', error);
        return c.json({ success: false, error: 'Failed to load dashboard stats' }, 500);
    }
});

/**
 * POST /api/principal/approvals/:id/action
 * Handle approval actions (approve, reject, request clarification)
 */
principalRouter.post('/approvals/:id/action', async (c) => {
    const user = c.get('user');
    const { id } = c.req.param();
    const { action, reason, type } = await c.req.json();

    // Validate action
    if (!['APPROVE', 'REJECT', 'REQUEST_CLARIFICATION'].includes(action)) {
        return c.json({ success: false, error: 'Invalid action' }, 400);
    }

    try {
        if (type === 'LEAVE_REQUEST') {
            const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

            // Update leave application
            await prisma.leaveApplication.update({
                where: { id },
                data: { status: newStatus }
            });

            // Create audit log
            await prisma.auditLog.create({
                data: {
                    school_id: user.school_id,
                    user_id: user.id,
                    action: `LEAVE_${action}`,
                    target_type: 'LeaveApplication',
                    target_id: id,
                    metadata: { reason, action }
                }
            });

            return c.json({
                success: true,
                message: `Leave request ${action.toLowerCase()}ed successfully`
            });
        }

        if (type === 'RESULT_PUBLISH') {
            // id here is the exam_id for batch approval
            const examId = id;

            // TODO: Enable actual result updates after running:
            // 1. npx prisma db push (apply schema)
            // 2. npx prisma generate (regenerate client)
            // For now, just create audit log and return success

            // Create audit log
            await prisma.auditLog.create({
                data: {
                    school_id: user.school_id,
                    user_id: user.id,
                    action: `RESULT_${action}`,
                    target_type: 'Exam',
                    target_id: examId,
                    metadata: { reason, action, type: 'batch_approval' }
                }
            });

            return c.json({
                success: true,
                message: `Result batch ${action.toLowerCase()}ed successfully (demo mode)`
            });
        }

        return c.json({ success: false, error: 'Unknown approval type' }, 400);
    } catch (error) {
        console.error('[Principal] Approval action error:', error);
        return c.json({ success: false, error: 'Failed to process approval' }, 500);
    }
});

/**
 * GET /api/principal/approvals
 * Get filtered list of approvals
 */
principalRouter.get('/approvals', async (c) => {
    const user = c.get('user');
    const type = c.req.query('type'); // Optional filter: LEAVE_REQUEST | RESULT_PUBLISH

    try {
        const [leaveApprovals, resultApprovals] = await Promise.all([
            type === 'RESULT_PUBLISH' ? [] : getPendingLeaveApprovals(user.school_id),
            type === 'LEAVE_REQUEST' ? [] : getPendingResultApprovals(user.school_id)
        ]);

        const approvals = [...resultApprovals, ...leaveApprovals]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return c.json({
            success: true,
            approvals,
            total: approvals.length
        });
    } catch (error) {
        console.error('[Principal] Approvals list error:', error);
        return c.json({ success: false, error: 'Failed to load approvals' }, 500);
    }
});

/**
 * POST /api/principal/demask
 * Log demask PII action for audit compliance
 */
principalRouter.post('/demask', async (c) => {
    const user = c.get('user');
    const { studentId, justification, fields } = await c.req.json();

    // Validate required fields
    if (!studentId || !justification || !fields) {
        return c.json({ success: false, error: 'Missing required fields' }, 400);
    }

    try {
        // Create audit log for compliance
        await prisma.auditLog.create({
            data: {
                school_id: user.school_id,
                user_id: user.id,
                action: 'DEMASK_PII',
                target_type: 'Student',
                target_id: studentId,
                metadata: {
                    justification,
                    fields_accessed: fields,
                    timestamp: new Date().toISOString(),
                    duration_minutes: 5
                }
            }
        });

        return c.json({
            success: true,
            message: 'Access granted. This action has been logged.',
            expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        });
    } catch (error) {
        console.error('[Principal] Demask error:', error);
        return c.json({ success: false, error: 'Failed to log demask action' }, 500);
    }
});

export { principalRouter };

