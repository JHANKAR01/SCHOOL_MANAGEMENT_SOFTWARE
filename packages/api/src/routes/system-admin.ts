// packages/api/src/routes/system-admin.ts
// P6.1: System Admin Module - User Access Control & Audit Logs
import { Hono } from 'hono';
import prisma from '../db';
import { authMiddleware, requireRole, requirePermission } from '../middleware/auth';
import { UserRole } from '../../../../types';
import { PERMISSIONS } from '../../../../types/permissions';
import bcrypt from 'bcryptjs';

type Variables = {
    user: {
        id: string;
        role: UserRole;
        school_id: string;
        permissions?: string[];
    };
};

const systemAdminRouter = new Hono<{ Variables: Variables }>();
systemAdminRouter.use('*', authMiddleware);
systemAdminRouter.use('*', requireRole([UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL]));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔒 GRANT ACCESS - The ONLY place to create user logins
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
systemAdminRouter.post('/users/grant-access',
    requirePermission(PERMISSIONS.MANAGE_USERS),
    async (c) => {
        const user = c.get('user');
        const { person_type, person_id, role, email, password, permissions } = await c.req.json();

        // 1. Validate person exists
        let person: { name: string; email?: string | null } | null = null;

        if (person_type === 'STUDENT') {
            const student = await prisma.student.findFirst({
                where: { id: person_id, school_id: user.school_id },
                select: { name: true, email: true, user_id: true }
            });

            if (!student) {
                return c.json({ error: 'Student not found' }, 404);
            }

            if (student.user_id) {
                return c.json({ error: 'Student already has a login' }, 400);
            }

            person = student;
        } else if (person_type === 'STAFF') {
            const staff = await prisma.staffProfile.findFirst({
                where: { id: person_id, school_id: user.school_id },
                include: { user: { select: { id: true } } }
            });

            if (!staff) {
                return c.json({ error: 'Staff profile not found' }, 404);
            }

            person = { name: staff.designation, email: null };
        } else {
            return c.json({ error: 'Invalid person_type. Use STUDENT or STAFF.' }, 400);
        }

        // 2. Check email uniqueness
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return c.json({ error: 'Email already in use' }, 400);
        }

        // 3. Hash password
        const password_hash = await bcrypt.hash(password || 'Welcome@123', 10);

        // 4. Create User
        const newUser = await prisma.user.create({
            data: {
                name: person.name,
                email,
                password_hash,
                role: role as UserRole,
                school_id: user.school_id,
                permissions: permissions || [],
                ...(person_type === 'STUDENT' && {
                    student_account: { connect: { id: person_id } }
                })
            }
        });

        // 5. If STAFF, link to StaffProfile
        if (person_type === 'STAFF') {
            await prisma.staffProfile.update({
                where: { id: person_id },
                data: { user_id: newUser.id }
            });
        }

        // 6. Audit Log
        await prisma.auditLog.create({
            data: {
                school_id: user.school_id,
                user_id: user.id,
                action: 'GRANT_USER_ACCESS',
                target_type: 'User',
                target_id: newUser.id,
                metadata: { person_type, person_id, role, email }
            }
        });

        return c.json({
            success: true,
            message: 'Login created successfully',
            user_id: newUser.id,
            email
        });
    }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔒 REVOKE ACCESS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
systemAdminRouter.post('/users/:id/revoke',
    requirePermission(PERMISSIONS.MANAGE_USERS),
    async (c) => {
        const user = c.get('user');
        const targetUserId = c.req.param('id');

        // Prevent self-revoke
        if (targetUserId === user.id) {
            return c.json({ error: 'Cannot revoke your own access' }, 400);
        }

        // Verify target is in same school
        const targetUser = await prisma.user.findFirst({
            where: { id: targetUserId, school_id: user.school_id }
        });

        if (!targetUser) {
            return c.json({ error: 'User not found' }, 404);
        }

        // Delete user
        await prisma.user.delete({ where: { id: targetUserId } });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                school_id: user.school_id,
                user_id: user.id,
                action: 'REVOKE_USER_ACCESS',
                target_type: 'User',
                target_id: targetUserId,
                metadata: { revoked_email: targetUser.email, revoked_role: targetUser.role }
            }
        });

        return c.json({ success: true, message: 'User access revoked' });
    }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔒 UPDATE PERMISSIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
systemAdminRouter.patch('/users/:id/permissions',
    requirePermission(PERMISSIONS.MANAGE_USERS),
    async (c) => {
        const user = c.get('user');
        const targetUserId = c.req.param('id');
        const { permissions } = await c.req.json();

        const updated = await prisma.user.updateMany({
            where: { id: targetUserId, school_id: user.school_id },
            data: { permissions }
        });

        if (updated.count === 0) {
            return c.json({ error: 'User not found' }, 404);
        }

        // Audit
        await prisma.auditLog.create({
            data: {
                school_id: user.school_id,
                user_id: user.id,
                action: 'UPDATE_PERMISSIONS',
                target_type: 'User',
                target_id: targetUserId,
                metadata: { new_permissions: permissions }
            }
        });

        return c.json({ success: true, permissions });
    }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔒 AUDIT LOGS - View security trail
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
systemAdminRouter.get('/audit-logs',
    requirePermission(PERMISSIONS.VIEW_AUDIT_LOGS),
    async (c) => {
        const user = c.get('user');
        const page = Math.max(1, parseInt(c.req.query('page') || '1'));
        const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '50')));
        const action = c.req.query('action'); // Optional filter

        const where: any = { school_id: user.school_id };
        if (action) where.action = action;

        const [total, logs] = await Promise.all([
            prisma.auditLog.count({ where }),
            prisma.auditLog.findMany({
                where,
                include: { user: { select: { name: true, email: true } } },
                orderBy: { created_at: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            })
        ]);

        return c.json({
            success: true,
            data: logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LIST USERS - Search-First Architecture (P9 Optimization)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
systemAdminRouter.get('/users', async (c) => {
    const user = c.get('user');

    // Parse query parameters
    const search = c.req.query('search')?.trim() || '';
    const roleFilter = c.req.query('role');
    const page = Math.max(1, parseInt(c.req.query('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(c.req.query('limit') || '20')));
    const skip = (page - 1) * limit;

    // If no search query, return only recent 10 users (or empty if preferred)
    if (!search) {
        const recentUsers = await prisma.user.findMany({
            where: { school_id: user.school_id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                permissions: true,
                created_at: true,
                student_account: { select: { id: true, admission_no: true } },
                staff_profile: { select: { id: true, designation: true } }
            },
            orderBy: { created_at: 'desc' },
            take: 10
        });

        return c.json({
            success: true,
            users: recentUsers,
            total: recentUsers.length,
            searchMode: false,
            message: 'Showing 10 most recent users. Use search to find specific users.'
        });
    }

    // Build search where clause
    const where: any = {
        school_id: user.school_id,
        OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
        ]
    };

    // Add role filter if provided
    if (roleFilter) {
        where.role = roleFilter;
    }

    // Execute count and search in parallel
    const [total, users] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                permissions: true,
                created_at: true,
                student_account: { select: { id: true, admission_no: true } },
                staff_profile: { select: { id: true, designation: true } }
            },
            orderBy: { created_at: 'desc' },
            skip,
            take: limit
        })
    ]);

    return c.json({
        success: true,
        users,
        total,
        searchMode: true,
        pagination: {
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasMore: page * limit < total
        }
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 DASHBOARD STATS - Real-time counts for School Admin Dashboard
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
systemAdminRouter.get('/stats', async (c) => {
    const user = c.get('user');
    const schoolId = user.school_id;

    // Get current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    try {
        // Execute all counts in parallel for performance
        const [
            totalStudents,
            totalStaff,
            feeAggregation,
            pendingIssues
        ] = await Promise.all([
            // 1. Total Students with active enrollment
            prisma.student.count({
                where: { school_id: schoolId }
            }),

            // 2. Total Staff
            prisma.staffProfile.count({
                where: { school_id: schoolId }
            }),

            // 3. Fee Collection this month (sum of payment transactions)
            prisma.paymentTransaction.aggregate({
                _sum: { amount: true },
                where: {
                    school_id: schoolId,
                    date: {
                        gte: startOfMonth,
                        lte: endOfMonth
                    }
                }
            }),

            // 4. Pending Issues (New Inquiries)
            prisma.inquiry.count({
                where: {
                    school_id: schoolId,
                    status: 'NEW'
                }
            })
        ]);

        return c.json({
            success: true,
            data: {
                totalStudents,
                totalStaff,
                collectedFee: feeAggregation._sum.amount || 0,
                pendingIssues
            },
            period: {
                month: now.toLocaleString('default', { month: 'long' }),
                year: now.getFullYear()
            }
        });
    } catch (error) {
        console.error('[STATS_ERROR]', error);
        return c.json({
            success: false,
            error: 'Failed to fetch dashboard stats',
            data: {
                totalStudents: 0,
                totalStaff: 0,
                collectedFee: 0,
                pendingIssues: 0
            }
        }, 500);
    }
});

export { systemAdminRouter };
