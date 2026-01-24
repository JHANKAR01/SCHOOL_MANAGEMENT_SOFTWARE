// server/src/routes/student.ts
// Student Dashboard API - Personal academic workspace for students
// Security: All endpoints scoped to authenticated student's own data

import { Hono } from 'hono';
import prisma from '../db';
import { authMiddleware, requireRole } from '../middleware/auth';
import { UserRole } from '../../../packages/types';

// Typed variables for context
type Variables = {
    user: {
        id: string;
        role: UserRole;
        school_id: string;
    };
};

const studentRouter = new Hono<{ Variables: Variables }>();

// Apply auth to all routes
studentRouter.use('*', authMiddleware);

// Helper: Get student from authenticated user
async function getStudentFromUser(userId: string, schoolId: string) {
    const student = await prisma.student.findFirst({
        where: {
            user_id: userId,
            school_id: schoolId
        },
        include: {
            enrollments: {
                where: {
                    academic_year: { is_current: true }
                },
                include: {
                    class: {
                        include: {
                            academic_year: true
                        }
                    }
                }
            }
        }
    });
    return student;
}

// ============================================================================
// GET /api/student/me - Student profile with current enrollment
// ============================================================================
studentRouter.get('/me',
    requireRole([UserRole.STUDENT]),
    async (c) => {
        try {
            const user = c.get('user');
            const student = await getStudentFromUser(user.id, user.school_id);

            if (!student) {
                return c.json({ success: false, error: 'Student profile not found' }, 404);
            }

            // Get current enrollment
            const currentEnrollment = student.enrollments[0];

            return c.json({
                success: true,
                data: {
                    id: student.id,
                    admission_no: student.admission_no,
                    name: student.name,
                    email: student.email,
                    phone: student.phone,
                    photo_url: student.photo_url,
                    gender: student.gender,
                    date_of_birth: student.date_of_birth,
                    blood_group: student.blood_group,
                    father_name: student.father_name,
                    mother_name: student.mother_name,
                    address: {
                        line1: student.address_line1,
                        line2: student.address_line2,
                        city: student.city,
                        state: student.state,
                        pincode: student.pincode
                    },
                    current_class: currentEnrollment ? {
                        class_id: currentEnrollment.class_id,
                        grade: currentEnrollment.class.grade,
                        section: currentEnrollment.class.section,
                        roll_number: currentEnrollment.roll_number,
                        academic_year: currentEnrollment.class.academic_year.name
                    } : null
                }
            });
        } catch (error) {
            console.error('[STUDENT_ME_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// GET /api/student/my-day - Today's consolidated view
// ============================================================================
studentRouter.get('/my-day',
    requireRole([UserRole.STUDENT]),
    async (c) => {
        try {
            const user = c.get('user');
            const student = await getStudentFromUser(user.id, user.school_id);

            if (!student) {
                return c.json({ success: false, error: 'Student profile not found' }, 404);
            }

            const currentEnrollment = student.enrollments[0];
            if (!currentEnrollment) {
                return c.json({ success: false, error: 'No current enrollment found' }, 404);
            }

            const today = new Date();
            const dayOfWeek = today.getDay(); // 0 = Sunday
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));
            const endOfDay = new Date(today.setHours(23, 59, 59, 999));

            // Get today's timetable
            const timetable = await prisma.timetable.findMany({
                where: {
                    school_id: user.school_id,
                    class_id: currentEnrollment.class_id,
                    day_of_week: dayOfWeek
                },
                include: {
                    subject: true,
                    User: { select: { name: true } }
                },
                orderBy: { period: 'asc' }
            });

            // Get today's attendance
            const attendance = await prisma.attendance.findMany({
                where: {
                    student_id: student.id,
                    date: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                }
            });

            // Get pending homework (due today or overdue)
            const pendingHomework = await prisma.homework.findMany({
                where: {
                    school_id: user.school_id,
                    class_id: currentEnrollment.class_id,
                    due_date: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // Next 7 days
                    submissions: {
                        none: { student_id: student.id }
                    }
                },
                include: {
                    subject: { select: { name: true, code: true } }
                },
                orderBy: { due_date: 'asc' },
                take: 5
            });

            // Get active/upcoming live classes
            const liveClasses = await prisma.liveClass.findMany({
                where: {
                    school_id: user.school_id,
                    class_id: currentEnrollment.class_id,
                    OR: [
                        { is_active: true },
                        {
                            start_time: {
                                gte: new Date(),
                                lte: new Date(Date.now() + 2 * 60 * 60 * 1000) // Next 2 hours
                            }
                        }
                    ]
                },
                include: {
                    subject: { select: { name: true } },
                    User: { select: { name: true } }
                },
                take: 3
            });

            // Get recent announcements
            const announcements = await prisma.announcement.findMany({
                where: {
                    school_id: user.school_id,
                    OR: [
                        { target_roles: { has: 'STUDENT' } },
                        { target_roles: { isEmpty: true } }
                    ],
                    expires_at: { gte: new Date() }
                },
                orderBy: { created_at: 'desc' },
                take: 5
            });

            return c.json({
                success: true,
                data: {
                    student: {
                        name: student.name,
                        class: `${currentEnrollment.class.grade}-${currentEnrollment.class.section}`,
                        roll_number: currentEnrollment.roll_number
                    },
                    timetable: timetable.map(t => ({
                        period: t.period,
                        subject: t.subject.name,
                        teacher: t.User?.name || 'TBA',
                        start_time: t.start_time,
                        end_time: t.end_time
                    })),
                    attendance: {
                        marked: attendance.length > 0,
                        status: attendance[0]?.status || null
                    },
                    pending_homework: pendingHomework.map(h => ({
                        id: h.id,
                        title: h.title,
                        subject: h.subject.name,
                        due_date: h.due_date,
                        is_overdue: new Date(h.due_date) < new Date()
                    })),
                    live_classes: liveClasses.map(lc => ({
                        id: lc.id,
                        subject: lc.subject.name,
                        teacher: lc.User?.name || 'TBA',
                        meeting_link: lc.meeting_link,
                        is_active: lc.is_active,
                        start_time: lc.start_time
                    })),
                    announcements: announcements.map(a => ({
                        id: a.id,
                        title: a.title,
                        message: a.message,
                        created_at: a.created_at
                    }))
                }
            });
        } catch (error) {
            console.error('[STUDENT_MY_DAY_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// GET /api/student/timetable - Full weekly timetable
// ============================================================================
studentRouter.get('/timetable',
    requireRole([UserRole.STUDENT]),
    async (c) => {
        try {
            const user = c.get('user');
            const day = c.req.query('day'); // Optional: filter by day (0-6)

            const student = await getStudentFromUser(user.id, user.school_id);
            if (!student) {
                return c.json({ success: false, error: 'Student profile not found' }, 404);
            }

            const currentEnrollment = student.enrollments[0];
            if (!currentEnrollment) {
                return c.json({ success: false, error: 'No current enrollment found' }, 404);
            }

            const whereClause: any = {
                school_id: user.school_id,
                class_id: currentEnrollment.class_id
            };

            if (day !== undefined) {
                whereClause.day_of_week = parseInt(day);
            }

            const timetable = await prisma.timetable.findMany({
                where: whereClause,
                include: {
                    subject: { select: { name: true, code: true } },
                    User: { select: { name: true } }
                },
                orderBy: [
                    { day_of_week: 'asc' },
                    { period: 'asc' }
                ]
            });

            // Check for substitutions today
            const today = new Date();
            const substitutions = await prisma.substitution.findMany({
                where: {
                    school_id: user.school_id,
                    classId: currentEnrollment.class_id,
                    date: {
                        gte: new Date(today.setHours(0, 0, 0, 0)),
                        lte: new Date(today.setHours(23, 59, 59, 999))
                    },
                    status: 'ASSIGNED'
                },
                include: {
                    substituteTeacher: {
                        include: {
                            user: { select: { name: true } }
                        }
                    },
                    subject: { select: { name: true } }
                }
            });

            return c.json({
                success: true,
                data: {
                    class: `${currentEnrollment.class.grade}-${currentEnrollment.class.section}`,
                    timetable: timetable.map(t => ({
                        id: t.id,
                        day_of_week: t.day_of_week,
                        period: t.period,
                        subject: t.subject.name,
                        subject_code: t.subject.code,
                        teacher: t.User?.name || 'TBA',
                        start_time: t.start_time,
                        end_time: t.end_time
                    })),
                    substitutions: substitutions.map(s => ({
                        period: s.period,
                        subject: s.subject?.name || 'N/A',
                        substitute_teacher: s.substituteTeacher?.user.name || 'TBA'
                    }))
                }
            });
        } catch (error) {
            console.error('[STUDENT_TIMETABLE_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// GET /api/student/homework - Homework list
// ============================================================================
studentRouter.get('/homework',
    requireRole([UserRole.STUDENT]),
    async (c) => {
        try {
            const user = c.get('user');
            const status = c.req.query('status'); // pending, submitted, graded

            const student = await getStudentFromUser(user.id, user.school_id);
            if (!student) {
                return c.json({ success: false, error: 'Student profile not found' }, 404);
            }

            const currentEnrollment = student.enrollments[0];
            if (!currentEnrollment) {
                return c.json({ success: false, error: 'No current enrollment found' }, 404);
            }

            // Get all homework for the class
            const homework = await prisma.homework.findMany({
                where: {
                    school_id: user.school_id,
                    class_id: currentEnrollment.class_id
                },
                include: {
                    subject: { select: { name: true, code: true } },
                    submissions: {
                        where: { student_id: student.id }
                    }
                },
                orderBy: { due_date: 'desc' }
            });

            // Filter by status
            let filtered = homework.map(h => {
                const submission = h.submissions[0];
                let computedStatus: 'pending' | 'submitted' | 'graded' | 'overdue';

                if (submission?.grade) {
                    computedStatus = 'graded';
                } else if (submission) {
                    computedStatus = 'submitted';
                } else if (new Date(h.due_date) < new Date()) {
                    computedStatus = 'overdue';
                } else {
                    computedStatus = 'pending';
                }

                return {
                    id: h.id,
                    title: h.title,
                    description: h.description,
                    subject: h.subject.name,
                    subject_code: h.subject.code,
                    due_date: h.due_date,
                    created_at: h.created_at,
                    status: computedStatus,
                    submission: submission ? {
                        id: submission.id,
                        submitted_at: submission.submitted_at,
                        is_late: submission.is_late,
                        grade: submission.grade,
                        feedback: submission.feedback
                    } : null
                };
            });

            if (status) {
                filtered = filtered.filter(h => h.status === status);
            }

            return c.json({
                success: true,
                data: filtered
            });
        } catch (error) {
            console.error('[STUDENT_HOMEWORK_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// POST /api/student/homework/:id/submit - Submit homework
// ============================================================================
studentRouter.post('/homework/:id/submit',
    requireRole([UserRole.STUDENT]),
    async (c) => {
        try {
            const user = c.get('user');
            const homeworkId = c.req.param('id');
            const body = await c.req.json();
            const { submission_text, submission_url } = body;

            if (!submission_text && !submission_url) {
                return c.json({ success: false, error: 'Submission text or file URL required' }, 400);
            }

            const student = await getStudentFromUser(user.id, user.school_id);
            if (!student) {
                return c.json({ success: false, error: 'Student profile not found' }, 404);
            }

            // Verify homework exists and belongs to student's class
            const currentEnrollment = student.enrollments[0];
            const homework = await prisma.homework.findFirst({
                where: {
                    id: homeworkId,
                    school_id: user.school_id,
                    class_id: currentEnrollment?.class_id
                }
            });

            if (!homework) {
                return c.json({ success: false, error: 'Homework not found' }, 404);
            }

            // Check if already submitted
            const existingSubmission = await prisma.homeworkSubmission.findUnique({
                where: {
                    homework_id_student_id: {
                        homework_id: homeworkId,
                        student_id: student.id
                    }
                }
            });

            if (existingSubmission) {
                return c.json({ success: false, error: 'Already submitted. Contact teacher to reopen.' }, 400);
            }

            // Check if past due date
            const isLate = new Date(homework.due_date) < new Date();

            // Create submission
            const submission = await prisma.homeworkSubmission.create({
                data: {
                    homework_id: homeworkId,
                    student_id: student.id,
                    school_id: user.school_id,
                    submission_text,
                    submission_url,
                    is_late: isLate
                }
            });

            return c.json({
                success: true,
                data: {
                    id: submission.id,
                    submitted_at: submission.submitted_at,
                    is_late: submission.is_late,
                    message: isLate ? 'Submitted (late)' : 'Submitted successfully'
                }
            }, 201);
        } catch (error) {
            console.error('[STUDENT_HOMEWORK_SUBMIT_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// GET /api/student/attendance - Attendance history
// ============================================================================
studentRouter.get('/attendance',
    requireRole([UserRole.STUDENT]),
    async (c) => {
        try {
            const user = c.get('user');
            const month = c.req.query('month'); // Format: YYYY-MM

            const student = await getStudentFromUser(user.id, user.school_id);
            if (!student) {
                return c.json({ success: false, error: 'Student profile not found' }, 404);
            }

            // Default to current month
            const targetDate = month ? new Date(`${month}-01`) : new Date();
            const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
            const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

            const attendance = await prisma.attendance.findMany({
                where: {
                    student_id: student.id,
                    date: {
                        gte: startOfMonth,
                        lte: endOfMonth
                    }
                },
                orderBy: { date: 'asc' }
            });

            // Calculate summary
            const present = attendance.filter(a => a.status === 'PRESENT').length;
            const absent = attendance.filter(a => a.status === 'ABSENT').length;
            const late = attendance.filter(a => a.status === 'LATE').length;
            const total = attendance.length;

            return c.json({
                success: true,
                data: {
                    month: `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`,
                    summary: {
                        present,
                        absent,
                        late,
                        total,
                        percentage: total > 0 ? Math.round((present / total) * 100) : 0
                    },
                    records: attendance.map(a => ({
                        date: a.date,
                        status: a.status,
                        period: a.period
                    }))
                }
            });
        } catch (error) {
            console.error('[STUDENT_ATTENDANCE_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// POST /api/student/leave-request - Request leave
// ============================================================================
studentRouter.post('/leave-request',
    requireRole([UserRole.STUDENT]),
    async (c) => {
        try {
            const user = c.get('user');
            const body = await c.req.json();
            const { type, start_date, end_date, reason } = body;

            if (!type || !start_date || !end_date) {
                return c.json({ success: false, error: 'Type, start_date, and end_date required' }, 400);
            }

            const student = await getStudentFromUser(user.id, user.school_id);
            if (!student) {
                return c.json({ success: false, error: 'Student profile not found' }, 404);
            }

            // Validate dates are in future
            if (new Date(start_date) < new Date()) {
                return c.json({ success: false, error: 'Start date must be in the future' }, 400);
            }

            // Create leave request
            const leaveRequest = await prisma.leaveApplication.create({
                data: {
                    id: `LEAVE_STD_${Date.now()}`,
                    school_id: user.school_id,
                    student_id: student.id,
                    type,
                    start_date: new Date(start_date),
                    end_date: new Date(end_date),
                    reason,
                    status: 'PENDING'
                }
            });

            return c.json({
                success: true,
                data: {
                    id: leaveRequest.id,
                    status: leaveRequest.status,
                    message: 'Leave request submitted for approval'
                }
            }, 201);
        } catch (error) {
            console.error('[STUDENT_LEAVE_REQUEST_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// GET /api/student/results - Published exam results
// ============================================================================
studentRouter.get('/results',
    requireRole([UserRole.STUDENT]),
    async (c) => {
        try {
            const user = c.get('user');

            const student = await getStudentFromUser(user.id, user.school_id);
            if (!student) {
                return c.json({ success: false, error: 'Student profile not found' }, 404);
            }

            // Only get PUBLISHED results
            const results = await prisma.result.findMany({
                where: {
                    student_id: student.id,
                    school_id: user.school_id,
                    status: 'PUBLISHED'
                },
                include: {
                    Exam: { select: { name: true, type: true, start_date: true } },
                    marks: {
                        include: {
                            subject: { select: { name: true, code: true } }
                        }
                    }
                },
                orderBy: { created_at: 'desc' }
            });

            return c.json({
                success: true,
                data: results.map(r => ({
                    id: r.id,
                    exam: {
                        name: r.Exam.name,
                        type: r.Exam.type,
                        date: r.Exam.start_date
                    },
                    total_percentage: r.total_percentage,
                    grade: r.grade,
                    remarks: r.remarks,
                    subjects: r.marks.map(m => ({
                        name: m.subject.name,
                        code: m.subject.code,
                        marks_obtained: m.marks_obtained,
                        max_marks: m.max_marks,
                        grade: m.grade,
                        remarks: m.remarks
                    }))
                }))
            });
        } catch (error) {
            console.error('[STUDENT_RESULTS_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// GET /api/student/results/:id/pdf - Generate PDF Report Card
// ============================================================================
studentRouter.get('/results/:id/pdf',
    requireRole([UserRole.STUDENT]),
    async (c) => {
        try {
            const user = c.get('user');
            const resultId = c.req.param('id');
            const { generatePDFMarksheet } = await import('../services/pdf-service');

            const student = await getStudentFromUser(user.id, user.school_id);
            if (!student) {
                return c.json({ success: false, error: 'Student profile not found' }, 404);
            }

            // Verify result belongs to student and is published
            const result = await prisma.result.findFirst({
                where: {
                    id: resultId,
                    student_id: student.id,
                    school_id: user.school_id,
                    status: 'PUBLISHED'
                }
            });

            if (!result) {
                return c.json({ success: false, error: 'Result not found or not published' }, 404);
            }

            const pdfBase64 = await generatePDFMarksheet(student.id, result.id);

            if (!pdfBase64) {
                return c.json({ success: false, error: 'Failed to generate PDF' }, 500);
            }

            return c.json({
                success: true,
                data: {
                    pdf_base64: pdfBase64,
                    filename: `ReportCard_${result.id.slice(0, 6)}.pdf`
                }
            });
        } catch (error) {
            console.error('[STUDENT_RESULT_PDF_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// GET /api/student/live-classes - Active/upcoming live classes
// ============================================================================
studentRouter.get('/live-classes',
    requireRole([UserRole.STUDENT]),
    async (c) => {
        try {
            const user = c.get('user');

            const student = await getStudentFromUser(user.id, user.school_id);
            if (!student) {
                return c.json({ success: false, error: 'Student profile not found' }, 404);
            }

            const currentEnrollment = student.enrollments[0];
            if (!currentEnrollment) {
                return c.json({ success: false, error: 'No current enrollment found' }, 404);
            }

            const liveClasses = await prisma.liveClass.findMany({
                where: {
                    school_id: user.school_id,
                    class_id: currentEnrollment.class_id
                },
                include: {
                    subject: { select: { name: true, code: true } },
                    User: { select: { name: true } }
                },
                orderBy: { start_time: 'desc' }
            });

            return c.json({
                success: true,
                data: liveClasses.map(lc => ({
                    id: lc.id,
                    subject: lc.subject.name,
                    subject_code: lc.subject.code,
                    teacher: lc.User?.name || 'TBA',
                    meeting_link: lc.meeting_link,
                    is_active: lc.is_active,
                    start_time: lc.start_time,
                    can_join: lc.is_active // Only allow joining active classes
                }))
            });
        } catch (error) {
            console.error('[STUDENT_LIVE_CLASSES_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// GET /api/student/notifications - Announcements for student
// ============================================================================
studentRouter.get('/notifications',
    requireRole([UserRole.STUDENT]),
    async (c) => {
        try {
            const user = c.get('user');

            const announcements = await prisma.announcement.findMany({
                where: {
                    school_id: user.school_id,
                    OR: [
                        { target_roles: { has: 'STUDENT' } },
                        { target_roles: { isEmpty: true } } // Empty = all roles
                    ]
                },
                include: {
                    author: { select: { name: true, role: true } }
                },
                orderBy: { created_at: 'desc' },
                take: 20
            });

            return c.json({
                success: true,
                data: announcements.map(a => ({
                    id: a.id,
                    title: a.title,
                    message: a.message,
                    author: a.author.name,
                    author_role: a.author.role,
                    is_public: a.is_public,
                    created_at: a.created_at,
                    expires_at: a.expires_at,
                    is_new: new Date(a.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                }))
            });
        } catch (error) {
            console.error('[STUDENT_NOTIFICATIONS_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

// ============================================================================
// PATCH /api/student/profile - Update limited profile fields
// ============================================================================
studentRouter.patch('/profile',
    requireRole([UserRole.STUDENT]),
    async (c) => {
        try {
            const user = c.get('user');
            const body = await c.req.json();

            // Only allow phone number update (per user's requirement)
            const { phone } = body;

            if (!phone) {
                return c.json({ success: false, error: 'No valid fields to update' }, 400);
            }

            const student = await getStudentFromUser(user.id, user.school_id);
            if (!student) {
                return c.json({ success: false, error: 'Student profile not found' }, 404);
            }

            const updated = await prisma.student.update({
                where: { id: student.id },
                data: { phone },
                select: { id: true, phone: true, updated_at: true }
            });

            return c.json({
                success: true,
                data: updated
            });
        } catch (error) {
            console.error('[STUDENT_PROFILE_UPDATE_ERROR]', error);
            return c.json({ success: false, error: 'Internal server error' }, 500);
        }
    }
);

export { studentRouter };
