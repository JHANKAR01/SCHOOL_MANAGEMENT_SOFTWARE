
import { PrismaClient } from '@prisma/client';

/**
 * Sovereign DB Setup
 * Connects to the live Supabase database via connection pooling.
 */

// Cast to any to bypass strict typing on datasources for now
const globalPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
} as any);

export default globalPrisma;

export type SovereignDB = ReturnType<typeof getTenantDB>;

/**
 * Tenant-Aware DB Factory
 * Wraps the standard Prisma Client to enforce Row-Level Security (RLS).
 */
export const getTenantDB = (schoolId: string, role: string) => {
  return globalPrisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query, model, operation }) {
          // Cast args to any to safely access potentially missing properties on union types
          // This fixes the TS errors about 'where'/'data' not existing on some types
          const safeArgs = args as any;

          // 1. Super Admin Bypass
          if (role === 'SUPER_ADMIN') {
            return query(args);
          }

          // 2. RLS Injection: Force Inject school_id into WHERE and DATA
          if (safeArgs.where) {
            safeArgs.where.school_id = schoolId;
          }
          if (safeArgs.data) {
            safeArgs.data.school_id = schoolId;
          }

          if (operation === 'create' || operation === 'createMany') {
            if (!safeArgs.data) safeArgs.data = {};
            // checks for array in createMany
            if (Array.isArray(safeArgs.data)) {
              safeArgs.data.forEach((item: any) => item.school_id = schoolId);
            } else {
              safeArgs.data.school_id = schoolId;
            }
          }

          if (
            operation === 'findUnique' ||
            operation === 'findFirst' ||
            operation === 'findMany' ||
            operation === 'update' ||
            operation === 'updateMany' ||
            operation === 'delete' ||
            operation === 'deleteMany' ||
            operation === 'count'
          ) {
            if (!safeArgs.where) safeArgs.where = {};
            safeArgs.where.school_id = schoolId;
          }

          return query(args);
        },
      },
    },
  });
};
