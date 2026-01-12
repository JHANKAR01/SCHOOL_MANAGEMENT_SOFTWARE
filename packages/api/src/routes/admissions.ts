import { Hono } from 'hono';
import { getTenantDB } from '../db';
import { authMiddleware, requireRole } from '../middleware/auth';
import { UserRole } from '../../../../types';

type Variables = {
  user: {
    id: string;
    role: UserRole;
    school_id: string;
  };
};

const admissionsRouter = new Hono<{ Variables: Variables }>();
admissionsRouter.use('*', authMiddleware);

admissionsRouter.get('/', requireRole([UserRole.ADMISSIONS_OFFICER]), async (c) => {
  const user = c.get('user');
  const db = getTenantDB(user.school_id, user.role);

  const inquiries = await db.inquiry.findMany({
    orderBy: { created_at: 'desc' }
  });

  return c.json(inquiries);
});

admissionsRouter.post('/', requireRole([UserRole.ADMISSIONS_OFFICER]), async (c) => {
  const user = c.get('user');
  const db = getTenantDB(user.school_id, user.role);
  const data = await c.req.json();

  const inquiry = await db.inquiry.create({
    data: {
      school_id: user.school_id,
      parent_name: data.parentName,
      phone: data.phone,
      target_class: data.class,
      status: 'NEW'
    }
  });

  return c.json(inquiry);
});

// ✅ New Endpoint: Enroll Student & Create Login
admissionsRouter.post('/enroll', requireRole([UserRole.ADMISSIONS_OFFICER, UserRole.SCHOOL_ADMIN]), async (c) => {
  const user = c.get('user');
  const db = getTenantDB(user.school_id, user.role);
  const data = await c.req.json();

  // 1. Create Student Profile
  const student = await db.student.create({
    data: {
      admission_no: data.admission_no,
      name: data.name,
      email: data.email,
      class: data.class,
      roll: parseInt(data.roll),
      school_id: user.school_id
    }
  });

  // 2. Create User Login (if email provided)
  if (data.email) {
    // Default password for new students (could be randomized)
    // Hash: $2a$10$AOX3MKfyvWr8sQyssgXLZeN0fZtOE7ooZxFkU5VxuP2W8t3Nnct7y (password123)
    const defaultHash = '$2a$10$AOX3MKfyvWr8sQyssgXLZeN0fZtOE7ooZxFkU5VxuP2W8t3Nnct7y';

    await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: UserRole.STUDENT,
        school_id: user.school_id,
        password_hash: defaultHash
      }
    });
  }

  return c.json({ message: 'Student Enrolled & User Created', student });
});

export { admissionsRouter };