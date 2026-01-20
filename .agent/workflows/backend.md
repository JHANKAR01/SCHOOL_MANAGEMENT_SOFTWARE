---
description: How to build API endpoints and backend services.
---

# Backend (Hono) Workflow

> **Framework**: Hono
> **ORM**: Prisma
> **Database**: PostgreSQL (Supabase)

---

## Quick Start

```bash
# Run backend server
npx tsx server/src/server.ts
```

Server runs at: `http://localhost:3001`

---

## File Structure

```
server/
├── prisma/
│   └── schema.prisma       # Database schema
└── src/
    ├── server.ts           # Main entry point
    ├── db.ts               # Prisma client
    ├── routes/             # API endpoints
    │   ├── teacher.ts
    │   ├── finance.ts
    │   └── academics.ts
    ├── services/           # Business logic
    │   └── pdf-service.ts
    ├── middleware/         # Auth, logging
    │   └── auth.ts
    └── data/               # Seed scripts
        └── seed.ts
```

---

## Creating a New API Route

### Step 1: Create Route File

```typescript
// server/src/routes/inventory.ts

import { Hono } from 'hono';
import prisma from '../db';
import { authMiddleware, requireRole } from '../middleware/auth';
import { UserRole } from '../../../packages/types';

// Typed variables for context
type Variables = {
  user: {
    id: string;
    role: UserRole;
    school_id: string;
  };
};

const inventoryRouter = new Hono<{ Variables: Variables }>();

// Apply auth to all routes
inventoryRouter.use('*', authMiddleware);

// GET /api/inventory/items
inventoryRouter.get('/items', 
  requireRole([UserRole.INVENTORY_MANAGER, UserRole.SCHOOL_ADMIN]),
  async (c) => {
    const user = c.get('user');
    
    const items = await prisma.inventoryItem.findMany({
      where: { school_id: user.school_id },
      orderBy: { name: 'asc' }
    });
    
    return c.json({ success: true, data: items });
  }
);

// POST /api/inventory/items
inventoryRouter.post('/items', 
  requireRole([UserRole.INVENTORY_MANAGER]),
  async (c) => {
    const user = c.get('user');
    const body = await c.req.json();
    
    const item = await prisma.inventoryItem.create({
      data: {
        ...body,
        school_id: user.school_id
      }
    });
    
    return c.json({ success: true, data: item });
  }
);

export { inventoryRouter };
```

### Step 2: Register Route

```typescript
// server/src/server.ts

import { inventoryRouter } from './routes/inventory';

// Add with other routes
app.route('/api/inventory', inventoryRouter);
```

---

## Route Patterns

### GET - List Items
```typescript
router.get('/items', async (c) => {
  const user = c.get('user');
  const items = await prisma.item.findMany({
    where: { school_id: user.school_id }
  });
  return c.json({ success: true, data: items });
});
```

### GET - Single Item
```typescript
router.get('/items/:id', async (c) => {
  const { id } = c.req.param();
  const user = c.get('user');
  
  const item = await prisma.item.findUnique({
    where: { id, school_id: user.school_id }
  });
  
  if (!item) {
    return c.json({ success: false, error: 'Not found' }, 404);
  }
  
  return c.json({ success: true, data: item });
});
```

### POST - Create
```typescript
router.post('/items', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  
  const item = await prisma.item.create({
    data: { ...body, school_id: user.school_id }
  });
  
  return c.json({ success: true, data: item }, 201);
});
```

### PUT/PATCH - Update
```typescript
router.patch('/items/:id', async (c) => {
  const { id } = c.req.param();
  const user = c.get('user');
  const body = await c.req.json();
  
  const item = await prisma.item.update({
    where: { id, school_id: user.school_id },
    data: body
  });
  
  return c.json({ success: true, data: item });
});
```

### DELETE
```typescript
router.delete('/items/:id', async (c) => {
  const { id } = c.req.param();
  const user = c.get('user');
  
  await prisma.item.delete({
    where: { id, school_id: user.school_id }
  });
  
  return c.json({ success: true });
});
```

---

## Authentication & Authorization

### Auth Middleware
```typescript
import { authMiddleware, requireRole } from '../middleware/auth';

// All routes require auth
router.use('*', authMiddleware);

// Specific role requirement
router.get('/sensitive', 
  requireRole([UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN]),
  handler
);
```

### Getting Current User
```typescript
const user = c.get('user');
// user.id - User ID
// user.role - UserRole enum value
// user.school_id - For RLS queries
```

---

## Database Queries (Prisma)

### Always Include school_id
```typescript
// ✅ Correct - RLS enforced
const students = await prisma.student.findMany({
  where: { school_id: user.school_id }
});

// ❌ Wrong - Data leak!
const students = await prisma.student.findMany();
```

### Common Query Patterns
```typescript
// With relations
const students = await prisma.student.findMany({
  where: { school_id: user.school_id },
  include: { 
    enrollments: { 
      where: { academic_year: { is_current: true } },
      include: { class: true }
    }
  }
});

// Pagination
const students = await prisma.student.findMany({
  where: { school_id: user.school_id },
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { name: 'asc' }
});

// Count
const total = await prisma.student.count({
  where: { school_id: user.school_id }
});
```

---

## Error Handling

```typescript
router.get('/resource/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const user = c.get('user');
    
    const item = await prisma.resource.findUnique({
      where: { id, school_id: user.school_id }
    });
    
    if (!item) {
      return c.json({ 
        success: false, 
        error: 'Resource not found',
        code: 'NOT_FOUND'
      }, 404);
    }
    
    return c.json({ success: true, data: item });
    
  } catch (error) {
    console.error('Error:', error);
    return c.json({ 
      success: false, 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }, 500);
  }
});
```

---

## Checklist for New API Endpoints

- [ ] File created in `server/src/routes/`
- [ ] Route registered in `server/src/server.ts`
- [ ] Uses `authMiddleware` for all routes
- [ ] Uses `requireRole()` for protected routes
- [ ] All queries include `school_id` filter
- [ ] Returns `{ success: true/false, data/error }` format
- [ ] Proper error handling with try/catch
- [ ] Types added to `packages/types/` if needed
