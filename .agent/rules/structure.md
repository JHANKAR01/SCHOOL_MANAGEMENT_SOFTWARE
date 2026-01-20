---
description: Folder structure rules and conventions for the monorepo.
---

# Project Structure Rules

> **Rule**: Every file has ONE correct location. Use this guide to decide where new code goes.

---

## Folder Map

```
d:\projects\School\School-Management-System---1\
│
├── apps/                    # Platform-specific entry points
│   ├── mobile/              # Expo app (iOS & Android)
│   │   └── app/             # expo-router pages
│   └── web/                 # Next.js app
│       └── pages/           # Next.js pages
│
├── packages/                # Shared code (used by both apps)
│   ├── app/                 # Main shared application code
│   │   ├── components/      # Reusable UI components
│   │   ├── features/        # Feature modules (dashboards, etc.)
│   │   ├── hooks/           # App-specific hooks
│   │   └── provider/        # Context providers
│   │
│   ├── hooks/               # Shared React hooks (data fetching)
│   ├── types/               # TypeScript type definitions
│   └── ui/                  # Design system (Nebula)
│       ├── components/      # UI components
│       └── theme/           # Colors, tokens
│
├── server/                  # Backend API
│   ├── prisma/              # Database schema
│   └── src/
│       ├── routes/          # API endpoints
│       ├── services/        # Business logic
│       ├── middleware/      # Auth, logging
│       └── data/            # Seed scripts
│
├── data/                    # Data fixtures
│   └── fixtures/            # Dummy data generators
│
├── docs/                    # Documentation
└── .agent/                  # AI development rules
```

---

## Decision Matrix

### Where does this code go?

| Type of Code | Location | Example |
|--------------|----------|---------|
| API endpoint | `server/src/routes/` | `teacher.ts`, `finance.ts` |
| Database query/logic | `server/src/services/` | `pdf-service.ts` |
| Prisma schema | `server/prisma/schema.prisma` | n/a |
| Seed data | `server/src/data/seed.ts` | n/a |
| TypeScript types | `packages/types/` | `user.ts`, `finance.ts` |
| Shared React hook | `packages/hooks/` | `useFinance.ts`, `useAcademics.ts` |
| Shared UI component | `packages/app/components/` | `NebulaCard.tsx` |
| Feature dashboard | `packages/app/features/` | `TeacherDashboard.tsx` |
| Mobile-only screen | `apps/mobile/app/` | `parent/payments.tsx` |
| Web-only page | `apps/web/pages/` | `super-admin/onboarding.tsx` |

---

## ❌ Forbidden Locations

| Never Put | Here | Why |
|-----------|------|-----|
| API code | `packages/` | Frontend packages cannot contain backend code |
| React components | `server/` | Backend should have no React dependencies |
| Raw fetch calls | `packages/app/features/` | Use hooks from `packages/hooks/` |
| HTML elements | `packages/app/` | Use React Native primitives for cross-platform |

---

## File Naming

| Type | Convention | Example |
|------|------------|---------|
| React Component | PascalCase.tsx | `TeacherDashboard.tsx` |
| Hook | camelCase with use prefix | `useTeacherData.ts` |
| API Route | kebab-case.ts | `teacher.ts`, `super-admin.ts` |
| Type file | camelCase.ts | `user.ts`, `finance.ts` |
| Utility | camelCase.ts | `pre-cache-service.ts` |

---

## Adding New Features

### New API Endpoint
1. Create file in `server/src/routes/`
2. Register in `server/src/server.ts`: `app.route('/api/...', newRouter)`
3. Add types to `packages/types/` if needed

### New Dashboard
1. Create in `packages/app/features/{domain}/`
2. Add to `RoleBasedRouter.tsx`
3. Use hooks from `packages/hooks/`

### New Shared Component
1. Create in `packages/app/components/`
2. Use React Native primitives (`<View>`, `<Text>`)
3. Style with NativeWind

### New Hook
1. Create in `packages/hooks/`
2. Re-export from `packages/hooks/index.ts`
3. Use `@tanstack/react-query` for data fetching
