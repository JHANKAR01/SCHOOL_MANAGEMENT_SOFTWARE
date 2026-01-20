---
description: Quick decision guide for where to place new files.
---

# File Placement Guide

> **Rule**: When unsure where a file goes, use this decision tree.

---

## Decision Tree

```
Is it TypeScript types/interfaces?
├─ YES → packages/types/
└─ NO ↓

Is it a React hook for data fetching?
├─ YES → packages/hooks/
└─ NO ↓

Is it a reusable UI component?
├─ YES → packages/app/components/
└─ NO ↓

Is it a feature/dashboard screen?
├─ YES → packages/app/features/{domain}/
└─ NO ↓

Is it mobile-only (Expo specific)?
├─ YES → apps/mobile/app/
└─ NO ↓

Is it web-only (Next.js specific)?
├─ YES → apps/web/pages/
└─ NO ↓

Is it an API endpoint?
├─ YES → server/src/routes/
└─ NO ↓

Is it backend business logic?
├─ YES → server/src/services/
└─ NO ↓

Is it database schema?
├─ YES → server/prisma/schema.prisma
└─ NO ↓

Is it seed/fixture data?
├─ YES → server/src/data/ or data/fixtures/
└─ NO ↓

Ask before creating!
```

---

## Common Scenarios

### "I need to add a new API endpoint"
```
server/src/routes/{domain}.ts
↓
Register in server/src/server.ts
```

### "I need to add a new dashboard"
```
packages/app/features/{role}/{DashboardName}.tsx
↓
Add route in RoleBasedRouter.tsx
```

### "I need to add a new shared hook"
```
packages/hooks/use{Name}.ts
↓
Re-export in packages/hooks/index.ts
```

### "I need to add a new type"
```
packages/types/{domain}.ts
↓
Re-export in packages/types/index.ts
```

### "I need to add a new UI component"
```
Shared (cross-platform):
  packages/app/components/{ComponentName}.tsx

Design system (Nebula):
  packages/ui/components/{ComponentName}.tsx
```

### "I need to add database changes"
```
server/prisma/schema.prisma
↓
npx prisma db push
↓
Update seed in server/src/data/seed.ts
```

---

## Folder → Purpose Quick Reference

| Folder | Contains | Examples |
|--------|----------|----------|
| `packages/types/` | Interfaces, enums | `User`, `Invoice`, `UserRole` |
| `packages/hooks/` | Data fetching hooks | `useFinance`, `useAcademics` |
| `packages/app/components/` | Shared UI | `NebulaCard`, `ActionModal` |
| `packages/app/features/` | Screens/dashboards | `TeacherDashboard`, `Gradebook` |
| `packages/app/provider/` | React contexts | `ThemeProvider`, `AuthProvider` |
| `apps/mobile/app/` | Expo screens | `parent/payments.tsx` |
| `apps/web/pages/` | Next.js pages | `super-admin/onboarding.tsx` |
| `server/src/routes/` | API handlers | `teacher.ts`, `finance.ts` |
| `server/src/services/` | Business logic | `pdf-service.ts` |
| `server/src/middleware/` | Request processing | `auth.ts` |
| `server/src/data/` | Seed scripts | `seed.ts`, `dummy-data.ts` |

---

## Anti-Patterns

| ❌ Don't | ✅ Instead |
|----------|-----------|
| Create new folder in root | Use existing structure |
| Put types in components | Put in packages/types/ |
| Put API calls in components | Put in packages/hooks/ |
| Create one-off utility files | Add to existing util file or create proper module |
| Duplicate code across mobile/web | Put in packages/app/ |
