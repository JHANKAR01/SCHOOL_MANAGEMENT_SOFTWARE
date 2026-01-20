
import { Hono } from 'hono';
import prisma from '../db';
import { authMiddleware, requireRole, requirePermission } from '../middleware/auth';
import { UserRole } from '../../../packages/types';
import { PERMISSIONS } from '../../../packages/types/permissions';

type Variables = {
  user: {
    id: string;
    role: UserRole;
    school_id: string;
    permissions?: string[];
  };
};

const financeRouter = new Hono<{ Variables: Variables }>();
financeRouter.use('*', authMiddleware);
financeRouter.use('*', requireRole([UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT, UserRole.FINANCE_MANAGER]));

// ============================================================================
// FEE STRUCTURES - Setup for School Admin (Define what to charge)
// ============================================================================
financeRouter.get('/structures', async (c) => {
  const user = c.get('user');

  const structures = await prisma.feeStructure.findMany({
    where: { school_id: user.school_id },
    include: {
      class: { select: { grade: true, section: true } },
      academicYear: { select: { name: true, is_current: true } }
    },
    orderBy: { created_at: 'desc' }
  });

  return c.json({
    success: true,
    structures: structures.map(fs => ({
      id: fs.id,
      name: fs.name,
      amount: fs.amount,
      frequency: fs.frequency,
      category: fs.category,
      class_id: fs.class_id,
      class_name: fs.class ? `${fs.class.grade}-${fs.class.section}` : 'All Classes',
      academic_year: fs.academicYear?.name || 'N/A'
    }))
  });
});

financeRouter.post('/structures', async (c) => {
  const user = c.get('user');
  const { name, amount, frequency, category, class_id, academic_year_id } = await c.req.json();

  if (!name || !amount || !frequency || !category) {
    return c.json({ error: 'Name, Amount, Frequency, and Category are required' }, 400);
  }

  // Get current academic year if not provided
  let ayId = academic_year_id;
  if (!ayId) {
    const currentYear = await prisma.academicYear.findFirst({
      where: { school_id: user.school_id, is_current: true },
      select: { id: true }
    });
    ayId = currentYear?.id;
  }

  if (!ayId) {
    return c.json({ error: 'No academic year found. Please set up academic year first.' }, 400);
  }

  const structure = await prisma.feeStructure.create({
    data: {
      id: `fs_${Date.now()}`,
      school_id: user.school_id,
      name,
      amount: parseFloat(amount),
      frequency, // MONTHLY, QUARTERLY, ANNUAL, ONE_TIME
      category, // TUITION, TRANSPORT, HOSTEL, ADMISSION, LAB, LIBRARY, MISC
      class_id: class_id || null, // null = applies to all classes
      academic_year_id: ayId
    }
  });

  return c.json({ success: true, structure });
});

financeRouter.patch('/structures/:id', async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  const { name, amount, frequency, category } = await c.req.json();

  const existing = await prisma.feeStructure.findFirst({
    where: { id, school_id: user.school_id }
  });

  if (!existing) {
    return c.json({ error: 'Fee structure not found' }, 404);
  }

  const updated = await prisma.feeStructure.update({
    where: { id },
    data: {
      name: name ?? existing.name,
      amount: amount !== undefined ? parseFloat(amount) : existing.amount,
      frequency: frequency ?? existing.frequency,
      category: category ?? existing.category
    }
  });

  return c.json({ success: true, structure: updated });
});

financeRouter.delete('/structures/:id', async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();

  const existing = await prisma.feeStructure.findFirst({
    where: { id, school_id: user.school_id }
  });

  if (!existing) {
    return c.json({ error: 'Fee structure not found' }, 404);
  }

  await prisma.feeStructure.delete({ where: { id } });

  return c.json({ success: true, message: 'Fee structure deleted' });
});

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
      _sum: { total_amount: true, discount_amount: true }
    }),
    // Total Pending (PENDING invoices)
    prisma.invoice.aggregate({
      where: { school_id: user.school_id, status: 'PENDING' },
      _sum: { total_amount: true, discount_amount: true }
    }),
    // Total Expenses
    prisma.expense.aggregate({
      where: { school_id: user.school_id },
      _sum: { amount: true }
    })
  ]);

  const totalCollected = (collectedResult._sum.total_amount || 0) - (collectedResult._sum.discount_amount || 0);
  const totalPending = (pendingResult._sum.total_amount || 0) - (pendingResult._sum.discount_amount || 0);
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
  const { studentId, totalAmount, discountAmount, description, dueDate, academicYearId } = await c.req.json();

  // Verify student exists in school
  const student = await prisma.student.findFirst({
    where: { id: studentId, school_id: user.school_id }
  });
  if (!student) {
    return c.json({ error: 'Student not found' }, 404);
  }

  // Get current academic year if not provided
  let ayId = academicYearId;
  if (!ayId) {
    const currentYear = await prisma.academicYear.findFirst({
      where: { school_id: user.school_id, is_current: true },
      select: { id: true }
    });
    ayId = currentYear?.id;
  }

  if (!ayId) {
    return c.json({ error: 'No academic year found. Please set up academic year first.' }, 400);
  }

  const total = parseFloat(totalAmount);
  const discount = parseFloat(discountAmount || '0');

  const invoice = await prisma.invoice.create({
    data: {
      school_id: user.school_id,
      student_id: studentId,
      academic_year_id: ayId,
      total_amount: total,
      amount_paid: 0,
      balance_amount: total - discount,
      discount_amount: discount,
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
  const { method, referenceNo } = await c.req.json(); // CASH | ONLINE | CHEQUE

  // Fetch invoice first
  const invoice = await prisma.invoice.findFirst({
    where: { id, school_id: user.school_id, status: 'PENDING' }
  });

  if (!invoice) {
    return c.json({ error: 'Invoice not found or already paid' }, 404);
  }

  // Update invoice to PAID and set balance to 0
  await prisma.invoice.update({
    where: { id },
    data: {
      status: 'PAID',
      amount_paid: invoice.total_amount,
      balance_amount: 0
    }
  });

  // Create payment transaction
  await prisma.paymentTransaction.create({
    data: {
      invoice_id: id,
      school_id: user.school_id,
      student_id: invoice.student_id,
      amount: invoice.total_amount - invoice.discount_amount,
      mode: method || 'CASH',
      reference_no: referenceNo || `${method}_${Date.now()}`
    }
  });

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

// ============================================================================
// 🔒 COLLECTION COUNTER - Permission Gated (P5.1)
// Only users with COLLECT_FEES permission can accept payments
// ============================================================================
financeRouter.post('/collect',
  requirePermission(PERMISSIONS.COLLECT_FEES),
  async (c) => {
    const user = c.get('user');
    const { invoice_id, amount, mode, reference_no, remarks } = await c.req.json();

    // 1. Fetch Invoice with current details
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoice_id, school_id: user.school_id }
    });

    if (!invoice) {
      return c.json({ error: 'Invoice not found' }, 404);
    }

    if (invoice.status === 'PAID' || invoice.status === 'VOID') {
      return c.json({ error: `Invoice is already ${invoice.status}` }, 400);
    }

    // 2. Create Payment Transaction
    const transaction = await prisma.paymentTransaction.create({
      data: {
        invoice_id,
        school_id: user.school_id,
        student_id: invoice.student_id,
        amount: parseFloat(amount),
        mode: mode, // CASH, UPI, BANK_TRANSFER, CHEQUE
        reference_no: reference_no || `${mode}-${Date.now()}`,
        remarks
      }
    });

    // 3. Update Invoice Ledger
    const newPaid = invoice.amount_paid + parseFloat(amount);
    const newBalance = invoice.total_amount - newPaid;
    const newStatus = newBalance <= 0 ? 'PAID' : newBalance < invoice.total_amount ? 'PARTIAL' : invoice.status;

    await prisma.invoice.update({
      where: { id: invoice_id },
      data: {
        amount_paid: newPaid,
        balance_amount: Math.max(0, newBalance),
        status: newStatus
      }
    });

    // 4. Audit Log
    await prisma.auditLog.create({
      data: {
        school_id: user.school_id,
        user_id: user.id,
        action: 'COLLECT_PAYMENT',
        target_type: 'Invoice',
        target_id: invoice_id,
        metadata: {
          amount,
          mode,
          reference_no,
          transaction_id: transaction.id,
          new_balance: newBalance
        }
      }
    });

    return c.json({
      success: true,
      transaction_id: transaction.id,
      invoice_id,
      amount_collected: parseFloat(amount),
      new_balance: Math.max(0, newBalance),
      new_status: newStatus
    });
  }
);

export { financeRouter };
