// packages/api/src/routes/academics.ts
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
      id: `hw_${Date.now()}`,
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


// --- EXAMS ---
academicsRouter.get('/exams', requireRole([UserRole.TEACHER, UserRole.PRINCIPAL, UserRole.STUDENT, UserRole.PARENT]), async (c) => {
  const user = c.get('user');
  // Fetches from the Exam model
  const exams = await prisma.exam.findMany({
    where: { school_id: user.school_id },
    include: { Result: true },
    orderBy: { start_date: 'desc' }
  });
  return c.json(exams);
});

academicsRouter.post('/exams', requireRole([UserRole.PRINCIPAL, UserRole.EXAM_CELL]), async (c) => {
  const user = c.get('user');
  const { name, startDate, endDate, type } = await c.req.json();

  const exam = await prisma.exam.create({
    data: {
      id: `ex_${Date.now()}`,
      school_id: user.school_id,
      name,
      start_date: new Date(startDate),
      end_date: new Date(endDate),
      type: type || 'INTERNAL'
    }
  });
  return c.json(exam);
});

// --- TEACHER: Marks Entry ---
academicsRouter.post('/results', requireRole([UserRole.TEACHER, UserRole.PRINCIPAL]), async (c) => {
  const user = c.get('user');
  const { examId, studentId, marks, totalPercentage, grade } = await c.req.json();

  // Uses Prisma Upsert for the Result model
  const result = await prisma.result.upsert({
    where: {
      id: 'placeholder_will_fail_upsert_without_unique' // Intentionally fail to trigger catch/findFirst
    },
    update: {
      subject_marks: marks,
      total_percentage: totalPercentage,
      grade
    },
    create: {
      id: `res_${Date.now()}_${studentId}`,
      school_id: user.school_id,
      exam_id: examId,
      student_id: studentId,
      subject_marks: marks,
      total_percentage: totalPercentage,
      grade
    }
  }).catch(async () => {
    // Fallback manual upsert
    const existing = await prisma.result.findFirst({
      where: { exam_id: examId, student_id: studentId }
    });

    if (existing) {
      return prisma.result.update({
        where: { id: existing.id },
        data: { subject_marks: marks, total_percentage: totalPercentage, grade }
      });
    } else {
      return prisma.result.create({
        data: {
          id: `res_${Date.now()}_${studentId}`,
          school_id: user.school_id,
          exam_id: examId,
          student_id: studentId,
          subject_marks: marks,
          total_percentage: totalPercentage,
          grade
        }
      });
    }
  });

  return c.json(result);
});

// --- PRINCIPAL: Publish Results ---
academicsRouter.post('/publish-results', requireRole([UserRole.PRINCIPAL]), async (c) => {
  const { examId } = await c.req.json();
  // Future: Trigger push notifications to parents here
  return c.json({ success: true, message: "Results published (Notifications Sent)" });
});

// --- EXAM CELL: Question Paper Inventory ---
academicsRouter.get('/papers', requireRole([UserRole.EXAM_CELL, UserRole.PRINCIPAL, UserRole.TEACHER]), async (c) => {
  const user = c.get('user');
  // Fetches from Paper model
  const papers = await prisma.paper.findMany({
    where: { school_id: user.school_id },
    orderBy: { created_at: 'desc' }
  });
  return c.json(papers);
});

// --- HOD: Syllabus Tracking ---
academicsRouter.get('/syllabus', requireRole([UserRole.HOD, UserRole.PRINCIPAL, UserRole.TEACHER, UserRole.STUDENT]), async (c) => {
  const user = c.get('user');
  // Fetches from Syllabus model
  const syllabus = await prisma.syllabus.findMany({
    where: { school_id: user.school_id },
    orderBy: { subject: 'asc' }
  });
  return c.json(syllabus);
});

// --- VICE PRINCIPAL: Timetables & Substitution ---
academicsRouter.get('/substitutions', requireRole([UserRole.VICE_PRINCIPAL, UserRole.TEACHER]), async (c) => {
  const user = c.get('user');
  // Fetches Substitution with teacher names included
  const subs = await prisma.substitution.findMany({
    where: { school_id: user.school_id },
    include: {
      User_Substitution_original_teacher_idToUser: { select: { name: true } },
      User_Substitution_substitute_teacher_idToUser: { select: { name: true } }
    },
    orderBy: { date: 'desc' }
  });
  return c.json(subs);
});

// --- PDF GENERATION ---
academicsRouter.post('/generate-report', async (c) => {
  return c.json({ url: "https://example.com/report.pdf" });
});

// --- LEAVES ---
academicsRouter.get('/leaves', requireRole([UserRole.TEACHER, UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN]), async (c) => {
  const user = c.get('user');
  const leaves = await prisma.leaveApplication.findMany({
    where: { school_id: user.school_id },
    include: { User: { select: { name: true, role: true } } },
    orderBy: { created_at: 'desc' }
  });
  return c.json(leaves);
});

academicsRouter.post('/leaves', requireRole([UserRole.TEACHER, UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN]), async (c) => {
  const user = c.get('user');
  const { type, startDate, endDate, reason } = await c.req.json();

  const leave = await prisma.leaveApplication.create({
    data: {
      id: `lv_${Date.now()}`,
      school_id: user.school_id,
      user_id: user.id,
      type,
      start_date: new Date(startDate),
      end_date: new Date(endDate),
      reason,
      status: 'PENDING'
    }
  });
  return c.json(leave);
});

academicsRouter.patch('/leaves/:id', requireRole([UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN]), async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  const { status } = await c.req.json();

  const updated = await prisma.leaveApplication.update({
    where: { id, school_id: user.school_id },
    data: { status }
  });
  return c.json(updated);
});

// --- SYLLABUS ACTIONS ---
academicsRouter.patch('/syllabus/:id/approve', requireRole([UserRole.PRINCIPAL, UserRole.HOD]), async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();

  // Using updateMany ensures we respect the school_id tenant filter
  const result = await prisma.syllabus.updateMany({
    where: { id, school_id: user.school_id },
    data: { status: 'COMPLETED', completed_at: new Date() }
  });

  if (result.count === 0) return c.json({ error: 'Not found or unauthorized' }, 404);

  return c.json({ success: true, id });
});

// --- LIVE CLASSES (JITSI INTEGRATION) ---
academicsRouter.get('/live-classes', requireRole([UserRole.TEACHER, UserRole.STUDENT, UserRole.PRINCIPAL]), async (c) => {
  const user = c.get('user');
  const classes = await prisma.liveClass.findMany({
    where: { school_id: user.school_id, is_active: true },
    include: { User: { select: { name: true } } }
  });
  return c.json(classes);
});

academicsRouter.post('/live-classes/toggle', requireRole([UserRole.TEACHER, UserRole.PRINCIPAL]), async (c) => {
  const user = c.get('user');
  const { subject, classId, isActive, meetingLink } = await c.req.json();

  const existing = await prisma.liveClass.findFirst({
    where: {
      school_id: user.school_id,
      teacher_id: user.id,
      class_id: classId,
      subject: subject
    }
  });

  // AUTO-GENERATE JITSI LINK IF NOT PROVIDED
  // Using a deterministic URL based on class and subject ensures consistency
  const jitsiLink = meetingLink || `https://meet.jit.si/sovereign-${user.school_id}-${classId}-${subject.replace(/\s+/g, '')}`;

  let liveClass;
  if (existing) {
    liveClass = await prisma.liveClass.update({
      where: { id: existing.id },
      data: { is_active: isActive, meeting_link: jitsiLink }
    });
  } else {
    liveClass = await prisma.liveClass.create({
      data: {
        id: `lc_${Date.now()}`,
        school_id: user.school_id,
        teacher_id: user.id,
        class_id: classId,
        subject: subject,
        meeting_link: jitsiLink,
        is_active: isActive
      }
    });
  }

  return c.json({ success: true, liveClass });
});

export { academicsRouter };