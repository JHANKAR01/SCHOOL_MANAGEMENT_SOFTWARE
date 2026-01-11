// packages/api/src/server.ts
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

const app = new Hono();

// Global Middleware
app.use('*', cors());

// Health Check
app.get('/health', (c) => c.json({ status: 'OK', uptime: (process as any).uptime() }));

// --- MOUNT ROUTERS ---

// 1. PUBLIC ROUTES (No Token Needed)
app.route('/api/auth', authRouter);

// 2. PROTECTED ROUTES (Middleware Guard)
// Protect "everything else" under /api/ that isn't already handled above (like auth)
// We use a custom middleware wrapper to skip auth check for paths starting with /api/auth (just in case)
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

// --- REAL-TIME LAYER (Socket.io) ---
const httpServer = serve({ fetch: app.fetch, port: 3000 });
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }
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