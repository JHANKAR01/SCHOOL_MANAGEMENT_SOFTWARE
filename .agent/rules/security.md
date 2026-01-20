---
description: Security rules for RBAC, PII handling, and data protection.
---

# Security Rules

> **Critical**: School data contains PII (student grades, Aadhaar, medical records). Handle with care.

---

## Authentication

### JWT Token Structure
```typescript
{
  id: string;        // User ID
  role: UserRole;    // TEACHER, PRINCIPAL, etc.
  school_id: string; // Multi-tenancy key
  exp: number;       // Expiration timestamp
}
```

### Token Storage
| Platform | Storage | Method |
|----------|---------|--------|
| Web | localStorage | `localStorage.getItem('sovereign_token')` |
| Mobile | SecureStore | `SecureStore.getItemAsync('token')` |

### Token Transmission
```typescript
// ✅ Always send in Authorization header
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## Row Level Security (RLS)

### Rule: Every query MUST include school_id

```typescript
// ✅ Correct - RLS enforced
const students = await prisma.student.findMany({
  where: { 
    school_id: user.school_id,  // REQUIRED
    status: 'ACTIVE'
  }
});

// ❌ Wrong - Data leak across schools
const students = await prisma.student.findMany({
  where: { status: 'ACTIVE' }  // Missing school_id!
});
```

### Middleware Enforcement
```typescript
// server/src/middleware/auth.ts
export const authMiddleware = async (c, next) => {
  const token = c.req.header('Authorization')?.split(' ')[1];
  const decoded = await verifyToken(token);
  c.set('user', { 
    id: decoded.id, 
    role: decoded.role, 
    school_id: decoded.school_id 
  });
  return next();
};
```

---

## Role-Based Access Control (RBAC)

### Route Protection
```typescript
// ✅ Use requireRole middleware
router.get('/students', 
  requireRole([UserRole.TEACHER, UserRole.PRINCIPAL]),
  async (c) => { ... }
);

// ❌ Don't check roles manually in handler
router.get('/students', async (c) => {
  if (c.get('user').role !== 'TEACHER') return c.json({ error: 'Forbidden' });
});
```

### UI Protection
```typescript
// ✅ Hide UI elements user cannot access
{user.role === UserRole.PRINCIPAL && (
  <LeaveApprovalSection />
)}

// ❌ Don't just disable - hide entirely
<LeaveApprovalSection disabled={user.role !== 'PRINCIPAL'} />
```

---

## PII Handling

### Sensitive Fields
| Field | Sensitivity | Masking |
|-------|-------------|---------|
| Aadhaar number | HIGH | `****-****-1234` |
| Phone number | MEDIUM | `******7890` |
| Email | MEDIUM | `u***@school.edu` |
| Student grades | MEDIUM | Role-based access |
| Medical records | HIGH | Counselor/Nurse only |

### Masking Function
```typescript
export function maskAadhaar(aadhaar: string): string {
  if (!aadhaar || aadhaar.length !== 12) return '****-****-****';
  return `****-****-${aadhaar.slice(-4)}`;
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 10) return '**********';
  return `******${phone.slice(-4)}`;
}
```

### Who Can See What

| Data | Principal | Teacher | Parent | Student |
|------|-----------|---------|--------|---------|
| Full Aadhaar | ❌ | ❌ | ❌ | ❌ |
| Masked Aadhaar | ✅ | ❌ | ❌ | ❌ |
| Student Grades | ✅ All | ✅ Own classes | ✅ Child only | ✅ Own only |
| Staff Salary | ❌ | ❌ | ❌ | ❌ |
| Medical Records | ❌ | ❌ | ❌ | ❌ |

---

## Audit Logging

### When to Log
| Action | Log Level | Required |
|--------|-----------|----------|
| View sensitive data (PII) | INFO | ✅ |
| Modify grades | WARN | ✅ |
| Approve/reject leave | INFO | ✅ |
| Payment processing | WARN | ✅ |
| User creation/deletion | WARN | ✅ |
| Login attempts | INFO | ✅ |

### Audit Entry Structure
```typescript
interface AuditLog {
  id: string;
  school_id: string;
  user_id: string;
  action: string;  // 'VIEW_GRADES', 'DEMASK_AADHAAR', etc.
  target_type: string;  // 'Student', 'Invoice'
  target_id: string;
  ip_address: string;
  created_at: Date;
}
```

---

## Password Rules

| Rule | Requirement |
|------|-------------|
| Minimum length | 8 characters |
| Complexity | At least 1 uppercase, 1 number |
| Storage | bcrypt hash (cost 12) |
| Default password | `Welcome@123` (must change on first login) |

---

## API Security Checklist

- [ ] All routes have `authMiddleware`
- [ ] Sensitive routes have `requireRole()`
- [ ] All queries include `school_id`
- [ ] PII fields are masked in responses
- [ ] Audit logs created for sensitive actions
- [ ] Rate limiting on auth endpoints
- [ ] CORS configured for allowed origins
