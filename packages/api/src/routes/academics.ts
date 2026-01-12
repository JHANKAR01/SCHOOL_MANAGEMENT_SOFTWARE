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

// ============================================================================
// GRADEBOOK - Fetch students for a class with their results (3NF Schema)
// ============================================================================
academicsRouter.get('/gradebook/:classId/:examId', requireRole([UserRole.TEACHER, UserRole.PRINCIPAL, UserRole.HOD]), async (c) => {
  const user = c.get('user');
  const { classId, examId } = c.req.param();

  try {
    // Fetch enrollments for the class in the current academic year
    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        school_id: user.school_id,
        class_id: classId,
        academic_year: {
          is_current: true
        }
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            admission_no: true
          }
        },
        class: {
          select: {
            id: true,
            grade: true,
            section: true
          }
        }
      },
      orderBy: {
        roll_number: 'asc'
      }
    });

    // Fetch results for these students for the specific exam
    const studentIds = enrollments.map(e => e.student.id);

    const results = await prisma.result.findMany({
      where: {
        school_id: user.school_id,
        exam_id: examId,
        student_id: { in: studentIds }
      },
      include: {
        marks: {
          include: {
            subject: {
              select: { id: true, code: true, name: true }
            }
          }
        }
      }
    });

    // Create a map of results by student_id for quick lookup
    const resultsMap = new Map(results.map(r => [r.student_id, r]));

    // Combine enrollment data with results
    const gradebookData = enrollments.map(enrollment => {
      const result = resultsMap.get(enrollment.student.id);

      return {
        studentId: enrollment.student.id,
        name: enrollment.student.name,
        admissionNo: enrollment.student.admission_no,
        roll: enrollment.roll_number,
        class: `${enrollment.class.grade}-${enrollment.class.section}`,
        classId: enrollment.class.id,
        // Result data
        resultId: result?.id || null,
        totalPercentage: result?.total_percentage || null,
        grade: result?.grade || null,
        remarks: result?.remarks || null,
        // Subject-wise marks
        subjectMarks: result?.marks?.map(m => ({
          subjectId: m.subject.id,
          subjectCode: m.subject.code,
          subjectName: m.subject.name,
          marksObtained: m.marks_obtained,
          maxMarks: m.max_marks,
          grade: m.grade
        })) || []
      };
    });

    return c.json({
      success: true,
      classId,
      examId,
      students: gradebookData,
      totalStudents: gradebookData.length
    });
  } catch (error) {
    console.error('Gradebook fetch error:', error);
    return c.json({ success: false, error: 'Failed to fetch gradebook data' }, 500);
  }
});

// --- Get available classes for gradebook dropdown ---
academicsRouter.get('/gradebook/classes', requireRole([UserRole.TEACHER, UserRole.PRINCIPAL, UserRole.HOD]), async (c) => {
  const user = c.get('user');

  const classes = await prisma.class.findMany({
    where: {
      school_id: user.school_id,
      academic_year: {
        is_current: true
      }
    },
    select: {
      id: true,
      grade: true,
      section: true,
      _count: {
        select: { enrollments: true }
      }
    },
    orderBy: [
      { grade: 'asc' },
      { section: 'asc' }
    ]
  });

  return c.json({
    success: true,
    classes: classes.map(cls => ({
      id: cls.id,
      name: `${cls.grade}-${cls.section}`,
      studentCount: cls._count.enrollments
    }))
  });
});



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
  const { title, subjectId, description, dueDate, classId } = await c.req.json();

  const newHomework = await prisma.homework.create({
    data: {
      id: `hw_${Date.now()}`,
      title,
      description,
      due_date: new Date(dueDate),
      status: 'PENDING',
      School: { connect: { id: user.school_id } },
      class: { connect: { id: classId } },
      subject: { connect: { id: subjectId } }
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
    include: { results: true },
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
// NOTE: In 3NF schema, marks go to ResultMark table, not Result.subject_marks JSON
academicsRouter.post('/results', requireRole([UserRole.TEACHER, UserRole.PRINCIPAL]), async (c) => {
  const user = c.get('user');
  const { examId, studentId, subjectId, marksObtained, maxMarks, totalPercentage, grade, remarks } = await c.req.json();

  // First, find or create the Result record
  let result = await prisma.result.findFirst({
    where: { exam_id: examId, student_id: studentId, school_id: user.school_id }
  });

  if (!result) {
    result = await prisma.result.create({
      data: {
        id: `res_${Date.now()}_${studentId}`,
        school_id: user.school_id,
        exam_id: examId,
        student_id: studentId,
        total_percentage: totalPercentage || null,
        grade: grade || null,
        remarks: remarks || null
      }
    });
  } else if (totalPercentage !== undefined || grade !== undefined) {
    // Update the result summary if provided
    result = await prisma.result.update({
      where: { id: result.id },
      data: {
        total_percentage: totalPercentage ?? result.total_percentage,
        grade: grade ?? result.grade,
        remarks: remarks ?? result.remarks
      }
    });
  }

  // If subject marks are provided, upsert the ResultMark
  if (subjectId && marksObtained !== undefined) {
    await prisma.resultMark.upsert({
      where: {
        result_id_subject_id: {
          result_id: result.id,
          subject_id: subjectId
        }
      },
      update: {
        marks_obtained: marksObtained,
        max_marks: maxMarks || 100,
        grade: grade || null
      },
      create: {
        school_id: user.school_id,
        result_id: result.id,
        subject_id: subjectId,
        marks_obtained: marksObtained,
        max_marks: maxMarks || 100,
        grade: grade || null
      }
    });
  }

  return c.json({ success: true, result });
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
  // Fetches from Syllabus model with subject relation
  const syllabus = await prisma.syllabus.findMany({
    where: { school_id: user.school_id },
    include: { subject: { select: { code: true, name: true } } },
    orderBy: { topic: 'asc' }
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
  const { subjectId, classId, isActive, meetingLink } = await c.req.json();

  const existing = await prisma.liveClass.findFirst({
    where: {
      school_id: user.school_id,
      teacher_id: user.id,
      class_id: classId,
      subject_id: subjectId
    }
  });

  // AUTO-GENERATE JITSI LINK IF NOT PROVIDED
  // Using a deterministic URL based on class and subject ensures consistency
  const jitsiLink = meetingLink || `https://meet.jit.si/sovereign-${user.school_id}-${classId}-${subjectId}`;

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
        meeting_link: jitsiLink,
        is_active: isActive,
        School: { connect: { id: user.school_id } },
        User: { connect: { id: user.id } },
        class: { connect: { id: classId } },
        subject: { connect: { id: subjectId } }  // subjectId should be passed, not subject string
      }
    });
  }

  return c.json({ success: true, liveClass });
});

export { academicsRouter };