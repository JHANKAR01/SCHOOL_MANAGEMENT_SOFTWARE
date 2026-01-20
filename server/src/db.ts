// server/src/db.ts
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// 1. Create the Pool with better timeouts and limits
// 1. Create the Pool with better timeouts and limits
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }, // Required for Supabase
  connectionTimeoutMillis: 20000,     // Wait 20s before failing (Increased)
  idleTimeoutMillis: 30000,           // Close idle clients after 30s
  max: 10,                            // Limit pool size
  keepAlive: true,                    // TCP Keep-Alive
  options: '-c search_path=schoolmanagementsystem'
});

// 2. Add Error Listeners (Prevents crash on idle client error)
pool.on('error', (err) => {
  console.warn('[DB] ⚠️ Unexpected error on idle client (Pool will recover):', err.message);
  // Do NOT exit process. The pool will discard the bad client and create a new one.
});

// 3. Initialize Adapter
const adapter = new PrismaPg(pool, {
  schema: 'schoolmanagementsystem'
});

const globalPrisma = new PrismaClient({ adapter });

// 4. Test Connection Immediately on Startup
(async () => {
  try {
    const client = await pool.connect();
    console.log('✅ [DB] Database Connection Established Successfully');
    const res = await client.query('SELECT NOW()');
    console.log(`   -> Server Time: ${res.rows[0].now}`);
    client.release();
  } catch (err: any) {
    console.error('❌ [DB] Connection Failed:', err.message);
    console.error('   -> Check if Supabase project is PAUSED.');
    console.error('   -> Check your Internet Connection.');
  }
})();

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
