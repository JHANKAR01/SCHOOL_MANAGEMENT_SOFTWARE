
import { Hono } from 'hono';
import prisma from '../db';
import { authMiddleware, requireRole } from '../middleware/auth';
import { UserRole } from '../../../packages/types';

type Variables = {
  user: {
    id: string;
    role: UserRole;
    school_id: string;
  };
};

const logisticsRouter = new Hono<{ Variables: Variables }>();
logisticsRouter.use('*', authMiddleware);
logisticsRouter.use('*', requireRole([UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN, UserRole.FLEET_MANAGER, UserRole.LIBRARIAN, UserRole.WARDEN]));

// --- LIBRARY ---
logisticsRouter.get('/books', requireRole([UserRole.LIBRARIAN, UserRole.PRINCIPAL, UserRole.TEACHER]), async (c) => {
  const user = c.get('user');
  const books = await prisma.book.findMany({
    where: { school_id: user.school_id },
    orderBy: { title: 'asc' }
  });

  // Map Prisma fields to Frontend expectations if necessary
  return c.json(books.map(b => ({
    ...b,
    id: b.isbn, // Frontend expects generic 'id'
  })));
});

logisticsRouter.post('/return-book', requireRole([UserRole.LIBRARIAN]), async (c) => {
  const user = c.get('user');
  const { bookId } = await c.req.json();

  await prisma.book.update({
    where: { isbn: bookId, school_id: user.school_id }, // Composite check if possible, but ISBN is ID. Add strict check if needed.
    data: { status: 'AVAILABLE' }
  });

  return c.json({ success: true, fine: 0 });
});

// --- FLEET ---
logisticsRouter.get('/buses', requireRole([UserRole.FLEET_MANAGER, UserRole.PRINCIPAL]), async (c) => {
  const user = c.get('user');
  const buses = await prisma.bus.findMany({
    where: { school_id: user.school_id }
  });

  return c.json(buses.map(b => ({
    ...b,
    number: b.plateNumber,
    route: b.route_id,
    driver: b.driverName,
    status: 'ON_ROUTE' // TODO: Add status to DB Schema
  })));
});

logisticsRouter.post('/assign-route', requireRole([UserRole.FLEET_MANAGER]), async (c) => {
  const user = c.get('user');
  const { busId, routeId } = await c.req.json();

  await prisma.bus.update({
    where: { id: busId }, // Add school_id check in findFirst if needed
    data: { route_id: routeId }
  });

  return c.json({ success: true, message: "Route Assigned" });
});

// --- HOSTEL ---
logisticsRouter.get('/rooms', requireRole([UserRole.WARDEN, UserRole.PRINCIPAL]), async (c) => {
  const user = c.get('user');
  const rooms = await prisma.hostelRoom.findMany({
    where: { school_id: user.school_id }
  });

  return c.json(rooms.map(r => ({
    ...r,
    number: r.room_number,
    occupied: r.student_id ? 1 : 0 // Simple occupancy logic
  })));
});

logisticsRouter.post('/allocate-room', requireRole([UserRole.WARDEN]), async (c) => {
  const user = c.get('user');
  const { roomId, studentId } = await c.req.json();

  await prisma.hostelRoom.update({
    where: { id: roomId },
    data: { student_id: studentId }
  });

  return c.json({ success: true });
});

export { logisticsRouter };
