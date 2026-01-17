// packages/api/src/routes/admissions.ts
// P3.1: Admissions Module - Complete Refactor
import { Hono } from 'hono';
import prisma from '../db';
import { authMiddleware, requireRole } from '../middleware/auth';
import { UserRole } from '../../../../types';

type Variables = {
  user: {
    id: string;
    role: UserRole;
    school_id: string;
    permissions?: string[];
  };
};

const admissionsRouter = new Hono<{ Variables: Variables }>();
admissionsRouter.use('*', authMiddleware);

// Helper: Generate next admission number
function generateNextAdmissionNo(lastNo: string | null | undefined): string {
  if (!lastNo) return 'ADM-0001';
  const parts = lastNo.split('-');
  const num = parseInt(parts[1] || '0');
  return `ADM-${String(num + 1).padStart(4, '0')}`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /admissions - Fetch all inquiries (Kanban data)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
admissionsRouter.get('/',
  requireRole([UserRole.ADMISSIONS_OFFICER, UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL]),
  async (c) => {
    const user = c.get('user');

    const inquiries = await prisma.inquiry.findMany({
      where: { school_id: user.school_id },
      orderBy: { created_at: 'desc' },
      include: {
        Student: { select: { id: true, admission_no: true } }
      }
    });

    return c.json(inquiries);
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /admissions - Create new inquiry
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
admissionsRouter.post('/',
  requireRole([UserRole.ADMISSIONS_OFFICER, UserRole.SCHOOL_ADMIN]),
  async (c) => {
    const user = c.get('user');
    const data = await c.req.json();

    const inquiry = await prisma.inquiry.create({
      data: {
        school_id: user.school_id,
        parent_name: data.parentName,
        phone: data.phone,
        target_class: data.targetClass || data.class,
        student_name: data.studentName,
        student_email: data.studentEmail,
        date_of_birth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        gender: data.gender,
        previous_school: data.previousSchool,
        address: data.address,
        remarks: data.remarks,
        assigned_to: user.id,
        status: 'NEW'
      }
    });

    return c.json(inquiry);
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PATCH /admissions/:id - Update inquiry (pre-fill form)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
admissionsRouter.patch('/:id',
  requireRole([UserRole.ADMISSIONS_OFFICER, UserRole.SCHOOL_ADMIN]),
  async (c) => {
    const user = c.get('user');
    const inquiryId = parseInt(c.req.param('id'));
    const data = await c.req.json();

    const updated = await prisma.inquiry.updateMany({
      where: { id: inquiryId, school_id: user.school_id },
      data: {
        student_name: data.studentName,
        student_email: data.studentEmail,
        date_of_birth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        gender: data.gender,
        previous_school: data.previousSchool,
        address: data.address,
        remarks: data.remarks,
        parent_name: data.parentName,
        phone: data.phone,
        target_class: data.targetClass
      }
    });

    return c.json({ success: updated.count > 0 });
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PATCH /admissions/:id/status - Move inquiry between Kanban stages
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
admissionsRouter.patch('/:id/status',
  requireRole([UserRole.ADMISSIONS_OFFICER, UserRole.SCHOOL_ADMIN]),
  async (c) => {
    const user = c.get('user');
    const inquiryId = parseInt(c.req.param('id'));
    const { status, interview_date, interview_notes } = await c.req.json();

    const updated = await prisma.inquiry.updateMany({
      where: { id: inquiryId, school_id: user.school_id },
      data: {
        status,
        interview_date: interview_date ? new Date(interview_date) : undefined,
        interview_notes
      }
    });

    if (updated.count === 0) {
      return c.json({ error: 'Not found' }, 404);
    }

    return c.json({ success: true, status });
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /admissions/:id/convert - 🔒 CORE RULE: Creates Student ONLY, NO User
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
admissionsRouter.post('/:id/convert',
  requireRole([UserRole.ADMISSIONS_OFFICER, UserRole.SCHOOL_ADMIN]),
  async (c) => {
    const user = c.get('user');
    const inquiryId = parseInt(c.req.param('id'));

    // 1. Fetch Inquiry
    const inquiry = await prisma.inquiry.findFirst({
      where: { id: inquiryId, school_id: user.school_id }
    });

    if (!inquiry) {
      return c.json({ error: 'Inquiry not found' }, 404);
    }

    if (inquiry.status === 'CONVERTED') {
      return c.json({ error: 'Already converted', student_id: inquiry.student_id }, 400);
    }

    // 2. Generate Admission Number
    const lastStudent = await prisma.student.findFirst({
      where: { school_id: user.school_id },
      orderBy: { created_at: 'desc' },
      select: { admission_no: true }
    });

    const nextAdmNo = generateNextAdmissionNo(lastStudent?.admission_no);

    // 3. Create Student Profile (🔒 NO USER CREATION!)
    const student = await prisma.student.create({
      data: {
        admission_no: nextAdmNo,
        name: inquiry.student_name || inquiry.parent_name,
        email: inquiry.student_email,
        school_id: user.school_id,
        gender: inquiry.gender,
        date_of_birth: inquiry.date_of_birth,
        previous_school: inquiry.previous_school,
        address_line1: inquiry.address,
        admission_date: new Date(),
        status: 'ACTIVE'
      }
    });

    // 4. Update Inquiry to CONVERTED
    await prisma.inquiry.update({
      where: { id: inquiryId },
      data: {
        status: 'CONVERTED',
        converted_at: new Date(),
        student_id: student.id
      }
    });

    // 5. Audit Log
    await prisma.auditLog.create({
      data: {
        school_id: user.school_id,
        user_id: user.id,
        action: 'CONVERT_INQUIRY',
        target_type: 'Student',
        target_id: student.id,
        metadata: { inquiry_id: inquiryId }
      }
    });

    return c.json({
      success: true,
      message: 'Student profile created. Login NOT granted (use System Admin to grant access).',
      student_id: student.id,
      admission_no: nextAdmNo
    });
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LEGACY: POST /admissions/enroll (kept for backward compatibility)
// ⚠️ DEPRECATED: Use POST /:id/convert instead
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
admissionsRouter.post('/enroll',
  requireRole([UserRole.ADMISSIONS_OFFICER, UserRole.SCHOOL_ADMIN]),
  async (c) => {
    const user = c.get('user');
    const data = await c.req.json();

    // Generate admission number
    const lastStudent = await prisma.student.findFirst({
      where: { school_id: user.school_id },
      orderBy: { created_at: 'desc' },
      select: { admission_no: true }
    });

    const nextAdmNo = data.admission_no || generateNextAdmissionNo(lastStudent?.admission_no);

    // Create Student Profile (NO USER per new policy)
    const student = await prisma.student.create({
      data: {
        admission_no: nextAdmNo,
        name: data.name,
        email: data.email,
        school_id: user.school_id,
        admission_date: new Date(),
        status: 'ACTIVE'
      }
    });

    return c.json({
      message: 'Student Enrolled (Legacy). Use System Admin to grant login access.',
      student,
      admission_no: nextAdmNo
    });
  }
);

export { admissionsRouter };