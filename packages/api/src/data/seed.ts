// import 'dotenv/config';
// import { PrismaClient, UserRole, InvoiceStatus } from '@prisma/client';
// import { SOVEREIGN_GENESIS_DATA } from './dummy-data.ts';

// const prisma = new PrismaClient();

// import * as dotenv from 'dotenv';
// dotenv.config({ path: '.env' });
// console.log('DB URL at runtime:', process.env.DATABASE_URL);

// // import { PrismaClient } from '@prisma/client';
// import { PrismaClient, UserRole, InvoiceStatus } from '@prisma/client';
// import { SOVEREIGN_GENESIS_DATA } from './dummy-data.ts';

// import { PrismaPg } from '@prisma/adapter-pg';
// import { Pool } from 'pg';

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false },
// });











import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });


import { PrismaClient, UserRole, InvoiceStatus } from '@prisma/client';
import { SOVEREIGN_GENESIS_DATA } from './dummy-data.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs'; // Import bcrypt

// 🔍 sanity check
console.log('DB URL at runtime:', process.env.DATABASE_URL);

// ✅ Explicit SSL config for Supabase + Node 22
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // <-- THIS IS THE KEY
  },
  options: '-c search_path=schoolmanagementsystem' // Ensure seed uses correct schema too
});

// ✅ Prisma v7 adapter
const adapter = new PrismaPg(pool, { schema: 'schoolmanagementsystem' });

// ✅ PrismaClient WITH adapter (this is REQUIRED)
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting Sovereign Genesis Seed');
  const SCHOOL_ID = 'sch_123';

  // Hash the default password "password123"
  // Salt of 10 matches the app's update
  const hashedPassword = await bcrypt.hash('password123', 10);
  console.log('🔐 Generated hash for "password123":', hashedPassword);



  console.log('🧹 Clearing existing data...');
  await prisma.identityDocument.deleteMany();
  await prisma.parentStudent.deleteMany();
  await prisma.medicalLog.deleteMany();
  await prisma.counseling.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();
  await prisma.bus.deleteMany();
  await prisma.book.deleteMany();
  await prisma.school.deleteMany();

  console.log('🏫 Seeding School');
  await prisma.school.create({ data: { id: SCHOOL_ID, name: 'Sovereign High' } });

  console.log('👨‍👩‍👧‍👦 Seeding Parents');
  const parentRefToIdMap = new Map<string, string>();
  for (const parent of SOVEREIGN_GENESIS_DATA.parents) {
    const created = await prisma.user.create({
      data: {
        name: parent.name,
        email: parent.email,
        phone: parent.primary_phone,
        role: UserRole.PARENT,
        school_id: SCHOOL_ID,
        password_hash: hashedPassword
      }
    });
    parentRefToIdMap.set(parent.parent_ref, created.id);
  }

  console.log('👨‍🏫 Seeding Staff');
  const staffNoToIdMap = new Map<string, string>();
  for (const staff of SOVEREIGN_GENESIS_DATA.staff) {
    const created = await prisma.user.create({
      data: {
        name: staff.name,
        email: staff.email,
        role: staff.role as UserRole,
        department: staff.department,
        school_id: SCHOOL_ID,
        password_hash: hashedPassword
      }
    });
    staffNoToIdMap.set(staff.staff_no, created.id);
  }

  console.log('🎓 Seeding Students');
  const admissionNoToIdMap = new Map<string, string>();
  const dummyIdToRealIdMap = new Map<string, string>();
  for (const student of SOVEREIGN_GENESIS_DATA.students) {
    const created = await prisma.student.create({
      data: {
        admission_no: student.admission_no,
        name: student.name,
        email: student.email,
        class: student.class,
        roll: student.roll,
        school_id: SCHOOL_ID
      }
    });
    admissionNoToIdMap.set(student.admission_no, created.id);
    dummyIdToRealIdMap.set(student.id, created.id);
  }

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
        }
      });
    }
  }

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
          // verification_status: DocumentStatus.PENDING,
          school_id: SCHOOL_ID,
          owner_user_id: uId,
          owner_student_id: sId
        }
      });
    }
  }

  console.log('🚌 Seeding Logistics');
  await prisma.bus.createMany({ data: SOVEREIGN_GENESIS_DATA.buses.map((b: any) => ({ ...b, school_id: SCHOOL_ID })) });
  await prisma.book.createMany({ data: SOVEREIGN_GENESIS_DATA.books.map((b: any) => ({ ...b, school_id: SCHOOL_ID })) });

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
          school_id: SCHOOL_ID
        }
      });
    }
  }

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


  console.log('✅ Seed Complete');
}

main()
  .catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());