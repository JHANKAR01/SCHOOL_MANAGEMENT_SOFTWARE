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
  LoanStatus,
  LeaveType
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

// Import data from dummy-data.ts
import {
  SCHOOL_ID,
  ACADEMIC_YEAR_2025_ID,
  DUMMY_ACADEMIC_YEARS,
  DUMMY_SUBJECTS,
  DUMMY_CLASSES,
  DUMMY_CLASS_SUBJECTS,
  DUMMY_STAFF_USERS,
  DUMMY_STAFF_PROFILES,
  DUMMY_STAFF_FINANCIALS,
  DUMMY_STAFF_SUBJECTS,
  DUMMY_STAFF_CLASSES,
  DUMMY_STUDENT_USERS,
  DUMMY_STUDENTS,
  DUMMY_ENROLLMENTS,
  DUMMY_PARENT_USERS,
  DUMMY_PARENT_PROFILES,
  DUMMY_PARENT_STUDENT_LINKS,
  DUMMY_EXAMS,
  DUMMY_RESULTS,
  DUMMY_RESULT_MARKS,
  DUMMY_ATTENDANCE,
  DUMMY_BOOKS,
  DUMMY_BOOK_LOANS,
  DUMMY_INVOICES,
  DUMMY_TIMETABLE,
  DUMMY_BUSES,
  DUMMY_EXPENSES,

  DUMMY_HOMEWORK_TEMPLATES, // UPDATED
  DUMMY_LEAVE_BALANCE_TEMPLATES, // NEW
  DUMMY_LIVE_CLASSES,
  DUMMY_PAPERS,
  // DUMMY_SYLLABUS, // Removed Phase 5
  // DUMMY_SUBSTITUTIONS, // Removed Phase 5
  // Phase 5 New Data
  DUMMY_SYLLABUS_TOPICS,
  DUMMY_TOPIC_COMPLETIONS,
  DUMMY_SUBSTITUTIONS_NEW,
  DUMMY_NUDGE_LOGS,
  DUMMY_MEDICAL_LOGS,
  DUMMY_COUNSELING,
  DUMMY_HOSTEL_ROOMS,
  DUMMY_VISITORS,
  DUMMY_GATE_LOGS,
  DUMMY_INQUIRIES,
  DUMMY_LEAVE_APPLICATIONS,
  DUMMY_TICKETS,
  DUMMY_IDENTITY_DOCUMENTS,
} from './dummy-data.ts';

// ============================================================================
// DATABASE CONNECTION - Supabase SSL Config
// ============================================================================

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
const prisma = new PrismaClient({ adapter }) as unknown as PrismaClient;

// ============================================================================
// PART 1: MAIN FUNCTION - SETUP, CLEANUP & BASE TABLES
// ============================================================================

async function main() {
  console.log('🌱 Starting Sovereign Genesis Seed (3NF Schema) - Part 1: Setup & Base Tables');
  console.log('='.repeat(70));

  // =========================================================================
  // STEP 1: CLEAR EXISTING DATA (in correct FK order - children first)
  // =========================================================================
  console.log('\n🧹 STEP 1: Clearing existing data in FK-safe order...');

  // Delete in reverse FK order (child tables first)
  console.log('   └─ Clearing AuditLog...');
  await prisma.auditLog.deleteMany();

  console.log('   └─ Clearing NudgeLog...');
  await prisma.nudgeLog.deleteMany();

  console.log('   └─ Clearing Substitution...');
  await prisma.substitution.deleteMany();

  console.log('   └─ Clearing Timetable...');
  await prisma.timetable.deleteMany();

  console.log('   └─ Clearing Homework...');
  await prisma.homework.deleteMany();

  console.log('   └─ Clearing LiveClass...');
  await prisma.liveClass.deleteMany();

  console.log('   └─ Clearing Paper...');
  await prisma.paper.deleteMany();

  console.log('   └─ Clearing TopicCompletion...');
  await prisma.topicCompletion.deleteMany();

  console.log('   └─ Clearing SyllabusTopic...');
  await prisma.syllabusTopic.deleteMany();

  console.log('   └─ Clearing PaymentTransaction...');
  await prisma.paymentTransaction.deleteMany();

  console.log('   └─ Clearing InvoiceItem...');
  await prisma.invoiceItem.deleteMany();

  console.log('   └─ Clearing FeeStructure...');
  await prisma.feeStructure.deleteMany();

  console.log('   └─ Clearing TransportStop...');
  await prisma.transportStop.deleteMany();

  console.log('   └─ Clearing Bus...');
  await prisma.bus.deleteMany();

  console.log('   └─ Clearing TransportRoute...');
  await prisma.transportRoute.deleteMany();

  console.log('   └─ Clearing ResultMark...');
  await prisma.resultMark.deleteMany();

  console.log('   └─ Clearing Result...');
  await prisma.result.deleteMany();

  console.log('   └─ Clearing Exam...');
  await prisma.exam.deleteMany();

  console.log('   └─ Clearing BookLoan...');
  await prisma.bookLoan.deleteMany();

  console.log('   └─ Clearing Book...');
  await prisma.book.deleteMany();

  console.log('   └─ Clearing Attendance...');
  await prisma.attendance.deleteMany();

  console.log('   └─ Clearing Invoice...');
  await prisma.invoice.deleteMany();

  console.log('   └─ Clearing Expense...');
  await prisma.expense.deleteMany();

  console.log('   └─ Clearing Ticket...');
  await prisma.ticket.deleteMany();

  console.log('   └─ Clearing LeaveApplication...');
  await prisma.leaveApplication.deleteMany();

  console.log('   └─ Clearing LeaveBalance...');
  await prisma.leaveBalance.deleteMany();

  console.log('   └─ Clearing Inquiry...');
  await prisma.inquiry.deleteMany();

  console.log('   └─ Clearing GateLog...');
  await prisma.gateLog.deleteMany();

  console.log('   └─ Clearing Visitor...');
  await prisma.visitor.deleteMany();

  console.log('   └─ Clearing HostelRoom...');
  await prisma.hostelRoom.deleteMany();

  console.log('   └─ Clearing MedicalLog...');
  await prisma.medicalLog.deleteMany();

  console.log('   └─ Clearing Counseling...');
  await prisma.counseling.deleteMany();

  console.log('   └─ Clearing IdentityDocument...');
  await prisma.identityDocument.deleteMany();

  console.log('   └─ Clearing ParentStudent...');
  await prisma.parentStudent.deleteMany();

  console.log('   └─ Clearing ParentProfile...');
  await prisma.parentProfile.deleteMany();

  console.log('   └─ Clearing StudentEnrollment...');
  await prisma.studentEnrollment.deleteMany();

  console.log('   └─ Clearing StaffClass...');
  await prisma.staffClass.deleteMany();

  console.log('   └─ Clearing StaffSubject...');
  await prisma.staffSubject.deleteMany();

  console.log('   └─ Clearing StaffFinancial...');
  await prisma.staffFinancial.deleteMany();

  console.log('   └─ Clearing StaffProfile...');
  await prisma.staffProfile.deleteMany();





  console.log('   └─ Clearing ClassSubject...');
  await prisma.classSubject.deleteMany();

  console.log('   └─ Clearing Class...');
  await prisma.class.deleteMany();

  console.log('   └─ Clearing Subject...');
  await prisma.subject.deleteMany();

  console.log('   └─ Clearing AcademicYear...');
  await prisma.academicYear.deleteMany();

  console.log('   └─ Clearing Student...');
  await prisma.student.deleteMany();

  console.log('   └─ Clearing User...');
  await prisma.user.deleteMany();

  console.log('   └─ Clearing Bus...');
  await prisma.bus.deleteMany();

  console.log('   └─ Clearing SystemSettings...');
  await prisma.systemSettings.deleteMany();

  console.log('   └─ Clearing School...');
  await prisma.school.deleteMany();

  console.log('   ✅ All tables cleared successfully!');

  // =========================================================================
  // STEP 2: SEED SCHOOL
  // =========================================================================
  console.log('\n🏫 STEP 2: Seeding School...');
  await prisma.school.create({
    data: {
      id: SCHOOL_ID,
      name: 'Sovereign High School',
      settings_json: {
        theme: 'sovereign-blue',
        timezone: 'Asia/Kolkata',
        academicYearStart: 'April',
        schoolMotto: 'Excellence Through Knowledge',
        affiliation: 'CBSE',
        establishedYear: 2010,
        // IMPORTANT: Feature flags - controls which modules are enabled
        features: {
          fees: true,
          transport: true,
          attendance: true,
          library: true,
          hostel: true
        },
        billing_cycle: 'custom'
      },
      status: 'ACTIVE'
    }
  });
  console.log('   ✅ School created: Sovereign High School (ID: ' + SCHOOL_ID + ')');


  // =========================================================================
  // STEP 3: SEED SYSTEM SETTINGS
  // =========================================================================
  console.log('\n⚙️ STEP 3: Seeding System Settings...');
  await prisma.systemSettings.create({
    data: {
      school_id: SCHOOL_ID,
      locked_roles: [],
      low_data_mode: false,
      announcement_ticker: 'Welcome to Sovereign High School - Academic Year 2025-2026!'
    }
  });
  console.log('   ✅ System settings created for school');

  // =========================================================================
  // STEP 4: SEED ACADEMIC YEARS
  // =========================================================================
  console.log('\n📅 STEP 4: Seeding Academic Years...');
  for (const year of DUMMY_ACADEMIC_YEARS) {
    await prisma.academicYear.create({
      data: {
        id: year.id,
        school_id: year.school_id,
        name: year.name,
        start_date: year.start_date,
        end_date: year.end_date,
        is_current: year.is_current
      }
    });
    console.log(`   └─ Created: ${year.name} ${year.is_current ? '(CURRENT)' : ''}`);
  }
  console.log(`   ✅ ${DUMMY_ACADEMIC_YEARS.length} academic years seeded`);

  // =========================================================================
  // =========================================================================
  // PART 2: STAFF & ACADEMIC STRUCTURE
  // =========================================================================
  // =========================================================================

  console.log('\n' + '='.repeat(70));
  console.log('🎯 PART 2: Staff & Academic Structure');
  console.log('='.repeat(70));

  // Use pre-computed password hash for all users (password: password123)
  // This hash is: $2a$10$kLh8IArLCS1JOqeUcMFre.D1Gtq2.d1mn5/Rq3H9hE5n.kcIYe0Tq
  const hashedPassword = '$2a$10$kLh8IArLCS1JOqeUcMFre.D1Gtq2.d1mn5/Rq3H9hE5n.kcIYe0Tq';
  console.log('\n🔐 Using pre-computed password hash for all users');

  // Maps to track created IDs for later steps
  const staffUserIdMap = new Map<string, string>(); // dummy ID -> real DB ID
  const staffProfileIdMap = new Map<string, string>(); // user ID -> profile ID

  // =========================================================================
  // STEP 5: SEED STAFF USERS
  // =========================================================================
  console.log('\n👨‍🏫 STEP 5: Seeding Staff Users...');

  const staffUserData = DUMMY_STAFF_USERS.map(staffUser => ({
    id: staffUser.id,
    name: staffUser.name,
    email: staffUser.email,
    phone: staffUser.phone,
    password_hash: hashedPassword,
    role: staffUser.role,
    department: staffUser.department,
    school_id: staffUser.school_id
  }));

  const staffUsersResult = await prisma.user.createMany({
    data: staffUserData,
    skipDuplicates: true
  });

  // Restore map population for consistency
  DUMMY_STAFF_USERS.forEach(u => staffUserIdMap.set(u.id, u.id));
  console.log(`   ✅ ${staffUsersResult.count} staff users created`);

  // =========================================================================
  // STEP 6: SEED STAFF PROFILES
  // =========================================================================
  console.log('\n📋 STEP 6: Seeding Staff Profiles...');

  const staffProfileData = DUMMY_STAFF_PROFILES.map(profile => ({
    id: profile.id,
    user_id: profile.user_id,
    school_id: profile.school_id,
    employee_id: profile.employee_id,
    designation: profile.designation,
    department: profile.department,
    employment_type: profile.employment_type,
    joining_date: profile.joining_date,
    qualification: profile.qualification,
    experience_years: profile.experience_years,
    date_of_birth: profile.date_of_birth,
    gender: profile.gender,
    blood_group: profile.blood_group,
    address_line1: profile.address_line1,
    city: profile.city,
    state: profile.state,
    pincode: profile.pincode,
    aadhaar_number: profile.aadhaar_number,
    pan_number: profile.pan_number,
    emergency_contact_name: profile.emergency_contact_name,
    emergency_contact_phone: profile.emergency_contact_phone,
    status: profile.status
  }));

  const staffProfilesResult = await prisma.staffProfile.createMany({
    data: staffProfileData,
    skipDuplicates: true
  });

  DUMMY_STAFF_PROFILES.forEach(p => staffProfileIdMap.set(p.user_id, p.id));
  DUMMY_STAFF_PROFILES.forEach(p => staffProfileIdMap.set(p.user_id, p.id));
  console.log(`   ✅ ${staffProfilesResult.count} staff profiles created`);

  // =========================================================================
  // STEP 6b: SEED LEAVE BALANCES
  // =========================================================================
  console.log('\n🍃 STEP 6b: Seeding Leave Balances...');

  const leaveBalanceData = [];
  for (const profile of DUMMY_STAFF_PROFILES) {
    for (const template of DUMMY_LEAVE_BALANCE_TEMPLATES) {
      leaveBalanceData.push({
        staff_profile_id: profile.id,
        school_id: SCHOOL_ID,
        academic_year_id: ACADEMIC_YEAR_2025_ID,
        leave_type: template.type,
        total_allowed: template.total,
        used: template.used
      });
    }
  }

  const leaveBalanceResult = await prisma.leaveBalance.createMany({
    data: leaveBalanceData,
    skipDuplicates: true
  });
  console.log(`   ✅ ${leaveBalanceResult.count} leave balance records created`);

  // =========================================================================
  // STEP 7: SEED STAFF FINANCIALS
  // =========================================================================
  console.log('\n💰 STEP 7: Seeding Staff Financials...');

  const staffFinancialData = DUMMY_STAFF_FINANCIALS.map(financial => ({
    id: financial.id,
    staff_profile_id: financial.staff_profile_id,
    school_id: financial.school_id,
    salary_grade: financial.salary_grade,
    basic_salary: financial.basic_salary,
    hra: financial.hra,
    allowances: financial.allowances,
    deductions: financial.deductions,
    bank_name: financial.bank_name,
    bank_account_no: financial.bank_account_no,
    ifsc_code: financial.ifsc_code
  }));

  const staffFinancialsResult = await prisma.staffFinancial.createMany({
    data: staffFinancialData,
    skipDuplicates: true
  });
  console.log(`   ✅ ${staffFinancialsResult.count} staff financial records created`);

  // =========================================================================
  // STEP 8: SEED SUBJECTS
  // =========================================================================
  console.log('\n� STEP 8: Seeding Subjects...');

  for (const subject of DUMMY_SUBJECTS) {
    await prisma.subject.create({
      data: {
        id: subject.id,
        school_id: subject.school_id,
        code: subject.code,
        name: subject.name,
        is_optional: subject.is_optional
      }
    });
  }
  console.log(`   ✅ ${DUMMY_SUBJECTS.length} subjects created`);

  // =========================================================================
  // STEP 9: SEED CLASSES
  // =========================================================================
  console.log('\n🏛️ STEP 9: Seeding Classes...');

  for (const cls of DUMMY_CLASSES) {
    await prisma.class.create({
      data: {
        id: cls.id,
        school_id: cls.school_id,
        academic_year_id: cls.academic_year_id,
        grade: cls.grade,
        section: cls.section,
        capacity: cls.capacity,
        class_teacher_id: cls.class_teacher_id // Already linked from dummy-data
      }
    });
  }
  console.log(`   ✅ ${DUMMY_CLASSES.length} classes created`);

  // =========================================================================
  // STEP 10: SEED CLASS-SUBJECT LINKS
  // =========================================================================
  console.log('\n🔗 STEP 10: Seeding Class-Subject Links...');

  for (const csLink of DUMMY_CLASS_SUBJECTS) {
    await prisma.classSubject.create({
      data: {
        id: csLink.id,
        school_id: csLink.school_id,
        class_id: csLink.class_id,
        subject_id: csLink.subject_id
      }
    });
  }
  console.log(`   ✅ ${DUMMY_CLASS_SUBJECTS.length} class-subject links created`);

  // =========================================================================
  // STEP 11: SEED STAFF-SUBJECT ASSIGNMENTS
  // =========================================================================
  console.log('\n📖 STEP 11: Seeding Staff-Subject Assignments...');

  for (const ss of DUMMY_STAFF_SUBJECTS) {
    await prisma.staffSubject.create({
      data: {
        id: ss.id,
        school_id: ss.school_id,
        staff_profile_id: ss.staff_profile_id,
        subject_id: ss.subject_id,
        is_primary: ss.is_primary
      }
    });
  }
  console.log(`   ✅ ${DUMMY_STAFF_SUBJECTS.length} staff-subject assignments created`);

  // =========================================================================
  // STEP 12: SEED STAFF-CLASS ASSIGNMENTS
  // =========================================================================
  console.log('\n🎓 STEP 12: Seeding Staff-Class Assignments...');

  for (const sc of DUMMY_STAFF_CLASSES) {
    await prisma.staffClass.create({
      data: {
        id: sc.id,
        school_id: sc.school_id,
        staff_profile_id: sc.staff_profile_id,
        class_id: sc.class_id,
        role: sc.role
      }
    });
  }
  console.log(`   ✅ ${DUMMY_STAFF_CLASSES.length} staff-class assignments created`);

  // =========================================================================
  // =========================================================================
  // PART 3: STUDENTS & ENROLLMENTS (THE HEAVY PART)
  // =========================================================================
  // =========================================================================

  console.log('\n' + '='.repeat(70));
  console.log('🎯 PART 3: Students & Enrollments (~2000 records)');
  console.log('='.repeat(70));

  // =========================================================================
  // STEP 13: SEED STUDENT USERS (Bulk Insert with createMany)
  // =========================================================================
  console.log('\n� STEP 13: Seeding Student Users (using createMany for performance)...');
  console.log(`   └─ Preparing ${DUMMY_STUDENT_USERS.length} student user records...`);

  // Prepare student user data with hashed passwords
  const studentUserData = DUMMY_STUDENT_USERS.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    password_hash: hashedPassword, // Reuse the same hash for all students
    role: user.role,
    school_id: user.school_id
  }));

  // Bulk insert student users
  const studentUsersResult = await prisma.user.createMany({
    data: studentUserData,
    skipDuplicates: true
  });
  console.log(`   ✅ ${studentUsersResult.count} student users created`);

  // =========================================================================
  // STEP 14: SEED STUDENTS (Bulk Insert with createMany)
  // =========================================================================
  console.log('\n🎓 STEP 14: Seeding Students (using createMany for performance)...');
  console.log(`   └─ Preparing ${DUMMY_STUDENTS.length} student records...`);

  // Prepare student data
  const studentData = DUMMY_STUDENTS.map(student => ({
    id: student.id,
    admission_no: student.admission_no,
    name: student.name,
    email: student.email,
    school_id: student.school_id,
    user_id: student.user_id,
    // Demographics
    gender: student.gender,
    date_of_birth: student.date_of_birth,
    father_name: student.father_name,
    mother_name: student.mother_name,
    guardian_name: student.guardian_name,
    blood_group: student.blood_group,
    nationality: student.nationality,
    religion: student.religion,
    category: student.category,
    caste: student.caste,
    mother_tongue: student.mother_tongue,
    // Contact
    phone: student.phone,
    alternate_phone: student.alternate_phone,
    emergency_contact_name: student.emergency_contact_name,
    emergency_contact_phone: student.emergency_contact_phone,
    // Address
    address_line1: student.address_line1,
    address_line2: student.address_line2,
    city: student.city,
    state: student.state,
    pincode: student.pincode,
    // Identity
    aadhaar_number: student.aadhaar_number,
    birth_certificate_no: student.birth_certificate_no,
    // Previous Education
    previous_school: student.previous_school,
    transfer_certificate_no: student.transfer_certificate_no,
    // Status
    status: student.status,
    admission_date: student.admission_date,
    leaving_date: student.leaving_date,
    leaving_reason: student.leaving_reason
  }));

  // Bulk insert students
  const studentsResult = await prisma.student.createMany({
    data: studentData,
    skipDuplicates: true
  });
  console.log(`   ✅ ${studentsResult.count} students created`);

  // =========================================================================
  // STEP 15: SEED STUDENT ENROLLMENTS (Critical - Roll Numbers!)
  // =========================================================================
  console.log('\n📝 STEP 15: Seeding Student Enrollments (using createMany)...');
  console.log(`   └─ Preparing ${DUMMY_ENROLLMENTS.length} enrollment records...`);
  console.log('   └─ This links students to classes with roll numbers...');

  // Prepare enrollment data - this is where roll_number lives!
  const enrollmentData = DUMMY_ENROLLMENTS.map(enrollment => ({
    id: enrollment.id,
    school_id: enrollment.school_id,
    student_id: enrollment.student_id,
    class_id: enrollment.class_id,
    academic_year_id: enrollment.academic_year_id,
    roll_number: enrollment.roll_number,
    status: enrollment.status,
    promoted_from_id: enrollment.promoted_from_id
  }));

  // Bulk insert enrollments
  const enrollmentsResult = await prisma.studentEnrollment.createMany({
    data: enrollmentData,
    skipDuplicates: true
  });
  console.log(`   ✅ ${enrollmentsResult.count} student enrollments created`);

  // =========================================================================
  // STEP 15b: AUTO-ENROLL FIX (Ensure all students are in a class)
  // =========================================================================
  console.log('\n🔧 STEP 15b: Auto-Enrolling Unassigned Students...');

  const allSeededStudents = await prisma.student.findMany({ select: { id: true, admission_no: true, school_id: true } });
  const allEnrollments = await prisma.studentEnrollment.findMany({ select: { student_id: true } });
  const enrolledStudentIds = new Set(allEnrollments.map(e => e.student_id));

  const unEnrolledStudents = allSeededStudents.filter(s => !enrolledStudentIds.has(s.id));

  if (unEnrolledStudents.length > 0) {
    const defaultClass = await prisma.class.findFirst();
    const currentAY = await prisma.academicYear.findFirst({ where: { is_current: true } });

    if (defaultClass && currentAY) {
      console.log(`   └─ Enrolling ${unEnrolledStudents.length} students into ${defaultClass.grade}-${defaultClass.section}...`);

      await prisma.studentEnrollment.createMany({
        data: unEnrolledStudents.map(s => ({
          id: `enr_auto_${s.id}`,
          student_id: s.id,
          class_id: defaultClass.id,
          academic_year_id: currentAY.id,
          roll_number: parseInt(s.admission_no || '0'),
          status: 'ACTIVE',
          school_id: s.school_id
        })),
        skipDuplicates: true
      });
      console.log('   ✅ Auto-enrollment complete');
    } else {
      console.warn('   ⚠️ Could not auto-enroll: Missing Class or Academic Year');
    }
  } else {
    console.log('   ✅ All students are already enrolled');
  }

  // =========================================================================
  // =========================================================================
  // PART 4: PARENTS, RESULTS & OPERATIONS (FINAL)
  // =========================================================================
  // =========================================================================

  console.log('\n' + '='.repeat(70));
  console.log('🎯 PART 4: Parents, Results & Operations (Final)');
  console.log('='.repeat(70));

  // =========================================================================
  // STEP 16: SEED PARENT USERS
  // =========================================================================
  console.log('\n👨‍👩‍👧 STEP 16: Seeding Parent Users...');

  const parentUserData = DUMMY_PARENT_USERS.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    password_hash: hashedPassword,
    role: user.role,
    school_id: user.school_id
  }));

  const parentUsersResult = await prisma.user.createMany({
    data: parentUserData,
    skipDuplicates: true
  });
  console.log(`   ✅ ${parentUsersResult.count} parent users created`);

  // =========================================================================
  // STEP 17: SEED PARENT PROFILES
  // =========================================================================
  console.log('\n📋 STEP 17: Seeding Parent Profiles...');

  const parentProfileData = DUMMY_PARENT_PROFILES.map(profile => ({
    id: profile.id,
    user_id: profile.user_id,
    school_id: profile.school_id,
    date_of_birth: profile.date_of_birth,
    gender: profile.gender,
    occupation: profile.occupation,
    organization: profile.organization,
    annual_income: profile.annual_income,
    qualification: profile.qualification,
    alternate_phone: profile.alternate_phone,
    office_phone: profile.office_phone,
    address_line1: profile.address_line1,
    address_line2: profile.address_line2,
    city: profile.city,
    state: profile.state,
    pincode: profile.pincode,
    aadhaar_number: profile.aadhaar_number,
    is_emergency_contact: profile.is_emergency_contact
  }));

  const parentProfilesResult = await prisma.parentProfile.createMany({
    data: parentProfileData,
    skipDuplicates: true
  });
  console.log(`   ✅ ${parentProfilesResult.count} parent profiles created`);

  // =========================================================================
  // STEP 18: LINK PARENTS & STUDENTS
  // =========================================================================
  console.log('\n🔗 STEP 18: Linking Parents & Students...');

  const parentStudentData = DUMMY_PARENT_STUDENT_LINKS.map(link => ({
    parent_id: link.parent_id,
    student_id: link.student_id,
    school_id: link.school_id,
    relation: link.relation,
    is_primary: link.is_primary,
    can_pickup: link.can_pickup,
    has_custody: link.has_custody
  }));

  const parentStudentResult = await prisma.parentStudent.createMany({
    data: parentStudentData,
    skipDuplicates: true
  });
  console.log(`   ✅ ${parentStudentResult.count} parent-student links created`);

  // =========================================================================
  // STEP 19: SEED EXAMS
  // =========================================================================
  console.log('\n📝 STEP 19: Seeding Exams...');

  for (const exam of DUMMY_EXAMS) {
    await prisma.exam.create({
      data: {
        id: exam.id,
        school_id: exam.school_id,
        name: exam.name,
        type: exam.type,
        start_date: exam.start_date,
        end_date: exam.end_date
      }
    });
  }
  console.log(`   ✅ ${DUMMY_EXAMS.length} exams created`);

  // =========================================================================
  // STEP 20: SEED RESULTS
  // =========================================================================
  console.log('\n📊 STEP 20: Seeding Results...');

  const resultData = DUMMY_RESULTS.map(result => ({
    id: result.id,
    school_id: result.school_id,
    exam_id: result.exam_id,
    student_id: result.student_id,
    total_percentage: result.total_percentage,
    grade: result.grade,
    remarks: result.remarks
  }));

  const resultsResult = await prisma.result.createMany({
    data: resultData,
    skipDuplicates: true
  });
  console.log(`   ✅ ${resultsResult.count} results created`);

  // =========================================================================
  // STEP 21: SEED RESULT MARKS (Normalized - No more JSON!)
  // =========================================================================
  console.log('\n📈 STEP 21: Seeding Result Marks (normalized subject marks)...');
  console.log(`   └─ This is the new normalized table replacing JSON...`);

  const resultMarkData = DUMMY_RESULT_MARKS.map(mark => ({
    id: mark.id,
    school_id: mark.school_id,
    result_id: mark.result_id,
    subject_id: mark.subject_id,
    marks_obtained: mark.marks_obtained,
    max_marks: mark.max_marks,
    grade: mark.grade,
    remarks: mark.remarks
  }));

  const resultMarksResult = await prisma.resultMark.createMany({
    data: resultMarkData,
    skipDuplicates: true
  });
  console.log(`   ✅ ${resultMarksResult.count} result marks created`);

  // =========================================================================
  // STEP 22: SEED ATTENDANCE
  // =========================================================================
  console.log('\n📋 STEP 22: Seeding Attendance...');

  const attendanceData = DUMMY_ATTENDANCE.map(att => ({
    student_id: att.student_id,
    date: att.date,
    status: att.status,
    period: att.period,
    synced: att.synced,
    school_id: att.school_id,
    marked_by: att.marked_by
  }));

  const attendanceResult = await prisma.attendance.createMany({
    data: attendanceData,
    skipDuplicates: true
  });
  console.log(`   ✅ ${attendanceResult.count} attendance records created`);

  // =========================================================================
  // STEP 23: SEED BOOKS
  // =========================================================================
  console.log('\n📚 STEP 23: Seeding Books...');

  const bookData = DUMMY_BOOKS.map(book => ({
    isbn: book.isbn,
    title: book.title,
    author: book.author,
    status: book.status,
    school_id: book.school_id,
    quantity: book.quantity,
    available: book.available
  }));

  const booksResult = await prisma.book.createMany({
    data: bookData,
    skipDuplicates: true
  });
  console.log(`   ✅ ${booksResult.count} books created`);

  // =========================================================================
  // STEP 24: SEED BOOK LOANS
  // =========================================================================
  console.log('\n📖 STEP 24: Seeding Book Loans...');

  const bookLoanData = DUMMY_BOOK_LOANS.map(loan => ({
    id: loan.id,
    book_isbn: loan.book_isbn,
    borrower_type: loan.borrower_type,
    student_id: loan.student_id,
    user_id: loan.user_id,
    school_id: loan.school_id,
    issue_date: loan.issue_date,
    due_date: loan.due_date,
    return_date: loan.return_date,
    fine_amount: loan.fine_amount,
    fine_paid: loan.fine_paid,
    status: loan.status
  }));

  const bookLoansResult = await prisma.bookLoan.createMany({
    data: bookLoanData,
    skipDuplicates: true
  });
  console.log(`   ✅ ${bookLoansResult.count} book loans created`);

  // =========================================================================
  // =========================================================================
  // STEP 25: SEED SMART FINANCE (V2) - WITH HISTORY
  // =========================================================================
  console.log('\n💵 STEP 25: Seeding Smart Finance (Ledger System) with Historical Data...');

  // Helper to subtract months safely
  const subMonths = (date: Date, months: number) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() - months);
    return d;
  };

  // 1. Create Master Fee Structures
  console.log('   └─ Creating Fee Structures...');
  const tuitionFee = await prisma.feeStructure.create({
    data: {
      school_id: SCHOOL_ID,
      academic_year_id: ACADEMIC_YEAR_2025_ID,
      name: 'Grade 10 Tuition Fee (Annual)',
      amount: 25000,
      category: 'TUITION',
      frequency: 'YEARLY'
    }
  });

  const transportFee = await prisma.feeStructure.create({
    data: {
      school_id: SCHOOL_ID,
      academic_year_id: ACADEMIC_YEAR_2025_ID,
      name: 'Bus Route A (Q1)',
      amount: 6000,
      category: 'TRANSPORT',
      frequency: 'QUARTERLY'
    }
  });

  const fineFee = await prisma.feeStructure.create({
    data: {
      school_id: SCHOOL_ID,
      academic_year_id: ACADEMIC_YEAR_2025_ID,
      name: 'Late Payment Fine',
      amount: 500,
      category: 'MISC',
      frequency: 'ONE_TIME'
    }
  });

  // 2. Generate Invoices & Transactions with HISTORY
  console.log('   └─ Generating Invoices & Transactions (Spread over 6 months)...');

  const allStudents = await prisma.student.findMany({
    where: { school_id: SCHOOL_ID },
    take: 50
  });

  let financeCount = 0;

  for (const [index, student] of allStudents.entries()) {
    const isGoodPayer = index < 30;
    const isPartialPayer = index >= 30 && index < 40;
    const isDefaulter = index >= 40;

    // RANDOMIZE DATE: Spread transactions over last 6 months
    const monthsAgo = Math.floor(Math.random() * 6);
    const transactionDate = subMonths(new Date(), monthsAgo);

    // Invoice created 5 days before transaction
    const invoiceDate = new Date(transactionDate);
    invoiceDate.setDate(invoiceDate.getDate() - 5);

    // Create Invoice (Demand) with backdated creation
    const invoice = await prisma.invoice.create({
      data: {
        school_id: SCHOOL_ID,
        student_id: student.id,
        academic_year_id: ACADEMIC_YEAR_2025_ID,
        due_date: new Date('2025-04-10'),
        total_amount: tuitionFee.amount,
        balance_amount: tuitionFee.amount,
        amount_paid: 0,
        status: 'PENDING',
        created_at: invoiceDate, // BACKDATED
        items: {
          create: {
            title: tuitionFee.name,
            amount: tuitionFee.amount,
            fee_structure_id: tuitionFee.id
          }
        }
      }
    });

    // Create Transactions (Collection)
    if (isGoodPayer) {
      await prisma.paymentTransaction.create({
        data: {
          school_id: SCHOOL_ID,
          invoice_id: invoice.id,
          student_id: student.id,
          amount: tuitionFee.amount,
          mode: Math.random() > 0.5 ? 'UPI' : 'BANK_TRANSFER',
          date: transactionDate, // BACKDATED
          remarks: 'Full Payment',
          reference_no: `TXN${Math.floor(Math.random() * 1000000)}`
        }
      });
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'PAID', amount_paid: tuitionFee.amount, balance_amount: 0 }
      });
    }
    else if (isPartialPayer) {
      const paid = tuitionFee.amount * 0.4;
      await prisma.paymentTransaction.create({
        data: {
          school_id: SCHOOL_ID,
          invoice_id: invoice.id,
          student_id: student.id,
          amount: paid,
          mode: 'CASH',
          date: transactionDate, // BACKDATED
          remarks: 'First Installment',
          reference_no: `RCPT${Math.floor(Math.random() * 1000000)}`
        }
      });
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'PARTIAL', amount_paid: paid, balance_amount: tuitionFee.amount - paid }
      });
    }
    else if (isDefaulter) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'OVERDUE' }
      });
    }
    financeCount++;
  }
  console.log(`   ✅ Processed finance records for ${financeCount} students`);

  // =========================================================================
  // STEP 26: SEED BUSES
  // =========================================================================
  // =========================================================================
  // STEP 25b: SEED TRANSPORT ROUTES
  // =========================================================================
  console.log('\n🛣️ STEP 25b: Seeding Transport Routes...');

  const routes = [
    { id: 'R-01', name: 'Route 1 - North Zone', start_point: 'City Center', end_point: 'North Campus' },
    { id: 'R-02', name: 'Route 2 - South Zone', start_point: 'Old City', end_point: 'South Campus' },
    { id: 'R-03', name: 'Route 3 - East Zone', start_point: 'Station', end_point: 'East Campus' },
    { id: 'R-04', name: 'Route 4 - West Zone', start_point: 'Airport Road', end_point: 'West Campus' },
    { id: 'R-05', name: 'Route 5 - Central Zone', start_point: 'Market', end_point: 'Central Campus' },
  ];

  for (const route of routes) {
    await prisma.transportRoute.create({
      data: {
        id: route.id,
        school_id: SCHOOL_ID,
        name: route.name,
        start_point: route.start_point,
        end_point: route.end_point
      }
    });
  }
  console.log(`   ✅ ${routes.length} transport routes created`);

  // =========================================================================
  // STEP 26: SEED BUSES
  // =========================================================================
  console.log('\n🚌 STEP 26: Seeding Buses...');

  const busData = DUMMY_BUSES.map(bus => ({
    id: bus.id,
    plateNumber: bus.plateNumber,
    driverName: bus.driverName,
    capacity: bus.capacity,
    route_id: bus.routeId,
    insuranceExpiry: bus.insuranceExpiry,
    school_id: bus.school_id
  }));

  const busesResult = await prisma.bus.createMany({
    data: busData,
    skipDuplicates: true
  });
  console.log(`   ✅ ${busesResult.count} buses created`);

  // =========================================================================
  // STEP 27: SEED TIMETABLE
  // =========================================================================
  console.log('\n🗓️ STEP 27: Seeding Timetable...');

  for (const tt of DUMMY_TIMETABLE) {
    await prisma.timetable.create({
      data: {
        id: tt.id,
        school_id: tt.school_id,
        class_id: tt.class_id,
        day_of_week: tt.day_of_week,
        start_time: tt.start_time,
        end_time: tt.end_time,
        period: tt.period, // ADDED
        subject_id: tt.subject_id,
        teacher_id: tt.teacher_id
      }
    });
  }
  console.log(`   ✅ ${DUMMY_TIMETABLE.length} timetable entries created`);

  // =========================================================================
  // =========================================================================
  // PART 5: OPERATIONAL DATA (15 New Tables)
  // =========================================================================
  // =========================================================================

  console.log('\n' + '='.repeat(70));
  console.log('🎯 PART 5: Operational Data (15 Tables)');
  console.log('='.repeat(70));

  // =========================================================================
  // STEP 28: SEED EXPENSES
  // =========================================================================
  console.log('\n💸 STEP 28: Seeding Expenses...');

  const expensesResult = await prisma.expense.createMany({
    data: DUMMY_EXPENSES.map(exp => ({
      id: exp.id,
      school_id: exp.school_id,
      category: exp.category,
      amount: exp.amount,
      description: exp.description,
      date: exp.date
    })),
    skipDuplicates: true
  });
  console.log(`   ✅ ${expensesResult.count} expenses created`);

  // =========================================================================
  // STEP 29: SEED HOMEWORK
  // =========================================================================
  console.log('\n📝 STEP 29: Seeding Homework (Dynamic)...');

  // Find a teacher to assign homework to (e.g., the first Maths teacher or just a generic one)
  // We'll use the 'Teacher' created in DUMMY_STAFF_USERS or just pick one with StaffClass assignments
  const activeClasses = DUMMY_CLASSES.slice(0, 5); // Pick first 5 classes
  let homeworkCount = 0;

  for (const cls of activeClasses) {
    // Find a subject for this class (pick the first one)
    const classSubject = DUMMY_CLASS_SUBJECTS.find(cs => cs.class_id === cls.id);
    if (!classSubject) continue;

    for (const template of DUMMY_HOMEWORK_TEMPLATES) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + template.due_days_offset);

      await prisma.homework.create({
        data: {
          id: `hw_dyn_${homeworkCount + 1}`,
          school_id: SCHOOL_ID,
          class_id: cls.id,
          subject_id: classSubject.subject_id,
          title: template.title,
          description: template.description,
          due_date: dueDate,
          status: template.status,
          created_at: new Date(dueDate.getTime() - 7 * 24 * 60 * 60 * 1000) // 1 week before
        } as any
      });
      homeworkCount++;
    }
  }

  console.log(`   ✅ ${homeworkCount} homework assignments created`);

  // =========================================================================
  // STEP 30: SEED LIVE CLASSES
  // =========================================================================
  console.log('\n📹 STEP 30: Seeding Live Classes...');

  const liveClassResult = await prisma.liveClass.createMany({
    data: DUMMY_LIVE_CLASSES.map(lc => ({
      id: lc.id,
      school_id: lc.school_id,
      subject_id: lc.subject_id,
      class_id: lc.class_id,
      teacher_id: lc.teacher_id,
      meeting_link: lc.meeting_link,
      is_active: lc.is_active,
      start_time: lc.start_time
    })),
    skipDuplicates: true
  });
  console.log(`   ✅ ${liveClassResult.count} live classes created`);

  // =========================================================================
  // STEP 31: SEED PAPERS
  // =========================================================================
  console.log('\n📄 STEP 31: Seeding Papers...');

  const papersResult = await prisma.paper.createMany({
    data: DUMMY_PAPERS.map(p => ({
      id: p.id,
      school_id: p.school_id,
      title: p.title,
      subject_id: p.subject_id,
      class_id: p.class_id,
      status: p.status,
      created_at: p.created_at
    })),
    skipDuplicates: true
  });
  console.log(`   ✅ ${papersResult.count} papers created`);

  // =========================================================================
  // STEP 32: SEED SYLLABUS TOPICS (Phase 5)
  // =========================================================================
  console.log('\n📚 STEP 32: Seeding Syllabus Topics (Master Plan)...');

  const syllabusTopicsResult = await prisma.syllabusTopic.createMany({
    data: DUMMY_SYLLABUS_TOPICS.map(topic => ({
      id: topic.id,
      school_id: topic.school_id,
      title: topic.title,
      description: topic.description,
      order: topic.order,
      estimatedHours: topic.estimatedHours,
      classId: topic.classId,
      subjectId: topic.subjectId,
    })),
    skipDuplicates: true
  });
  console.log(`   ✅ ${syllabusTopicsResult.count} syllabus topics created`);

  // =========================================================================
  // STEP 33: SEED TOPIC COMPLETIONS (Phase 5)
  // =========================================================================
  console.log('\n✅ STEP 33: Seeding Topic Completions (Progress)...');

  const topicCompletionsResult = await prisma.topicCompletion.createMany({
    data: DUMMY_TOPIC_COMPLETIONS.map(tc => ({
      id: tc.id,
      status: tc.status,
      completedAt: tc.completedAt,
      classId: tc.classId,
      section: tc.section,
      topicId: tc.topicId,
      markedById: tc.markedById,
      school_id: tc.school_id
    })),
    skipDuplicates: true
  });
  console.log(`   ✅ ${topicCompletionsResult.count} topic completions marked`);

  // =========================================================================
  // STEP 33b: SEED SUBSTITUTIONS (Phase 5)
  // =========================================================================
  console.log('\n🔄 STEP 33b: Seeding Substitutions...');

  const substitutionsResult = await prisma.substitution.createMany({
    data: DUMMY_SUBSTITUTIONS_NEW.map(sub => ({
      id: sub.id,
      school_id: sub.school_id,
      date: sub.date,
      period: sub.period,
      status: sub.status,
      reason: sub.reason,
      originalTeacherId: sub.originalTeacherId,
      substituteTeacherId: sub.substituteTeacherId,
      classId: sub.classId,
      section: sub.section,
      subjectId: sub.subjectId,
      // timetableId is optional and not in dummy data
    })),
    skipDuplicates: true
  });
  console.log(`   ✅ ${substitutionsResult.count} substitutions created`);

  // =========================================================================
  // STEP 33c: SEED NUDGE LOGS (Phase 5)
  // =========================================================================
  console.log('\n🔔 STEP 33c: Seeding Nudge Logs...');

  const nudgeLogsResult = await prisma.nudgeLog.createMany({
    data: DUMMY_NUDGE_LOGS.map(nudge => ({
      id: nudge.id,
      school_id: nudge.school_id,
      type: nudge.type,
      message: nudge.message,
      senderId: nudge.senderId,
      receiverId: nudge.receiverId,
      isRead: nudge.isRead,
    })),
    skipDuplicates: true
  });
  console.log(`   ✅ ${nudgeLogsResult.count} nudge logs created`);

  // =========================================================================
  // STEP 34: SEED MEDICAL LOGS
  // =========================================================================
  console.log('\n🏥 STEP 34: Seeding Medical Logs...');

  const medicalLogsResult = await prisma.medicalLog.createMany({
    data: DUMMY_MEDICAL_LOGS.map(log => ({
      id: log.id,
      student_id: log.student_id,
      time: log.time,
      issue: log.issue,
      action: log.action,
      school_id: log.school_id
    })),
    skipDuplicates: true
  });
  console.log(`   ✅ ${medicalLogsResult.count} medical logs created`);

  // =========================================================================
  // STEP 35: SEED COUNSELING
  // =========================================================================
  console.log('\n🧠 STEP 35: Seeding Counseling Sessions...');

  const counselingResult = await prisma.counseling.createMany({
    data: DUMMY_COUNSELING.map(c => ({
      id: c.id,
      student_id: c.student_id,
      category: c.category,
      note: c.note,
      date: c.date,
      school_id: c.school_id
    })),
    skipDuplicates: true
  });
  console.log(`   ✅ ${counselingResult.count} counseling sessions created`);

  // =========================================================================
  // STEP 36: SEED HOSTEL ROOMS
  // =========================================================================
  console.log('\n🛏️ STEP 36: Seeding Hostel Rooms...');

  const hostelRoomsResult = await prisma.hostelRoom.createMany({
    data: DUMMY_HOSTEL_ROOMS.map(r => ({
      id: r.id,
      school_id: r.school_id,
      room_number: r.room_number,
      student_id: r.student_id,
      capacity: r.capacity,
      created_at: r.created_at
    })),
    skipDuplicates: true
  });
  console.log(`   ✅ ${hostelRoomsResult.count} hostel rooms created`);

  // =========================================================================
  // STEP 37: SEED VISITORS
  // =========================================================================
  console.log('\n👋 STEP 37: Seeding Visitors...');

  // Visitors use auto-increment ID, so we don't pass id
  for (const visitor of DUMMY_VISITORS) {
    await prisma.visitor.create({
      data: {
        school_id: visitor.school_id,
        name: visitor.name,
        student_id: visitor.student_id,
        purpose: visitor.purpose,
        status: visitor.status,
        time: visitor.time
      }
    });
  }
  console.log(`   ✅ ${DUMMY_VISITORS.length} visitors created`);

  // =========================================================================
  // STEP 38: SEED GATE LOGS
  // =========================================================================
  console.log('\n🚪 STEP 38: Seeding Gate Logs...');

  // GateLogs use auto-increment ID, so we don't pass id
  for (const log of DUMMY_GATE_LOGS) {
    await prisma.gateLog.create({
      data: {
        school_id: log.school_id,
        person_type: log.person_type,
        person_id: log.person_id,
        name: log.name,
        purpose: log.purpose,
        status: log.status,
        entry_time: log.entry_time,
        exit_time: log.exit_time
      }
    });
  }
  console.log(`   ✅ ${DUMMY_GATE_LOGS.length} gate logs created`);

  // =========================================================================
  // STEP 39: SEED INQUIRIES
  // =========================================================================
  console.log('\n❓ STEP 39: Seeding Inquiries...');

  // Inquiries use auto-increment ID, so we don't pass id
  for (const inquiry of DUMMY_INQUIRIES) {
    await prisma.inquiry.create({
      data: {
        school_id: inquiry.school_id,
        parent_name: inquiry.parent_name,
        phone: inquiry.phone,
        target_class: inquiry.target_class,
        status: inquiry.status,
        created_at: inquiry.created_at
      }
    });
  }
  console.log(`   ✅ ${DUMMY_INQUIRIES.length} inquiries created`);

  // =========================================================================
  // STEP 40: SEED LEAVE APPLICATIONS
  // =========================================================================
  console.log('\n🏖️ STEP 40: Seeding Leave Applications...');

  const leaveResult = await prisma.leaveApplication.createMany({
    data: DUMMY_LEAVE_APPLICATIONS.map(l => ({
      id: l.id,
      school_id: l.school_id,
      user_id: l.user_id,
      type: l.type,
      start_date: l.start_date,
      end_date: l.end_date,
      reason: l.reason,
      status: l.status,
      created_at: l.created_at
    })),
    skipDuplicates: true
  });
  console.log(`   ✅ ${leaveResult.count} leave applications created`);

  // =========================================================================
  // STEP 41: SEED TICKETS
  // =========================================================================
  console.log('\n🎫 STEP 41: Seeding Tickets...');

  const ticketsResult = await prisma.ticket.createMany({
    data: DUMMY_TICKETS.map(t => ({
      id: t.id,
      school_id: t.school_id,
      location: t.location,
      issue: t.issue,
      priority: t.priority,
      status: t.status,
      reported_by: t.reported_by,
      created_at: t.created_at
    })),
    skipDuplicates: true
  });
  console.log(`   ✅ ${ticketsResult.count} tickets created`);

  // =========================================================================
  // STEP 42: SEED IDENTITY DOCUMENTS
  // =========================================================================
  console.log('\n📑 STEP 42: Seeding Identity Documents...');

  const idDocsResult = await prisma.identityDocument.createMany({
    data: DUMMY_IDENTITY_DOCUMENTS.map(doc => ({
      id: doc.id,
      owner_user_id: doc.owner_user_id,
      owner_student_id: doc.owner_student_id,
      doc_type: doc.doc_type,
      file_ref: doc.file_ref,
      masked_id: doc.masked_id,
      verification_status: doc.verification_status,
      school_id: doc.school_id,
      created_at: doc.created_at
    })),
    skipDuplicates: true
  });
  console.log(`   ✅ ${idDocsResult.count} identity documents created`);

  // =========================================================================
  // =========================================================================
  // SEED COMPLETE - FINAL SUMMARY
  // =========================================================================
  // =========================================================================
  console.log('\n\n' + '🎉'.repeat(35));
  console.log('='.repeat(70));
  console.log('✅ SOVEREIGN GENESIS SEED COMPLETE!');
  console.log('='.repeat(70));
  console.log('🎉'.repeat(35));

  console.log('\n📊 FINAL COUNTS:');
  console.log('─'.repeat(50));

  console.log('\n🏫 ORGANIZATION:');
  console.log('   ├─ 1 School');
  console.log('   ├─ 1 System Settings');
  console.log(`   └─ ${DUMMY_ACADEMIC_YEARS.length} Academic Years`);

  console.log('\n👨‍🏫 STAFF & STRUCTURE:');
  console.log(`   ├─ ${DUMMY_STAFF_USERS.length} Staff Users`);
  console.log(`   ├─ ${DUMMY_STAFF_PROFILES.length} Staff Profiles`);
  console.log(`   ├─ ${DUMMY_STAFF_FINANCIALS.length} Staff Financials`);
  console.log(`   ├─ ${DUMMY_SUBJECTS.length} Subjects`);
  console.log(`   ├─ ${DUMMY_CLASSES.length} Classes`);
  console.log(`   ├─ ${DUMMY_CLASS_SUBJECTS.length} Class-Subject Links`);
  console.log(`   ├─ ${DUMMY_STAFF_SUBJECTS.length} Staff-Subject Assignments`);
  console.log(`   └─ ${DUMMY_STAFF_CLASSES.length} Staff-Class Assignments`);

  console.log('\n🎓 STUDENTS:');
  console.log(`   ├─ ${studentUsersResult.count} Student Users`);
  console.log(`   ├─ ${studentsResult.count} Students`);
  console.log(`   └─ ${enrollmentsResult.count} Enrollments`);

  console.log('\n👨‍👩‍👧 PARENTS:');
  console.log(`   ├─ ${parentUsersResult.count} Parent Users`);
  console.log(`   ├─ ${parentProfilesResult.count} Parent Profiles`);
  console.log(`   └─ ${parentStudentResult.count} Parent-Student Links`);

  console.log('\n📝 ACADEMICS:');
  console.log(`   ├─ ${DUMMY_EXAMS.length} Exams`);
  console.log(`   ├─ ${resultsResult.count} Results`);
  console.log(`   ├─ ${resultMarksResult.count} Result Marks`);
  console.log(`   ├─ ${attendanceResult.count} Attendance Records`);
  console.log(`   ├─ ${homeworkCount} Homework Assignments`);
  console.log(`   ├─ ${liveClassResult.count} Live Classes`);
  console.log(`   ├─ ${papersResult.count} Exam Papers`);
  console.log(`   ├─ ${syllabusTopicsResult.count} Syllabus Topics`);
  console.log(`   └─ ${topicCompletionsResult.count} Topic Completions`);

  console.log('\n📚 LIBRARY & FINANCE:');
  console.log(`   ├─ ${booksResult.count} Books`);
  console.log(`   ├─ ${bookLoansResult.count} Book Loans`);
  console.log(`   ├─ ${financeCount} Invoices`);
  console.log(`   └─ ${expensesResult.count} Expenses`);

  console.log('\n🚌 LOGISTICS:');
  console.log(`   ├─ ${busesResult.count} Buses`);
  console.log(`   ├─ ${DUMMY_TIMETABLE.length} Timetable Entries`);
  console.log(`   └─ ${substitutionsResult.count} Substitutions`);

  console.log('\n🏥 HEALTH & WELFARE:');
  console.log(`   ├─ ${medicalLogsResult.count} Medical Logs`);
  console.log(`   ├─ ${counselingResult.count} Counseling Sessions`);
  console.log(`   └─ ${hostelRoomsResult.count} Hostel Rooms`);

  console.log('\n🚪 OPERATIONS:');
  console.log(`   ├─ ${DUMMY_VISITORS.length} Visitors`);
  console.log(`   ├─ ${DUMMY_GATE_LOGS.length} Gate Logs`);
  console.log(`   ├─ ${DUMMY_INQUIRIES.length} Inquiries`);
  console.log(`   ├─ ${leaveResult.count} Leave Applications`);
  console.log(`   ├─ ${ticketsResult.count} Tickets`);
  console.log(`   └─ ${idDocsResult.count} Identity Documents`);

  console.log('\n' + '─'.repeat(50));
  console.log('🔐 TEST CREDENTIALS:');
  console.log('   ├─ ALL accounts use the same password hash');
  console.log('   ├─ Password: password123');
  console.log('   └─ Hash: $2a$10$kLh8IArLCS1JOqeUcMFre.D1Gtq2.d1mn5/Rq3H9hE5n.kcIYe0Tq');
  console.log('─'.repeat(50));

  console.log('\n✅ Database is ready for development!');
}

// ============================================================================
// EXECUTE
// ============================================================================

main()
  .catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());