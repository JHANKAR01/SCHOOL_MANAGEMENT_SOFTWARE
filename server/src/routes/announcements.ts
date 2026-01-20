import { Hono } from 'hono';
import prisma from '../db';
import { authMiddleware, getRLSContext } from '../middleware/auth';

const announcementRouter = new Hono();

// Public Route (For Login Page)
announcementRouter.get('/public', async (c) => {
    const schoolId = c.req.query('schoolId');
    if (!schoolId) return c.json({ error: 'School ID required' }, 400);

    const announcements = await prisma.announcement.findMany({
        where: {
            school_id: schoolId,
            is_public: true,
            expires_at: { gt: new Date() } // Only future expirations
        },
        orderBy: { created_at: 'desc' },
        take: 3
    });

    return c.json(announcements);
});

// Protected Routes
announcementRouter.use('*', authMiddleware);

// Create Announcement (Admin Only)
announcementRouter.post('/create', async (c) => {
    const { school_id } = getRLSContext(c);
    const user = c.get('user');
    const body = await c.req.json();

    if (!['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'].includes(user.role)) {
        return c.json({ error: 'Unauthorized' }, 403);
    }

    const announcement = await prisma.announcement.create({
        data: {
            school_id,
            author_id: user.id,
            title: body.title,
            message: body.message,
            target_roles: body.target_roles || [], // [] means Everyone
            is_public: body.is_public || false,
            expires_at: body.expires_at ? new Date(body.expires_at) : null
        }
    });

    return c.json(announcement);
});

// Get My Announcements
announcementRouter.get('/active', async (c) => {
    const { school_id } = getRLSContext(c);
    const user = c.get('user');

    const announcements = await prisma.announcement.findMany({
        where: {
            school_id,
            expires_at: { gt: new Date() },
            OR: [
                { target_roles: { has: user.role } }, // Targeted to my role
                { target_roles: { equals: [] } }      // OR Targeted to everyone
            ]
        },
        orderBy: { created_at: 'desc' }
    });

    return c.json(announcements);
});

export default announcementRouter;
