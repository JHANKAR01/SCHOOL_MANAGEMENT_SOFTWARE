---
description: Known mistakes and pitfalls to avoid. Learn from past errors.
---

# Common Pitfalls

> **Rule**: Don't repeat these mistakes. This is a living document of lessons learned.

---

## 🔴 Critical Pitfalls

### 1. The Deleted Folder Problem
**Mistake**: Creating files in `packages/api/`
**Why Wrong**: This folder was DELETED during restructuring
**Fix**: Use `server/src/` for all backend code

```
❌ packages/api/src/routes/xxx.ts
✅ server/src/routes/xxx.ts

❌ packages/api/src/data/seed.ts
✅ server/src/data/seed.ts
```

---

### 2. Direct Database Access in Frontend
**Mistake**: Importing Prisma client in frontend code
**Why Wrong**: Frontend runs in browser, cannot access database directly

```typescript
// ❌ NEVER DO THIS in packages/app/
import prisma from '../../../server/src/db';
const students = await prisma.student.findMany();

// ✅ Use hooks + API
import { useStudents } from '../../hooks/useStudents';
const { data: students } = useStudents();
```

---

### 3. Importing Server Code in Frontend
**Mistake**: Importing from `server/src/` in frontend files
**Why Wrong**: Server code has Node.js dependencies that don't work in browser

```typescript
// ❌ Will break the build
import { generatePDFMarksheet } from '../../../server/src/services/pdf-service';

// ✅ Call API endpoint instead
const response = await client.get(`/academics/marksheet/${studentId}/pdf`);
```

---

### 4. Raw fetch() Instead of client
**Mistake**: Using raw `fetch()` for API calls
**Why Wrong**: Inconsistent, no auth headers, no base URL

```typescript
// ❌ Raw fetch
const response = await fetch('http://localhost:3001/api/students');

// ✅ Use client wrapper
import client from '../api/client';
const response = await client.get('/students');
```

---

### 5. HTML Elements in Shared Components
**Mistake**: Using `<div>`, `<span>`, `<button>` in `packages/app/`
**Why Wrong**: These don't work in React Native (mobile)

```tsx
// ❌ Won't work on mobile
<div className="p-4">
  <span>Hello</span>
</div>

// ✅ Cross-platform
<View className="p-4">
  <Text>Hello</Text>
</View>
```

---

### 6. The InteractionContext Trap
**Mistake**: Adding more data to `InteractionContext`
**Why Wrong**: Context was refactored. Most data moved to hooks.

```typescript
// ❌ OLD - Don't destructure these from useInteraction()
const { invoices, liveClasses, homeworks } = useInteraction();

// ✅ NEW - Use domain-specific hooks
const { invoices } = useFinance();
const { liveClasses, homeworks } = useAcademics();
```

---

## 🟠 Import Pitfalls

### 7. Wrong Relative Path Depth
**Mistake**: Getting `../` count wrong

| From | To | Correct Path |
|------|----|--------------|
| `packages/app/features/xxx/` | `packages/types/` | `../../../types/` |
| `packages/app/features/xxx/` | `packages/hooks/` | `../../../hooks/` |
| `server/src/routes/` | `packages/types/` | `../../../packages/types/` |

### 8. Importing with .ts Extension
**Mistake**: Including file extension in import

```typescript
// ❌ Wrong
import { User } from './user.ts';

// ✅ Correct
import { User } from './user';
```

### 9. Path Alias Confusion
**Mistake**: Using `@/` aliases that aren't configured

```typescript
// ❌ Not configured yet
import { User } from '@/types/user';

// ✅ Use relative paths
import { User } from '../../../types/user';
```

---

## 🟡 Schema Pitfalls

### 10. Missing school_id
**Mistake**: Forgetting multi-tenancy in queries

```typescript
// ❌ Data leak!
const students = await prisma.student.findMany();

// ✅ Always include school_id
const students = await prisma.student.findMany({
  where: { school_id: user.school_id }
});
```

### 11. Wrong Field Names
**Mistake**: Using camelCase when schema uses snake_case

```typescript
// ❌ Wrong
where: { routeId: '...' }

// ✅ Correct (matches schema)
where: { route_id: '...' }
```

### 12. Field Doesn't Exist
**Mistake**: Accessing fields that were never in the schema

```typescript
// ❌ These fields don't exist
{ lockdown_mode: true }  // Use locked_roles array instead
{ roll: true }            // Student doesn't have 'roll' field
{ issuedTo: null }        // Book doesn't have 'issuedTo' field
```

---

## 🔵 UI Pitfalls

### 13. StyleSheet Instead of NativeWind
**Mistake**: Using React Native StyleSheet

```tsx
// ❌ Not our pattern
const styles = StyleSheet.create({
  container: { padding: 16 }
});

// ✅ Use NativeWind
<View className="p-4">
```

### 14. Wrong Icon Library
**Mistake**: Using wrong icon library

```tsx
// ❌ Wrong libraries
import { FaUser } from 'react-icons/fa';
import { UserIcon } from '@heroicons/react';

// ✅ Use lucide-react
import { User } from 'lucide-react';
```

---

## 🟢 Workflow Pitfalls

### 15. Stale IDE Cache
**Symptom**: Errors for files that don't exist
**Fix**: Close tabs, restart VS Code

### 16. Not Registering New Routes
**Mistake**: Creating route file but not registering it

```typescript
// server/src/server.ts - MUST ADD:
import { newRouter } from './routes/new';
app.route('/api/new', newRouter);
```

### 17. Not Re-exporting from index.ts
**Mistake**: Creating hook/type but not exporting from index

```typescript
// packages/hooks/index.ts - MUST ADD:
export { useNewHook } from './useNewHook';
```
