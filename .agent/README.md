# .agent - AI Development Guidelines

This folder contains rules, workflows, and templates for AI-assisted development of the Sovereign School Management System.

---

## 📁 Structure

```
.agent/
├── context/           # Project understanding
├── rules/             # Hard constraints
├── workflows/         # Step-by-step guides
└── templates/         # Code skeletons
```

---

## 📋 Quick Reference

### Before Starting ANY Task

1. **Check Current Status**: Read `context/current-status.md`
2. **Understand Roles**: Read `context/user-personas.md` if role-based
3. **Know the Tech**: Read `context/tech-stack.md` for libraries

### Creating New Code

| Creating... | Read First | Use Template |
|-------------|------------|--------------|
| React Component | `workflows/frontend-mobile.md` | `templates/component.tsx` |
| API Route | `workflows/backend.md` | `templates/route.ts` |
| Data Hook | `workflows/api-integration.md` | `templates/hook.ts` |
| DB Table | `workflows/data.md` | `templates/model.prisma` |

### Avoiding Mistakes

Always scan `rules/common-pitfalls.md` before making changes.

---

## 📚 File Index

### Context (Project Understanding)

| File | Purpose |
|------|---------|
| [tech-stack.md](context/tech-stack.md) | Approved libraries & versions |
| [user-personas.md](context/user-personas.md) | Role permissions & capabilities |
| [database-schema.md](context/database-schema.md) | Tables, relations, naming |
| [current-status.md](context/current-status.md) | Project phase & WIP |
| [theme.md](context/theme.md) | Nebula design system |

### Rules (Hard Constraints)

| File | Purpose |
|------|---------|
| [structure.md](rules/structure.md) | Folder conventions |
| [imports.md](rules/imports.md) | Import path rules |
| [security.md](rules/security.md) | RBAC, PII, auth |
| [error-handling.md](rules/error-handling.md) | API & UI errors |
| [file-placement.md](rules/file-placement.md) | Where to put new files |
| [common-pitfalls.md](rules/common-pitfalls.md) | Known mistakes |

### Workflows (Step-by-Step Guides)

| File | Purpose |
|------|---------|
| [frontend-mobile.md](workflows/frontend-mobile.md) | Expo/React Native |
| [frontend-web.md](workflows/frontend-web.md) | Next.js |
| [backend.md](workflows/backend.md) | Hono API |
| [data.md](workflows/data.md) | Prisma & seeding |
| [api-integration.md](workflows/api-integration.md) | Frontend-backend comms |

### Templates (Code Skeletons)

| File | Purpose |
|------|---------|
| [component.tsx.txt](templates/component.tsx.txt) | React component |
| [route.ts.txt](templates/route.ts.txt) | Hono API route |
| [hook.ts.txt](templates/hook.ts.txt) | React Query hook |
| [model.prisma.txt](templates/model.prisma.txt) | Prisma model |

> **Note**: Templates use `.txt` extension to prevent IDE type-checking errors. Copy content when using.

---

## 🚨 Critical Rules

1. **Never create files in `packages/api/`** - This folder was DELETED
2. **Server code lives in `server/src/`**
3. **Always include `school_id`** in DB queries
4. **Use `client` wrapper**, not raw `fetch()`
5. **Use React Native primitives** in shared components
6. **Use NativeWind** for styling, not StyleSheet

---

## 🔄 Keeping This Updated

- Update `current-status.md` when starting major work
- Add to `common-pitfalls.md` when discovering new issues
- Review before each development session
