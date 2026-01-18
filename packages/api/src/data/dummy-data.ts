/**
 * DUMMY DATA GENERATOR - Large Scale School Management System
 * 
 * Generates ~1920 students, 48 classes, ~100 staff programmatically.
 * All PII is masked. Passwords are plaintext (hashed by seed.ts).
 * 
 * Test Credentials:
 * - Super Admin: super@sovereign.edu / SuperAdmin@123
 * - School Admin: admin@sovereign.edu / Admin@123
 * - Finance: finance@sovereign.edu / Finance@123
 * - All generated users: password123
 */

import {
  UserRole,
  Section,
  StudentStatus,
  StaffStatus,
  EnrollmentStatus,
  LoanStatus,
  InvoiceStatus,
  AttendanceStatus,
  ExamType,
  HomeworkStatus,
  SyllabusStatus,
  TicketPriority,
  TicketStatus,
} from '@prisma/client';

// ============================================================================
// CONSTANTS
// ============================================================================

export const SCHOOL_ID = 'sch_123';
const SEED_RNG = 42;

// Academic year IDs
export const ACADEMIC_YEAR_2024_ID = 'ay_2024_2025';
export const ACADEMIC_YEAR_2025_ID = 'ay_2025_2026';

// ============================================================================
// SEEDED RANDOM NUMBER GENERATOR (Reproducible)
// ============================================================================

let rngState = SEED_RNG;

function seededRandom(): number {
  rngState = (rngState * 1103515245 + 12345) & 0x7fffffff;
  return rngState / 0x7fffffff;
}

function resetRng(): void {
  rngState = SEED_RNG;
}

function randomInt(min: number, max: number): number {
  return Math.floor(seededRandom() * (max - min + 1)) + min;
}

function randomFromArray<T>(arr: readonly T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

// ============================================================================
// NAME DATA POOLS (Common Indian Names)
// ============================================================================

const FIRST_NAMES_MALE = [
  'Aarav', 'Vihaan', 'Aditya', 'Sai', 'Arjun', 'Reyansh', 'Ayaan', 'Krishna',
  'Ishaan', 'Shaurya', 'Atharva', 'Vivaan', 'Pranav', 'Dhruv', 'Kabir', 'Rudra',
  'Ansh', 'Darsh', 'Advait', 'Rishi', 'Arnav', 'Dev', 'Rohan', 'Karan', 'Yash',
  'Rahul', 'Amit', 'Vikram', 'Suresh', 'Rajesh', 'Manish', 'Anil', 'Sanjay',
  'Gaurav', 'Nikhil', 'Akash', 'Vishal', 'Deepak', 'Pankaj', 'Mohit'
];

const FIRST_NAMES_FEMALE = [
  'Saanvi', 'Aanya', 'Aadhya', 'Ananya', 'Pari', 'Diya', 'Isha', 'Kiara',
  'Myra', 'Sara', 'Anika', 'Navya', 'Avni', 'Prisha', 'Riya', 'Anvi',
  'Shanaya', 'Kavya', 'Tara', 'Nisha', 'Pooja', 'Priya', 'Neha', 'Swati',
  'Meera', 'Anjali', 'Shruti', 'Sneha', 'Kritika', 'Divya', 'Komal', 'Simran',
  'Tanvi', 'Bhavna', 'Rekha', 'Sunita', 'Geeta', 'Suman', 'Kiran', 'Lata'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Reddy', 'Rao',
  'Joshi', 'Shah', 'Mehta', 'Agarwal', 'Mishra', 'Dubey', 'Trivedi', 'Pandey',
  'Chopra', 'Kapoor', 'Malhotra', 'Bhatia', 'Iyer', 'Nair', 'Menon', 'Pillai',
  'Das', 'Roy', 'Bose', 'Sen', 'Mukherjee', 'Banerjee', 'Chatterjee', 'Ghosh',
  'Desai', 'Patil', 'Kulkarni', 'Jain', 'Saxena', 'Srivastava', 'Tiwari', 'Yadav'
];

const CITIES = ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Dewas', 'Rewa'];
const STATES = ['Madhya Pradesh', 'Maharashtra', 'Gujarat', 'Rajasthan', 'Delhi', 'Uttar Pradesh'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS'];
const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain'];
const OCCUPATIONS = ['Business', 'Government Service', 'Private Job', 'Doctor', 'Engineer', 'Teacher', 'Farmer', 'Lawyer'];
const INCOME_BRACKETS = ['Below 2L', '2-5L', '5-10L', '10-20L', 'Above 20L'];
const QUALIFICATIONS = ['10th', '12th', 'Graduate', 'Post Graduate', 'PhD'];
const BANK_NAMES = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank'];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function generateId(prefix: string, index: number): string {
  return `${prefix}_${index.toString().padStart(4, '0')}`;
}

export function generateStudentName(index: number): { name: string; gender: string } {
  const isMale = index % 2 === 0;
  const firstName = isMale
    ? FIRST_NAMES_MALE[index % FIRST_NAMES_MALE.length]
    : FIRST_NAMES_FEMALE[index % FIRST_NAMES_FEMALE.length];
  const lastName = LAST_NAMES[(index * 7) % LAST_NAMES.length];
  return {
    name: `${firstName} ${lastName}`,
    gender: isMale ? 'Male' : 'Female'
  };
}

export function generateStaffName(index: number, isMale: boolean = true): string {
  const firstName = isMale
    ? FIRST_NAMES_MALE[index % FIRST_NAMES_MALE.length]
    : FIRST_NAMES_FEMALE[index % FIRST_NAMES_FEMALE.length];
  const lastName = LAST_NAMES[(index * 3) % LAST_NAMES.length];
  return `${firstName} ${lastName}`;
}

export function generateEmail(name: string, domain: string): string {
  const sanitized = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '');
  return `${sanitized}@${domain}`;
}

export function generateAdmissionNo(year: number, index: number): string {
  return `${year}-${index.toString().padStart(4, '0')}`;
}

export function generateEmployeeId(index: number): string {
  return `EMP${index.toString().padStart(4, '0')}`;
}

export function generatePhone(index: number): string {
  const base = 9876500000 + (index * 17) % 100000;
  return `+91${base}`;
}

export function generateMaskedAadhaar(index: number): string {
  const last4 = ((index * 1234) % 10000).toString().padStart(4, '0');
  return `XXXX-XXXX-${last4}`;
}

export function generateMaskedPAN(index: number): string {
  const digits = ((index * 5678) % 10000).toString().padStart(4, '0');
  return `XXXXX${digits}X`;
}

export function generateMaskedBankAccount(index: number): string {
  const last4 = ((index * 9012) % 10000).toString().padStart(4, '0');
  return `XXXXXXXXX${last4}`;
}

export function generatePincode(index: number): string {
  return `462${(index % 100).toString().padStart(3, '0')}`;
}

export function generateAddress(index: number): { line1: string; line2: string; city: string; state: string; pincode: string } {
  return {
    line1: `${100 + index}, Block ${String.fromCharCode(65 + (index % 26))}`,
    line2: `Sector ${(index % 50) + 1}`,
    city: CITIES[index % CITIES.length],
    state: STATES[index % STATES.length],
    pincode: generatePincode(index)
  };
}

export function generateDOB(baseYear: number, index: number): Date {
  const year = baseYear - (index % 3);
  const month = index % 12;
  const day = (index % 28) + 1;
  return new Date(year, month, day);
}

export function spreadTimestamp(baseDate: Date, index: number, totalCount: number): Date {
  const daysSpread = 180; // Spread across 6 months
  const offset = Math.floor((index / totalCount) * daysSpread);
  const result = new Date(baseDate);
  result.setDate(result.getDate() + offset);
  return result;
}

// ============================================================================
// GRADE & SECTION HELPERS
// ============================================================================

const GRADES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const SECTIONS: Section[] = [Section.A, Section.B, Section.C, Section.D];

export function getGradeIndex(grade: string): number {
  return GRADES.indexOf(grade);
}

export function getSectionIndex(section: Section): number {
  return SECTIONS.indexOf(section);
}

export function calculateBaseYear(grade: string): number {
  const gradeNum = parseInt(grade);
  // Students in grade 1 are ~6 years old, grade 12 are ~17 years old
  // For 2025 academic year
  return 2019 - gradeNum;
}

// ============================================================================
// PART 2: ACADEMIC STRUCTURE
// ============================================================================

// --- Academic Years ---
export interface DummyAcademicYear {
  id: string;
  school_id: string;
  name: string;
  start_date: Date;
  end_date: Date;
  is_current: boolean;
}

export const DUMMY_ACADEMIC_YEARS: DummyAcademicYear[] = [
  {
    id: ACADEMIC_YEAR_2024_ID,
    school_id: SCHOOL_ID,
    name: '2024-2025',
    start_date: new Date('2024-04-01'),
    end_date: new Date('2025-03-31'),
    is_current: false
  },
  {
    id: ACADEMIC_YEAR_2025_ID,
    school_id: SCHOOL_ID,
    name: '2025-2026',
    start_date: new Date('2025-04-01'),
    end_date: new Date('2026-03-31'),
    is_current: true
  }
];

// --- Subjects ---
export interface DummySubject {
  id: string;
  school_id: string;
  code: string;
  name: string;
  is_optional: boolean;
}

export const DUMMY_SUBJECTS: DummySubject[] = [
  { id: 'sub_math', school_id: SCHOOL_ID, code: 'MATH', name: 'Mathematics', is_optional: false },
  { id: 'sub_eng', school_id: SCHOOL_ID, code: 'ENG', name: 'English', is_optional: false },
  { id: 'sub_hin', school_id: SCHOOL_ID, code: 'HIN', name: 'Hindi', is_optional: false },
  { id: 'sub_sci', school_id: SCHOOL_ID, code: 'SCI', name: 'General Science', is_optional: false },
  { id: 'sub_sst', school_id: SCHOOL_ID, code: 'SST', name: 'Social Studies', is_optional: false },
  { id: 'sub_phy', school_id: SCHOOL_ID, code: 'PHY', name: 'Physics', is_optional: false },
  { id: 'sub_chem', school_id: SCHOOL_ID, code: 'CHEM', name: 'Chemistry', is_optional: false },
  { id: 'sub_bio', school_id: SCHOOL_ID, code: 'BIO', name: 'Biology', is_optional: false },
  { id: 'sub_hist', school_id: SCHOOL_ID, code: 'HIST', name: 'History', is_optional: false },
  { id: 'sub_geo', school_id: SCHOOL_ID, code: 'GEO', name: 'Geography', is_optional: false },
  { id: 'sub_eco', school_id: SCHOOL_ID, code: 'ECO', name: 'Economics', is_optional: true },
  { id: 'sub_acc', school_id: SCHOOL_ID, code: 'ACC', name: 'Accountancy', is_optional: true },
  { id: 'sub_cs', school_id: SCHOOL_ID, code: 'CS', name: 'Computer Science', is_optional: true },
  { id: 'sub_pe', school_id: SCHOOL_ID, code: 'PE', name: 'Physical Education', is_optional: true },
  { id: 'sub_art', school_id: SCHOOL_ID, code: 'ART', name: 'Art & Craft', is_optional: true },
];

// --- Classes (48 total: Grades 1-12 x Sections A-D) ---
export interface DummyClass {
  id: string;
  school_id: string;
  academic_year_id: string;
  grade: string;
  section: Section;
  capacity: number;
  class_teacher_id: string | null;
}

function generateClasses(): DummyClass[] {
  const classes: DummyClass[] = [];
  let classIndex = 0;

  for (const grade of GRADES) {
    for (const section of SECTIONS) {
      classes.push({
        id: `cls_${grade}_${section}`,
        school_id: SCHOOL_ID,
        academic_year_id: ACADEMIC_YEAR_2025_ID,
        grade,
        section,
        capacity: 40,
        class_teacher_id: `usr_staff_${(classIndex % 48) + 1}`.padStart(13, '0').replace('usr_staff_', 'usr_staff_') // Will link later
      });
      classIndex++;
    }
  }
  return classes;
}

export const DUMMY_CLASSES: DummyClass[] = generateClasses();

// --- Class-Subject Links ---
export interface DummyClassSubject {
  id: string;
  school_id: string;
  class_id: string;
  subject_id: string;
}

function generateClassSubjects(): DummyClassSubject[] {
  const links: DummyClassSubject[] = [];
  let linkIndex = 0;

  // Primary (1-5): MATH, ENG, HIN, SCI, SST, PE, ART
  const primarySubjects = ['sub_math', 'sub_eng', 'sub_hin', 'sub_sci', 'sub_sst', 'sub_pe', 'sub_art'];
  // Middle (6-8): Add GEO, HIST, CS
  const middleSubjects = ['sub_math', 'sub_eng', 'sub_hin', 'sub_sci', 'sub_sst', 'sub_geo', 'sub_hist', 'sub_cs', 'sub_pe'];
  // Secondary (9-10): PHY, CHEM, BIO, MATH, ENG, HIN, SST, CS, PE
  const secondarySubjects = ['sub_math', 'sub_eng', 'sub_hin', 'sub_phy', 'sub_chem', 'sub_bio', 'sub_sst', 'sub_cs', 'sub_pe'];
  // Senior (11-12): PHY, CHEM, BIO/ACC, MATH, ENG, ECO, CS, PE
  const seniorSubjects = ['sub_math', 'sub_eng', 'sub_phy', 'sub_chem', 'sub_bio', 'sub_eco', 'sub_acc', 'sub_cs', 'sub_pe'];

  for (const cls of DUMMY_CLASSES) {
    const gradeNum = parseInt(cls.grade);
    let subjects: string[];

    if (gradeNum <= 5) subjects = primarySubjects;
    else if (gradeNum <= 8) subjects = middleSubjects;
    else if (gradeNum <= 10) subjects = secondarySubjects;
    else subjects = seniorSubjects;

    for (const subjectId of subjects) {
      links.push({
        id: generateId('csub', linkIndex++),
        school_id: SCHOOL_ID,
        class_id: cls.id,
        subject_id: subjectId
      });
    }
  }
  return links;
}

export const DUMMY_CLASS_SUBJECTS: DummyClassSubject[] = generateClassSubjects();

// ============================================================================
// PART 2: STAFF DATA (~100 staff)
// ============================================================================

// --- Staff User Accounts ---
export interface DummyStaffUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  password: string; // Plaintext, hashed by seed.ts
  role: UserRole;
  department: string | null;
  school_id: string;
}

// --- Staff Profiles ---
export interface DummyStaffProfile {
  id: string;
  user_id: string;
  school_id: string;
  employee_id: string;
  designation: string;
  department: string | null;
  employment_type: string;
  joining_date: Date;
  qualification: string;
  experience_years: number;
  date_of_birth: Date;
  gender: string;
  blood_group: string;
  address_line1: string;
  city: string;
  state: string;
  pincode: string;
  aadhaar_number: string;
  pan_number: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  status: StaffStatus;
}

// --- Staff Financials ---
export interface DummyStaffFinancial {
  id: string;
  staff_profile_id: string;
  school_id: string;
  salary_grade: string;
  basic_salary: number;
  hra: number;
  allowances: number;
  deductions: number;
  bank_name: string;
  bank_account_no: string;
  ifsc_code: string;
}

// Staff role distribution
const STAFF_ROLES: { role: UserRole; count: number; department: string; designation: string; salaryGrade: string; baseSalary: number }[] = [
  { role: UserRole.SUPER_ADMIN, count: 1, department: 'IT', designation: 'System Administrator', salaryGrade: 'S', baseSalary: 100000 },
  { role: UserRole.SCHOOL_ADMIN, count: 2, department: 'Administration', designation: 'School Administrator', salaryGrade: 'A', baseSalary: 80000 },
  { role: UserRole.PRINCIPAL, count: 1, department: 'Administration', designation: 'Principal', salaryGrade: 'A+', baseSalary: 120000 },
  { role: UserRole.VICE_PRINCIPAL, count: 1, department: 'Administration', designation: 'Vice Principal', salaryGrade: 'A', baseSalary: 90000 },
  { role: UserRole.HOD, count: 6, department: 'Academics', designation: 'Head of Department', salaryGrade: 'B+', baseSalary: 65000 },
  { role: UserRole.TEACHER, count: 60, department: 'Academics', designation: 'Teacher', salaryGrade: 'B', baseSalary: 45000 },
  { role: UserRole.ACCOUNTANT, count: 2, department: 'Finance', designation: 'Accountant', salaryGrade: 'C', baseSalary: 40000 },
  { role: UserRole.FINANCE_MANAGER, count: 1, department: 'Finance', designation: 'Finance Manager', salaryGrade: 'B', baseSalary: 55000 },
  { role: UserRole.LIBRARIAN, count: 2, department: 'Library', designation: 'Librarian', salaryGrade: 'C', baseSalary: 35000 },
  { role: UserRole.NURSE, count: 2, department: 'Medical', designation: 'School Nurse', salaryGrade: 'C', baseSalary: 32000 },
  { role: UserRole.COUNSELOR, count: 2, department: 'Wellness', designation: 'Counselor', salaryGrade: 'B', baseSalary: 45000 },
  { role: UserRole.RECEPTIONIST, count: 2, department: 'Front Desk', designation: 'Receptionist', salaryGrade: 'D', baseSalary: 25000 },
  { role: UserRole.SECURITY_HEAD, count: 1, department: 'Security', designation: 'Security Head', salaryGrade: 'C', baseSalary: 35000 },
  { role: UserRole.IT_ADMIN, count: 2, department: 'IT', designation: 'IT Administrator', salaryGrade: 'B', baseSalary: 50000 },
  { role: UserRole.WARDEN, count: 2, department: 'Hostel', designation: 'Hostel Warden', salaryGrade: 'C', baseSalary: 38000 },
  { role: UserRole.FLEET_MANAGER, count: 1, department: 'Transport', designation: 'Fleet Manager', salaryGrade: 'C', baseSalary: 40000 },
  { role: UserRole.INVENTORY_MANAGER, count: 1, department: 'Stores', designation: 'Inventory Manager', salaryGrade: 'C', baseSalary: 38000 },
  { role: UserRole.ESTATE_MANAGER, count: 1, department: 'Facilities', designation: 'Estate Manager', salaryGrade: 'B', baseSalary: 50000 },
  { role: UserRole.EXAM_CELL, count: 2, department: 'Exams', designation: 'Exam Controller', salaryGrade: 'B', baseSalary: 45000 },
  { role: UserRole.ADMISSIONS_OFFICER, count: 2, department: 'Admissions', designation: 'Admissions Officer', salaryGrade: 'C', baseSalary: 38000 },
];

function generateStaffData(): {
  users: DummyStaffUser[];
  profiles: DummyStaffProfile[];
  financials: DummyStaffFinancial[];
} {
  const users: DummyStaffUser[] = [];
  const profiles: DummyStaffProfile[] = [];
  const financials: DummyStaffFinancial[] = [];

  let staffIndex = 0;
  const baseDate = new Date('2025-04-01');

  // Known admin accounts first
  const knownAccounts = [
    { email: 'super@sovereign.edu', password: 'SuperAdmin@123', role: UserRole.SUPER_ADMIN, name: 'Super Administrator' },
    { email: 'admin@sovereign.edu', password: 'Admin@123', role: UserRole.SCHOOL_ADMIN, name: 'School Administrator' },
    { email: 'finance@sovereign.edu', password: 'Finance@123', role: UserRole.FINANCE_MANAGER, name: 'Finance Manager' },
    { email: 'accountant@sovereign.edu', password: 'Acc@123', role: UserRole.ACCOUNTANT, name: 'Head Accountant' },
  ];

  for (const account of knownAccounts) {
    staffIndex++;
    const userId = `usr_staff_${staffIndex.toString().padStart(4, '0')}`;
    const profileId = `sp_${staffIndex.toString().padStart(4, '0')}`;
    const isMale = staffIndex % 2 === 0;
    const addr = generateAddress(staffIndex);
    const roleInfo = STAFF_ROLES.find(r => r.role === account.role) || STAFF_ROLES[0];

    users.push({
      id: userId,
      name: account.name,
      email: account.email,
      phone: generatePhone(staffIndex + 1000),
      password: account.password,
      role: account.role,
      department: roleInfo.department,
      school_id: SCHOOL_ID
    });

    profiles.push({
      id: profileId,
      user_id: userId,
      school_id: SCHOOL_ID,
      employee_id: generateEmployeeId(staffIndex),
      designation: roleInfo.designation,
      department: roleInfo.department,
      employment_type: 'Permanent',
      joining_date: new Date('2020-04-01'),
      qualification: 'Post Graduate',
      experience_years: 10 + (staffIndex % 10),
      date_of_birth: new Date(1975 + (staffIndex % 15), staffIndex % 12, (staffIndex % 28) + 1),
      gender: isMale ? 'Male' : 'Female',
      blood_group: BLOOD_GROUPS[staffIndex % BLOOD_GROUPS.length],
      address_line1: addr.line1,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      aadhaar_number: generateMaskedAadhaar(staffIndex + 5000),
      pan_number: generateMaskedPAN(staffIndex + 5000),
      emergency_contact_name: `Emergency Contact ${staffIndex}`,
      emergency_contact_phone: generatePhone(staffIndex + 2000),
      status: StaffStatus.ACTIVE
    });

    financials.push({
      id: `sf_${staffIndex.toString().padStart(4, '0')}`,
      staff_profile_id: profileId,
      school_id: SCHOOL_ID,
      salary_grade: roleInfo.salaryGrade,
      basic_salary: roleInfo.baseSalary,
      hra: roleInfo.baseSalary * 0.2,
      allowances: roleInfo.baseSalary * 0.1,
      deductions: roleInfo.baseSalary * 0.12,
      bank_name: BANK_NAMES[staffIndex % BANK_NAMES.length],
      bank_account_no: generateMaskedBankAccount(staffIndex + 5000),
      ifsc_code: 'SBIN0001234'
    });
  }

  // Generate remaining staff based on role distribution
  for (const roleConfig of STAFF_ROLES) {
    // Skip already created known accounts
    const alreadyCreated = knownAccounts.filter(a => a.role === roleConfig.role).length;
    const toCreate = Math.max(0, roleConfig.count - alreadyCreated);

    for (let i = 0; i < toCreate; i++) {
      staffIndex++;
      const userId = `usr_staff_${staffIndex.toString().padStart(4, '0')}`;
      const profileId = `sp_${staffIndex.toString().padStart(4, '0')}`;
      const isMale = staffIndex % 3 !== 0; // 2/3 male for teaching staff typical ratio
      const name = generateStaffName(staffIndex, isMale);
      const addr = generateAddress(staffIndex);

      users.push({
        id: userId,
        name,
        email: `staff.${staffIndex}.${name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '')}@sovereign.edu`,
        phone: generatePhone(staffIndex + 1000),
        password: 'password123',
        role: roleConfig.role,
        department: roleConfig.department,
        school_id: SCHOOL_ID
      });

      profiles.push({
        id: profileId,
        user_id: userId,
        school_id: SCHOOL_ID,
        employee_id: generateEmployeeId(staffIndex),
        designation: roleConfig.designation,
        department: roleConfig.department,
        employment_type: i < toCreate - 2 ? 'Permanent' : 'Contract',
        joining_date: spreadTimestamp(new Date('2018-04-01'), staffIndex, 100),
        qualification: QUALIFICATIONS[2 + (staffIndex % 3)], // Graduate or higher
        experience_years: 2 + (staffIndex % 15),
        date_of_birth: new Date(1970 + (staffIndex % 25), staffIndex % 12, (staffIndex % 28) + 1),
        gender: isMale ? 'Male' : 'Female',
        blood_group: BLOOD_GROUPS[staffIndex % BLOOD_GROUPS.length],
        address_line1: addr.line1,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        aadhaar_number: generateMaskedAadhaar(staffIndex + 5000),
        pan_number: generateMaskedPAN(staffIndex + 5000),
        emergency_contact_name: `EC for ${name}`,
        emergency_contact_phone: generatePhone(staffIndex + 2000),
        status: staffIndex % 50 === 0 ? StaffStatus.ON_LEAVE : StaffStatus.ACTIVE
      });

      financials.push({
        id: `sf_${staffIndex.toString().padStart(4, '0')}`,
        staff_profile_id: profileId,
        school_id: SCHOOL_ID,
        salary_grade: roleConfig.salaryGrade,
        basic_salary: roleConfig.baseSalary + (staffIndex % 5) * 1000,
        hra: roleConfig.baseSalary * 0.2,
        allowances: roleConfig.baseSalary * 0.1,
        deductions: roleConfig.baseSalary * 0.12,
        bank_name: BANK_NAMES[staffIndex % BANK_NAMES.length],
        bank_account_no: generateMaskedBankAccount(staffIndex + 5000),
        ifsc_code: `SBIN000${(1000 + staffIndex % 100).toString()}`
      });
    }
  }

  return { users, profiles, financials };
}

const staffData = generateStaffData();
export const DUMMY_STAFF_USERS: DummyStaffUser[] = staffData.users;
export const DUMMY_STAFF_PROFILES: DummyStaffProfile[] = staffData.profiles;
export const DUMMY_STAFF_FINANCIALS: DummyStaffFinancial[] = staffData.financials;

// Update class teacher IDs now that staff is generated
DUMMY_CLASSES.forEach((cls, index) => {
  // First 48 teachers are class teachers
  const teacherIndex = (index % Math.min(48, DUMMY_STAFF_USERS.filter(u => u.role === UserRole.TEACHER).length));
  const teachers = DUMMY_STAFF_USERS.filter(u => u.role === UserRole.TEACHER);
  if (teachers[teacherIndex]) {
    cls.class_teacher_id = teachers[teacherIndex].id;
  }
});

// --- Staff Subject & Class Assignments ---
export interface DummyStaffSubject {
  id: string;
  school_id: string;
  staff_profile_id: string;
  subject_id: string;
  is_primary: boolean;
}

export interface DummyStaffClass {
  id: string;
  school_id: string;
  staff_profile_id: string;
  class_id: string;
  role: string;
}

function generateStaffAssignments(): { staffSubjects: DummyStaffSubject[]; staffClasses: DummyStaffClass[] } {
  const staffSubjects: DummyStaffSubject[] = [];
  const staffClasses: DummyStaffClass[] = [];

  const teachers = DUMMY_STAFF_PROFILES.filter(p => {
    const user = DUMMY_STAFF_USERS.find(u => u.id === p.user_id);
    return user && (user.role === UserRole.TEACHER || user.role === UserRole.HOD);
  });

  let ssIndex = 0;
  let scIndex = 0;

  teachers.forEach((teacher, tIndex) => {
    // Assign 1-2 subjects per teacher
    const subjectCount = 1 + (tIndex % 2);
    for (let s = 0; s < subjectCount; s++) {
      const subjectIndex = (tIndex + s) % DUMMY_SUBJECTS.length;
      staffSubjects.push({
        id: generateId('ss', ssIndex++),
        school_id: SCHOOL_ID,
        staff_profile_id: teacher.id,
        subject_id: DUMMY_SUBJECTS[subjectIndex].id,
        is_primary: s === 0
      });
    }

    // Assign 2-4 classes per teacher
    const classCount = 2 + (tIndex % 3);
    for (let c = 0; c < classCount; c++) {
      const classIndex = (tIndex * 3 + c) % DUMMY_CLASSES.length;
      staffClasses.push({
        id: generateId('sc', scIndex++),
        school_id: SCHOOL_ID,
        staff_profile_id: teacher.id,
        class_id: DUMMY_CLASSES[classIndex].id,
        role: c === 0 && tIndex < 48 ? 'CLASS_TEACHER' : 'TEACHER'
      });
    }
  });

  return { staffSubjects, staffClasses };
}

const staffAssignments = generateStaffAssignments();
export const DUMMY_STAFF_SUBJECTS: DummyStaffSubject[] = staffAssignments.staffSubjects;
export const DUMMY_STAFF_CLASSES: DummyStaffClass[] = staffAssignments.staffClasses;

// ============================================================================
// PART 3: STUDENTS & PARENTS
// ============================================================================

// --- Student User Accounts ---
export interface DummyStudentUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  password: string; // Plaintext, hashed by seed.ts
  role: UserRole;
  school_id: string;
}

// --- Student Profiles ---
export interface DummyStudent {
  id: string;
  admission_no: string;
  name: string;
  email: string;
  school_id: string;
  user_id: string;
  // Demographics
  gender: string;
  date_of_birth: Date;
  father_name: string;
  mother_name: string;
  guardian_name: string | null;
  blood_group: string;
  nationality: string;
  religion: string;
  category: string;
  caste: string | null;
  mother_tongue: string;
  // Contact
  phone: string;
  alternate_phone: string | null;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  // Address
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  // Identity
  aadhaar_number: string;
  birth_certificate_no: string | null;
  // Previous Education
  previous_school: string | null;
  transfer_certificate_no: string | null;
  // Status
  status: StudentStatus;
  admission_date: Date;
  leaving_date: Date | null;
  leaving_reason: string | null;
}

function generateStudentsData(): { users: DummyStudentUser[]; students: DummyStudent[] } {
  const users: DummyStudentUser[] = [];
  const students: DummyStudent[] = [];

  let studentIndex = 0;
  const academicYearStart = new Date('2025-04-01');

  for (const grade of GRADES) {
    const gradeNum = parseInt(grade);
    // Calculate approximate birth year for this grade
    // Grade 1 = ~6 years old in 2025, Grade 12 = ~17 years old
    const baseAge = 5 + gradeNum;
    const birthYear = 2025 - baseAge;

    for (const section of SECTIONS) {
      const sectionLetter = Section[section]; // 'A', 'B', 'C', 'D'

      for (let roll = 1; roll <= 40; roll++) {
        studentIndex++;

        // Generate IDs
        const padIndex = studentIndex.toString().padStart(4, '0');
        const userId = `usr_std_${padIndex}`;
        const studentId = `std_${padIndex}`;
        const admissionNo = generateAdmissionNo(2025, studentIndex);

        // Generate name and gender
        const { name, gender } = generateStudentName(studentIndex);
        const lastName = name.split(' ')[1] || 'Kumar';

        // Generate email
        const email = `student.${grade}.${sectionLetter.toLowerCase()}.${roll}@sovereign.edu`;

        // Generate demographics
        const birthMonth = (studentIndex % 12);
        const birthDay = (studentIndex % 28) + 1;
        const dob = new Date(birthYear - (studentIndex % 2), birthMonth, birthDay);

        const addr = generateAddress(studentIndex);

        // Determine status - most are ACTIVE, some edge cases
        let status: StudentStatus = StudentStatus.ACTIVE;
        if (studentIndex % 100 === 0) status = StudentStatus.ALUMNI;
        else if (studentIndex % 75 === 0) status = StudentStatus.TRANSFERRED;
        else if (studentIndex % 150 === 0) status = StudentStatus.INACTIVE;

        // Create User
        users.push({
          id: userId,
          name,
          email,
          phone: generatePhone(studentIndex + 3000),
          password: 'password123',
          role: UserRole.STUDENT,
          school_id: SCHOOL_ID
        });

        // Create Student Profile
        students.push({
          id: studentId,
          admission_no: admissionNo,
          name,
          email,
          school_id: SCHOOL_ID,
          user_id: userId,
          // Demographics
          gender,
          date_of_birth: dob,
          father_name: `Mr. ${lastName}`,
          mother_name: `Mrs. ${lastName}`,
          guardian_name: studentIndex % 20 === 0 ? `Guardian of ${name}` : null,
          blood_group: BLOOD_GROUPS[studentIndex % BLOOD_GROUPS.length],
          nationality: 'Indian',
          religion: RELIGIONS[studentIndex % RELIGIONS.length],
          category: CATEGORIES[studentIndex % CATEGORIES.length],
          caste: null,
          mother_tongue: studentIndex % 5 === 0 ? 'Marathi' : 'Hindi',
          // Contact
          phone: generatePhone(studentIndex + 3000),
          alternate_phone: studentIndex % 3 === 0 ? generatePhone(studentIndex + 4000) : null,
          emergency_contact_name: `EC for ${name}`,
          emergency_contact_phone: generatePhone(studentIndex + 5000),
          // Address
          address_line1: addr.line1,
          address_line2: addr.line2,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          // Identity
          aadhaar_number: generateMaskedAadhaar(studentIndex),
          birth_certificate_no: studentIndex % 10 === 0 ? `BC${studentIndex.toString().padStart(8, '0')}` : null,
          // Previous Education
          previous_school: studentIndex % 15 === 0 ? 'Previous School Name' : null,
          transfer_certificate_no: studentIndex % 15 === 0 ? `TC${studentIndex.toString().padStart(6, '0')}` : null,
          // Status
          status,
          admission_date: spreadTimestamp(new Date('2024-04-01'), studentIndex, 1920),
          leaving_date: status === StudentStatus.ALUMNI || status === StudentStatus.TRANSFERRED
            ? new Date('2025-03-31') : null,
          leaving_reason: status === StudentStatus.TRANSFERRED ? 'Family relocation' : null
        });
      }
    }
  }

  return { users, students };
}

const studentsData = generateStudentsData();
export const DUMMY_STUDENT_USERS: DummyStudentUser[] = studentsData.users;
export const DUMMY_STUDENTS: DummyStudent[] = studentsData.students;

// ============================================================================
// PART 3.2: STUDENT ENROLLMENTS
// ============================================================================

export interface DummyEnrollment {
  id: string;
  school_id: string;
  student_id: string;
  class_id: string;
  academic_year_id: string;
  roll_number: number;
  status: EnrollmentStatus;
  promoted_from_id: string | null;
}

function generateEnrollments(): DummyEnrollment[] {
  const enrollments: DummyEnrollment[] = [];

  let studentIndex = 0;

  for (const grade of GRADES) {
    for (const section of SECTIONS) {
      const classId = `cls_${grade}_${section}`;

      for (let roll = 1; roll <= 40; roll++) {
        studentIndex++;
        const padIndex = studentIndex.toString().padStart(4, '0');
        const studentId = `std_${padIndex}`;

        // Determine enrollment status based on student status
        const student = DUMMY_STUDENTS.find(s => s.id === studentId);
        let enrollmentStatus: EnrollmentStatus = EnrollmentStatus.ACTIVE;

        if (student) {
          if (student.status === StudentStatus.ALUMNI) {
            enrollmentStatus = EnrollmentStatus.COMPLETED;
          } else if (student.status === StudentStatus.TRANSFERRED) {
            enrollmentStatus = EnrollmentStatus.TRANSFERRED;
          }
        }

        // For some students in higher grades, create a promotion chain reference
        let promotedFromId: string | null = null;
        const gradeNum = parseInt(grade);
        if (gradeNum > 1 && studentIndex % 10 === 0) {
          // This student was promoted from previous grade
          promotedFromId = `enr_prev_${padIndex}`;
        }

        enrollments.push({
          id: `enr_${ACADEMIC_YEAR_2025_ID}_${padIndex}`,
          school_id: SCHOOL_ID,
          student_id: studentId,
          class_id: classId,
          academic_year_id: ACADEMIC_YEAR_2025_ID,
          roll_number: roll,
          status: enrollmentStatus,
          promoted_from_id: promotedFromId
        });
      }
    }
  }

  return enrollments;
}

export const DUMMY_ENROLLMENTS: DummyEnrollment[] = generateEnrollments();

// ============================================================================
// PART 4.1: PARENTS
// ============================================================================

// --- Parent User Accounts ---
export interface DummyParentUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  school_id: string;
}

// --- Parent Profiles ---
export interface DummyParentProfile {
  id: string;
  user_id: string;
  school_id: string;
  date_of_birth: Date | null;
  gender: string;
  occupation: string;
  organization: string | null;
  annual_income: string;
  qualification: string;
  alternate_phone: string | null;
  office_phone: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  aadhaar_number: string;
  is_emergency_contact: boolean;
}

// --- Parent-Student Links ---
export interface DummyParentStudentLink {
  parent_id: string;
  student_id: string;
  school_id: string;
  relation: string;
  is_primary: boolean;
  can_pickup: boolean;
  has_custody: boolean;
}

function generateParentsData(): {
  users: DummyParentUser[];
  profiles: DummyParentProfile[];
  links: DummyParentStudentLink[];
} {
  const users: DummyParentUser[] = [];
  const profiles: DummyParentProfile[] = [];
  const links: DummyParentStudentLink[] = [];

  // Generate ~960 parents (1 per 2 students)
  const numParents = Math.ceil(DUMMY_STUDENTS.length / 2);

  for (let i = 0; i < numParents; i++) {
    const parentIndex = i + 1;
    const padIndex = parentIndex.toString().padStart(4, '0');
    const userId = `usr_parent_${padIndex}`;
    const profileId = `pp_${padIndex}`;

    // Alternate between fathers and mothers
    const isFather = i % 2 === 0;
    const gender = isFather ? 'Male' : 'Female';
    const prefix = isFather ? 'Mr.' : 'Mrs.';

    // Get student info to derive parent last name
    const studentIndex = i * 2;
    const relatedStudent = DUMMY_STUDENTS[studentIndex];
    const lastName = relatedStudent ? relatedStudent.name.split(' ')[1] || 'Kumar' : 'Kumar';

    const firstName = isFather
      ? FIRST_NAMES_MALE[i % FIRST_NAMES_MALE.length]
      : FIRST_NAMES_FEMALE[i % FIRST_NAMES_FEMALE.length];
    const name = `${prefix} ${firstName} ${lastName}`;

    const email = `parent.${parentIndex}.${firstName.toLowerCase()}.${lastName.toLowerCase()}@sovereign.edu`;
    const addr = generateAddress(parentIndex + 2000);

    users.push({
      id: userId,
      name,
      email,
      phone: generatePhone(parentIndex + 6000),
      password: 'password123',
      role: UserRole.PARENT,
      school_id: SCHOOL_ID
    });

    profiles.push({
      id: profileId,
      user_id: userId,
      school_id: SCHOOL_ID,
      date_of_birth: new Date(1970 + (parentIndex % 20), parentIndex % 12, (parentIndex % 28) + 1),
      gender,
      occupation: OCCUPATIONS[parentIndex % OCCUPATIONS.length],
      organization: parentIndex % 3 === 0 ? `Company ${parentIndex}` : null,
      annual_income: INCOME_BRACKETS[parentIndex % INCOME_BRACKETS.length],
      qualification: QUALIFICATIONS[parentIndex % QUALIFICATIONS.length],
      alternate_phone: parentIndex % 4 === 0 ? generatePhone(parentIndex + 7000) : null,
      office_phone: parentIndex % 5 === 0 ? generatePhone(parentIndex + 8000) : null,
      address_line1: addr.line1,
      address_line2: addr.line2,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      aadhaar_number: generateMaskedAadhaar(parentIndex + 3000),
      is_emergency_contact: parentIndex % 10 !== 0 // 90% are emergency contacts
    });
  }

  // Generate parent-student links
  // Each parent is linked to 2 students (siblings)
  // Some variability in can_pickup and has_custody
  for (let i = 0; i < DUMMY_STUDENTS.length; i++) {
    const student = DUMMY_STUDENTS[i];
    const parentIndex = Math.floor(i / 2);
    const padIndex = (parentIndex + 1).toString().padStart(4, '0');
    const parentId = `usr_parent_${padIndex}`;

    // Determine relation based on parent index
    const isFather = parentIndex % 2 === 0;
    const relation = isFather ? 'Father' : 'Mother';

    // First child of pair is primary
    const isPrimary = i % 2 === 0;

    // Most can pickup, some cannot
    const canPickup = i % 15 !== 0; // ~93% can pickup

    // Most have custody, very few don't
    const hasCustody = i % 40 !== 0; // ~97.5% have custody

    links.push({
      parent_id: parentId,
      student_id: student.id,
      school_id: SCHOOL_ID,
      relation,
      is_primary: isPrimary,
      can_pickup: canPickup,
      has_custody: hasCustody
    });

    // Add a second parent link for some students (both parents registered)
    if (i % 5 === 0 && parentIndex + 1 < Math.ceil(DUMMY_STUDENTS.length / 2)) {
      const secondParentIndex = parentIndex + 1;
      const secondPadIndex = (secondParentIndex + 1).toString().padStart(4, '0');
      const secondParentId = `usr_parent_${secondPadIndex}`;
      const secondRelation = isFather ? 'Mother' : 'Father';

      links.push({
        parent_id: secondParentId,
        student_id: student.id,
        school_id: SCHOOL_ID,
        relation: secondRelation,
        is_primary: false,
        can_pickup: true,
        has_custody: true
      });
    }
  }

  return { users, profiles, links };
}

const parentsData = generateParentsData();
export const DUMMY_PARENT_USERS: DummyParentUser[] = parentsData.users;
export const DUMMY_PARENT_PROFILES: DummyParentProfile[] = parentsData.profiles;
export const DUMMY_PARENT_STUDENT_LINKS: DummyParentStudentLink[] = parentsData.links;

// ============================================================================
// PART 4.2: EXAMS & RESULTS
// ============================================================================

// --- Exams ---
export interface DummyExam {
  id: string;
  school_id: string;
  name: string;
  type: ExamType;
  start_date: Date;
  end_date: Date;
}

export const DUMMY_EXAMS: DummyExam[] = [
  {
    id: 'exam_midterm_2025',
    school_id: SCHOOL_ID,
    name: 'Mid-Term Examination 2025',
    type: ExamType.MIDTERM,
    start_date: new Date('2025-09-15'),
    end_date: new Date('2025-09-25')
  },
  {
    id: 'exam_final_2025',
    school_id: SCHOOL_ID,
    name: 'Final Examination 2025',
    type: ExamType.FINAL,
    start_date: new Date('2026-02-15'),
    end_date: new Date('2026-02-28')
  }
];

// --- Results ---
export interface DummyResult {
  id: string;
  school_id: string;
  exam_id: string;
  student_id: string;
  total_percentage: number;
  grade: string;
  remarks: string | null;
}

// --- ResultMarks ---
export interface DummyResultMark {
  id: string;
  school_id: string;
  result_id: string;
  subject_id: string;
  marks_obtained: number;
  max_marks: number;
  grade: string;
  remarks: string | null;
}

function calculateGrade(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
}

function generateResultsData(): { results: DummyResult[]; marks: DummyResultMark[] } {
  const results: DummyResult[] = [];
  const marks: DummyResultMark[] = [];

  let resultIndex = 0;
  let markIndex = 0;

  // Generate results for Mid-Term exam only (to keep size manageable)
  const examId = 'exam_midterm_2025';

  for (const enrollment of DUMMY_ENROLLMENTS) {
    // Skip some students (transferred/completed)
    if (enrollment.status !== EnrollmentStatus.ACTIVE) continue;

    resultIndex++;
    const resultId = `res_${resultIndex.toString().padStart(5, '0')}`;

    // Find subjects for this class
    const classSubjects = DUMMY_CLASS_SUBJECTS.filter(cs => cs.class_id === enrollment.class_id);

    if (classSubjects.length === 0) continue;

    // Generate marks for each subject
    let totalMarks = 0;
    let totalMaxMarks = 0;
    const studentMarks: DummyResultMark[] = [];

    for (const cs of classSubjects) {
      markIndex++;

      // Generate score with some edge cases
      let marksObtained: number;
      if (resultIndex % 100 === 0) {
        // Edge case: absent (0 marks)
        marksObtained = 0;
      } else if (resultIndex % 50 === 0) {
        // Edge case: perfect score
        marksObtained = 100;
      } else if (resultIndex % 30 === 0) {
        // Edge case: failing
        marksObtained = 20 + (resultIndex % 15);
      } else {
        // Normal distribution around 60-85
        marksObtained = 45 + (resultIndex % 50) + (markIndex % 10);
        if (marksObtained > 100) marksObtained = 95;
      }

      const maxMarks = 100;
      const subjectGrade = calculateGrade(marksObtained);

      totalMarks += marksObtained;
      totalMaxMarks += maxMarks;

      // Remarks for special cases
      let remarks: string | null = null;
      if (marksObtained === 0) remarks = 'Absent';
      else if (marksObtained === 100) remarks = 'Excellent!';
      else if (marksObtained < 40) remarks = 'Needs improvement';

      studentMarks.push({
        id: `rm_${markIndex.toString().padStart(6, '0')}`,
        school_id: SCHOOL_ID,
        result_id: resultId,
        subject_id: cs.subject_id,
        marks_obtained: marksObtained,
        max_marks: maxMarks,
        grade: subjectGrade,
        remarks
      });
    }

    // Calculate overall result
    const totalPercentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;
    const overallGrade = calculateGrade(totalPercentage);

    let overallRemarks: string | null = null;
    if (totalPercentage >= 90) overallRemarks = 'Outstanding performance';
    else if (totalPercentage >= 75) overallRemarks = 'Good performance';
    else if (totalPercentage < 40) overallRemarks = 'Requires remedial classes';

    results.push({
      id: resultId,
      school_id: SCHOOL_ID,
      exam_id: examId,
      student_id: enrollment.student_id,
      total_percentage: Math.round(totalPercentage * 100) / 100,
      grade: overallGrade,
      remarks: overallRemarks
    });

    marks.push(...studentMarks);
  }

  return { results, marks };
}

const resultsData = generateResultsData();
export const DUMMY_RESULTS: DummyResult[] = resultsData.results;
export const DUMMY_RESULT_MARKS: DummyResultMark[] = resultsData.marks;

// ============================================================================
// PART 4.3: OPERATIONAL DATA
// ============================================================================

// --- Attendance ---
export interface DummyAttendance {
  id: string;
  student_id: string;
  date: Date;
  status: AttendanceStatus;
  period: number;
  school_id: string;
  marked_by: string | null;
  synced: boolean;
}

function generateAttendance(): DummyAttendance[] {
  const attendance: DummyAttendance[] = [];
  let attIndex = 0;

  // Generate attendance for Class 10-A students for 5 days
  const class10AStudents = DUMMY_ENROLLMENTS.filter(e => e.class_id === 'cls_10_A');
  const dates = [
    new Date('2025-09-01'),
    new Date('2025-09-02'),
    new Date('2025-09-03'),
    new Date('2025-09-04'),
    new Date('2025-09-05')
  ];

  const principalId = DUMMY_STAFF_USERS.find(s => s.role === UserRole.PRINCIPAL)?.id || null;

  for (const enrollment of class10AStudents.slice(0, 40)) {
    for (const date of dates) {
      attIndex++;

      // Daily attendance (period 0)
      let status: AttendanceStatus = AttendanceStatus.PRESENT;
      if (attIndex % 10 === 0) status = AttendanceStatus.ABSENT;
      else if (attIndex % 15 === 0) status = AttendanceStatus.LATE;

      attendance.push({
        id: `att_${attIndex.toString().padStart(5, '0')}`,
        student_id: enrollment.student_id,
        date,
        status,
        period: 0,
        school_id: SCHOOL_ID,
        marked_by: principalId,
        synced: true
      });

      // Period-level attendance for some days
      if (attIndex % 5 === 0) {
        for (let period = 1; period <= 6; period++) {
          attIndex++;
          attendance.push({
            id: `att_${attIndex.toString().padStart(5, '0')}`,
            student_id: enrollment.student_id,
            date,
            status: period === 3 ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT,
            period,
            school_id: SCHOOL_ID,
            marked_by: principalId,
            synced: true
          });
        }
      }
    }
  }

  return attendance;
}

export const DUMMY_ATTENDANCE: DummyAttendance[] = generateAttendance();

// --- Books ---
export interface DummyBook {
  isbn: string;
  title: string;
  author: string;
  status: string;
  school_id: string;
  quantity: number;
  available: number;
}

const BOOK_TITLES = [
  { title: 'Concepts of Physics Vol 1', author: 'H.C. Verma' },
  { title: 'Concepts of Physics Vol 2', author: 'H.C. Verma' },
  { title: 'Mathematics Class X', author: 'R.D. Sharma' },
  { title: 'Mathematics Class XII', author: 'R.D. Sharma' },
  { title: 'Organic Chemistry', author: 'Morrison Boyd' },
  { title: 'Inorganic Chemistry', author: 'J.D. Lee' },
  { title: 'Biology NCERT Class XI', author: 'NCERT' },
  { title: 'Biology NCERT Class XII', author: 'NCERT' },
  { title: 'History of Modern India', author: 'Bipin Chandra' },
  { title: 'Indian Geography', author: 'Majid Husain' },
  { title: 'Economics NCERT', author: 'NCERT' },
  { title: 'Accountancy Class XII', author: 'T.S. Grewal' },
  { title: 'Computer Science with Python', author: 'Sumita Arora' },
  { title: 'English Literature', author: 'Board Publication' },
  { title: 'Hindi Sahitya', author: 'Various' },
  { title: 'Wings of Fire', author: 'A.P.J. Abdul Kalam' },
  { title: 'The Discovery of India', author: 'Jawaharlal Nehru' },
  { title: 'Gitanjali', author: 'Rabindranath Tagore' },
  { title: 'Train to Pakistan', author: 'Khushwant Singh' },
  { title: 'God of Small Things', author: 'Arundhati Roy' },
];

function generateBooks(): DummyBook[] {
  const books: DummyBook[] = [];

  for (let i = 0; i < 50; i++) {
    const bookInfo = BOOK_TITLES[i % BOOK_TITLES.length];
    const quantity = 5 + (i % 10);
    const issued = i % 5;

    books.push({
      isbn: `978-81-${(1000 + i).toString().padStart(4, '0')}-${(i % 100).toString().padStart(2, '0')}`,
      title: i < BOOK_TITLES.length ? bookInfo.title : `Reference Book ${i + 1}`,
      author: i < BOOK_TITLES.length ? bookInfo.author : `Author ${i + 1}`,
      status: issued > 0 ? 'ISSUED' : 'AVAILABLE',
      school_id: SCHOOL_ID,
      quantity,
      available: quantity - issued
    });
  }

  return books;
}

export const DUMMY_BOOKS: DummyBook[] = generateBooks();

// --- Book Loans ---
export interface DummyBookLoan {
  id: string;
  book_isbn: string;
  borrower_type: string;
  student_id: string | null;
  user_id: string | null;
  school_id: string;
  issue_date: Date;
  due_date: Date;
  return_date: Date | null;
  fine_amount: number;
  fine_paid: boolean;
  status: LoanStatus;
}

function generateBookLoans(): DummyBookLoan[] {
  const loans: DummyBookLoan[] = [];

  const statuses: { status: LoanStatus; count: number }[] = [
    { status: LoanStatus.ACTIVE, count: 15 },
    { status: LoanStatus.RETURNED, count: 8 },
    { status: LoanStatus.OVERDUE, count: 5 },
    { status: LoanStatus.LOST, count: 2 }
  ];

  let loanIndex = 0;

  for (const { status, count } of statuses) {
    for (let i = 0; i < count; i++) {
      loanIndex++;
      const studentId = DUMMY_STUDENTS[loanIndex % DUMMY_STUDENTS.length].id;
      const book = DUMMY_BOOKS[loanIndex % DUMMY_BOOKS.length];

      const issueDate = new Date('2025-08-15');
      issueDate.setDate(issueDate.getDate() + loanIndex);

      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + 14);

      let returnDate: Date | null = null;
      let fineAmount = 0;
      let finePaid = false;

      if (status === LoanStatus.RETURNED) {
        returnDate = new Date(dueDate);
        returnDate.setDate(returnDate.getDate() - 2);
      } else if (status === LoanStatus.OVERDUE) {
        fineAmount = 5 * (loanIndex % 10 + 1);
      } else if (status === LoanStatus.LOST) {
        fineAmount = 500;
        finePaid = loanIndex % 2 === 0;
      }

      loans.push({
        id: `loan_${loanIndex.toString().padStart(4, '0')}`,
        book_isbn: book.isbn,
        borrower_type: 'STUDENT',
        student_id: studentId,
        user_id: null,
        school_id: SCHOOL_ID,
        issue_date: issueDate,
        due_date: dueDate,
        return_date: returnDate,
        fine_amount: fineAmount,
        fine_paid: finePaid,
        status
      });
    }
  }

  return loans;
}

export const DUMMY_BOOK_LOANS: DummyBookLoan[] = generateBookLoans();

// --- Invoices ---
export interface DummyInvoice {
  id: string;
  student_id: string;
  base_amount: number;
  discount_amount: number;
  description: string;
  due_date: Date;
  status: InvoiceStatus;
  utr: string | null;
  school_id: string;
}

function generateInvoices(): DummyInvoice[] {
  const invoices: DummyInvoice[] = [];

  // Generate invoices for first 100 students
  for (let i = 0; i < 100; i++) {
    const student = DUMMY_STUDENTS[i];

    let status: InvoiceStatus;
    let utr: string | null = null;

    if (i % 3 === 0) {
      status = InvoiceStatus.PAID;
      utr = `UPI${(1000000000 + i).toString()}`;
    } else if (i % 3 === 1) {
      status = InvoiceStatus.PAID;
      utr = `NEFT${(2000000000 + i).toString()}`;
    } else {
      status = InvoiceStatus.PENDING;
    }

    invoices.push({
      id: `inv_${(i + 1).toString().padStart(4, '0')}`,
      student_id: student.id,
      base_amount: 25000 + (i % 5) * 1000,
      discount_amount: i % 10 === 0 ? 2500 : 0,
      description: 'Term 1 Fees 2025-26',
      due_date: new Date('2025-05-15'),
      status,
      utr,
      school_id: SCHOOL_ID
    });
  }

  return invoices;
}

export const DUMMY_INVOICES: DummyInvoice[] = generateInvoices();

// --- Timetable (Sample) ---
export interface DummyTimetable {
  id: string;
  school_id: string;
  class_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  subject_id: string;
  teacher_id: string | null;
}

function generateTimetable(): DummyTimetable[] {
  const timetable: DummyTimetable[] = [];
  let ttIndex = 0;

  const periods = [
    { start: '08:00', end: '08:45' },
    { start: '08:45', end: '09:30' },
    { start: '09:45', end: '10:30' },
    { start: '10:30', end: '11:15' },
    { start: '11:30', end: '12:15' },
    { start: '12:15', end: '13:00' }
  ];

  // Generate timetable for Class 10-A (sample)
  const classId = 'cls_10_A';
  const classSubjects = DUMMY_CLASS_SUBJECTS.filter(cs => cs.class_id === classId);
  const teachers = DUMMY_STAFF_USERS.filter(s => s.role === UserRole.TEACHER);

  for (let day = 1; day <= 5; day++) { // Monday to Friday
    for (let p = 0; p < periods.length; p++) {
      ttIndex++;
      const subjectIndex = (day * 6 + p) % classSubjects.length;
      const teacherIndex = (day * 6 + p) % teachers.length;

      timetable.push({
        id: `tt_${ttIndex.toString().padStart(4, '0')}`,
        school_id: SCHOOL_ID,
        class_id: classId,
        day_of_week: day,
        start_time: periods[p].start,
        end_time: periods[p].end,
        subject_id: classSubjects[subjectIndex].subject_id,
        teacher_id: teachers[teacherIndex].id
      });
    }
  }

  return timetable;
}

export const DUMMY_TIMETABLE: DummyTimetable[] = generateTimetable();

// --- Buses ---
export interface DummyBus {
  id: string;
  plateNumber: string;
  driverName: string;
  capacity: number;
  routeId: string;
  insuranceExpiry: Date;
  school_id: string;
}

export const DUMMY_BUSES: DummyBus[] = [
  { id: 'bus_1', plateNumber: 'MP-09-AB-0001', driverName: 'Ramesh Singh', capacity: 40, routeId: 'R-01', insuranceExpiry: new Date('2026-06-01'), school_id: SCHOOL_ID },
  { id: 'bus_2', plateNumber: 'MP-09-AB-0002', driverName: 'Suresh Kumar', capacity: 35, routeId: 'R-02', insuranceExpiry: new Date('2026-07-15'), school_id: SCHOOL_ID },
  { id: 'bus_3', plateNumber: 'MP-09-AB-0003', driverName: 'Mahesh Yadav', capacity: 50, routeId: 'R-03', insuranceExpiry: new Date('2026-08-20'), school_id: SCHOOL_ID },
  { id: 'bus_4', plateNumber: 'MP-09-AB-0004', driverName: 'Dinesh Patel', capacity: 45, routeId: 'R-04', insuranceExpiry: new Date('2026-05-10'), school_id: SCHOOL_ID },
  { id: 'bus_5', plateNumber: 'MP-09-AB-0005', driverName: 'Ganesh Sharma', capacity: 40, routeId: 'R-05', insuranceExpiry: new Date('2026-09-30'), school_id: SCHOOL_ID },
];

// ============================================================================
// PART 5: OPERATIONAL DATA (15 Missing Tables)
// ============================================================================

// --- Expenses ---
export interface DummyExpense {
  id: string;
  school_id: string;
  category: 'UTILITY' | 'VENDOR' | 'SALARY' | 'MAINTENANCE';
  amount: number;
  description: string;
  date: Date;
}

function generateExpenses(): DummyExpense[] {
  const expenses: DummyExpense[] = [];
  const categories: ('UTILITY' | 'VENDOR' | 'SALARY' | 'MAINTENANCE')[] = ['UTILITY', 'VENDOR', 'SALARY', 'MAINTENANCE'];
  const descriptions = [
    ['Electricity Bill', 'Water Bill', 'Internet Bill', 'Phone Bill'],
    ['Stationery Purchase', 'Lab Equipment', 'Sports Equipment', 'Furniture'],
    ['Driver Salary', 'Security Guard Salary', 'Cleaning Staff Salary', 'Helper Salary'],
    ['AC Repair', 'Plumbing Work', 'Painting', 'Generator Service']
  ];

  const baseDate = new Date();
  for (let i = 0; i < 20; i++) {
    const catIndex = i % 4;
    const descIndex = Math.floor(i / 4) % 4;
    const date = new Date(baseDate);
    date.setDate(date.getDate() - (i * 2)); // Spread across current month

    expenses.push({
      id: `exp_${(i + 1).toString().padStart(4, '0')}`,
      school_id: SCHOOL_ID,
      category: categories[catIndex],
      amount: 5000 + (i * 1000) + (catIndex * 2500),
      description: descriptions[catIndex][descIndex],
      date
    });
  }
  return expenses;
}

export const DUMMY_EXPENSES: DummyExpense[] = generateExpenses();

// --- Homework ---
export interface DummyHomework {
  id: string;
  school_id: string;
  title: string;
  subject_id: string;
  description: string;
  due_date: Date;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED';
  class_id: string;
  created_at: Date;
}

function generateHomework(): DummyHomework[] {
  const homeworks: DummyHomework[] = [];
  const titles = ['Chapter Review Questions', 'Practice Problems Set', 'Weekly Assignment', 'Project Work', 'Case Study Analysis'];
  const statuses: ('PENDING' | 'SUBMITTED' | 'GRADED')[] = ['PENDING', 'SUBMITTED', 'GRADED'];

  const baseDate = new Date();
  const classes = ['cls_6_A', 'cls_7_B', 'cls_8_C', 'cls_9_A', 'cls_10_B'];
  const subjects = ['sub_math', 'sub_eng', 'sub_sci', 'sub_sst', 'sub_hin'];

  for (let i = 0; i < 20; i++) {
    const dueDate = new Date(baseDate);
    dueDate.setDate(dueDate.getDate() + (i % 14) - 7); // Some past, some future

    homeworks.push({
      id: `hw_${(i + 1).toString().padStart(4, '0')}`,
      school_id: SCHOOL_ID,
      title: `${titles[i % 5]} - Week ${Math.floor(i / 5) + 1}`,
      subject_id: subjects[i % 5],
      description: `Complete all questions from the assigned chapter. Submit before the due date.`,
      due_date: dueDate,
      status: statuses[i % 3],
      class_id: classes[i % 5],
      created_at: new Date(dueDate.getTime() - 7 * 24 * 60 * 60 * 1000) // 1 week before due
    });
  }
  return homeworks;
}

export const DUMMY_HOMEWORK: DummyHomework[] = generateHomework();

// --- Live Classes ---
export interface DummyLiveClass {
  id: string;
  school_id: string;
  subject_id: string;
  class_id: string;
  teacher_id: string;
  meeting_link: string;
  is_active: boolean;
  start_time: Date;
}

function generateLiveClasses(): DummyLiveClass[] {
  const liveClasses: DummyLiveClass[] = [];
  const teachers = DUMMY_STAFF_USERS.filter(u => u.role === UserRole.TEACHER);
  const classes = ['cls_6_A', 'cls_7_B', 'cls_8_C', 'cls_9_A', 'cls_10_B'];
  const subjects = ['sub_math', 'sub_eng', 'sub_sci', 'sub_phy', 'sub_chem'];

  const baseDate = new Date();

  for (let i = 0; i < 15; i++) {
    const startTime = new Date(baseDate);
    startTime.setHours(9 + (i % 6), 0, 0, 0);

    liveClasses.push({
      id: `lc_${(i + 1).toString().padStart(4, '0')}`,
      school_id: SCHOOL_ID,
      subject_id: subjects[i % 5],
      class_id: classes[i % 5],
      teacher_id: teachers[i % teachers.length].id,
      meeting_link: `https://meet.sovereign.edu/class-${i + 1}`,
      is_active: i < 3, // First 3 are active
      start_time: startTime
    });
  }
  return liveClasses;
}

export const DUMMY_LIVE_CLASSES: DummyLiveClass[] = generateLiveClasses();

// --- Papers ---
export interface DummyPaper {
  id: string;
  school_id: string;
  title: string;
  subject_id: string;
  class_id: string;
  status: 'DRAFT' | 'PRINTED' | 'DISTRIBUTED';
  created_at: Date;
}

function generatePapers(): DummyPaper[] {
  const papers: DummyPaper[] = [];
  const statuses: ('DRAFT' | 'PRINTED' | 'DISTRIBUTED')[] = ['DRAFT', 'PRINTED', 'DISTRIBUTED'];
  const classes = ['cls_9_A', 'cls_10_B', 'cls_11_A', 'cls_12_B'];
  const subjects = ['sub_math', 'sub_phy', 'sub_chem', 'sub_bio', 'sub_eng'];

  for (let i = 0; i < 15; i++) {
    papers.push({
      id: `ppr_${(i + 1).toString().padStart(4, '0')}`,
      school_id: SCHOOL_ID,
      title: `Mid-Term Paper - ${subjects[i % 5].replace('sub_', '').toUpperCase()} - Class ${classes[i % 4].split('_')[1]}`,
      subject_id: subjects[i % 5],
      class_id: classes[i % 4],
      status: statuses[i % 3],
      created_at: new Date()
    });
  }
  return papers;
}

export const DUMMY_PAPERS: DummyPaper[] = generatePapers();



// --- Medical Logs ---
export interface DummyMedicalLog {
  id: string;
  student_id: string;
  time: Date;
  issue: string;
  action: string;
  school_id: string;
}

function generateMedicalLogs(): DummyMedicalLog[] {
  const logs: DummyMedicalLog[] = [];
  const issues = ['Headache', 'Fever', 'Stomach ache', 'Minor injury', 'Allergic reaction', 'Nausea', 'Fatigue'];
  const actions = ['Rest prescribed', 'Medicine given', 'Parents informed', 'First aid applied', 'Sent home', 'Referred to hospital'];

  const baseDate = new Date();
  for (let i = 0; i < 20; i++) {
    const time = new Date(baseDate);
    time.setDate(time.getDate() - (i % 15));
    time.setHours(9 + (i % 6), (i * 15) % 60, 0, 0);

    logs.push({
      id: `med_${(i + 1).toString().padStart(4, '0')}`,
      student_id: DUMMY_STUDENTS[i % 100].id,
      time,
      issue: issues[i % issues.length],
      action: actions[i % actions.length],
      school_id: SCHOOL_ID
    });
  }
  return logs;
}

export const DUMMY_MEDICAL_LOGS: DummyMedicalLog[] = generateMedicalLogs();

// --- Counseling ---
export interface DummyCounseling {
  id: string;
  student_id: string;
  category: string;
  note: string;
  date: Date;
  school_id: string;
}

function generateCounseling(): DummyCounseling[] {
  const sessions: DummyCounseling[] = [];
  const categories = ['Academic', 'Behavioral', 'Personal', 'Career', 'Social'];
  const notes = [
    'Student needs extra support in studies',
    'Discussion about classroom behavior improvement',
    'Follow-up session scheduled',
    'Career counseling completed',
    'Peer relationship issues addressed'
  ];

  const baseDate = new Date();
  for (let i = 0; i < 15; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - (i * 2));

    sessions.push({
      id: `cns_${(i + 1).toString().padStart(4, '0')}`,
      student_id: DUMMY_STUDENTS[(i * 5) % 100].id,
      category: categories[i % categories.length],
      note: notes[i % notes.length],
      date,
      school_id: SCHOOL_ID
    });
  }
  return sessions;
}

export const DUMMY_COUNSELING: DummyCounseling[] = generateCounseling();

// --- Hostel Rooms ---
export interface DummyHostelRoom {
  id: string;
  school_id: string;
  room_number: string;
  student_id: string | null;
  capacity: number;
  created_at: Date;
}

function generateHostelRooms(): DummyHostelRoom[] {
  const rooms: DummyHostelRoom[] = [];
  const genderWings = ['BOYS', 'GIRLS'];

  for (let i = 0; i < 20; i++) {
    const wing = genderWings[i % 2];
    const roomNum = `${wing[0]}${(101 + i).toString()}`;

    rooms.push({
      id: `hr_${(i + 1).toString().padStart(4, '0')}`,
      school_id: SCHOOL_ID,
      room_number: roomNum,
      student_id: i < 15 ? DUMMY_STUDENTS[i * 10].id : null, // 15 occupied, 5 empty
      capacity: i % 3 === 0 ? 4 : 2,
      created_at: new Date()
    });
  }
  return rooms;
}

export const DUMMY_HOSTEL_ROOMS: DummyHostelRoom[] = generateHostelRooms();

// --- Visitors ---
export interface DummyVisitor {
  id: number;
  school_id: string;
  name: string;
  student_id: string | null;
  purpose: string;
  status: 'WAITING' | 'APPROVED' | 'COMPLETED';
  time: Date;
}

function generateVisitors(): DummyVisitor[] {
  const visitors: DummyVisitor[] = [];
  const purposes = ['Parent-Teacher Meeting', 'Fee Payment', 'Admission Inquiry', 'Document Collection', 'General Visit'];
  const statuses: ('WAITING' | 'APPROVED' | 'COMPLETED')[] = ['WAITING', 'APPROVED', 'COMPLETED'];

  const baseDate = new Date();
  for (let i = 0; i < 15; i++) {
    const time = new Date(baseDate);
    time.setDate(time.getDate() - (i % 7));
    time.setHours(9 + (i % 8), (i * 10) % 60, 0, 0);

    visitors.push({
      id: i + 1, // Auto-increment ID
      school_id: SCHOOL_ID,
      name: `Visitor ${FIRST_NAMES_MALE[i % FIRST_NAMES_MALE.length]} ${LAST_NAMES[i % LAST_NAMES.length]}`,
      student_id: i % 3 === 0 ? DUMMY_STUDENTS[i * 5].id : null,
      purpose: purposes[i % purposes.length],
      status: statuses[i % 3],
      time
    });
  }
  return visitors;
}

export const DUMMY_VISITORS: DummyVisitor[] = generateVisitors();

// --- Gate Logs ---
export interface DummyGateLog {
  id: number;
  school_id: string;
  person_type: 'STUDENT' | 'STAFF' | 'VISITOR';
  person_id: string | null;
  name: string;
  purpose: string;
  status: 'INSIDE' | 'EXITED';
  entry_time: Date;
  exit_time: Date | null;
}

function generateGateLogs(): DummyGateLog[] {
  const logs: DummyGateLog[] = [];
  const personTypes: ('STUDENT' | 'STAFF' | 'VISITOR')[] = ['STUDENT', 'STAFF', 'VISITOR'];
  const purposes = ['Regular Entry', 'Late Entry', 'Early Exit', 'Official Work', 'Meeting'];
  const statuses: ('INSIDE' | 'EXITED')[] = ['INSIDE', 'EXITED'];

  const baseDate = new Date();
  for (let i = 0; i < 20; i++) {
    const personType = personTypes[i % 3];
    const entryTime = new Date(baseDate);
    entryTime.setDate(entryTime.getDate() - (i % 5));
    entryTime.setHours(7 + (i % 4), (i * 5) % 60, 0, 0);

    const status = statuses[i % 2];
    let exitTime: Date | null = null;
    if (status === 'EXITED') {
      exitTime = new Date(entryTime);
      exitTime.setHours(exitTime.getHours() + 6 + (i % 3));
    }

    let personId: string | null = null;
    let name: string;
    if (personType === 'STUDENT') {
      personId = DUMMY_STUDENTS[i % 50].id;
      name = DUMMY_STUDENTS[i % 50].name;
    } else if (personType === 'STAFF') {
      personId = DUMMY_STAFF_USERS[i % 30].id;
      name = DUMMY_STAFF_USERS[i % 30].name;
    } else {
      name = `Visitor ${i + 1}`;
    }

    logs.push({
      id: i + 1,
      school_id: SCHOOL_ID,
      person_type: personType,
      person_id: personId,
      name,
      purpose: purposes[i % purposes.length],
      status,
      entry_time: entryTime,
      exit_time: exitTime
    });
  }
  return logs;
}

export const DUMMY_GATE_LOGS: DummyGateLog[] = generateGateLogs();

// --- Inquiries ---
export interface DummyInquiry {
  id: number;
  school_id: string;
  parent_name: string;
  phone: string;
  target_class: string;
  status: 'NEW' | 'FOLLOW_UP' | 'CONVERTED';
  created_at: Date;
}

function generateInquiries(): DummyInquiry[] {
  const inquiries: DummyInquiry[] = [];
  const statuses: ('NEW' | 'FOLLOW_UP' | 'CONVERTED')[] = ['NEW', 'FOLLOW_UP', 'CONVERTED'];
  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  const baseDate = new Date();
  for (let i = 0; i < 15; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - (i * 2));

    inquiries.push({
      id: i + 1,
      school_id: SCHOOL_ID,
      parent_name: `${FIRST_NAMES_MALE[i % FIRST_NAMES_MALE.length]} ${LAST_NAMES[i % LAST_NAMES.length]}`,
      phone: generatePhone(i + 8000),
      target_class: grades[i % grades.length],
      status: statuses[i % 3],
      created_at: date
    });
  }
  return inquiries;
}

export const DUMMY_INQUIRIES: DummyInquiry[] = generateInquiries();

// --- Leave Applications ---
export interface DummyLeaveApplication {
  id: string;
  school_id: string;
  user_id: string;
  type: 'SICK' | 'CASUAL' | 'EARNED';
  start_date: Date;
  end_date: Date;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: Date;
}

function generateLeaveApplications(): DummyLeaveApplication[] {
  const leaves: DummyLeaveApplication[] = [];
  const leaveTypes: ('SICK' | 'CASUAL' | 'EARNED')[] = ['SICK', 'CASUAL', 'EARNED'];
  const statuses: ('PENDING' | 'APPROVED' | 'REJECTED')[] = ['PENDING', 'APPROVED', 'REJECTED'];
  const reasons = ['Medical reasons', 'Family function', 'Personal work', 'Out of station', 'Health checkup'];

  const baseDate = new Date();
  for (let i = 0; i < 15; i++) {
    const startDate = new Date(baseDate);
    startDate.setDate(startDate.getDate() + (i % 10) - 5);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (i % 3) + 1);

    leaves.push({
      id: `leave_${(i + 1).toString().padStart(4, '0')}`,
      school_id: SCHOOL_ID,
      user_id: DUMMY_STAFF_USERS[i % 30].id,
      type: leaveTypes[i % 3],
      start_date: startDate,
      end_date: endDate,
      reason: reasons[i % reasons.length],
      status: statuses[i % 3],
      created_at: new Date(startDate.getTime() - 2 * 24 * 60 * 60 * 1000)
    });
  }
  return leaves;
}

export const DUMMY_LEAVE_APPLICATIONS: DummyLeaveApplication[] = generateLeaveApplications();

// --- Tickets ---
export interface DummyTicket {
  id: string;
  school_id: string;
  location: string;
  issue: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'RESOLVED' | 'ASSIGNED' | 'PENDING';
  reported_by: string;
  created_at: Date;
}

function generateTickets(): DummyTicket[] {
  const tickets: DummyTicket[] = [];
  const locations = ['Computer Lab', 'Library', 'Classroom 5A', 'Staff Room', 'Principal Office', 'Boys Washroom', 'Canteen', 'Sports Ground'];
  const issues = ['AC not working', 'Projector malfunction', 'Broken desk', 'Water leakage', 'Electrical issue', 'Network down', 'Door lock broken', 'Fan not working'];
  const priorities: ('LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const statuses: ('OPEN' | 'RESOLVED' | 'ASSIGNED' | 'PENDING')[] = ['OPEN', 'RESOLVED', 'ASSIGNED', 'PENDING'];

  const baseDate = new Date();
  for (let i = 0; i < 15; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - (i % 10));

    tickets.push({
      id: `tkt_${(i + 1).toString().padStart(4, '0')}`,
      school_id: SCHOOL_ID,
      location: locations[i % locations.length],
      issue: issues[i % issues.length],
      priority: priorities[i % 4],
      status: statuses[i % 4],
      reported_by: DUMMY_STAFF_USERS[i % 20].id,
      created_at: date
    });
  }
  return tickets;
}

export const DUMMY_TICKETS: DummyTicket[] = generateTickets();

// --- Identity Documents ---
export interface DummyIdentityDocument {
  id: string;
  owner_user_id: string | null;
  owner_student_id: string | null;
  doc_type: string;
  file_ref: string;
  masked_id: string;
  verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  school_id: string;
  created_at: Date;
}

function generateIdentityDocuments(): DummyIdentityDocument[] {
  const docs: DummyIdentityDocument[] = [];
  const docTypes = ['AADHAAR', 'PAN', 'BIRTH_CERTIFICATE', 'TRANSFER_CERTIFICATE', 'PASSPORT'];
  const statuses: ('PENDING' | 'VERIFIED' | 'REJECTED')[] = ['PENDING', 'VERIFIED', 'REJECTED'];

  // 15 student documents
  for (let i = 0; i < 15; i++) {
    docs.push({
      id: `doc_std_${(i + 1).toString().padStart(4, '0')}`,
      owner_user_id: null,
      owner_student_id: DUMMY_STUDENTS[i].id,
      doc_type: docTypes[i % docTypes.length],
      file_ref: `/documents/student_${i + 1}_${docTypes[i % docTypes.length].toLowerCase()}.pdf`,
      masked_id: generateMaskedAadhaar(i + 1000),
      verification_status: statuses[i % 3],
      school_id: SCHOOL_ID,
      created_at: new Date()
    });
  }

  // 5 staff documents
  for (let i = 0; i < 5; i++) {
    docs.push({
      id: `doc_staff_${(i + 1).toString().padStart(4, '0')}`,
      owner_user_id: DUMMY_STAFF_USERS[i].id,
      owner_student_id: null,
      doc_type: i % 2 === 0 ? 'AADHAAR' : 'PAN',
      file_ref: `/documents/staff_${i + 1}_${(i % 2 === 0 ? 'aadhaar' : 'pan')}.pdf`,
      masked_id: i % 2 === 0 ? generateMaskedAadhaar(i + 2000) : generateMaskedPAN(i + 2000),
      verification_status: 'VERIFIED',
      school_id: SCHOOL_ID,
      created_at: new Date()
    });
  }

  return docs;
}

export const DUMMY_IDENTITY_DOCUMENTS: DummyIdentityDocument[] = generateIdentityDocuments();

// ============================================================================
// SUMMARY - DATA COUNTS
// ============================================================================
// Academic Years: 2
// Subjects: 15
// Classes: 48
// Class-Subject Links: ~380
// Staff Users: ~94
// Staff Profiles: ~94
// Staff Financials: ~94
// Staff Subjects: ~100
// Staff Classes: ~200
// Student Users: ~1920
// Students: ~1920
// Enrollments: ~1920
// Parent Users: ~960
// Parent Profiles: ~960
// Parent-Student Links: ~2300
// Exams: 2
// Results: ~1850
// Result Marks: ~15000
// Attendance: ~500
// Books: 50
// Book Loans: 30
// Invoices: 100
// Timetable: 30
// Buses: 5
// --- NEW OPERATIONAL DATA ---
// Expenses: 20
// Homework: 20
// Live Classes: 15
// Papers: 15
// Syllabus: 20
// Substitutions: 10
// Medical Logs: 20
// Counseling: 15
// Hostel Rooms: 20
// Visitors: 15
// Gate Logs: 20
// Inquiries: 15
// Leave Applications: 15
// Tickets: 15
// Identity Documents: 20
// Buses: 5
// ============================================================================

// ============================================================================
// PHASE 5: ACADEMIC OVERSIGHT & SUBSTITUTIONS
// ============================================================================

// --- Syllabus Topics ---
export interface DummySyllabusTopic {
  id: string;
  school_id: string;
  title: string;
  description: string;
  order: number;
  estimatedHours: number;
  classId: string;
  subjectId: string;
}

function generateSyllabusTopics(): DummySyllabusTopic[] {
  const topics: DummySyllabusTopic[] = [];
  let topicIndex = 0;

  // We need to generate topics for each Class-Subject pair?
  // Actually, SyllabusTopic is linked to Class and Subject.
  // In our schema: classId references Class.
  // DUMMY_CLASS_SUBJECTS has {class_id, subject_id}.

  // Note: DUMMY_CLASS_SUBJECTS links specific SECTION classes (e.g. 10-A) to subjects.
  // But usually syllabus is same for 10-A, 10-B. 
  // Our schema stores SyllabusTopic per Class ID. 
  // If we want them to share topics, we'd need a master 'GradeSubject' link, 
  // but current schema links to Class (10-A).
  // So we will generate duplicate topics for each section for now (or just for A and propagate logic, but separate rows).

  // To avoid massive count, let's just generate for FIRST 5 classes for testing
  const testClasses = DUMMY_CLASSES.slice(0, 10);
  const relevantClassSubjects = DUMMY_CLASS_SUBJECTS.filter(cs => testClasses.some(c => c.id === cs.class_id));

  for (const cs of relevantClassSubjects) {
    const subject = DUMMY_SUBJECTS.find(s => s.id === cs.subject_id);
    if (!subject) continue;

    for (let i = 1; i <= 10; i++) {
      topics.push({
        id: `syl_topic_${topicIndex++}`,
        school_id: SCHOOL_ID,
        title: `${subject.name} - Chapter ${i}`,
        description: `Detailed description for Chapter ${i}`,
        order: i,
        estimatedHours: 5,
        classId: cs.class_id,
        subjectId: cs.subject_id
      });
    }
  }
  return topics;
}

export const DUMMY_SYLLABUS_TOPICS: DummySyllabusTopic[] = generateSyllabusTopics();

// --- Topic Completions ---
export interface DummyTopicCompletion {
  id: string;
  status: 'COMPLETED' | 'SKIPPED' | 'IN_PROGRESS';
  completedAt: Date;
  classId: string;
  section: Section;
  topicId: string;
  markedById: string | null;
  school_id: string;
}

function generateTopicCompletions(): DummyTopicCompletion[] {
  const completions: DummyTopicCompletion[] = [];
  let compIndex = 0;

  // We iterate over the generated topics
  // DUMMY_SYLLABUS_TOPICS are already linked to specific classId (e.g. 10-A).

  for (const topic of DUMMY_SYLLABUS_TOPICS) {
    const cls = DUMMY_CLASSES.find(c => c.id === topic.classId);
    if (!cls) continue;

    // Logic: 
    // Section A: 50% complete (Topics 1-5)
    // Section B: 20% complete (Topics 1-2)
    // Section C: 80% complete (Topics 1-8)
    // Section D: 0% complete

    // Check if we should mark this topic as completed
    let shouldComplete = false;
    if (cls.section === Section.A && topic.order <= 5) shouldComplete = true;
    else if (cls.section === Section.B && topic.order <= 2) shouldComplete = true;
    else if (cls.section === Section.C && topic.order <= 8) shouldComplete = true;

    if (shouldComplete) {
      // Fix: markedById expects StaffProfile ID, but cls.class_teacher_id is User ID
      const teacherProfile = DUMMY_STAFF_PROFILES.find(p => p.user_id === cls.class_teacher_id);

      completions.push({
        id: `tc_${compIndex++}`,
        status: 'COMPLETED',
        completedAt: new Date(),
        classId: topic.classId,
        section: cls.section,
        topicId: topic.id,
        markedById: teacherProfile ? teacherProfile.id : null,
        school_id: SCHOOL_ID
      });
    }
  }
  return completions;
}

export const DUMMY_TOPIC_COMPLETIONS: DummyTopicCompletion[] = generateTopicCompletions();


// --- Substitutions ---
export interface DummySubstitution {
  id: string;
  school_id: string;
  date: Date;
  period: number;
  status: 'PENDING' | 'ASSIGNED' | 'COMPLETED';
  reason: string;
  originalTeacherId: string;
  substituteTeacherId: string | null;
  classId: string;
  section: Section;
  subjectId: string | null;
}

function generateSubstitutions(): DummySubstitution[] {
  const subs: DummySubstitution[] = [];

  // Create 5 substitutions for Today
  const today = new Date();
  const teachers = DUMMY_STAFF_PROFILES.filter(p => DUMMY_STAFF_USERS.find(u => u.id === p.user_id)?.role === UserRole.TEACHER);

  if (teachers.length < 10) return subs; // logic needs teachers

  // 1. Pending (Sick leave)
  subs.push({
    id: 'sub_1', school_id: SCHOOL_ID, date: today, period: 1,
    status: 'PENDING', reason: 'SICK',
    originalTeacherId: teachers[0].id, substituteTeacherId: null,
    classId: DUMMY_CLASSES[0].id, section: DUMMY_CLASSES[0].section, subjectId: DUMMY_SUBJECTS[0].id
  });

  // 2. Assigned (Casual leave)
  subs.push({
    id: 'sub_2', school_id: SCHOOL_ID, date: today, period: 2,
    status: 'ASSIGNED', reason: 'CASUAL',
    originalTeacherId: teachers[1].id, substituteTeacherId: teachers[5].id,
    classId: DUMMY_CLASSES[1].id, section: DUMMY_CLASSES[1].section, subjectId: DUMMY_SUBJECTS[1].id
  });

  // 3. Pending (Emergency)
  subs.push({
    id: 'sub_3', school_id: SCHOOL_ID, date: today, period: 3,
    status: 'PENDING', reason: 'EMERGENCY',
    originalTeacherId: teachers[2].id, substituteTeacherId: null,
    classId: DUMMY_CLASSES[2].id, section: DUMMY_CLASSES[2].section, subjectId: DUMMY_SUBJECTS[2].id
  });

  // 4. Assigned
  subs.push({
    id: 'sub_4', school_id: SCHOOL_ID, date: today, period: 4,
    status: 'ASSIGNED', reason: 'OFFICIAL_DUTY',
    originalTeacherId: teachers[3].id, substituteTeacherId: teachers[6].id,
    classId: DUMMY_CLASSES[3].id, section: DUMMY_CLASSES[3].section, subjectId: DUMMY_SUBJECTS[3].id
  });

  // 5. Completed
  subs.push({
    id: 'sub_5', school_id: SCHOOL_ID, date: today, period: 5,
    status: 'COMPLETED', reason: 'SICK',
    originalTeacherId: teachers[4].id, substituteTeacherId: teachers[7].id,
    classId: DUMMY_CLASSES[4].id, section: DUMMY_CLASSES[4].section, subjectId: DUMMY_SUBJECTS[4].id
  });

  return subs;
}

export const DUMMY_SUBSTITUTIONS_NEW: DummySubstitution[] = generateSubstitutions();

// --- Nudge Logs ---
export interface DummyNudgeLog {
  id: string;
  school_id: string;
  type: string;
  message: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
  created_at: Date;
}

function generateNudgeLogs(): DummyNudgeLog[] {
  const nudges: DummyNudgeLog[] = [];

  // Principal sends nudge to teacher
  const principal = DUMMY_STAFF_PROFILES.find(p => p.designation === 'Principal');
  const teacher = DUMMY_STAFF_PROFILES.find(p => p.designation === 'Teacher');

  if (principal && teacher) {
    nudges.push({
      id: 'nudge_1', school_id: SCHOOL_ID, type: 'SYLLABUS_LAG',
      message: 'Please speed up Math syllabus for Class 10-A',
      senderId: principal.id, receiverId: teacher.id,
      isRead: false, created_at: new Date()
    });

    nudges.push({
      id: 'nudge_2', school_id: SCHOOL_ID, type: 'ATTENDANCE',
      message: 'Please mark attendance by 9 AM',
      senderId: principal.id, receiverId: teacher.id,
      isRead: true, created_at: new Date()
    });
  }
  return nudges;
}

export const DUMMY_NUDGE_LOGS: DummyNudgeLog[] = generateNudgeLogs();
