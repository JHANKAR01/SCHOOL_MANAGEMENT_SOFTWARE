---
description: How to work with database schema, migrations, and seed data.
---

# Data & Database Workflow

> **ORM**: Prisma
> **Database**: PostgreSQL (Supabase)
> **Schema Location**: `server/prisma/schema.prisma`

---

## Quick Commands

```bash
# Push schema changes to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Run seed script
npx tsx server/src/data/seed.ts

# Open Prisma Studio (GUI)
npx prisma studio
```

---

## Adding a New Table

### Step 1: Define Model in Schema

```prisma
// server/prisma/schema.prisma

model InventoryItem {
  id          String   @id @default(cuid())
  school_id   String
  name        String
  category    String
  quantity    Int      @default(0)
  min_stock   Int      @default(10)
  created_at  DateTime @default(now()) @db.Timestamptz(6)
  updated_at  DateTime @updatedAt

  // Relations
  school      School   @relation(fields: [school_id], references: [id])

  // Indexes (REQUIRED for multi-tenancy)
  @@index([school_id])
  @@schema("schoolmanagementsystem")
}
```

### Step 2: Add Relation to School

```prisma
// In the School model, add:
model School {
  // ... existing fields ...
  inventoryItems  InventoryItem[]
}
```

### Step 3: Push to Database

```bash
npx prisma db push
```

### Step 4: Update Seed Data (Optional)

```typescript
// server/src/data/seed.ts

// Add to seed function
console.log('[Step N] Creating inventory items...');
await prisma.inventoryItem.createMany({
  data: [
    { school_id: school.id, name: 'Chalk', category: 'Supplies', quantity: 100 },
    { school_id: school.id, name: 'Markers', category: 'Supplies', quantity: 50 },
  ]
});
```

---

## Schema Conventions

### Naming
| Type | Convention | Example |
|------|------------|---------|
| Model | PascalCase | `InventoryItem` |
| Field | snake_case | `school_id`, `created_at` |
| FK | `{model}_id` | `student_id` |
| Boolean | `is_` prefix | `is_active` |
| Timestamp | `_at` suffix | `created_at` |

### Required Fields for Multi-Tenancy
```prisma
model AnyModel {
  id          String   @id @default(cuid())
  school_id   String                         // REQUIRED
  // ... other fields ...
  
  school      School   @relation(...)        // REQUIRED
  
  @@index([school_id])                       // REQUIRED
  @@schema("schoolmanagementsystem")         // REQUIRED
}
```

### Common Field Types
```prisma
// IDs
id          String   @id @default(cuid())
id          Int      @id @default(autoincrement())

// Strings
name        String
description String?  // Optional

// Numbers
quantity    Int      @default(0)
amount      Float

// Booleans
is_active   Boolean  @default(true)

// Dates
date        DateTime @db.Date
created_at  DateTime @default(now()) @db.Timestamptz(6)
updated_at  DateTime @updatedAt

// Enums
status      InvoiceStatus @default(PENDING)

// JSON
metadata    Json?    @default("{}")
```

---

## Defining Enums

```prisma
// At the end of schema.prisma

enum InventoryCategory {
  SUPPLIES
  FURNITURE
  ELECTRONICS
  BOOKS
  OTHER

  @@schema("schoolmanagementsystem")
}
```

---

## Relations

### One-to-Many
```prisma
model School {
  id        String     @id
  students  Student[]  // One school has many students
}

model Student {
  id        String  @id
  school_id String
  school    School  @relation(fields: [school_id], references: [id])
}
```

### One-to-One
```prisma
model User {
  id           String        @id
  staffProfile StaffProfile?
}

model StaffProfile {
  id      String @id
  user_id String @unique
  user    User   @relation(fields: [user_id], references: [id])
}
```

### Many-to-Many
```prisma
model Student {
  subjects StudentSubject[]
}

model Subject {
  students StudentSubject[]
}

model StudentSubject {
  student_id String
  subject_id String
  student    Student @relation(fields: [student_id], references: [id])
  subject    Subject @relation(fields: [subject_id], references: [id])
  
  @@id([student_id, subject_id])
}
```

---

## Seed Data Structure

```typescript
// server/src/data/seed.ts

async function main() {
  console.log('🌱 Starting database seed...');
  
  // Step 1: Clean database (in correct order for FK constraints)
  console.log('[Step 1] Cleaning database...');
  await prisma.childTable.deleteMany();  // Children first
  await prisma.parentTable.deleteMany(); // Parents last
  
  // Step 2: Create seed data
  console.log('[Step 2] Creating schools...');
  const school = await prisma.school.create({...});
  
  console.log('[Step 3] Creating users...');
  // ...
  
  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## Dummy Data Generators

```typescript
// data/fixtures/dummy-data.ts

// Generate consistent IDs
function generateId(prefix: string, index: number): string {
  return `${prefix}_${String(index).padStart(4, '0')}`;
}

// Generate students
export const DUMMY_STUDENTS = Array.from({ length: 2000 }, (_, i) => ({
  id: generateId('std', i + 1),
  name: `Student ${i + 1}`,
  admission_no: `ADM${2024000 + i}`,
  // ...
}));
```

---

## Troubleshooting

### "Foreign Key Constraint" Error
```
Delete order matters! Delete children before parents:

✅ Correct Order:
1. Delete Attendance (child of Student)
2. Delete Enrollment (child of Student)
3. Delete Student (child of School)
4. Delete School

❌ Wrong Order:
1. Delete School → ERROR! Still has students.
```

### "Unique Constraint" Error
```
A record with that unique field already exists.

Fix: Check @unique fields and ensure seed data has unique values.
```

### "Schema Out of Sync"
```bash
npx prisma db push --force-reset  # WARNING: Deletes all data!
npx tsx server/src/data/seed.ts   # Re-seed after reset
```

---

## Checklist for Schema Changes

- [ ] Model added to `server/prisma/schema.prisma`
- [ ] `school_id` field included for multi-tenancy
- [ ] `@@index([school_id])` added
- [ ] `@@schema("schoolmanagementsystem")` added
- [ ] Relation added to School model
- [ ] Enum defined if needed
- [ ] `npx prisma db push` executed
- [ ] Seed data updated if needed
- [ ] Types added to `packages/types/` for frontend
