
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
financeRouter.use('*', requireRole([UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT, UserRole.FINANCE_MANAGER]));

// ============================================================================
// FINANCE STATS - Aggregated on DB side (NOT fetching all records)
// ============================================================================
financeRouter.get('/stats', async (c) => {
  const user = c.get('user');

  // Use Prisma aggregate to calculate totals on the database side
  const [collectedResult, pendingResult, expensesResult] = await Promise.all([
    // Total Collected (PAID invoices)
    prisma.invoice.aggregate({
      where: { school_id: user.school_id, status: 'PAID' },
      _sum: { base_amount: true, discount_amount: true }
    }),
    // Total Pending (PENDING invoices)
    prisma.invoice.aggregate({
      where: { school_id: user.school_id, status: 'PENDING' },
      _sum: { base_amount: true, discount_amount: true }
    }),
    // Total Expenses
    prisma.expense.aggregate({
      where: { school_id: user.school_id },
      _sum: { amount: true }
    })
  ]);

  const totalCollected = (collectedResult._sum.base_amount || 0) - (collectedResult._sum.discount_amount || 0);
  const totalPending = (pendingResult._sum.base_amount || 0) - (pendingResult._sum.discount_amount || 0);
  const totalExpenses = expensesResult._sum.amount || 0;
  const cashOnHand = totalCollected - totalExpenses;

  return c.json({
    success: true,
    stats: {
      totalCollected,
      totalPending,
      totalExpenses,
      cashOnHand
    }
  });
});

// ============================================================================
// INVOICES - With Pagination
// ============================================================================
financeRouter.get('/invoices', async (c) => {
  const user = c.get('user');

  // Parse query params with defaults
  const page = Math.max(1, parseInt(c.req.query('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '20')));
  const status = c.req.query('status'); // Optional filter: PAID, PENDING, OVERDUE
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = { school_id: user.school_id };
  if (status && ['PAID', 'PENDING', 'OVERDUE'].includes(status)) {
    where.status = status;
  }

  // Execute count and find in parallel
  const [total, invoices] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            admission_no: true
          }
        }
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip
    })
  ]);

  const totalPages = Math.ceil(total / limit);

  return c.json({
    success: true,
    data: invoices,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
});

financeRouter.post('/invoices', async (c) => {
  const user = c.get('user');
  const { studentId, baseAmount, discountAmount, description, dueDate } = await c.req.json();

  // Verify student exists in school
  const student = await prisma.student.findFirst({
    where: { id: studentId, school_id: user.school_id }
  });
  if (!student) {
    return c.json({ error: 'Student not found' }, 404);
  }

  const invoice = await prisma.invoice.create({
    data: {
      school_id: user.school_id,
      student_id: studentId,
      base_amount: parseFloat(baseAmount),
      discount_amount: parseFloat(discountAmount || '0'),
      description: description || 'Fee',
      due_date: new Date(dueDate),
      status: 'PENDING'
    }
  });

  return c.json({ success: true, invoice });
});

financeRouter.patch('/invoices/:id/pay', async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  const { method, utr } = await c.req.json(); // CASH | ONLINE | CHEQUE

  // Verify ownership and update
  const result = await prisma.invoice.updateMany({
    where: { id, school_id: user.school_id, status: 'PENDING' },
    data: {
      status: 'PAID',
      utr: utr || `${method}_${Date.now()}`
    }
  });

  if (result.count === 0) {
    return c.json({ error: 'Invoice not found or already paid' }, 404);
  }

  return c.json({ success: true, id, status: 'PAID' });
});

// ============================================================================
// STUDENTS - Limited list for dropdown (NEVER fetch all 2000!)
// ============================================================================
financeRouter.get('/students', async (c) => {
  const user = c.get('user');
  const search = c.req.query('search') || '';

  // CRUCIAL: Limit to 100 students max for dropdown
  const students = await prisma.student.findMany({
    where: {
      school_id: user.school_id,
      status: 'ACTIVE',
      OR: search ? [
        { name: { contains: search, mode: 'insensitive' } },
        { admission_no: { contains: search, mode: 'insensitive' } }
      ] : undefined
    },
    select: {
      id: true,
      name: true,
      admission_no: true,
      enrollments: {
        where: {
          academic_year: { is_current: true }
        },
        select: {
          roll_number: true,
          class: {
            select: { grade: true, section: true }
          }
        },
        take: 1
      }
    },
    take: 100, // HARD LIMIT
    orderBy: { name: 'asc' }
  });

  // Format response
  const formattedStudents = students.map(s => ({
    id: s.id,
    name: s.name,
    admissionNo: s.admission_no,
    class: s.enrollments[0]?.class
      ? `${s.enrollments[0].class.grade}-${s.enrollments[0].class.section}`
      : 'N/A',
    roll: s.enrollments[0]?.roll_number || null
  }));

  return c.json({
    success: true,
    students: formattedStudents,
    count: formattedStudents.length,
    limited: students.length === 100
  });
});

// ============================================================================
// EXPENSES - With Pagination
// ============================================================================
financeRouter.get('/expenses', async (c) => {
  const user = c.get('user');

  const page = Math.max(1, parseInt(c.req.query('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '20')));
  const skip = (page - 1) * limit;

  const [total, expenses] = await Promise.all([
    prisma.expense.count({ where: { school_id: user.school_id } }),
    prisma.expense.findMany({
      where: { school_id: user.school_id },
      orderBy: { date: 'desc' },
      take: limit,
      skip
    })
  ]);

  return c.json({
    success: true,
    data: expenses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
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
      date: date ? new Date(date) : new Date()
    }
  });

  return c.json({ success: true, expense });
});

// ============================================================================
// RECONCILIATION (Placeholder)
// ============================================================================
financeRouter.post('/reconcile', async (c) => {
  return c.json({ success: true, results: [] });
});

export { financeRouter };
