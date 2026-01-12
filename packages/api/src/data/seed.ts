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
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

// Import data from dummy-data.ts
import {
  SCHOOL_ID,
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
const prisma = new PrismaClient({ adapter });

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

  console.log('   └─ Clearing Timetable...');
  await prisma.timetable.deleteMany();

  console.log('   └─ Clearing Homework...');
  await prisma.homework.deleteMany();

  console.log('   └─ Clearing LiveClass...');
  await prisma.liveClass.deleteMany();

  console.log('   └─ Clearing Paper...');
  await prisma.paper.deleteMany();

  console.log('   └─ Clearing Syllabus...');
  await prisma.syllabus.deleteMany();

  console.log('   └─ Clearing Substitution...');
  await prisma.substitution.deleteMany();

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
        establishedYear: 2010
      }
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
      lockdown_mode: false,
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

  // Hash the default password once (reused for all staff)
  const hashedPassword = await bcrypt.hash('password123', 10);
  console.log('\n🔐 Generated password hash for "password123"');

  // Maps to track created IDs for later steps
  const staffUserIdMap = new Map<string, string>(); // dummy ID -> real DB ID
  const staffProfileIdMap = new Map<string, string>(); // user ID -> profile ID

  // =========================================================================
  // STEP 5: SEED STAFF USERS
  // =========================================================================
  console.log('\n👨‍🏫 STEP 5: Seeding Staff Users...');

  for (const staffUser of DUMMY_STAFF_USERS) {
    // Hash specific passwords for known accounts, default for others
    let passwordHash = hashedPassword;
    if (staffUser.password !== 'password123') {
      passwordHash = await bcrypt.hash(staffUser.password, 10);
    }

    const createdUser = await prisma.user.create({
      data: {
        id: staffUser.id,
        name: staffUser.name,
        email: staffUser.email,
        phone: staffUser.phone,
        password_hash: passwordHash,
        role: staffUser.role,
        department: staffUser.department,
        school_id: staffUser.school_id
      }
    });
    staffUserIdMap.set(staffUser.id, createdUser.id);
  }
  console.log(`   ✅ ${DUMMY_STAFF_USERS.length} staff users created`);

  // =========================================================================
  // STEP 6: SEED STAFF PROFILES
  // =========================================================================
  console.log('\n📋 STEP 6: Seeding Staff Profiles...');

  for (const profile of DUMMY_STAFF_PROFILES) {
    const createdProfile = await prisma.staffProfile.create({
      data: {
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
      }
    });
    staffProfileIdMap.set(profile.user_id, createdProfile.id);
  }
  console.log(`   ✅ ${DUMMY_STAFF_PROFILES.length} staff profiles created`);

  // =========================================================================
  // STEP 7: SEED STAFF FINANCIALS
  // =========================================================================
  console.log('\n💰 STEP 7: Seeding Staff Financials...');

  for (const financial of DUMMY_STAFF_FINANCIALS) {
    await prisma.staffFinancial.create({
      data: {
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
      }
    });
  }
  console.log(`   ✅ ${DUMMY_STAFF_FINANCIALS.length} staff financial records created`);

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
  // STEP 25: SEED INVOICES
  // =========================================================================
  console.log('\n💵 STEP 25: Seeding Invoices...');

  const invoiceData = DUMMY_INVOICES.map(inv => ({
    student_id: inv.student_id,
    base_amount: inv.base_amount,
    discount_amount: inv.discount_amount,
    description: inv.description,
    due_date: inv.due_date,
    status: inv.status,
    utr: inv.utr,
    school_id: inv.school_id
  }));

  const invoicesResult = await prisma.invoice.createMany({
    data: invoiceData,
    skipDuplicates: true
  });
  console.log(`   ✅ ${invoicesResult.count} invoices created`);

  // =========================================================================
  // STEP 26: SEED BUSES
  // =========================================================================
  console.log('\n🚌 STEP 26: Seeding Buses...');

  const busData = DUMMY_BUSES.map(bus => ({
    id: bus.id,
    plateNumber: bus.plateNumber,
    driverName: bus.driverName,
    capacity: bus.capacity,
    routeId: bus.routeId,
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
        subject_id: tt.subject_id,
        teacher_id: tt.teacher_id
      }
    });
  }
  console.log(`   ✅ ${DUMMY_TIMETABLE.length} timetable entries created`);

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
  console.log(`   └─ ${attendanceResult.count} Attendance Records`);

  console.log('\n📚 LIBRARY & FINANCE:');
  console.log(`   ├─ ${booksResult.count} Books`);
  console.log(`   ├─ ${bookLoansResult.count} Book Loans`);
  console.log(`   └─ ${invoicesResult.count} Invoices`);

  console.log('\n🚌 LOGISTICS:');
  console.log(`   ├─ ${busesResult.count} Buses`);
  console.log(`   └─ ${DUMMY_TIMETABLE.length} Timetable Entries`);

  console.log('\n' + '─'.repeat(50));
  console.log('🔐 TEST CREDENTIALS:');
  console.log('   ├─ Super Admin: super@sovereign.edu / SuperAdmin@123');
  console.log('   ├─ School Admin: admin@sovereign.edu / Admin@123');
  console.log('   ├─ Finance: finance@sovereign.edu / Finance@123');
  console.log('   └─ All Others: [email] / password123');
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