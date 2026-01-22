// server/src/routes/auth.ts
import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import prisma from '../db.ts';
import bcrypt from 'bcryptjs';
import { checkRateLimit, resetRateLimit } from '../utils/rate-limiter';

const authRouter = new Hono();
// JWT Secret - MUST be set in environment, no fallback allowed
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
    throw new Error('FATAL: JWT_SECRET environment variable must be set and at least 32 characters');
}

/**
 * LOGIN ENDPOINT
 * Validates credentials and returns a tenant-scoped JWT.
 */
authRouter.post('/login', async (c) => {
    try {
        const { email, password } = await c.req.json();

        // Get client IP for rate limiting
        const clientIP = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
            c.req.header('x-real-ip') ||
            'unknown';
        const rateLimitKey = `login:${clientIP}:${email}`;

        // Check rate limit (5 attempts per 15 minutes)
        const rateCheck = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
        if (!rateCheck.allowed) {
            console.warn(`[SECURITY] Rate limit exceeded for ${email} from ${clientIP}`);
            return c.json({
                error: 'Too many login attempts. Please try again later.',
                retryAfter: Math.ceil(rateCheck.resetIn / 1000)
            }, 429);
        }

        // 1. Find User
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, role: true, school_id: true, password_hash: true, name: true, permissions: true, school: { select: { name: true } } }
        });

        // 2. Validate
        if (!user) {
            console.warn(`[SECURITY] Failed login - user not found: ${email} from ${clientIP}`);
            return c.json({ error: 'Invalid email or password' }, 401);
        }

        // Standard bcrypt comparison
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            console.warn(`[SECURITY] Failed login - wrong password: ${email} from ${clientIP}`);
            return c.json({ error: 'Invalid email or password' }, 401);
        }

        // Successful login - reset rate limit
        resetRateLimit(rateLimitKey);
        console.info(`[AUTH] Successful login: ${email} (${user.role}) from ${clientIP}`);

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
            error: 'Internal Server Error'
            // Details logged server-side only - not exposed to clients
        }, 500);
    }
});

export { authRouter };