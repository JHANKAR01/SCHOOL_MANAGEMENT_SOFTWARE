
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

const attendanceRouter = new Hono<{ Variables: Variables }>();
attendanceRouter.use('*', authMiddleware);

// --- GET ATTENDANCE ---
attendanceRouter.get('/', requireRole([UserRole.TEACHER, UserRole.PRINCIPAL, UserRole.PARENT, UserRole.STUDENT]), async (c) => {
  const user = c.get('user');
  const { date, studentId } = c.req.query();

  // 1. Build Query
  const query: any = { school_id: user.school_id };

  if (date) {
    query.date = new Date(date);
  }

  if (studentId) {
    query.student_id = studentId;
  } else if (user.role === UserRole.STUDENT) {
    // Enforce student seeing only their own data if not explicitly requested
    // Or if student user ID is linked to student table. 
    // For now, assuming student users have same ID as student records or we need to lookup.
    // Simplified:
    // query.student_id = user.id; // Or similar mapping logic
  }

  const records = await prisma.attendance.findMany({
    where: query,
    include: { student: { select: { name: true } } },
    orderBy: { date: 'desc' }
  });

  return c.json(records);
});

// --- SUBMIT ATTENDANCE (BULK) ---
attendanceRouter.post('/', requireRole([UserRole.TEACHER, UserRole.PRINCIPAL]), async (c) => {
  const user = c.get('user');
  const { date, records } = await c.req.json(); // records: { studentId: string, status: 'PRESENT'|'ABSENT' }[]

  const targetDate = new Date(date);

  // Transactional Bulk Ops
  const ops = records.map((rec: any) =>
    prisma.attendance.create({
      data: {
        school_id: user.school_id,
        student_id: rec.studentId,
        date: targetDate,
        status: rec.status,
        synced: true
      }
    })
  );

  await prisma.$transaction(ops);

  return c.json({ success: true, count: records.length });
});

export { attendanceRouter };
