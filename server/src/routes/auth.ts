// server/src/routes/auth.ts
import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import prisma from '../db.ts';
import bcrypt from 'bcryptjs';

const authRouter = new Hono();
// Hardcoded for consistency during debugging
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';

/**
 * LOGIN ENDPOINT
 * Validates credentials and returns a tenant-scoped JWT.
 */
authRouter.post('/login', async (c) => {
    try {
        const { email, password } = await c.req.json();

        // 1. Find User
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, role: true, school_id: true, password_hash: true, name: true, permissions: true, school: { select: { name: true } } }
        });

        // 2. Validate
        if (!user) {
            return c.json({ error: 'Invalid email or password' }, 401);
        }

        // Standard bcrypt comparison
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return c.json({ error: 'Invalid email or password' }, 401);
        }

        // 3a. Fetch School Config
        const school = await prisma.school.findUnique({
            where: { id: user.school_id }
        });

        // 3. Generate Token with Tenant Context (RLS) + Permissions (P2.1.2)
        const payload = {
            sub: user.id,
            role: user.role,
            school_id: user.school_id,
            permissions: user.permissions || [],  // Include granular permissions
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24 Hours
        };

        const token = await sign(payload, JWT_SECRET);

        return c.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                school_id: user.school_id,
                school_name: user.school.name
            },
            school: {
                school_id: school?.id,
                name: school?.name,
                logo_url: 'https://via.placeholder.com/150', // placeholder
                primary_color: '#4F46E5', // default indigo
                features: {
                    attendance: true,
                    fees: true,
                    transport: true,
                    library: true,
                    hostel: true
                },
                location: { lat: 0, lng: 0 },
                upi_vpa: 'school@upi'
            }
        });
    } catch (error) {
        console.error('[AUTH_ERROR]', error);
        return c.json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        }, 500);
    }
});

export { authRouter };