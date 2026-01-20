---
description: Quick reference for database schema, key tables, and relationships.
---

# Database Schema Reference

> **Location**: `server/prisma/schema.prisma`
> **Database**: PostgreSQL (Supabase)
> **Schema Name**: `schoolmanagementsystem`

---

## Core Entities

### User & Auth
```
User (id, email, password_hash, role, school_id)
  └── StaffProfile (user_id, designation, department, ...)
  └── StudentAccount (user_id, student_id)
```

### Academic Structure
```
School
  └── AcademicYear (is_current)
      └── Class (name: "10-A", section)
          └── Subject (name: "Mathematics", code: "MATH")
              └── Timetable (day, period, teacher_id)
```

### Student Data
```
Student (id, name, admission_no, ...)
  └── Enrollment (class_id, academic_year_id, status)
  └── Attendance (date, status: PRESENT/ABSENT/LATE)
  └── Result (exam_id)
      └── ResultMark (subject_id, marks_obtained)
```

---

## Key Relationships

| Parent | Child | Relation | Notes |
|--------|-------|----------|-------|
| School | User | 1:N | All users belong to a school |
| School | Class | 1:N | Classes are school-specific |
| Class | Enrollment | 1:N | Students enrolled per year |
| Student | Enrollment | 1:N | One per academic year |
| Exam | Result | 1:N | One result per student per exam |
| Result | ResultMark | 1:N | One mark per subject |
| User | StaffProfile | 1:1 | Teachers, admins, etc. |
| StaffProfile | LeaveBalance | 1:N | Leave quota per year |

---

## Common Queries

### Get students in a class
```prisma
prisma.enrollment.findMany({
  where: { 
    class_id: 'cls_10A',
    academic_year: { is_current: true }
  },
  include: { student: true }
})
```

### Get teacher's classes today
```prisma
prisma.timetable.findMany({
  where: {
    teacher_id: userId,
    day: 'MONDAY'
  },
  include: { class: true, subject: true }
})
```

### Get pending invoices
```prisma
prisma.invoice.findMany({
  where: {
    school_id,
    status: { in: ['PENDING', 'PARTIAL'] }
  }
})
```

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Table names | PascalCase | `Student`, `AcademicYear` |
| Column names | snake_case | `school_id`, `created_at` |
| Foreign keys | `{table}_id` | `student_id`, `class_id` |
| Boolean | `is_` prefix | `is_current`, `is_active` |
| Timestamps | `_at` suffix | `created_at`, `updated_at` |
| Enums | SCREAMING_CASE | `PENDING`, `APPROVED` |

---

## Important Indexes

These are already defined in schema.prisma:

| Table | Index | Purpose |
|-------|-------|---------|
| Attendance | `[school_id, date]` | Daily attendance queries |
| Invoice | `[school_id, status]` | Defaulter reports |
| Enrollment | `[class_id, academic_year_id]` | Class roster |
| Timetable | `[teacher_id, day]` | Teacher schedule |

---

## Enums Reference

### UserRole
```
SUPER_ADMIN, SCHOOL_ADMIN, PRINCIPAL, VICE_PRINCIPAL, HOD,
TEACHER, ACCOUNTANT, FINANCE_MANAGER, FLEET_MANAGER,
ADMISSIONS_OFFICER, EXAM_CELL, LIBRARIAN, WARDEN, NURSE,
COUNSELOR, INVENTORY_MANAGER, RECEPTIONIST, IT_ADMIN,
SECURITY_HEAD, ESTATE_MANAGER, PARENT, STUDENT
```

### InvoiceStatus
```
DRAFT, PENDING, PARTIAL, PAID, OVERDUE, VOID
```

### AttendanceStatus
```
PRESENT, ABSENT, LATE
```

### LeaveStatus
```
PENDING, APPROVED, REJECTED
```

---

## Adding New Tables

1. Add model to `server/prisma/schema.prisma`
2. Include `school_id` for multi-tenancy
3. Add `@@index([school_id])` for RLS performance
4. Add `@@schema("schoolmanagementsystem")`
5. Run `npx prisma db push` to sync
6. Add seed data in `server/src/data/seed.ts`
