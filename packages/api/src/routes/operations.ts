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

const operationsRouter = new Hono<{ Variables: Variables }>();
operationsRouter.use('*', authMiddleware);

// --- VISITORS ---
operationsRouter.get('/visitors', requireRole([UserRole.RECEPTIONIST, UserRole.PRINCIPAL, UserRole.SECURITY_HEAD]), async (c) => {
  const user = c.get('user');
  const visitors = await prisma.visitor.findMany({
    where: { school_id: user.school_id },
    orderBy: { time: 'desc' }
  });
  return c.json(visitors);
});

operationsRouter.post('/visitors', requireRole([UserRole.RECEPTIONIST, UserRole.SECURITY_HEAD]), async (c) => {
  const user = c.get('user');
  const { name, purpose, studentId } = await c.req.json();

  const visitor = await prisma.visitor.create({
    data: {
      school_id: user.school_id,
      name,
      purpose,
      student_id: studentId, // Optional
      status: 'WAITING',
      time: new Date()
    }
  });
  return c.json(visitor);
});

// --- TICKETS (MAINTENANCE) ---
operationsRouter.get('/tickets', requireRole([UserRole.ESTATE_MANAGER, UserRole.PRINCIPAL]), async (c) => {
  const user = c.get('user');
  const tickets = await prisma.ticket.findMany({
    where: { school_id: user.school_id },
    orderBy: { created_at: 'desc' }
  });
  return c.json(tickets);
});

operationsRouter.post('/tickets', requireRole([UserRole.ESTATE_MANAGER, UserRole.TEACHER, UserRole.PRINCIPAL]), async (c) => {
  const user = c.get('user');
  const { location, issue, priority } = await c.req.json();

  // Manual ID not needed if we rely on user provided ID?
  // Schema says "id String @id".
  // I need to generate an ID or assume autoincrement doesn't exist.
  // Let's use `tic_${Date.now()}` convention.

  const ticket = await prisma.ticket.create({
    data: {
      id: `tic_${Date.now()}`,
      school_id: user.school_id,
      location,
      issue,
      priority,
      status: 'OPEN',
      reported_by: user.id
    }
  });
  return c.json(ticket);
});

operationsRouter.post('/tickets/resolve', requireRole([UserRole.ESTATE_MANAGER]), async (c) => {
  const user = c.get('user');
  const { id } = await c.req.json();

  await prisma.ticket.update({
    where: { id },
    data: { status: 'RESOLVED' }
  });

  return c.json({ success: true, id, status: 'RESOLVED' });
});

// --- INQUIRIES (ADMISSIONS) ---
operationsRouter.get('/inquiries', requireRole([UserRole.ADMISSIONS_OFFICER, UserRole.PRINCIPAL]), async (c) => {
  const user = c.get('user');
  const inquiries = await prisma.inquiry.findMany({
    where: { school_id: user.school_id },
    orderBy: { created_at: 'desc' }
  });
  return c.json(inquiries);
});

operationsRouter.post('/inquiries', requireRole([UserRole.ADMISSIONS_OFFICER, UserRole.PRINCIPAL]), async (c) => {
  const user = c.get('user');
  const { parentName, phone, targetClass } = await c.req.json();

  const inquiry = await prisma.inquiry.create({
    data: {
      school_id: user.school_id,
      parent_name: parentName,
      phone,
      target_class: targetClass,
      status: 'NEW'
    }
  });
  return c.json(inquiry);
});


// --- GATE LOGS (Missing Table - STUB) ---
operationsRouter.get('/gate-logs', requireRole([UserRole.SECURITY_HEAD, UserRole.PRINCIPAL]), async (c) => {
  return c.json([]);
});

operationsRouter.post('/broadcast-alert', requireRole([UserRole.SECURITY_HEAD]), async (c) => {
  const { type, message } = await c.req.json();
  console.log(`[EMERGENCY] ${type}: ${message}`);
  return c.json({ success: true, timestamp: new Date().toISOString() });
});

export { operationsRouter };
