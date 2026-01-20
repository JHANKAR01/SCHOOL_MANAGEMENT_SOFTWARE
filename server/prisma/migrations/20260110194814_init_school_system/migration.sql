-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HOD', 'TEACHER', 'ACCOUNTANT', 'FINANCE_MANAGER', 'FLEET_MANAGER', 'ADMISSIONS_OFFICER', 'EXAM_CELL', 'LIBRARIAN', 'WARDEN', 'NURSE', 'COUNSELOR', 'INVENTORY_MANAGER', 'RECEPTIONIST', 'IT_ADMIN', 'SECURITY_HEAD', 'ESTATE_MANAGER', 'PARENT', 'STUDENT');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'VERIFIED', 'PAID');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "settings_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "department" TEXT,
    "school_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "admission_no" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "class" TEXT NOT NULL,
    "roll" INTEGER NOT NULL,
    "school_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentStudent" (
    "parent_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ParentStudent_pkey" PRIMARY KEY ("parent_id","student_id")
);

-- CreateTable
CREATE TABLE "IdentityDocument" (
    "id" TEXT NOT NULL,
    "owner_user_id" TEXT,
    "owner_student_id" TEXT,
    "doc_type" TEXT NOT NULL,
    "file_ref" TEXT NOT NULL,
    "masked_id" TEXT,
    "verification_status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "school_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdentityDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bus" (
    "id" TEXT NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "routeId" TEXT NOT NULL,
    "insuranceExpiry" TIMESTAMP(3) NOT NULL,
    "school_id" TEXT NOT NULL,

    CONSTRAINT "Bus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "isbn" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "issuedTo" TEXT,
    "school_id" TEXT NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("isbn")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "base_amount" DOUBLE PRECISION NOT NULL,
    "discount_amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "utr" TEXT,
    "school_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "synced" BOOLEAN NOT NULL DEFAULT false,
    "school_id" TEXT NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalLog" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "issue" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,

    CONSTRAINT "MedicalLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Counseling" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "school_id" TEXT NOT NULL,

    CONSTRAINT "Counseling_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_school_id_idx" ON "User"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE INDEX "Student_school_id_idx" ON "Student"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "Student_school_id_admission_no_key" ON "Student"("school_id", "admission_no");

-- CreateIndex
CREATE INDEX "IdentityDocument_school_id_idx" ON "IdentityDocument"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "Bus_plateNumber_key" ON "Bus"("plateNumber");

-- CreateIndex
CREATE INDEX "Bus_school_id_idx" ON "Bus"("school_id");

-- CreateIndex
CREATE INDEX "Book_school_id_idx" ON "Book"("school_id");

-- CreateIndex
CREATE INDEX "Invoice_school_id_idx" ON "Invoice"("school_id");

-- CreateIndex
CREATE INDEX "Invoice_student_id_idx" ON "Invoice"("student_id");

-- CreateIndex
CREATE INDEX "Attendance_school_id_idx" ON "Attendance"("school_id");

-- CreateIndex
CREATE INDEX "Attendance_student_id_idx" ON "Attendance"("student_id");

-- CreateIndex
CREATE INDEX "MedicalLog_school_id_idx" ON "MedicalLog"("school_id");

-- CreateIndex
CREATE INDEX "MedicalLog_student_id_idx" ON "MedicalLog"("student_id");

-- CreateIndex
CREATE INDEX "Counseling_school_id_idx" ON "Counseling"("school_id");

-- CreateIndex
CREATE INDEX "Counseling_student_id_idx" ON "Counseling"("student_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentStudent" ADD CONSTRAINT "ParentStudent_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentStudent" ADD CONSTRAINT "ParentStudent_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentityDocument" ADD CONSTRAINT "IdentityDocument_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentityDocument" ADD CONSTRAINT "IdentityDocument_owner_student_id_fkey" FOREIGN KEY ("owner_student_id") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bus" ADD CONSTRAINT "Bus_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalLog" ADD CONSTRAINT "MedicalLog_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Counseling" ADD CONSTRAINT "Counseling_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
