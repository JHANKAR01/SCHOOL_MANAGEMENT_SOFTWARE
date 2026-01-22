
import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import prisma from '../db';
import { authMiddleware, requireRole } from '../middleware/auth';
import { UserRole } from '../../../packages/types';
import { sanitizeString, normalizeEmail, isValidEmail, isValidPassword } from '../utils/validation';

type Variables = {
  user: {
    id: string;
    role: UserRole;
    school_id: string;
  };
};

const staffRouter = new Hono<{ Variables: Variables }>();

staffRouter.use('*', authMiddleware);
// Only Admin/Super Admin/Principal can view all staff
staffRouter.use('*', requireRole([UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL]));

// GET Staff List (only active users)
staffRouter.get('/', async (c) => {
  const user = c.get('user');

  const staff = await prisma.user.findMany({
    where: {
      school_id: user.school_id,
      role: { not: UserRole.STUDENT },
      is_active: true  // Only show active staff
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      department: true,
      created_at: true
    }
  });

  return c.json(staff);
});

// POST Create Staff
staffRouter.post('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();

  // Sanitize and normalize inputs
  const name = sanitizeString(body.name || '').trim();
  const email = normalizeEmail(body.email || '');
  const phone = body.phone?.replace(/\D/g, '') || null;
  const role = body.role;
  const department = sanitizeString(body.department || '').trim();
  const password = body.password;

  // Validate required fields
  if (!name || !email || !password) {
    return c.json({ error: "Missing required fields: name, email, password" }, 400);
  }

  // Validate email format
  if (!isValidEmail(email)) {
    return c.json({ error: "Invalid email format" }, 400);
  }

  // Validate password strength
  const passwordCheck = isValidPassword(password);
  if (!passwordCheck.valid) {
    return c.json({ error: passwordCheck.error }, 400);
  }

  // Create User with hashed password
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        school_id: user.school_id,
        name: name,
        email: email,
        phone: phone,
        password_hash: hashedPassword,
        role: role as UserRole,
        department: department || null
      }
    });

    // Don't return password_hash in response
    const { password_hash, ...safeUser } = newUser as any;
    return c.json(safeUser);
  } catch (e: any) {
    console.error('[STAFF] Create error:', e.message);
    return c.json({ error: "Failed to create staff. Email might be duplicate." }, 400);
  }
});

// DELETE Terminate Staff (Soft Delete - Revoke Access)
staffRouter.delete('/:id', async (c) => {
  const user = c.get('user');
  const targetId = c.req.param('id');

  // Verify target belongs to same school
  const targetUser = await prisma.user.findUnique({
    where: { id: targetId }
  });

  if (!targetUser || targetUser.school_id !== user.school_id) {
    return c.json({ error: "User not found" }, 404);
  }

  // Prevent self-deactivation
  if (targetUser.id === user.id) {
    return c.json({ error: "Cannot deactivate your own account" }, 400);
  }

  // Soft delete - set is_active to false instead of deleting
  await prisma.user.update({
    where: { id: targetId },
    data: { is_active: false }
  });

  console.info(`[STAFF] User deactivated: ${targetUser.email} by ${user.id}`);
  return c.json({ success: true, message: 'Staff member deactivated' });
});

export { staffRouter };
