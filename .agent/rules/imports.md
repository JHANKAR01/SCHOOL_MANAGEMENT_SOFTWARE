---
description: Import path conventions to prevent import hell.
---

# Import Rules

> **Rule**: Consistent imports prevent "path hell". Follow these patterns exactly.

---

## Quick Reference

| From | To | Pattern |
|------|-----|---------|
| `packages/app/features/xxx/` | `packages/types/` | `../../../types/...` |
| `packages/app/features/xxx/` | `packages/hooks/` | `../../../hooks/...` |
| `packages/app/features/xxx/` | `packages/app/components/` | `../../components/...` |
| `server/src/routes/` | `packages/types/` | `../../../packages/types/...` |
| `apps/mobile/app/xxx/` | `packages/app/` | `../../../../packages/app/...` |

---

## Import Categories

### 1. Shared Types
```typescript
// ✅ Correct (from packages/app/)
import { UserRole, User } from '../../types/user';
import { Invoice } from '../../types/finance';

// ❌ Wrong
import { UserRole } from '@/types/user';  // No path aliases yet
import { UserRole } from '../../../../types/user';  // Too many levels
```

### 2. Shared Hooks
```typescript
// ✅ From packages/app/features/
import { useFinance } from '../../hooks/useFinance';
import { useAcademics } from '../../hooks/useAcademics';

// Or from packages/hooks/ directly
import { useTeacherData } from '../../../hooks/useTeacherData';
```

### 3. Components
```typescript
// ✅ From packages/app/features/
import { NebulaCard } from '../../components/nebula/NebulaCard';
import { SovereignButton } from '../../components/SovereignComponents';

// ❌ Never import from node_modules path directly for internal components
```

### 4. Server Imports (Backend Only)
```typescript
// ✅ Correct (from server/src/routes/)
import prisma from '../db';
import { UserRole } from '../../../packages/types';
import { authMiddleware } from '../middleware/auth';

// ❌ Wrong - Never import server code in frontend
import prisma from '../../../server/src/db';  // FORBIDDEN in frontend
```

---

## ❌ Forbidden Patterns

| Pattern | Why | Fix |
|---------|-----|-----|
| `import from 'packages/api/...'` | Folder deleted | Use `server/src/...` |
| `import prisma` in frontend | Backend-only | Use hooks + API fetch |
| Raw `fetch()` in components | Inconsistent | Use `client.get()` from api/client |
| `import from '@/...'` | Aliases not configured | Use relative paths |
| Importing `.ts` extension | Not needed | `import from './file'` |

---

## API Client Usage

### ✅ Correct Pattern
```typescript
// packages/app/hooks/useFinance.ts
import client from '../api/client';

const { data } = await client.get('/finance/invoices');
const result = await client.post('/finance/invoices', payload);
```

### ❌ Wrong Pattern
```typescript
// Direct fetch is forbidden
const res = await fetch('http://localhost:3001/api/finance/invoices');

// Importing server code is forbidden
import { generatePDFMarksheet } from '../../../server/src/services/pdf-service';
```

---

## Type-Only Imports

When importing only types, use `import type`:

```typescript
// ✅ Type-only import
import type { User, UserRole } from '../../types/user';
import type { Invoice } from '../../types/finance';

// Use regular import when you need the value
import { UserRole } from '../../types/user';  // UserRole is an enum (has runtime value)
```

---

## Circular Dependency Prevention

1. **Types** should never import from **hooks**
2. **Hooks** can import from **types**
3. **Components** can import from **hooks** and **types**
4. **Features** can import from all above

```
types → (nothing)
hooks → types
components → types
features → types, hooks, components
```

---

## Re-exports

### packages/types/index.ts
```typescript
// All types should be re-exported from index
export { UserRole, type User } from './user';
export type { Invoice } from './finance';
export { Permission, PERMISSIONS } from './permissions';
```

### packages/hooks/index.ts
```typescript
// All hooks should be re-exported
export { useFinance } from './useFinance';
export { useAcademics } from './useAcademics';
export { useTeacherData } from './useTeacherData';
```
