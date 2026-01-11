// packages/api/src/routes/auth.ts
import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import prisma from '../db.ts';
import bcrypt from 'bcryptjs';

const authRouter = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || 'sovereign_secret_key_123';

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
            select: { id: true, role: true, school_id: true, password_hash: true, name: true, school: { select: { name: true } } }
        });

        // 2. Validate
        if (!user) {
            return c.json({ error: 'Invalid email or password' }, 401);
        }

        // Allow 'admin123' for migration/testing purposes if the hash matches OR strictly during dev
        // For production, we strictly use bcrypt.compare
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        // Fallback for initial dev/seed users who might just have plain text 'admin123' stored as hash (unlikely but "seed" mentioned)
        // OR if the user manually seeded 'admin123' as the password field without hashing.
        // Assuming the database has correct bcrypt hashes. If not, this might fail unless we handle plain text fallback.
        // Given constraint: "verify credentials (accept 'admin123' for seed users)"
        // We will assume "accept 'admin123'" means we check against the hash of 'admin123' OR a specific condition.
        // If the DB has raw 'admin123' we need to handle that, but `password_hash` implies hashing.
        // I will assume standard bcrypt compare.

        if (!isPasswordValid) {
            return c.json({ error: 'Invalid email or password' }, 401);
        }

        // 3. Generate Token with Tenant Context (RLS)
        const payload = {
            sub: user.id,
            role: user.role,
            school_id: user.school_id,
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
            }
        });
    } catch (error) {
        console.error('[AUTH_ERROR]', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

export { authRouter };