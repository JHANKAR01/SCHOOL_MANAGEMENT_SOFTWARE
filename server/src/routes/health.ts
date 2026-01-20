
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

const healthRouter = new Hono<{ Variables: Variables }>();
healthRouter.use('*', authMiddleware);

healthRouter.post('/log', requireRole([UserRole.NURSE]), async (c) => {
  const user = c.get('user');
  const { studentId, condition, treatment } = await c.req.json();

  const log = await prisma.medicalLog.create({
    data: {
      id: `med_${Date.now()}`,
      school_id: user.school_id,
      student_id: studentId,
      time: new Date(),
      issue: condition,    // Map condition -> issue
      action: treatment    // Map treatment -> action
    }
  });

  return c.json({ success: true, log });
});

healthRouter.use('*', requireRole([UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN, UserRole.NURSE, UserRole.COUNSELOR]));
healthRouter.get('/logs', requireRole([UserRole.NURSE, UserRole.PRINCIPAL]), async (c) => {
  const user = c.get('user');
  const logs = await prisma.medicalLog.findMany({
    where: { school_id: user.school_id },
    orderBy: { time: 'desc' }
  });

  // Map back to frontend fields
  return c.json(logs.map(l => ({
    ...l,
    condition: l.issue,
    treatment: l.action
  })));
});

healthRouter.get('/counselor/notes', requireRole([UserRole.COUNSELOR, UserRole.PRINCIPAL]), async (c) => {
  const user = c.get('user');
  const notes = await prisma.counseling.findMany({
    where: { school_id: user.school_id },
    orderBy: { date: 'desc' }
  });
  return c.json(notes);
});

export { healthRouter };
