// packages/api/src/db.ts
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

/**
 * Sovereign DB Setup
 * Connects to the live Supabase database.
 * FIX: Prisma 7 uses 'datasourceUrl' instead of 'datasources' for constructor overrides.
 */
const globalPrisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
} as any);
export default globalPrisma;

export type SovereignDB = ReturnType<typeof getTenantDB>;

/**
 * Tenant-Aware DB Factory
 * Wraps the standard Prisma Client to enforce Row-Level Security (RLS).
 * This interceptor automatically injects the school_id into every query.
 */
export const getTenantDB = (schoolId: string, role: string) => {
  return globalPrisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query, model, operation }) {
          // Cast args to any to safely access potentially missing properties on union types
          // This bypasses TS errors where 'where' or 'data' don't exist on specific operations
          const safeArgs = args as any;

          // 1. Super Admin Bypass (Platform Level Access)
          if (role === 'SUPER_ADMIN') {
            return query(args);
          }

          // 2. Create Operations: Inject school_id into the data payload
          if (operation === 'create' || operation === 'createMany') {
            if (!safeArgs.data) safeArgs.data = {};

            // Handle bulk and single inserts
            if (Array.isArray(safeArgs.data)) {
              safeArgs.data.forEach((item: any) => {
                item.school_id = schoolId;
              });
            } else {
              safeArgs.data.school_id = schoolId;
            }
          }

          // 3. Read/Update/Delete Operations: Inject school_id into the filter
          const filterOperations = [
            'findUnique',
            'findFirst',
            'findMany',
            'update',
            'updateMany',
            'delete',
            'deleteMany',
            'count',
          ];

          if (filterOperations.includes(operation)) {
            if (!safeArgs.where) safeArgs.where = {};
            safeArgs.where.school_id = schoolId;
          }

          return query(args);
        },
      },
    },
  });
};