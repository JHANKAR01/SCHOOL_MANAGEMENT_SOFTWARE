/*
  Warnings:

  - You are about to drop the column `issuedTo` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `class` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `roll` on the `Student` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[student_id,date,period]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `Student` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Section" AS ENUM ('A', 'B', 'C', 'D', 'E', 'F');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ALUMNI', 'TRANSFERRED', 'EXPELLED');

-- CreateEnum
CREATE TYPE "StaffStatus" AS ENUM ('ACTIVE', 'ON_LEAVE', 'RESIGNED', 'RETIRED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'PROMOTED', 'DETAINED', 'TRANSFERRED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('ACTIVE', 'RETURNED', 'OVERDUE', 'LOST');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('UTILITY', 'VENDOR', 'SALARY', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "HomeworkStatus" AS ENUM ('PENDING', 'SUBMITTED', 'GRADED');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'FOLLOW_UP', 'CONVERTED');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('SICK', 'CASUAL', 'EARNED');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'RESOLVED', 'ASSIGNED', 'PENDING');

-- CreateEnum
CREATE TYPE "VisitorStatus" AS ENUM ('WAITING', 'APPROVED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('INTERNAL', 'MIDTERM', 'FINAL');

-- CreateEnum
CREATE TYPE "GatePersonType" AS ENUM ('STUDENT', 'STAFF', 'VISITOR');

-- CreateEnum
CREATE TYPE "GateStatus" AS ENUM ('INSIDE', 'EXITED');

-- CreateEnum
CREATE TYPE "PaperStatus" AS ENUM ('DRAFT', 'PRINTED', 'DISTRIBUTED');

-- CreateEnum
CREATE TYPE "SyllabusStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "marked_by" TEXT,
ADD COLUMN     "period" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "date" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "issuedTo",
ADD COLUMN     "available" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Bus" ALTER COLUMN "insuranceExpiry" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "Counseling" ALTER COLUMN "date" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "IdentityDocument" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "due_date" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "MedicalLog" ALTER COLUMN "time" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "ParentStudent" ADD COLUMN     "can_pickup" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "has_custody" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "School" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "class",
DROP COLUMN "roll",
ADD COLUMN     "aadhaar_number" TEXT,
ADD COLUMN     "address_line1" TEXT,
ADD COLUMN     "address_line2" TEXT,
ADD COLUMN     "admission_date" DATE,
ADD COLUMN     "alternate_phone" TEXT,
ADD COLUMN     "birth_certificate_no" TEXT,
ADD COLUMN     "blood_group" TEXT,
ADD COLUMN     "caste" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "date_of_birth" DATE,
ADD COLUMN     "emergency_contact_name" TEXT,
ADD COLUMN     "emergency_contact_phone" TEXT,
ADD COLUMN     "father_name" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "guardian_name" TEXT,
ADD COLUMN     "leaving_date" DATE,
ADD COLUMN     "leaving_reason" TEXT,
ADD COLUMN     "mother_name" TEXT,
ADD COLUMN     "mother_tongue" TEXT,
ADD COLUMN     "nationality" TEXT DEFAULT 'Indian',
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "photo_url" TEXT,
ADD COLUMN     "pincode" TEXT,
ADD COLUMN     "previous_school" TEXT,
ADD COLUMN     "religion" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "transfer_certificate_no" TEXT,
ADD COLUMN     "user_id" TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6);

-- CreateTable
CREATE TABLE "AcademicYear" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "academic_year_id" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "section" "Section" NOT NULL,
    "capacity" INTEGER DEFAULT 40,
    "class_teacher_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_optional" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassSubject" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,

    CONSTRAINT "ClassSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentEnrollment" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "academic_year_id" TEXT NOT NULL,
    "roll_number" INTEGER NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "promoted_from_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffProfile" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "employee_id" TEXT,
    "designation" TEXT NOT NULL,
    "department" TEXT,
    "employment_type" TEXT,
    "joining_date" DATE,
    "confirmation_date" DATE,
    "qualification" TEXT,
    "experience_years" INTEGER,
    "specialization" TEXT,
    "date_of_birth" DATE,
    "gender" TEXT,
    "blood_group" TEXT,
    "address_line1" TEXT,
    "address_line2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "aadhaar_number" TEXT,
    "pan_number" TEXT,
    "emergency_contact_name" TEXT,
    "emergency_contact_phone" TEXT,
    "photo_url" TEXT,
    "status" "StaffStatus" NOT NULL DEFAULT 'ACTIVE',
    "leaving_date" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffFinancial" (
    "id" TEXT NOT NULL,
    "staff_profile_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "salary_grade" TEXT,
    "basic_salary" DOUBLE PRECISION NOT NULL,
    "hra" DOUBLE PRECISION DEFAULT 0,
    "allowances" DOUBLE PRECISION DEFAULT 0,
    "deductions" DOUBLE PRECISION DEFAULT 0,
    "bank_name" TEXT,
    "bank_account_no" TEXT,
    "ifsc_code" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffFinancial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffSubject" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "staff_profile_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "StaffSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffClass" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "staff_profile_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'TEACHER',

    CONSTRAINT "StaffClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentProfile" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "date_of_birth" DATE,
    "gender" TEXT,
    "occupation" TEXT,
    "organization" TEXT,
    "annual_income" TEXT,
    "qualification" TEXT,
    "alternate_phone" TEXT,
    "office_phone" TEXT,
    "address_line1" TEXT,
    "address_line2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "aadhaar_number" TEXT,
    "is_emergency_contact" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ExamType" DEFAULT 'INTERNAL',
    "start_date" TIMESTAMPTZ(6) NOT NULL,
    "end_date" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Result" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "total_percentage" DOUBLE PRECISION,
    "grade" TEXT,
    "remarks" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResultMark" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "result_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "marks_obtained" DOUBLE PRECISION NOT NULL,
    "max_marks" DOUBLE PRECISION NOT NULL,
    "grade" TEXT,
    "remarks" TEXT,

    CONSTRAINT "ResultMark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timetable" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "teacher_id" TEXT,

    CONSTRAINT "Timetable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Homework" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "description" TEXT,
    "due_date" TIMESTAMPTZ(6) NOT NULL,
    "status" "HomeworkStatus" DEFAULT 'PENDING',
    "class_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Homework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveClass" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "meeting_link" TEXT NOT NULL,
    "is_active" BOOLEAN DEFAULT false,
    "start_time" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paper" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "status" "PaperStatus" DEFAULT 'DRAFT',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Paper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Syllabus" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "status" "SyllabusStatus" DEFAULT 'NOT_STARTED',
    "teacher_id" TEXT,
    "completed_at" TIMESTAMPTZ(6),

    CONSTRAINT "Syllabus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Substitution" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "original_teacher_id" TEXT,
    "substitute_teacher_id" TEXT,
    "timetable_id" TEXT,

    CONSTRAINT "Substitution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookLoan" (
    "id" TEXT NOT NULL,
    "book_isbn" TEXT NOT NULL,
    "borrower_type" TEXT NOT NULL,
    "student_id" TEXT,
    "user_id" TEXT,
    "school_id" TEXT NOT NULL,
    "issue_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" TIMESTAMPTZ(6) NOT NULL,
    "return_date" TIMESTAMPTZ(6),
    "fine_amount" DOUBLE PRECISION DEFAULT 0,
    "fine_paid" BOOLEAN NOT NULL DEFAULT false,
    "status" "LoanStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "BookLoan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "date" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostelRoom" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "room_number" TEXT NOT NULL,
    "student_id" TEXT,
    "capacity" INTEGER DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HostelRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visitor" (
    "id" SERIAL NOT NULL,
    "school_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "student_id" TEXT,
    "purpose" TEXT NOT NULL,
    "status" "VisitorStatus" DEFAULT 'WAITING',
    "time" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GateLog" (
    "id" SERIAL NOT NULL,
    "school_id" TEXT NOT NULL,
    "person_type" "GatePersonType" NOT NULL,
    "person_id" TEXT,
    "name" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "status" "GateStatus" DEFAULT 'INSIDE',
    "entry_time" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "exit_time" TIMESTAMPTZ(6),

    CONSTRAINT "GateLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" SERIAL NOT NULL,
    "school_id" TEXT NOT NULL,
    "parent_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "target_class" TEXT,
    "status" "InquiryStatus" DEFAULT 'NEW',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveApplication" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "LeaveType" NOT NULL,
    "start_date" TIMESTAMPTZ(6) NOT NULL,
    "end_date" TIMESTAMPTZ(6) NOT NULL,
    "reason" TEXT,
    "status" "LeaveStatus" DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaveApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "issue" TEXT NOT NULL,
    "priority" "TicketPriority" DEFAULT 'MEDIUM',
    "status" "TicketStatus" DEFAULT 'OPEN',
    "reported_by" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "school_id" TEXT NOT NULL,
    "lockdown_mode" BOOLEAN DEFAULT false,
    "low_data_mode" BOOLEAN DEFAULT false,
    "announcement_ticker" TEXT,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("school_id")
);

-- CreateIndex
CREATE INDEX "AcademicYear_school_id_idx" ON "AcademicYear"("school_id");

-- CreateIndex
CREATE INDEX "AcademicYear_school_id_is_current_idx" ON "AcademicYear"("school_id", "is_current");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_school_id_name_key" ON "AcademicYear"("school_id", "name");

-- CreateIndex
CREATE INDEX "Class_school_id_idx" ON "Class"("school_id");

-- CreateIndex
CREATE INDEX "Class_academic_year_id_idx" ON "Class"("academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "Class_school_id_academic_year_id_grade_section_key" ON "Class"("school_id", "academic_year_id", "grade", "section");

-- CreateIndex
CREATE INDEX "Subject_school_id_idx" ON "Subject"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_school_id_code_key" ON "Subject"("school_id", "code");

-- CreateIndex
CREATE INDEX "ClassSubject_school_id_idx" ON "ClassSubject"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "ClassSubject_class_id_subject_id_key" ON "ClassSubject"("class_id", "subject_id");

-- CreateIndex
CREATE INDEX "StudentEnrollment_school_id_idx" ON "StudentEnrollment"("school_id");

-- CreateIndex
CREATE INDEX "StudentEnrollment_class_id_idx" ON "StudentEnrollment"("class_id");

-- CreateIndex
CREATE INDEX "StudentEnrollment_academic_year_id_idx" ON "StudentEnrollment"("academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "StudentEnrollment_student_id_academic_year_id_key" ON "StudentEnrollment"("student_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "StudentEnrollment_class_id_roll_number_key" ON "StudentEnrollment"("class_id", "roll_number");

-- CreateIndex
CREATE UNIQUE INDEX "StaffProfile_user_id_key" ON "StaffProfile"("user_id");

-- CreateIndex
CREATE INDEX "StaffProfile_school_id_idx" ON "StaffProfile"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "StaffProfile_school_id_employee_id_key" ON "StaffProfile"("school_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "StaffFinancial_staff_profile_id_key" ON "StaffFinancial"("staff_profile_id");

-- CreateIndex
CREATE INDEX "StaffFinancial_school_id_idx" ON "StaffFinancial"("school_id");

-- CreateIndex
CREATE INDEX "StaffSubject_school_id_idx" ON "StaffSubject"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "StaffSubject_staff_profile_id_subject_id_key" ON "StaffSubject"("staff_profile_id", "subject_id");

-- CreateIndex
CREATE INDEX "StaffClass_school_id_idx" ON "StaffClass"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "StaffClass_staff_profile_id_class_id_key" ON "StaffClass"("staff_profile_id", "class_id");

-- CreateIndex
CREATE UNIQUE INDEX "ParentProfile_user_id_key" ON "ParentProfile"("user_id");

-- CreateIndex
CREATE INDEX "ParentProfile_school_id_idx" ON "ParentProfile"("school_id");

-- CreateIndex
CREATE INDEX "Exam_school_id_idx" ON "Exam"("school_id");

-- CreateIndex
CREATE INDEX "Result_school_id_idx" ON "Result"("school_id");

-- CreateIndex
CREATE INDEX "Result_exam_id_idx" ON "Result"("exam_id");

-- CreateIndex
CREATE INDEX "Result_student_id_idx" ON "Result"("student_id");

-- CreateIndex
CREATE INDEX "ResultMark_school_id_idx" ON "ResultMark"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "ResultMark_result_id_subject_id_key" ON "ResultMark"("result_id", "subject_id");

-- CreateIndex
CREATE INDEX "Timetable_class_id_idx" ON "Timetable"("class_id");

-- CreateIndex
CREATE INDEX "Timetable_subject_id_idx" ON "Timetable"("subject_id");

-- CreateIndex
CREATE INDEX "Timetable_school_id_idx" ON "Timetable"("school_id");

-- CreateIndex
CREATE INDEX "Homework_school_id_idx" ON "Homework"("school_id");

-- CreateIndex
CREATE INDEX "Homework_class_id_idx" ON "Homework"("class_id");

-- CreateIndex
CREATE INDEX "Homework_subject_id_idx" ON "Homework"("subject_id");

-- CreateIndex
CREATE INDEX "LiveClass_class_id_idx" ON "LiveClass"("class_id");

-- CreateIndex
CREATE INDEX "LiveClass_subject_id_idx" ON "LiveClass"("subject_id");

-- CreateIndex
CREATE INDEX "LiveClass_school_id_idx" ON "LiveClass"("school_id");

-- CreateIndex
CREATE INDEX "Paper_class_id_idx" ON "Paper"("class_id");

-- CreateIndex
CREATE INDEX "Paper_subject_id_idx" ON "Paper"("subject_id");

-- CreateIndex
CREATE INDEX "Paper_school_id_idx" ON "Paper"("school_id");

-- CreateIndex
CREATE INDEX "Syllabus_class_id_idx" ON "Syllabus"("class_id");

-- CreateIndex
CREATE INDEX "Syllabus_subject_id_idx" ON "Syllabus"("subject_id");

-- CreateIndex
CREATE INDEX "Syllabus_school_id_idx" ON "Syllabus"("school_id");

-- CreateIndex
CREATE INDEX "Substitution_school_id_idx" ON "Substitution"("school_id");

-- CreateIndex
CREATE INDEX "BookLoan_book_isbn_idx" ON "BookLoan"("book_isbn");

-- CreateIndex
CREATE INDEX "BookLoan_student_id_idx" ON "BookLoan"("student_id");

-- CreateIndex
CREATE INDEX "BookLoan_user_id_idx" ON "BookLoan"("user_id");

-- CreateIndex
CREATE INDEX "BookLoan_school_id_idx" ON "BookLoan"("school_id");

-- CreateIndex
CREATE INDEX "Expense_school_id_idx" ON "Expense"("school_id");

-- CreateIndex
CREATE INDEX "HostelRoom_school_id_idx" ON "HostelRoom"("school_id");

-- CreateIndex
CREATE INDEX "Visitor_school_id_idx" ON "Visitor"("school_id");

-- CreateIndex
CREATE INDEX "GateLog_school_id_idx" ON "GateLog"("school_id");

-- CreateIndex
CREATE INDEX "Inquiry_school_id_idx" ON "Inquiry"("school_id");

-- CreateIndex
CREATE INDEX "LeaveApplication_school_id_idx" ON "LeaveApplication"("school_id");

-- CreateIndex
CREATE INDEX "Ticket_school_id_idx" ON "Ticket"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_student_id_date_period_key" ON "Attendance"("student_id", "date", "period");

-- CreateIndex
CREATE INDEX "ParentStudent_school_id_idx" ON "ParentStudent"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "Student_user_id_key" ON "Student"("user_id");

-- AddForeignKey
ALTER TABLE "AcademicYear" ADD CONSTRAINT "AcademicYear_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_class_teacher_id_fkey" FOREIGN KEY ("class_teacher_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubject" ADD CONSTRAINT "ClassSubject_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubject" ADD CONSTRAINT "ClassSubject_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubject" ADD CONSTRAINT "ClassSubject_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffProfile" ADD CONSTRAINT "StaffProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffProfile" ADD CONSTRAINT "StaffProfile_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffFinancial" ADD CONSTRAINT "StaffFinancial_staff_profile_id_fkey" FOREIGN KEY ("staff_profile_id") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffFinancial" ADD CONSTRAINT "StaffFinancial_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffSubject" ADD CONSTRAINT "StaffSubject_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffSubject" ADD CONSTRAINT "StaffSubject_staff_profile_id_fkey" FOREIGN KEY ("staff_profile_id") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffSubject" ADD CONSTRAINT "StaffSubject_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffClass" ADD CONSTRAINT "StaffClass_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffClass" ADD CONSTRAINT "StaffClass_staff_profile_id_fkey" FOREIGN KEY ("staff_profile_id") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffClass" ADD CONSTRAINT "StaffClass_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentProfile" ADD CONSTRAINT "ParentProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentProfile" ADD CONSTRAINT "ParentProfile_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_marked_by_fkey" FOREIGN KEY ("marked_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ResultMark" ADD CONSTRAINT "ResultMark_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultMark" ADD CONSTRAINT "ResultMark_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "Result"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultMark" ADD CONSTRAINT "ResultMark_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timetable" ADD CONSTRAINT "Timetable_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timetable" ADD CONSTRAINT "Timetable_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timetable" ADD CONSTRAINT "Timetable_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Timetable" ADD CONSTRAINT "Timetable_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "LiveClass" ADD CONSTRAINT "LiveClass_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveClass" ADD CONSTRAINT "LiveClass_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveClass" ADD CONSTRAINT "LiveClass_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "LiveClass" ADD CONSTRAINT "LiveClass_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Paper" ADD CONSTRAINT "Paper_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paper" ADD CONSTRAINT "Paper_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paper" ADD CONSTRAINT "Paper_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Syllabus" ADD CONSTRAINT "Syllabus_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Syllabus" ADD CONSTRAINT "Syllabus_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Syllabus" ADD CONSTRAINT "Syllabus_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Syllabus" ADD CONSTRAINT "Syllabus_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Substitution" ADD CONSTRAINT "Substitution_original_teacher_id_fkey" FOREIGN KEY ("original_teacher_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Substitution" ADD CONSTRAINT "Substitution_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Substitution" ADD CONSTRAINT "Substitution_substitute_teacher_id_fkey" FOREIGN KEY ("substitute_teacher_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Substitution" ADD CONSTRAINT "Substitution_timetable_id_fkey" FOREIGN KEY ("timetable_id") REFERENCES "Timetable"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BookLoan" ADD CONSTRAINT "BookLoan_book_isbn_fkey" FOREIGN KEY ("book_isbn") REFERENCES "Book"("isbn") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookLoan" ADD CONSTRAINT "BookLoan_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookLoan" ADD CONSTRAINT "BookLoan_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookLoan" ADD CONSTRAINT "BookLoan_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "HostelRoom" ADD CONSTRAINT "HostelRoom_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "HostelRoom" ADD CONSTRAINT "HostelRoom_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "GateLog" ADD CONSTRAINT "GateLog_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "LeaveApplication" ADD CONSTRAINT "LeaveApplication_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "LeaveApplication" ADD CONSTRAINT "LeaveApplication_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SystemSettings" ADD CONSTRAINT "SystemSettings_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
