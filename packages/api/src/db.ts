// packages/api/src/db.ts
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// 1. Create the Pool
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

// 2. CRITICAL: Force the schema search path on every connection
pool.on('connect', (client) => {
  client.query('SET search_path TO schoolmanagementsystem, public');
});

// 3. Initialize Adapter and Client
const adapter = new PrismaPg(pool);
const globalPrisma = new PrismaClient({ adapter });

export default globalPrisma;

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