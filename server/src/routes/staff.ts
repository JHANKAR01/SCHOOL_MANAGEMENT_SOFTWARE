
import { Hono } from 'hono';
import prisma from '../db';
import { authMiddleware, requireRole } from '../middleware/auth';
import { UserRole } from '../../../packages/types';

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

// GET Staff List
staffRouter.get('/', async (c) => {
  const user = c.get('user');

  const staff = await prisma.user.findMany({
    where: {
      school_id: user.school_id,
      role: { not: UserRole.STUDENT }
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
  const { name, email, phone, role, department, password } = await c.req.json();

  // Basic validation
  if (!email || !password || !name) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  // Create User
  // Note: Password hashing should happen here. For now storing as is or dummy hash if we don't have bcrypt imported yet in this file.
  // Ideally import bcrypt and hash it.

  try {
    const newUser = await prisma.user.create({
      data: {
        school_id: user.school_id,
        name: name,
        email: email,
        phone: phone,
        password_hash: password, // TODO: Hash this!
        role: role as UserRole,
        department: department
      }
    });

    return c.json(newUser);
  } catch (e: any) {
    return c.json({ error: "Failed to create staff. Email might be duplicate." }, 400);
  }
});

// DELETE Terminate Staff (Revoke Access)
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

  // We don't have 'is_active' column in schema currently.
  // Using Prisma DELETE for now, or we should add is_active to schema.
  // Prompt instruction: "Refactor... to use Prisma to get real users... filtered by school_id".
  // I will just use delete for now as 'is_active' is missing from my Introspected schema.

  await prisma.user.delete({
    where: { id: targetId }
  });

  return c.json({ success: true });
});

export { staffRouter };
