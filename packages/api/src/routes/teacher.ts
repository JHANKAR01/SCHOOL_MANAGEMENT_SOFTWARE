// packages/api/src/routes/teacher.ts
// Teacher-scoped API endpoints for the Teacher Dashboard
// All endpoints are scoped by authenticated teacher's user_id and school_id

import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const teacherRouter = new Hono();

// ============================================================================
// HELPER: Get teacher's staff profile and validate access
// ============================================================================

async function getTeacherProfile(userId: string, schoolId: string) {
    const user = await prisma.user.findFirst({
        where: { id: userId, school_id: schoolId, role: 'TEACHER' },
        include: {
            staffProfile: {
                include: {
                    staffClasses: { include: { class: true } },
                    staffSubjects: { include: { subject: true } },
                },
            },
        },
    });
    return user?.staffProfile;
}

// ============================================================================
// GET /teacher/my-classes-today
// Returns teacher's classes for the current day based on timetable
// ============================================================================

teacherRouter.get('/my-classes-today', async (c) => {
    try {
        // In production, get from auth middleware
        const userId = c.req.header('X-User-Id') || '';
        const schoolId = c.req.header('X-School-Id') || '';

        if (!userId || !schoolId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const staffProfile = await getTeacherProfile(userId, schoolId);
        if (!staffProfile) {
            return c.json({ error: 'Teacher profile not found' }, 404);
        }

        // Get today's day of week (0 = Sunday, 1 = Monday, etc.)
        const today = new Date();
        const dayOfWeek = today.getDay();
        const todayStr = today.toISOString().split('T')[0];

        // Get assigned class IDs
        const assignedClassIds = staffProfile.staffClasses.map(sc => sc.classId);

        // Fetch timetable entries for today
        const timetableEntries = await prisma.timetable.findMany({
            where: {
                school_id: schoolId,
                classId: { in: assignedClassIds },
                day: dayOfWeek,
            },
            include: {
                class: true,
                subject: true,
            },
            orderBy: { period: 'asc' },
        });

        // Check attendance status for each class
        const classesWithStatus = await Promise.all(
            timetableEntries.map(async (entry) => {
                const attendanceCount = await prisma.attendance.count({
                    where: {
                        class_id: entry.classId,
                        date: today,
                        period: entry.period,
                    },
                });

                return {
                    id: entry.id,
                    classId: entry.classId,
                    className: entry.class?.name || `Class ${entry.classId}`,
                    grade: entry.class?.grade || '',
                    section: entry.class?.section || '',
                    subjectId: entry.subjectId,
                    subjectName: entry.subject?.name || 'Unknown',
                    period: entry.period,
                    startTime: entry.start_time || `${8 + entry.period}:00`,
                    endTime: entry.end_time || `${9 + entry.period}:00`,
                    attendanceMarked: attendanceCount > 0,
                };
            })
        );

        return c.json(classesWithStatus);
    } catch (error) {
        console.error('[Teacher API] Error fetching classes:', error);
        return c.json({ error: 'Failed to fetch classes' }, 500);
    }
});

// ============================================================================
// GET /teacher/class/:classId/students
// Returns masked student roster for a specific class
// ============================================================================

teacherRouter.get('/class/:classId/students', async (c) => {
    try {
        const userId = c.req.header('X-User-Id') || '';
        const schoolId = c.req.header('X-School-Id') || '';
        const classId = c.req.param('classId');

        if (!userId || !schoolId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        // Verify teacher has access to this class
        const staffProfile = await getTeacherProfile(userId, schoolId);
        const hasAccess = staffProfile?.staffClasses.some(sc => sc.classId === classId);

        if (!hasAccess) {
            return c.json({ error: 'Access denied to this class' }, 403);
        }

        // Get students enrolled in this class
        const enrollments = await prisma.studentEnrollment.findMany({
            where: {
                class_id: classId,
                status: 'ACTIVE',
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        roll_number: true,
                        photo_url: true,
                        // Masked: phone, email, aadhaar excluded
                    },
                },
            },
            orderBy: { student: { roll_number: 'asc' } },
        });

        const students = enrollments.map(e => ({
            id: e.student.id,
            name: e.student.name,
            rollNumber: e.student.roll_number || 0,
            photoUrl: e.student.photo_url,
        }));

        return c.json(students);
    } catch (error) {
        console.error('[Teacher API] Error fetching students:', error);
        return c.json({ error: 'Failed to fetch students' }, 500);
    }
});

// ============================================================================
// POST /teacher/attendance
// Submit attendance for a class/date/period (idempotent)
// ============================================================================

teacherRouter.post('/attendance', async (c) => {
    try {
        const userId = c.req.header('X-User-Id') || '';
        const schoolId = c.req.header('X-School-Id') || '';
        const idempotencyKey = c.req.header('X-Idempotency-Key') || '';

        if (!userId || !schoolId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const body = await c.req.json();
        const { classId, date, period, records } = body;

        if (!classId || !date || !period || !Array.isArray(records)) {
            return c.json({ error: 'Missing required fields' }, 400);
        }

        // Verify teacher has access to this class
        const staffProfile = await getTeacherProfile(userId, schoolId);
        const hasAccess = staffProfile?.staffClasses.some(sc => sc.classId === classId);

        if (!hasAccess) {
            return c.json({ error: 'Access denied to this class' }, 403);
        }

        // Parse date
        const attendanceDate = new Date(date);

        // Upsert attendance records (idempotent)
        const results = await Promise.all(
            records.map(async (record: { studentId: string; status: string }) => {
                return prisma.attendance.upsert({
                    where: {
                        // Composite unique constraint
                        student_id_date_period: {
                            student_id: record.studentId,
                            date: attendanceDate,
                            period: period,
                        },
                    },
                    update: {
                        status: record.status as any,
                        marked_by_id: userId,
                        updated_at: new Date(),
                    },
                    create: {
                        student_id: record.studentId,
                        class_id: classId,
                        school_id: schoolId,
                        date: attendanceDate,
                        period: period,
                        status: record.status as any,
                        marked_by_id: userId,
                    },
                });
            })
        );

        // Audit log
        await prisma.auditLog.create({
            data: {
                school_id: schoolId,
                user_id: userId,
                action: 'MARK_ATTENDANCE',
                target_type: 'Attendance',
                target_id: classId,
                metadata: {
                    date,
                    period,
                    recordCount: records.length,
                    idempotencyKey,
                },
            },
        });

        return c.json({
            success: true,
            message: `Attendance saved for ${results.length} students`,
            count: results.length,
        });
    } catch (error) {
        console.error('[Teacher API] Error saving attendance:', error);
        return c.json({ error: 'Failed to save attendance' }, 500);
    }
});

// ============================================================================
// GET /teacher/attendance/:classId/:date/:period
// Get current attendance for a class/date/period
// ============================================================================

teacherRouter.get('/attendance/:classId/:date/:period', async (c) => {
    try {
        const userId = c.req.header('X-User-Id') || '';
        const schoolId = c.req.header('X-School-Id') || '';
        const classId = c.req.param('classId');
        const dateStr = c.req.param('date');
        const period = parseInt(c.req.param('period'), 10);

        if (!userId || !schoolId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const date = new Date(dateStr);

        const attendanceRecords = await prisma.attendance.findMany({
            where: {
                class_id: classId,
                date: date,
                period: period,
            },
            include: {
                student: {
                    select: { id: true, name: true, roll_number: true },
                },
            },
        });

        const records = attendanceRecords.map(a => ({
            studentId: a.student_id,
            name: a.student?.name || '',
            rollNumber: a.student?.roll_number || 0,
            status: a.status,
        }));

        return c.json({
            marked: records.length > 0,
            records,
        });
    } catch (error) {
        console.error('[Teacher API] Error fetching attendance:', error);
        return c.json({ error: 'Failed to fetch attendance' }, 500);
    }
});

// ============================================================================
// GET /teacher/my-exams
// Returns exams for teacher's subjects with entry status
// ============================================================================

teacherRouter.get('/my-exams', async (c) => {
    try {
        const userId = c.req.header('X-User-Id') || '';
        const schoolId = c.req.header('X-School-Id') || '';
        const status = c.req.query('status');

        if (!userId || !schoolId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const staffProfile = await getTeacherProfile(userId, schoolId);
        if (!staffProfile) {
            return c.json({ error: 'Teacher profile not found' }, 404);
        }

        const assignedSubjectIds = staffProfile.staffSubjects.map(ss => ss.subjectId);
        const assignedClassIds = staffProfile.staffClasses.map(sc => sc.classId);

        // Get exams for teacher's subjects/classes
        const exams = await prisma.exam.findMany({
            where: {
                school_id: schoolId,
                subjectId: { in: assignedSubjectIds },
                classId: { in: assignedClassIds },
            },
            include: {
                subject: true,
                class: true,
            },
            orderBy: { date: 'desc' },
        });

        // Calculate entry status for each exam
        const examsWithStatus = await Promise.all(
            exams.map(async (exam) => {
                const resultCount = await prisma.result.count({
                    where: { exam_id: exam.id },
                });

                const totalStudents = await prisma.studentEnrollment.count({
                    where: { class_id: exam.classId, status: 'ACTIVE' },
                });

                let entryStatus: string;
                if (resultCount === 0) {
                    entryStatus = 'NOT_STARTED';
                } else if (resultCount < totalStudents) {
                    entryStatus = 'IN_PROGRESS';
                } else {
                    // Check if submitted for approval
                    const result = await prisma.result.findFirst({
                        where: { exam_id: exam.id },
                    });
                    entryStatus = result?.approval_status === 'PENDING_APPROVAL' || result?.approval_status === 'PUBLISHED'
                        ? 'SUBMITTED'
                        : 'IN_PROGRESS';
                }

                return {
                    id: exam.id,
                    name: exam.name,
                    subjectId: exam.subjectId,
                    subjectName: exam.subject?.name || '',
                    classId: exam.classId,
                    className: exam.class?.name || '',
                    status: entryStatus,
                    maxMarks: exam.max_marks,
                    date: exam.date?.toISOString().split('T')[0] || '',
                };
            })
        );

        // Filter by status if provided
        const filtered = status
            ? examsWithStatus.filter(e => e.status === status)
            : examsWithStatus;

        return c.json(filtered);
    } catch (error) {
        console.error('[Teacher API] Error fetching exams:', error);
        return c.json({ error: 'Failed to fetch exams' }, 500);
    }
});

// ============================================================================
// GET /teacher/leave-balances
// Returns leave balances for current teacher
// ============================================================================

teacherRouter.get('/leave-balances', async (c) => {
    try {
        const userId = c.req.header('X-User-Id') || '';
        const schoolId = c.req.header('X-School-Id') || '';

        if (!userId || !schoolId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const staffProfile = await getTeacherProfile(userId, schoolId);
        if (!staffProfile) {
            return c.json({ error: 'Teacher profile not found' }, 404);
        }

        // Get current academic year
        const currentYear = await prisma.academicYear.findFirst({
            where: { school_id: schoolId, is_current: true },
        });

        if (!currentYear) {
            return c.json([]);
        }

        // Get leave balances
        const balances = await prisma.leaveBalance.findMany({
            where: {
                staff_profile_id: staffProfile.id,
                academic_year_id: currentYear.id,
            },
        });

        return c.json(
            balances.map(b => ({
                type: b.leave_type,
                totalAllowed: b.total_allowed,
                used: b.used,
                remaining: b.total_allowed - b.used,
            }))
        );
    } catch (error) {
        console.error('[Teacher API] Error fetching leave balances:', error);
        return c.json({ error: 'Failed to fetch leave balances' }, 500);
    }
});

export { teacherRouter };
