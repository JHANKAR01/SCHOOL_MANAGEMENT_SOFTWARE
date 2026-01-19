import { Hono } from 'hono';
import prisma from '../db';

const teacherRouter = new Hono();

// ============================================================================
// HELPER: Get teacher's staff profile and validate access
// ============================================================================

async function getTeacherProfile(userId: string, schoolId: string) {
    const user = await prisma.user.findFirst({
        where: { id: userId, school_id: schoolId, role: 'TEACHER' },
        include: {
            staff_profile: {
                include: {
                    staffClasses: { include: { class: true } },
                    staffSubjects: { include: { subject: true } },
                },
            },
        },
    });
    return user?.staff_profile;
}

// Helper: Combine grade + section into class name
function getClassName(cls: { grade: string; section: string } | null | undefined): string {
    if (!cls) return 'Unknown';
    return `${cls.grade}-${cls.section}`;
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

        // Get assigned class IDs
        const assignedClassIds = staffProfile.staffClasses.map(sc => sc.class_id);

        // Fetch timetable entries for today
        const timetableEntries = await prisma.timetable.findMany({
            where: {
                school_id: schoolId,
                class_id: { in: assignedClassIds },
                day_of_week: dayOfWeek,
            },
            include: {
                class: true,
                subject: true,
            },
            orderBy: { start_time: 'asc' },
        });

        // Check attendance status for each class
        const classesWithStatus = await Promise.all(
            timetableEntries.map(async (entry: any) => {
                // Calculate period from start_time if not available
                const entryPeriod = entry.period ?? 1;

                const attendanceCount = await prisma.attendance.count({
                    where: {
                        student_id: { in: [] }, // Will be updated when we have class-based lookup
                        date: today,
                        period: entryPeriod,
                    },
                });

                return {
                    id: entry.id,
                    classId: entry.class_id,
                    className: getClassName(entry.class),
                    grade: entry.class?.grade || '',
                    section: entry.class?.section || '',
                    subjectId: entry.subject_id,
                    subjectName: entry.subject?.name || 'Unknown',
                    period: entryPeriod,
                    startTime: entry.start_time || `${8 + entryPeriod}:00`,
                    endTime: entry.end_time || `${9 + entryPeriod}:00`,
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
        const hasAccess = staffProfile?.staffClasses.some(sc => sc.class_id === classId);

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
                        photo_url: true,
                        // Masked: phone, email, aadhaar excluded
                    },
                },
            },
            orderBy: { roll_number: 'asc' },
        });

        const students = enrollments.map(e => ({
            id: e.student.id,
            name: e.student.name,
            rollNumber: e.roll_number || 0,
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
        const hasAccess = staffProfile?.staffClasses.some(sc => sc.class_id === classId);

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
                        marked_by: userId,
                    },
                    create: {
                        student_id: record.studentId,
                        school_id: schoolId,
                        date: attendanceDate,
                        period: period,
                        status: record.status as any,
                        marked_by: userId,
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

        // Get students in the class
        const enrollments = await prisma.studentEnrollment.findMany({
            where: { class_id: classId, status: 'ACTIVE' },
            select: { student_id: true },
        });
        const studentIds = enrollments.map(e => e.student_id);

        const attendanceRecords = await prisma.attendance.findMany({
            where: {
                student_id: { in: studentIds },
                date: date,
                period: period,
            },
            include: {
                student: {
                    select: { id: true, name: true },
                },
            },
        });

        const records = attendanceRecords.map(a => ({
            studentId: a.student_id,
            name: a.student?.name || '',
            rollNumber: 0, // Would need join with enrollment
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

        const assignedSubjectIds = staffProfile.staffSubjects.map(ss => ss.subject_id);
        const assignedClassIds = staffProfile.staffClasses.map(sc => sc.class_id);

        // Get exams for teacher's school
        // Note: Exam model doesn't have class_id/subject_id directly - simplified query
        const exams = await prisma.exam.findMany({
            where: {
                school_id: schoolId,
            },
            orderBy: { start_date: 'desc' },
        });

        // Calculate entry status for each exam
        const examsWithStatus = await Promise.all(
            exams.map(async (exam) => {
                const resultCount = await prisma.result.count({
                    where: { exam_id: exam.id },
                });

                let entryStatus: string;
                if (resultCount === 0) {
                    entryStatus = 'NOT_STARTED';
                } else {
                    // Check if submitted for approval
                    const result = await prisma.result.findFirst({
                        where: { exam_id: exam.id },
                    });
                    entryStatus = result?.status === 'PENDING_APPROVAL' || result?.status === 'PUBLISHED'
                        ? 'SUBMITTED'
                        : 'IN_PROGRESS';
                }

                return {
                    id: exam.id,
                    name: exam.name,
                    type: exam.type,
                    status: entryStatus,
                    startDate: exam.start_date?.toISOString().split('T')[0] || '',
                    endDate: exam.end_date?.toISOString().split('T')[0] || '',
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

// ============================================================================
// GET /teacher/marks/:examId
// Fetch marks for an exam with student list
// ============================================================================

teacherRouter.get('/marks/:examId', async (c) => {
    try {
        const userId = c.req.header('X-User-Id') || '';
        const schoolId = c.req.header('X-School-Id') || '';
        const examId = c.req.param('examId');

        if (!userId || !schoolId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        // Get exam details
        const exam = await prisma.exam.findFirst({
            where: { id: examId, school_id: schoolId },
        });

        if (!exam) {
            return c.json({ error: 'Exam not found' }, 404);
        }

        // Get all results for this exam
        const results = await prisma.result.findMany({
            where: { exam_id: examId },
            include: {
                Student: {
                    select: { id: true, name: true },
                },
            },
        });

        // Determine status
        const examResult = results[0];
        const resultStatus = examResult?.status || 'NOT_STARTED';
        const canEdit = resultStatus === 'DRAFT' || !examResult;

        // Map students with their marks
        const students = results.map(r => ({
            id: r.student_id,
            name: r.Student?.name || '',
            rollNumber: 0,
            marks: r.total_percentage ?? null,
            grade: r.grade || null,
        }));

        return c.json({
            exam: {
                id: exam.id,
                name: exam.name,
                maxMarks: 100, // Default, would come from ResultMark max_marks
                status: resultStatus,
            },
            students,
            canEdit,
        });
    } catch (error) {
        console.error('[Teacher API] Error fetching marks:', error);
        return c.json({ error: 'Failed to fetch marks' }, 500);
    }
});

// ============================================================================
// POST /teacher/marks
// Save marks (draft) or submit for approval
// ============================================================================

teacherRouter.post('/marks', async (c) => {
    try {
        const userId = c.req.header('X-User-Id') || '';
        const schoolId = c.req.header('X-School-Id') || '';

        if (!userId || !schoolId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const body = await c.req.json();
        const { examId, records, action } = body; // action: 'DRAFT' | 'SUBMIT'

        if (!examId || !Array.isArray(records)) {
            return c.json({ error: 'Missing required fields' }, 400);
        }

        // Validate action
        if (!['DRAFT', 'SUBMIT'].includes(action)) {
            return c.json({ error: 'Invalid action. Use DRAFT or SUBMIT' }, 400);
        }

        // Check exam exists
        const exam = await prisma.exam.findFirst({
            where: { id: examId, school_id: schoolId },
        });

        if (!exam) {
            return c.json({ error: 'Exam not found' }, 404);
        }

        // Determine new status
        const newStatus = action === 'SUBMIT' ? 'PENDING_APPROVAL' : 'DRAFT';

        // Upsert results for each student
        await Promise.all(
            records.map(async (record: { studentId: string; marks: number }) => {
                // Calculate grade based on percentage
                const percentage = record.marks; // Assuming marks is percentage
                let grade = 'F';
                if (percentage >= 90) grade = 'A+';
                else if (percentage >= 80) grade = 'A';
                else if (percentage >= 70) grade = 'B+';
                else if (percentage >= 60) grade = 'B';
                else if (percentage >= 50) grade = 'C';
                else if (percentage >= 40) grade = 'D';

                // Use findFirst + update/create pattern since upsert needs unique constraint
                const existing = await prisma.result.findFirst({
                    where: { student_id: record.studentId, exam_id: examId },
                });

                if (existing) {
                    await prisma.result.update({
                        where: { id: existing.id },
                        data: {
                            total_percentage: percentage,
                            grade,
                            status: newStatus as any,
                        },
                    });
                } else {
                    await prisma.result.create({
                        data: {
                            id: `result_${examId}_${record.studentId}`,
                            student_id: record.studentId,
                            exam_id: examId,
                            school_id: schoolId,
                            total_percentage: percentage,
                            grade,
                            status: newStatus as any,
                        },
                    });
                }
            })
        );

        // Audit log
        await prisma.auditLog.create({
            data: {
                school_id: schoolId,
                user_id: userId,
                action: action === 'SUBMIT' ? 'SUBMIT_MARKS' : 'SAVE_MARKS_DRAFT',
                target_type: 'Result',
                target_id: examId,
                metadata: {
                    recordCount: records.length,
                    status: newStatus,
                },
            },
        });

        return c.json({
            success: true,
            message: action === 'SUBMIT'
                ? 'Marks submitted for approval. You cannot edit until approved/rejected.'
                : `Marks saved as draft for ${records.length} students`,
            status: newStatus,
            canEdit: action !== 'SUBMIT',
        });
    } catch (error) {
        console.error('[Teacher API] Error saving marks:', error);
        return c.json({ error: 'Failed to save marks' }, 500);
    }
});

// ============================================================================
// GET /teacher/homework
// List teacher's homework with optional filters
// ============================================================================

teacherRouter.get('/homework', async (c) => {
    try {
        const userId = c.req.header('X-User-Id') || '';
        const schoolId = c.req.header('X-School-Id') || '';
        const classId = c.req.query('classId');
        const status = c.req.query('status'); // 'ACTIVE' | 'PAST'

        if (!userId || !schoolId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const staffProfile = await getTeacherProfile(userId, schoolId);
        if (!staffProfile) {
            return c.json({ error: 'Teacher profile not found' }, 404);
        }

        const assignedClassIds = staffProfile.staffClasses.map(sc => sc.class_id);
        const today = new Date();

        // Build where clause
        const whereClause: any = {
            school_id: schoolId,
        };

        if (classId) {
            whereClause.class_id = classId;
        } else {
            whereClause.class_id = { in: assignedClassIds };
        }

        const homeworks = await prisma.homework.findMany({
            where: whereClause,
            include: {
                subject: { select: { name: true } },
                class: true,
            },
            orderBy: { created_at: 'desc' },
        });

        // Calculate submission stats (mock for now - would need HomeworkSubmission model)
        const result = homeworks.map(hw => {
            const isPast = new Date(hw.due_date) < today;
            return {
                id: hw.id,
                title: hw.title,
                description: hw.description,
                subjectName: hw.subject?.name || '',
                className: getClassName(hw.class),
                dueDate: hw.due_date.toISOString(),
                createdAt: hw.created_at?.toISOString() || '',
                submissionCount: 0, // Would come from HomeworkSubmission count
                totalStudents: 35, // Would come from enrollment count
                isPast,
            };
        });

        // Filter by status if provided
        if (status === 'ACTIVE') {
            return c.json(result.filter(h => !h.isPast));
        } else if (status === 'PAST') {
            return c.json(result.filter(h => h.isPast));
        }

        return c.json(result);
    } catch (error) {
        console.error('[Teacher API] Error fetching homework:', error);
        return c.json({ error: 'Failed to fetch homework' }, 500);
    }
});

// ============================================================================
// POST /teacher/homework
// Create new homework
// ============================================================================

teacherRouter.post('/homework', async (c) => {
    try {
        const userId = c.req.header('X-User-Id') || '';
        const schoolId = c.req.header('X-School-Id') || '';

        if (!userId || !schoolId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const body = await c.req.json();
        const { title, description, subjectId, classId, dueDate } = body;

        if (!title || !classId || !dueDate || !subjectId) {
            return c.json({ error: 'Missing required fields' }, 400);
        }

        const homework = await prisma.homework.create({
            data: {
                id: `hw_${Date.now()}`,
                title,
                description: description || '',
                subject_id: subjectId,
                class_id: classId,
                school_id: schoolId,
                due_date: new Date(dueDate),
            },
        });

        return c.json({
            success: true,
            homework: {
                id: homework.id,
                title: homework.title,
            },
        });
    } catch (error) {
        console.error('[Teacher API] Error creating homework:', error);
        return c.json({ error: 'Failed to create homework' }, 500);
    }
});

// ============================================================================
// POST /teacher/homework/:id/copy
// Copy homework to another class
// ============================================================================

teacherRouter.post('/homework/:id/copy', async (c) => {
    try {
        const userId = c.req.header('X-User-Id') || '';
        const schoolId = c.req.header('X-School-Id') || '';
        const homeworkId = c.req.param('id');

        if (!userId || !schoolId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const body = await c.req.json();
        const { targetClassId } = body;

        if (!targetClassId) {
            return c.json({ error: 'targetClassId is required' }, 400);
        }

        // Get original homework
        const original = await prisma.homework.findFirst({
            where: { id: homeworkId, school_id: schoolId },
        });

        if (!original) {
            return c.json({ error: 'Homework not found' }, 404);
        }

        // Create copy
        const copy = await prisma.homework.create({
            data: {
                id: `hw_${Date.now()}`,
                title: original.title,
                description: original.description,
                subject_id: original.subject_id,
                class_id: targetClassId,
                school_id: schoolId,
                due_date: original.due_date,
            },
        });

        return c.json({
            success: true,
            message: 'Homework copied successfully',
            homework: { id: copy.id, title: copy.title },
        });
    } catch (error) {
        console.error('[Teacher API] Error copying homework:', error);
        return c.json({ error: 'Failed to copy homework' }, 500);
    }
});

// ============================================================================
// DELETE /teacher/homework/:id
// Delete homework
// ============================================================================

teacherRouter.delete('/homework/:id', async (c) => {
    try {
        const userId = c.req.header('X-User-Id') || '';
        const schoolId = c.req.header('X-School-Id') || '';
        const homeworkId = c.req.param('id');

        if (!userId || !schoolId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        // Verify homework exists
        const homework = await prisma.homework.findFirst({
            where: { id: homeworkId, school_id: schoolId },
        });

        if (!homework) {
            return c.json({ error: 'Homework not found or access denied' }, 404);
        }

        await prisma.homework.delete({
            where: { id: homeworkId },
        });

        return c.json({ success: true, message: 'Homework deleted' });
    } catch (error) {
        console.error('[Teacher API] Error deleting homework:', error);
        return c.json({ error: 'Failed to delete homework' }, 500);
    }
});

// ============================================================================
// GET /teacher/leave
// Fetch leave history for current teacher
// ============================================================================

teacherRouter.get('/leave', async (c) => {
    try {
        const userId = c.req.header('X-User-Id') || '';
        const schoolId = c.req.header('X-School-Id') || '';

        if (!userId || !schoolId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        const leaves = await prisma.leaveApplication.findMany({
            where: {
                school_id: schoolId,
                user_id: userId,
            },
            orderBy: { created_at: 'desc' },
        });

        return c.json(
            leaves.map(l => ({
                id: l.id,
                type: l.type,
                startDate: l.start_date.toISOString(),
                endDate: l.end_date.toISOString(),
                reason: l.reason,
                status: l.status,
                appliedAt: l.created_at?.toISOString() || '',
            }))
        );
    } catch (error) {
        console.error('[Teacher API] Error fetching leave history:', error);
        return c.json({ error: 'Failed to fetch leave history' }, 500);
    }
});

// ============================================================================
// POST /teacher/leave
// Apply for leave
// ============================================================================

teacherRouter.post('/leave', async (c) => {
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

        const body = await c.req.json();
        const { type, startDate, endDate, reason } = body;

        if (!type || !startDate || !endDate || !reason) {
            return c.json({ error: 'Missing required fields' }, 400);
        }

        // Check leave balance
        const currentYear = await prisma.academicYear.findFirst({
            where: { school_id: schoolId, is_current: true },
        });

        if (currentYear) {
            const balance = await prisma.leaveBalance.findFirst({
                where: {
                    staff_profile_id: staffProfile.id,
                    academic_year_id: currentYear.id,
                    leave_type: type,
                },
            });

            if (balance && balance.used >= balance.total_allowed) {
                return c.json({ error: `No ${type} leaves remaining` }, 400);
            }
        }

        const leave = await prisma.leaveApplication.create({
            data: {
                id: `leave_${Date.now()}`,
                school_id: schoolId,
                user_id: userId,
                type: type,
                start_date: new Date(startDate),
                end_date: new Date(endDate),
                reason,
                status: 'PENDING',
            },
        });

        return c.json({
            success: true,
            message: 'Leave application submitted',
            leave: { id: leave.id, status: leave.status },
        });
    } catch (error) {
        console.error('[Teacher API] Error applying for leave:', error);
        return c.json({ error: 'Failed to submit leave application' }, 500);
    }
});

// ============================================================================
// GET /teacher/live-class/room-id
// Generate unique Jitsi room ID for live class
// ============================================================================

teacherRouter.get('/live-class/room-id', async (c) => {
    try {
        const userId = c.req.header('X-User-Id') || '';
        const schoolId = c.req.header('X-School-Id') || '';
        const classId = c.req.query('classId') || '';
        const period = c.req.query('period') || '';

        if (!userId || !schoolId) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        if (!classId || !period) {
            return c.json({ error: 'classId and period are required' }, 400);
        }

        // Get school info
        const school = await prisma.school.findFirst({
            where: { id: schoolId },
        });

        // Get class info
        const classInfo = await prisma.class.findFirst({
            where: { id: classId },
        });

        // Get teacher info
        const user = await prisma.user.findFirst({
            where: { id: userId },
        });

        // Get today's timetable entry for subject
        const timetable = await prisma.timetable.findFirst({
            where: {
                class_id: classId,
                day_of_week: new Date().getDay(),
            },
            include: { subject: true },
        });

        // Generate unique room ID
        const schoolSlug = (school?.name || 'school').toLowerCase().replace(/\s+/g, '');
        const classSlug = getClassName(classInfo).toLowerCase().replace(/\s+/g, '');
        const teacherSlug = (user?.name || 'teacher').toLowerCase().replace(/\s+/g, '').slice(0, 15);
        const subjectSlug = (timetable?.subject?.name || 'class').toLowerCase().replace(/\s+/g, '');

        const roomId = `${schoolSlug}_${classSlug}_${teacherSlug}_${subjectSlug}_${period}`;

        return c.json({
            roomId,
            jitsiDomain: 'meet.jit.si',
            displayName: `${user?.name || 'Teacher'} - ${timetable?.subject?.name || 'Live Class'}`,
            classInfo: {
                className: getClassName(classInfo),
                subjectName: timetable?.subject?.name || '',
                period: parseInt(period, 10),
            },
        });
    } catch (error) {
        console.error('[Teacher API] Error generating room ID:', error);
        return c.json({ error: 'Failed to generate room ID' }, 500);
    }
});

export { teacherRouter };
