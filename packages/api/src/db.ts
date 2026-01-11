// packages/api/src/db.ts
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// In ESM environments, destructure Pool from the default export
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

// 1. Create a PostgreSQL connection pool
const pool = new Pool({ connectionString });

// 2. Create the Prisma Adapter
const adapter = new PrismaPg(pool);

// 3. Initialize Prisma Client with the adapter
const globalPrisma = new PrismaClient({ adapter });

export default globalPrisma;

export type SovereignDB = ReturnType<typeof getTenantDB>;

/**
 * Tenant-Aware DB Factory
 */
export const getTenantDB = (schoolId: string, role: string) => {
  return globalPrisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query, model, operation }) {
          const safeArgs = args as any;

          if (role === 'SUPER_ADMIN') {
            return query(args);
          }

          if (operation === 'create' || operation === 'createMany') {
            if (!safeArgs.data) safeArgs.data = {};
            if (Array.isArray(safeArgs.data)) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              safeArgs.data.forEach((item: any) => item.school_id = schoolId);
            } else {
              safeArgs.data.school_id = schoolId;
            }
          }

          const filterOps = ['findUnique', 'findFirst', 'findMany', 'update', 'updateMany', 'delete', 'deleteMany', 'count'];
          if (filterOps.includes(operation)) {
            if (!safeArgs.where) safeArgs.where = {};
            safeArgs.where.school_id = schoolId;
          }

          return query(args);
        },
      },
    },
  });
};