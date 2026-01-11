
import { Hono } from 'hono';
import prisma from '../db';
import { authMiddleware, requireRole } from '../middleware/auth';
import { UserRole } from '../../../../types';

type Variables = {
  user: {
    id: string;
    role: UserRole;
    school_id: string;
  };
};

const academicsRouter = new Hono<{ Variables: Variables }>();
academicsRouter.use('*', authMiddleware);

// --- HOMEWORK ---
academicsRouter.get('/homework', requireRole([UserRole.TEACHER, UserRole.PRINCIPAL, UserRole.STUDENT, UserRole.PARENT]), async (c) => {
  const user = c.get('user');

  // Filter by Class would be ideal in real scenario, but for now filtering by School ID
  // In a real app: if (user.role === STUDENT) filter by user.class
  const homework = await prisma.homework.findMany({
    where: { school_id: user.school_id },
    orderBy: { created_at: 'desc' }
  });

  return c.json(homework);
});

academicsRouter.post('/homework', requireRole([UserRole.TEACHER, UserRole.PRINCIPAL]), async (c) => {
  const user = c.get('user');
  const { title, subject, description, dueDate, classId } = await c.req.json();

  const newHomework = await prisma.homework.create({
    data: {
      id: `hw_${Date.now()}`, // Using manual ID or let Prisma handle it if we used @default(cuid()). Schema says @id without default? Let's assume we provide ID or it's needed. Schema: id String @id.
      school_id: user.school_id,
      title,
      subject,
      description,
      due_date: new Date(dueDate),
      class_id: classId,
      status: 'PENDING'
    }
  });
  return c.json(newHomework);
});

// --- TEACHER: Marks Entry (Exam Table Missing) ---
academicsRouter.post('/results', requireRole([UserRole.TEACHER, UserRole.PRINCIPAL]), async (c) => {
  // TODO: Exam Table Missing
  return c.json({ success: false, message: "Exam module not yet available (DB Schema Missing)" });
});

// --- PRINCIPAL: Publish Results (Exam Table Missing) ---
academicsRouter.post('/publish-results', requireRole([UserRole.PRINCIPAL]), async (c) => {
  // TODO: Exam Table Missing
  return c.json({ success: false, message: "Exam module not yet available (DB Schema Missing)" });
});

// --- EXAM CELL: Question Paper Inventory (Exam Table Missing) ---
academicsRouter.get('/papers', requireRole([UserRole.EXAM_CELL, UserRole.PRINCIPAL]), async (c) => {
  return c.json([]);
});

// --- HOD: Syllabus Tracking (Syllabus Table Missing) ---
academicsRouter.get('/syllabus', requireRole([UserRole.HOD, UserRole.PRINCIPAL]), async (c) => {
  return c.json([]);
});

// --- VICE PRINCIPAL: Timetables & Substitution (Timetable Table Missing) ---
academicsRouter.get('/substitutions', requireRole([UserRole.VICE_PRINCIPAL]), async (c) => {
  return c.json([]);
});

// --- PDF GENERATION ---
academicsRouter.post('/generate-report', async (c) => {
  // Stubbed
  return c.json({ url: "https://example.com/report.pdf" });
});

export { academicsRouter };
