
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

const financeRouter = new Hono<{ Variables: Variables }>();
financeRouter.use('*', authMiddleware);
financeRouter.use('*', requireRole([UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT, UserRole.FINANCE_MANAGER]));

// --- INVOICES ---
financeRouter.get('/invoices', async (c) => {
  const user = c.get('user');
  const invoices = await prisma.invoice.findMany({
    where: { school_id: user.school_id },
    include: { student: { select: { name: true, class: true } } },
    orderBy: { created_at: 'desc' }
  });
  return c.json(invoices);
});

financeRouter.post('/invoices', async (c) => {
  const user = c.get('user');
  const { studentId, baseAmount, description, dueDate } = await c.req.json();

  // In real prod, verify student exists in school

  const invoice = await prisma.invoice.create({
    data: {
      school_id: user.school_id,
      student_id: studentId,
      base_amount: parseFloat(baseAmount),
      discount_amount: 0, // Placeholder for discount logic
      description: description || 'Fee',
      due_date: new Date(dueDate),
      status: 'PENDING'
    }
  });

  return c.json(invoice);
});

financeRouter.patch('/invoices/:id/pay', requireRole([UserRole.ACCOUNTANT, UserRole.FINANCE_MANAGER, UserRole.SCHOOL_ADMIN]), async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  const { method } = await c.req.json(); // CASH | ONLINE | CHEQUE

  // Verify ownership
  const result = await prisma.invoice.updateMany({
    where: { id, school_id: user.school_id },
    data: { status: 'PAID' }
  });

  if (result.count === 0) return c.json({ error: 'Invoice not found' }, 404);

  return c.json({ success: true, id, status: 'PAID' });
});

// --- EXPENSES ---
financeRouter.get('/expenses', async (c) => {
  const user = c.get('user');
  const expenses = await prisma.expense.findMany({
    where: { school_id: user.school_id },
    orderBy: { date: 'desc' }
  });
  return c.json(expenses);
});

financeRouter.post('/expenses', async (c) => {
  const user = c.get('user');
  const { category, amount, description, date } = await c.req.json();

  const expense = await prisma.expense.create({
    data: {
      id: `exp_${Date.now()}`,
      school_id: user.school_id,
      category: category,
      amount: parseFloat(amount),
      description: description,
      date: new Date(date)
    }
  });
  return c.json(expense);
});

// --- RECONCILIATION (Stubbed for now) ---
financeRouter.post('/reconcile', async (c) => {
  return c.json({ results: [] });
});

export { financeRouter };
