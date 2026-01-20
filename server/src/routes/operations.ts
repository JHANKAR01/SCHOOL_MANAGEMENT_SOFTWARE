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

const operationsRouter = new Hono<{ Variables: Variables }>();
operationsRouter.use('*', authMiddleware);
operationsRouter.use('*', requireRole([UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN, UserRole.SECURITY_HEAD]));

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


// --- GATE LOGS ---
operationsRouter.get('/gate-logs', requireRole([UserRole.SECURITY_HEAD, UserRole.PRINCIPAL]), async (c) => {
  const user = c.get('user');
  const logs = await prisma.gateLog.findMany({
    where: { school_id: user.school_id },
    orderBy: { entry_time: 'desc' }
  });
  return c.json(logs);
});

// --- SYSTEM SETTINGS ---
operationsRouter.get('/settings', requireRole([UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN]), async (c) => {
  const user = c.get('user');
  const settings = await prisma.systemSettings.findFirst({
    where: { school_id: user.school_id }
  });
  // Return lockdown status using locked_roles array (if it contains 'ALL', system is in lockdown)
  const isLockdown = settings?.locked_roles?.includes('ALL') ?? false;
  return c.json({ ...settings, lockdown_mode: isLockdown });
});

operationsRouter.post('/settings/toggle-lockdown', requireRole([UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN]), async (c) => {
  const user = c.get('user');
  const { enabled } = await c.req.json();

  // Use locked_roles array: push 'ALL' for lockdown, remove for unlock
  const settings = await prisma.systemSettings.upsert({
    where: { school_id: user.school_id },
    update: {
      locked_roles: enabled ? ['ALL'] : [],
      updated_at: new Date()
    },
    create: {
      school_id: user.school_id,
      locked_roles: enabled ? ['ALL'] : [],
      low_data_mode: false
    }
  });

  const isLockdown = settings.locked_roles?.includes('ALL') ?? false;
  return c.json({ success: true, lockdown_mode: isLockdown });
});

operationsRouter.post('/broadcast-alert', requireRole([UserRole.SECURITY_HEAD]), async (c) => {
  const { type, message } = await c.req.json();
  console.log(`[EMERGENCY] ${type}: ${message}`);
  return c.json({ success: true, timestamp: new Date().toISOString() });
});

export { operationsRouter };
