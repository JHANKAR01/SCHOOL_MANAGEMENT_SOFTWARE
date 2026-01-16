
import { Hono } from 'hono';
import prisma from '../db';
import { authMiddleware } from '../middleware/auth';

export const superAdminRouter = new Hono();

// Protect all routes
superAdminRouter.use('*', authMiddleware);

/**
 * GET /stats
 * Global KPIs: Active Schools, Total Students, Revenue, Failed Payments
 */
superAdminRouter.get('/stats', async (c) => {
    try {
        const activeSchools = await prisma.school.count({
            where: { status: 'ACTIVE' }
        });

        const totalStudents = await prisma.student.count();

        const revenueResult = await prisma.invoice.aggregate({
            _sum: { amount_paid: true },
            where: { status: 'PAID' }
        });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Count overdue invoices (Pending and older than 30 days) as a proxy for failed/problematic payments
        const failedPayments = await prisma.invoice.count({
            where: {
                status: 'PENDING',
                created_at: { lt: thirtyDaysAgo }
            }
        });

        return c.json({
            schools: activeSchools,
            students: totalStudents,
            revenue: revenueResult._sum.amount_paid || 0,
            failedPayments
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

/**
 * GET /tenants
 * List of schools with student counts and plan details
 */
superAdminRouter.get('/tenants', async (c) => {
    try {
        const schools = await prisma.school.findMany({
            include: {
                _count: {
                    select: { students: true }
                }
            }
        });

        const tenants = schools.map(school => {
            // Safe access to settings_json
            const settings = (school.settings_json as any) || {};

            return {
                id: school.id,
                name: school.name,
                status: school.status,
                plan: settings.billing_cycle || 'Custom',
                region: settings.timezone || 'India',
                studentCount: school._count.students
            };
        });

        return c.json(tenants);
    } catch (error) {
        console.error('Error fetching tenants:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

/**
 * GET /finance
 * Monthly revenue chart data (Last 6 months)
 */
superAdminRouter.get('/finance', async (c) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Helper for grouping if needed, but findMany is safer for known schema
        const paidInvoices = await prisma.invoice.findMany({
            where: {
                status: 'PAID',
                created_at: { gte: sixMonthsAgo }
            },
            select: {
                created_at: true,
                amount_paid: true
            }
        });

        const monthlyRevenue: Record<string, number> = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        paidInvoices.forEach(inv => {
            const date = new Date(inv.created_at);
            const monthName = months[date.getMonth()]; // Simple month name
            const key = monthName;

            if (!monthlyRevenue[key]) {
                monthlyRevenue[key] = 0;
            }
            monthlyRevenue[key] += Number(inv.amount_paid);
        });

        const chartData = Object.entries(monthlyRevenue).map(([name, value]) => ({
            name,
            value
        }));

        return c.json(chartData);
    } catch (error) {
        console.error('Error fetching finance data:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

/**
 * POST /tenants/:id/toggle-feature
 * Update feature flags in settings_json
 */
superAdminRouter.post('/tenants/:id/toggle-feature', async (c) => {
    try {
        const schoolId = c.req.param('id');
        const body = await c.req.json();
        const { feature, enabled } = body;

        if (!feature || typeof enabled !== 'boolean') {
            return c.json({ error: 'Invalid payload' }, 400);
        }

        const school = await prisma.school.findUnique({
            where: { id: schoolId }
        });

        if (!school) {
            return c.json({ error: 'School not found' }, 404);
        }

        // Merge settings
        const currentSettings = (school.settings_json as any) || {};
        const features = currentSettings.features || {};

        // Update specific feature
        features[feature] = enabled;

        const newSettings = {
            ...currentSettings,
            features
        };

        await prisma.school.update({
            where: { id: schoolId },
            data: {
                settings_json: newSettings
            }
        });

        return c.json({ success: true, features });
    } catch (error) {
        console.error('Error toggling feature:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

/**
 * GET /explorer/search
 * Universal search for Super Admin Data Explorer
 */
superAdminRouter.get('/explorer/search', async (c) => {
    try {
        const schoolId = c.req.query('schoolId');
        const module = c.req.query('module'); // 'students' | 'staff'
        const query = c.req.query('query') || '';

        if (!schoolId) return c.json({ error: 'School ID required' }, 400);

        let results: any[] = [];

        if (module === 'students') {
            const students = await prisma.student.findMany({
                where: {
                    school_id: schoolId,
                    name: { contains: query, mode: 'insensitive' }
                },
                take: 50,
                select: {
                    id: true,
                    name: true,
                    // Use enrollment to get class info if needed, or just return basic info
                    phone: true,
                    email: true,
                    aadhaar_number: true,
                    enrollments: {
                        where: { status: 'ACTIVE' },
                        include: { class: true },
                        take: 1
                    }
                }
            });

            // Format for frontend
            results = students.map(r => ({
                id: r.id,
                name: r.name,
                class: r.enrollments[0]?.class?.grade ? `${r.enrollments[0]?.class?.grade}-${r.enrollments[0]?.class?.section}` : 'N/A',
                phone: r.phone || 'N/A',
                email: r.email || 'N/A',
                aadhaar: r.aadhaar_number || 'N/A',
                feeStatus: 'Unknown' // Placeholder until we link finance
            }));

        } else if (module === 'staff') {
            const staff = await prisma.user.findMany({
                where: {
                    school_id: schoolId,
                    role: { in: ['TEACHER', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HOD'] },
                    name: { contains: query, mode: 'insensitive' }
                },
                take: 50,
                select: {
                    id: true,
                    name: true,
                    role: true,
                    email: true,
                    phone: true
                }
            });

            // Format for frontend
            results = staff.map(r => ({
                id: r.id,
                name: r.name,
                class: r.role, // Mapping role to 'class' column for display
                phone: r.phone || 'N/A',
                email: r.email || 'N/A',
                aadhaar: 'N/A',
                feeStatus: 'Active'
            }));
        }

        return c.json(results);
    } catch (error) {
        console.error('Explorer Search Error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
