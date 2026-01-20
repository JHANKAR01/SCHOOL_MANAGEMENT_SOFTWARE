---
description: Role-based permissions and capabilities for each user type in the school management system.
---

# User Personas & Permissions

> **Rule**: Every feature must respect these role boundaries. When building a dashboard or feature, check what this role CAN and CANNOT do.

## Role Hierarchy

```
SUPER_ADMIN (Platform Owner)
    └── SCHOOL_ADMIN (School IT/Management)
        └── PRINCIPAL
            ├── VICE_PRINCIPAL
            ├── HOD (Head of Department)
            └── Various Staff Roles...
```

---

## 🔴 SUPER_ADMIN
**Who**: Platform owner, SaaS operator
**Scope**: ALL schools, ALL data

| Can Do | Cannot Do |
|--------|-----------|
| Create/delete schools | - |
| Manage feature flags | - |
| Access platform analytics | - |
| Impersonate any user | - |

---

## 🟠 SCHOOL_ADMIN
**Who**: IT administrator, school management
**Scope**: Single school only

| Can Do | Cannot Do |
|--------|-----------|
| Manage users & roles | Access other schools |
| Configure school settings | Override SUPER_ADMIN decisions |
| View audit logs | Delete audit logs |
| Toggle system lockdown | Edit student grades |

---

## 🟣 PRINCIPAL
**Who**: School head
**Scope**: Single school, all departments

| Can Do | Cannot Do |
|--------|-----------|
| View ALL dashboards | Delete users |
| Approve/reject leave | Edit grades directly |
| Publish exam results | Access other schools |
| View financial summaries | Process payments |
| Send announcements | Modify system settings |

---

## 🔵 TEACHER
**Who**: Subject teacher
**Scope**: OWN classes only

| Can Do | Cannot Do |
|--------|-----------|
| View assigned classes | View other teachers' classes |
| Enter marks for own subjects | Modify others' marks |
| Create homework | Approve leave |
| Start live classes | Access financial data |
| Apply for leave | View student PII (Aadhaar) |
| Mark attendance | Delete student records |

---

## 🟢 STUDENT
**Who**: Enrolled student
**Scope**: OWN data only

| Can Do | Cannot Do |
|--------|-----------|
| View own attendance | View other students' data |
| View own grades | Edit any data |
| Submit homework | View teacher data |
| Join live classes | Access admin features |
| View fee invoices | Make payments |

---

## 🟡 PARENT
**Who**: Student's guardian
**Scope**: Linked children only

| Can Do | Cannot Do |
|--------|-----------|
| View child's attendance | View other children |
| View child's grades | Edit any data |
| Pay fees via UPI | Access teacher data |
| Track school bus | Join live classes |
| View announcements | Contact other parents |

---

## 🟤 ACCOUNTANT
**Who**: Finance staff
**Scope**: Financial data only

| Can Do | Cannot Do |
|--------|-----------|
| Create invoices | View academic data |
| Record payments | Access student grades |
| Generate fee reports | Modify attendance |
| Manage expenses | Access personal data |

---

## Data Access Matrix

| Data Type | Principal | Teacher | Student | Parent | Accountant |
|-----------|-----------|---------|---------|--------|------------|
| Student Grades | ✅ View All | ✅ Own Classes | ✅ Own Only | ✅ Child Only | ❌ |
| Attendance | ✅ View All | ✅ Own Classes | ✅ Own Only | ✅ Child Only | ❌ |
| Financial | ✅ Summary | ❌ | ✅ Own Invoices | ✅ Child Invoices | ✅ Full Access |
| PII (Aadhaar) | 🔒 Masked | ❌ | ❌ | ❌ | ❌ |
| Staff Data | ✅ View All | ❌ | ❌ | ❌ | ❌ |

---

## Implementation Notes

1. **RLS (Row Level Security)**: All Prisma queries must include `school_id` filter
2. **Middleware**: `requireRole([...])` decorator enforces access
3. **Frontend**: Hide UI elements user cannot access (don't just disable)
4. **Audit**: Log all access to sensitive data (grades, PII, payments)
