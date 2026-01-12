import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import {
  PrismaClient,
  UserRole,
  InvoiceStatus,
  Section,
  StudentStatus,
  StaffStatus,
  EnrollmentStatus,
  AttendanceStatus,
  LoanStatus
} from '@prisma/client';
import { SOVEREIGN_GENESIS_DATA } from './dummy-data.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

// 🔍 sanity check
console.log('DB URL at runtime:', process.env.DATABASE_URL);

// ✅ Explicit SSL config for Supabase + Node 22
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  options: '-c search_path=schoolmanagementsystem'
});

// ✅ Prisma v7 adapter
const adapter = new PrismaPg(pool, { schema: 'schoolmanagementsystem' });

// ✅ PrismaClient WITH adapter
const prisma = new PrismaClient({ adapter });

// --- Constants ---
const SCHOOL_ID = 'sch_123';
const ACADEMIC_YEAR_ID = 'ay_2025_2026';

// --- Helper: Parse class string to grade and section ---
function parseClassString(classStr: string): { grade: string; section: Section } {
  // Handle formats like "10-A", "9-B", "12-Sci", "11-Com", "11-Arts", "6-A", "7-B", "8-C"
  const parts = classStr.split('-');
  const grade = parts[0];

  // Map section/stream to Section enum
  let section: Section = Section.A;
  if (parts[1]) {
    const sectionPart = parts[1].toUpperCase();
    if (sectionPart === 'A' || sectionPart === 'SCI') section = Section.A;
    else if (sectionPart === 'B' || sectionPart === 'COM') section = Section.B;
    else if (sectionPart === 'C' || sectionPart === 'ARTS') section = Section.C;
    else if (sectionPart === 'D') section = Section.D;
    else if (sectionPart === 'E') section = Section.E;
    else if (sectionPart === 'F') section = Section.F;
  }

  return { grade, section };
}

async function main() {
  console.log('🌱 Starting Sovereign Genesis Seed (3NF Schema)');

  // Hash the default password "password123"
  const hashedPassword = await bcrypt.hash('password123', 10);
  console.log('🔐 Generated hash for "password123"');

  // =========================================================================
  // STEP 1: CLEAR EXISTING DATA (in correct order due to FKs)
  // =========================================================================
  console.log('🧹 Clearing existing data...');

  // Clear in reverse FK order
  await prisma.resultMark.deleteMany();
  await prisma.result.deleteMany();
  await prisma.bookLoan.deleteMany();
  await prisma.staffClass.deleteMany();
  await prisma.staffSubject.deleteMany();
  await prisma.staffFinancial.deleteMany();
  await prisma.staffProfile.deleteMany();
  await prisma.parentProfile.deleteMany();
  await prisma.studentEnrollment.deleteMany();
  await prisma.classSubject.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.identityDocument.deleteMany();
  await prisma.parentStudent.deleteMany();
  await prisma.medicalLog.deleteMany();
  await prisma.counseling.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.syllabus.deleteMany();
  await prisma.paper.deleteMany();
  await prisma.liveClass.deleteMany();
  await prisma.homework.deleteMany();
  await prisma.substitution.deleteMany();
  await prisma.timetable.deleteMany();
  await prisma.class.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();
  await prisma.bus.deleteMany();
  await prisma.book.deleteMany();
  await prisma.school.deleteMany();

  // =========================================================================
  // STEP 2: SEED SCHOOL
  // =========================================================================
  console.log('🏫 Seeding School');
  await prisma.school.create({
    data: {
      id: SCHOOL_ID,
      name: 'Sovereign High',
      settings_json: {
        theme: 'sovereign-blue',
        timezone: 'Asia/Kolkata',
        academicYearStart: 'April'
      }
    }
  });

  // =========================================================================
  // STEP 3: SEED ACADEMIC YEAR
  // =========================================================================
  console.log('📅 Seeding Academic Year');
  await prisma.academicYear.create({
    data: {
      id: ACADEMIC_YEAR_ID,
      school_id: SCHOOL_ID,
      name: '2025-2026',
      start_date: new Date('2025-04-01'),
      end_date: new Date('2026-03-31'),
      is_current: true
    }
  });

  // =========================================================================
  // STEP 4: SEED SUBJECTS
  // =========================================================================
  console.log('📚 Seeding Subjects');
  const subjects = [
    { id: 'sub_math', code: 'MATH', name: 'Mathematics', is_optional: false },
    { id: 'sub_eng', code: 'ENG', name: 'English', is_optional: false },
    { id: 'sub_hin', code: 'HIN', name: 'Hindi', is_optional: false },
    { id: 'sub_phy', code: 'PHY', name: 'Physics', is_optional: false },
    { id: 'sub_chem', code: 'CHEM', name: 'Chemistry', is_optional: false },
    { id: 'sub_bio', code: 'BIO', name: 'Biology', is_optional: false },
    { id: 'sub_hist', code: 'HIST', name: 'History', is_optional: false },
    { id: 'sub_geo', code: 'GEO', name: 'Geography', is_optional: false },
    { id: 'sub_civics', code: 'CIV', name: 'Civics', is_optional: false },
    { id: 'sub_eco', code: 'ECO', name: 'Economics', is_optional: true },
    { id: 'sub_acc', code: 'ACC', name: 'Accountancy', is_optional: true },
    { id: 'sub_bst', code: 'BST', name: 'Business Studies', is_optional: true },
    { id: 'sub_cs', code: 'CS', name: 'Computer Science', is_optional: true },
    { id: 'sub_pe', code: 'PE', name: 'Physical Education', is_optional: true },
    { id: 'sub_music', code: 'MUS', name: 'Music', is_optional: true },
  ];

  const subjectCodeToIdMap = new Map<string, string>();
  for (const sub of subjects) {
    const created = await prisma.subject.create({
      data: {
        id: sub.id,
        school_id: SCHOOL_ID,
        code: sub.code,
        name: sub.name,
        is_optional: sub.is_optional
      }
    });
    subjectCodeToIdMap.set(sub.code, created.id);
  }

  // =========================================================================
  // STEP 5: SEED CLASSES
  // =========================================================================
  console.log('🏛️ Seeding Classes');

  // Collect unique classes from student data
  const uniqueClasses = [...new Set(SOVEREIGN_GENESIS_DATA.students.map(s => s.class))];
  const classStringToIdMap = new Map<string, string>();

  for (const classStr of uniqueClasses) {
    const { grade, section } = parseClassString(classStr);
    const classId = `cls_${grade}_${section}`;

    const created = await prisma.class.create({
      data: {
        id: classId,
        school_id: SCHOOL_ID,
        academic_year_id: ACADEMIC_YEAR_ID,
        grade: grade,
        section: section,
        capacity: 40
      }
    });
    classStringToIdMap.set(classStr, created.id);
  }

  // =========================================================================
  // STEP 6: SEED PARENTS (as Users with ParentProfile)
  // =========================================================================
  console.log('👨‍👩‍👧‍👦 Seeding Parents');
  const parentRefToIdMap = new Map<string, string>();

  for (const parent of SOVEREIGN_GENESIS_DATA.parents) {
    // Create User
    const createdUser = await prisma.user.create({
      data: {
        name: parent.name,
        email: parent.email,
        phone: parent.primary_phone,
        role: UserRole.PARENT,
        school_id: SCHOOL_ID,
        password_hash: hashedPassword
      }
    });
    parentRefToIdMap.set(parent.parent_ref, createdUser.id);

    // Create ParentProfile
    await prisma.parentProfile.create({
      data: {
        user_id: createdUser.id,
        school_id: SCHOOL_ID,
        occupation: 'Business',
        is_emergency_contact: true
      }
    });
  }

  // =========================================================================
  // STEP 7: SEED STAFF (as Users with StaffProfile + StaffFinancial)
  // =========================================================================
  console.log('👨‍🏫 Seeding Staff');
  const staffNoToIdMap = new Map<string, string>();
  const staffNoToProfileIdMap = new Map<string, string>();

  for (const staff of SOVEREIGN_GENESIS_DATA.staff) {
    // Create User
    const createdUser = await prisma.user.create({
      data: {
        name: staff.name,
        email: staff.email,
        role: staff.role as UserRole,
        department: staff.department,
        school_id: SCHOOL_ID,
        password_hash: hashedPassword
      }
    });
    staffNoToIdMap.set(staff.staff_no, createdUser.id);

    // Create StaffProfile
    const staffProfile = await prisma.staffProfile.create({
      data: {
        user_id: createdUser.id,
        school_id: SCHOOL_ID,
        employee_id: staff.staff_no,
        designation: staff.role,
        department: staff.department,
        employment_type: 'Permanent',
        joining_date: new Date('2020-04-01'),
        qualification: staff.role === 'TEACHER' ? 'M.A., B.Ed' : 'Graduate',
        status: StaffStatus.ACTIVE
      }
    });
    staffNoToProfileIdMap.set(staff.staff_no, staffProfile.id);

    // Create StaffFinancial for all staff
    await prisma.staffFinancial.create({
      data: {
        staff_profile_id: staffProfile.id,
        school_id: SCHOOL_ID,
        salary_grade: staff.role === 'PRINCIPAL' ? 'Grade A' : staff.role === 'TEACHER' ? 'Grade B' : 'Grade C',
        basic_salary: staff.role === 'PRINCIPAL' ? 80000 : staff.role === 'TEACHER' ? 45000 : 35000,
        hra: 10000,
        allowances: 5000,
        deductions: 2000,
        bank_name: 'State Bank of India',
        bank_account_no: '1234567890',
        ifsc_code: 'SBIN0001234'
      }
    });

    // Assign subjects to teachers
    if (staff.role === 'TEACHER' || staff.role === 'HOD') {
      const deptToSubject: Record<string, string> = {
        'Physics': 'PHY',
        'Mathematics': 'MATH',
        'Hindi': 'HIN',
        'Music': 'MUS',
        'Physical Education': 'PE'
      };

      const subjectCode = deptToSubject[staff.department || ''];
      if (subjectCode) {
        const subjectId = subjectCodeToIdMap.get(subjectCode);
        if (subjectId) {
          await prisma.staffSubject.create({
            data: {
              school_id: SCHOOL_ID,
              staff_profile_id: staffProfile.id,
              subject_id: subjectId,
              is_primary: true
            }
          });
        }
      }
    }
  }

  // =========================================================================
  // STEP 8: SEED STUDENTS (with User account and Enrollment)
  // =========================================================================
  console.log('🎓 Seeding Students');
  const admissionNoToIdMap = new Map<string, string>();
  const dummyIdToRealIdMap = new Map<string, string>();

  // Indian names for demographics
  const genders = ['Male', 'Female'];
  const bloodGroups = ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'];
  const categories = ['General', 'OBC', 'SC', 'ST', 'EWS'];
  const religions = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist'];
  const states = ['Madhya Pradesh', 'Maharashtra', 'Gujarat', 'Rajasthan', 'Delhi'];

  for (let i = 0; i < SOVEREIGN_GENESIS_DATA.students.length; i++) {
    const student = SOVEREIGN_GENESIS_DATA.students[i];
    const { grade, section } = parseClassString(student.class);
    const classId = classStringToIdMap.get(student.class);

    if (!classId) {
      console.warn(`Class not found for student ${student.name}: ${student.class}`);
      continue;
    }

    // Create User account for student login
    const studentUser = await prisma.user.create({
      data: {
        name: student.name,
        email: student.email || `student.${student.admission_no}@sovereign.edu`,
        role: UserRole.STUDENT,
        school_id: SCHOOL_ID,
        password_hash: hashedPassword
      }
    });

    // Create Student with enhanced demographics
    const created = await prisma.student.create({
      data: {
        admission_no: student.admission_no,
        name: student.name,
        email: student.email,
        school_id: SCHOOL_ID,
        user_id: studentUser.id,
        // Demographics
        gender: genders[i % 2],
        date_of_birth: new Date(2010 - parseInt(grade) + 6, i % 12, (i % 28) + 1),
        father_name: `Mr. ${student.name.split(' ')[1] || 'Kumar'}`,
        mother_name: `Mrs. ${student.name.split(' ')[1] || 'Devi'}`,
        blood_group: bloodGroups[i % bloodGroups.length],
        nationality: 'Indian',
        religion: religions[i % religions.length],
        category: categories[i % categories.length],
        mother_tongue: 'Hindi',
        phone: `+91987654${(3210 + i).toString().padStart(4, '0')}`,
        emergency_contact_name: `Emergency Contact for ${student.name}`,
        emergency_contact_phone: `+91876543${(2100 + i).toString().padStart(4, '0')}`,
        address_line1: `${100 + i}, Model Colony`,
        city: 'Bhopal',
        state: states[i % states.length],
        pincode: `46200${i % 10}`,
        status: StudentStatus.ACTIVE,
        admission_date: new Date('2024-04-01')
      }
    });

    admissionNoToIdMap.set(student.admission_no, created.id);
    dummyIdToRealIdMap.set(student.id, created.id);

    // Create StudentEnrollment (roll number lives here now!)
    await prisma.studentEnrollment.create({
      data: {
        school_id: SCHOOL_ID,
        student_id: created.id,
        class_id: classId,
        academic_year_id: ACADEMIC_YEAR_ID,
        roll_number: student.roll,
        status: EnrollmentStatus.ACTIVE
      }
    });
  }

  // =========================================================================
  // STEP 9: LINK PARENTS & STUDENTS
  // =========================================================================
  console.log('🔗 Linking Parents & Students');
  for (const link of SOVEREIGN_GENESIS_DATA.parentStudent) {
    const pId = parentRefToIdMap.get(link.parent_ref);
    const sId = admissionNoToIdMap.get(link.admission_no);
    if (pId && sId) {
      await prisma.parentStudent.create({
        data: {
          parent_id: pId,
          student_id: sId,
          school_id: SCHOOL_ID,
          relation: link.relation,
          is_primary: link.is_primary,
          can_pickup: true,
          has_custody: true
        }
      });
    }
  }

  // =========================================================================
  // STEP 10: SEED DOCUMENTS
  // =========================================================================
  console.log('📄 Seeding Documents');
  for (const doc of SOVEREIGN_GENESIS_DATA.documents) {
    const uId = doc.owner_type === 'PARENT' ? parentRefToIdMap.get(doc.owner_key) : staffNoToIdMap.get(doc.owner_key);
    const sId = doc.owner_type === 'STUDENT' ? admissionNoToIdMap.get(doc.owner_key) : null;
    if (uId || sId) {
      await prisma.identityDocument.create({
        data: {
          doc_type: doc.doc_type,
          file_ref: doc.file_ref,
          masked_id: doc.id_last4,
          school_id: SCHOOL_ID,
          owner_user_id: uId || undefined,
          owner_student_id: sId || undefined
        }
      });
    }
  }

  // =========================================================================
  // STEP 11: SEED LOGISTICS (Buses & Books)
  // =========================================================================
  console.log('🚌 Seeding Logistics');
  await prisma.bus.createMany({
    data: SOVEREIGN_GENESIS_DATA.buses.map((b: any) => ({
      ...b,
      school_id: SCHOOL_ID,
      insuranceExpiry: new Date(b.insuranceExpiry)
    }))
  });

  // Seed books with new schema (quantity, available)
  for (const book of SOVEREIGN_GENESIS_DATA.books) {
    await prisma.book.create({
      data: {
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        status: book.status,
        school_id: SCHOOL_ID,
        quantity: 5,
        available: book.status === 'AVAILABLE' ? 5 : 4
      }
    });

    // Create BookLoan for issued books
    if (book.issuedTo) {
      const studentId = dummyIdToRealIdMap.get(book.issuedTo);
      if (studentId) {
        await prisma.bookLoan.create({
          data: {
            book_isbn: book.isbn,
            borrower_type: 'STUDENT',
            student_id: studentId,
            school_id: SCHOOL_ID,
            issue_date: new Date(),
            due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
            status: LoanStatus.ACTIVE
          }
        });
      }
    }
  }

  // =========================================================================
  // STEP 12: SEED INVOICES
  // =========================================================================
  console.log('💰 Seeding Invoices');
  for (const inv of SOVEREIGN_GENESIS_DATA.invoices) {
    const sId = dummyIdToRealIdMap.get(inv.student_id);
    if (sId) {
      await prisma.invoice.create({
        data: {
          student_id: sId,
          base_amount: inv.base_amount,
          discount_amount: inv.discount_amount,
          description: inv.description,
          due_date: new Date(inv.due_date),
          status: inv.status as InvoiceStatus,
          utr: inv.utr,
          school_id: SCHOOL_ID
        }
      });
    }
  }

  // =========================================================================
  // STEP 13: SEED MEDICAL & COUNSELING LOGS
  // =========================================================================
  console.log('🏥 Seeding Medical & Counseling Logs');
  for (const log of SOVEREIGN_GENESIS_DATA.medicalLogs) {
    const sId = dummyIdToRealIdMap.get(log.student_id);
    if (sId) {
      await prisma.medicalLog.create({
        data: {
          student_id: sId,
          time: new Date(log.time),
          issue: log.issue,
          action: log.action,
          school_id: SCHOOL_ID
        }
      });
    }
  }

  for (const session of SOVEREIGN_GENESIS_DATA.counseling) {
    const sId = dummyIdToRealIdMap.get(session.student_id);
    if (sId) {
      await prisma.counseling.create({
        data: {
          student_id: sId,
          category: session.category,
          note: session.note,
          date: new Date(session.date),
          school_id: SCHOOL_ID
        }
      });
    }
  }

  // =========================================================================
  // STEP 14: SEED SAMPLE ATTENDANCE
  // =========================================================================
  console.log('📋 Seeding Sample Attendance');
  const today = new Date();
  const firstStudent = SOVEREIGN_GENESIS_DATA.students[0];
  const firstStudentId = admissionNoToIdMap.get(firstStudent.admission_no);
  const principalId = staffNoToIdMap.get('STF_001');

  if (firstStudentId) {
    await prisma.attendance.create({
      data: {
        student_id: firstStudentId,
        date: today,
        status: AttendanceStatus.PRESENT,
        period: 0, // Daily summary
        school_id: SCHOOL_ID,
        marked_by: principalId,
        synced: true
      }
    });
  }

  // =========================================================================
  // STEP 15: SEED SAMPLE TIMETABLE
  // =========================================================================
  console.log('🗓️ Seeding Sample Timetable');
  const firstClassId = classStringToIdMap.get('10-A');
  const mathSubjectId = subjectCodeToIdMap.get('MATH');
  const mathTeacherId = staffNoToIdMap.get('STF_005');

  if (firstClassId && mathSubjectId) {
    await prisma.timetable.create({
      data: {
        id: 'tt_1',
        school_id: SCHOOL_ID,
        class_id: firstClassId,
        day_of_week: 1, // Monday
        start_time: '08:00',
        end_time: '08:45',
        subject_id: mathSubjectId,
        teacher_id: mathTeacherId
      }
    });
  }

  // =========================================================================
  // STEP 16: SEED SAMPLE EXAM & RESULTS
  // =========================================================================
  console.log('📝 Seeding Sample Exam & Results');
  const examId = 'exam_midterm_2025';
  await prisma.exam.create({
    data: {
      id: examId,
      school_id: SCHOOL_ID,
      name: 'Mid-Term Examination 2025',
      type: 'MIDTERM',
      start_date: new Date('2025-09-15'),
      end_date: new Date('2025-09-25')
    }
  });

  // Create result for first student
  if (firstStudentId && mathSubjectId) {
    const resultId = 'result_1';
    await prisma.result.create({
      data: {
        id: resultId,
        school_id: SCHOOL_ID,
        exam_id: examId,
        student_id: firstStudentId,
        total_percentage: 85.5,
        grade: 'A',
        remarks: 'Excellent performance'
      }
    });

    // Create ResultMark (normalized - no more JSON!)
    await prisma.resultMark.create({
      data: {
        school_id: SCHOOL_ID,
        result_id: resultId,
        subject_id: mathSubjectId,
        marks_obtained: 85,
        max_marks: 100,
        grade: 'A',
        remarks: 'Great work!'
      }
    });
  }

  console.log('✅ Seed Complete! New 3NF Schema fully populated.');
  console.log('📊 Summary:');
  console.log(`   - 1 School`);
  console.log(`   - 1 Academic Year`);
  console.log(`   - ${subjects.length} Subjects`);
  console.log(`   - ${uniqueClasses.length} Classes`);
  console.log(`   - ${SOVEREIGN_GENESIS_DATA.parents.length} Parents (with profiles)`);
  console.log(`   - ${SOVEREIGN_GENESIS_DATA.staff.length} Staff (with profiles & financials)`);
  console.log(`   - ${SOVEREIGN_GENESIS_DATA.students.length} Students (with enrollments)`);
}

main()
  .catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());