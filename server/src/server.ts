// server/src/server.ts
import 'dotenv/config'; // Load .env before anything else

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Server } from 'socket.io';
import { authMiddleware } from './middleware/auth.ts';
import { authRouter } from './routes/auth.ts'; // Import the new router
import { staffRouter } from './routes/staff.ts';
import { academicsRouter } from './routes/academics.ts';
import { logisticsRouter } from './routes/logistics.ts';
import { financeRouter } from './routes/finance.ts';
import { healthRouter } from './routes/health.ts';
import { admissionsRouter } from './routes/admissions.ts';
import { jitsiRouter } from './routes/jitsi.ts';
import { operationsRouter } from './routes/operations.ts';
import { attendanceRouter } from './routes/attendance.ts';
import { superAdminRouter } from './routes/super-admin.ts';
import { systemAdminRouter } from './routes/system-admin.ts';
import announcementsRouter from './routes/announcements.ts';
import { principalRouter } from './routes/principal.ts';
import { teacherRouter } from './routes/teacher.ts';
import { reportsRouter } from './routes/reports.ts';

const app = new Hono();

// CORS Configuration - Restrict to allowed origins
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173',  // Vite dev server
  'http://localhost:3000',  // Alternative dev
];

app.use('*', cors({
  origin: (origin) => {
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) return '*';
    return ALLOWED_ORIGINS.includes(origin) ? origin : '';
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Security Headers Middleware
app.use('*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
});

// Health Check
app.get('/health', (c) => c.json({ status: 'OK', uptime: (process as any).uptime() }));

// --- MOUNT ROUTERS ---

// 1. PUBLIC ROUTES (No Token Needed)
app.route('/api/auth', authRouter);

// 2. PROTECTED ROUTES (Middleware Guard)
// Protect "everything else" under /api/ that isn't already handled above (like auth)
// ✅ SECURITY RE-ENABLED
app.use('/api/*', async (c, next) => {
  if (c.req.path.startsWith('/api/auth')) {
    return next();
  } else {
    return authMiddleware(c, next);
  }
});

app.route('/api/staff', staffRouter);
app.route('/api/academics', academicsRouter);
app.route('/api/logistics', logisticsRouter);
app.route('/api/finance', financeRouter);
app.route('/api/health', healthRouter);
app.route('/api/admissions', admissionsRouter);
app.route('/api/jitsi', jitsiRouter);
app.route('/api/operations', operationsRouter);
app.route('/api/attendance', attendanceRouter);
app.route('/api/super-admin', superAdminRouter);
app.route('/api/system-admin', systemAdminRouter);  // P6: System Admin for User Access Control
app.route('/api/announcements', announcementsRouter);
app.route('/api/principal', principalRouter);  // Principal Dashboard Command Center
app.route('/api/teacher', teacherRouter);  // Teacher Dashboard API
app.route('/api/reports', reportsRouter);  // Report generation API

// --- REAL-TIME LAYER (Socket.io) ---
const httpServer = serve({ fetch: app.fetch, port: 3000 });
const io = new Server(httpServer, {
  cors: { origin: ALLOWED_ORIGINS, methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  socket.on('bus:location', (data) => {
    io.emit(`bus:update:${data.routeId}`, data);
  });

  socket.on('chat:message', (data) => {
    io.to(`room:${data.studentId}`).emit('chat:receive', data);
  });

  socket.on('disconnect', () => console.log(`[Socket] Disconnected: ${socket.id}`));
});

if (process.env.NODE_ENV !== 'test') {
  console.log("🚀 Project Sovereign API Online on port 3000");
}

export default app;