# Project Architecture

## Overview

School Management System is a monorepo containing a full-stack application with:
- **Mobile App** (Expo/React Native)
- **Web App** (Next.js)
- **Backend API** (Hono + Prisma)

---

## Directory Structure

```
school-management-system/
│
├── apps/                    # Platform-specific entry points
│   ├── mobile/              # Expo (iOS + Android)
│   └── web/                 # Next.js
│
├── packages/                # Shared code
│   ├── types/               # TypeScript definitions
│   ├── ui/                  # Design system
│   │   ├── components/      # Button, Input, Modal, etc.
│   │   ├── layouts/         # DashboardShell
│   │   └── theme/           # Colors, typography
│   ├── features/            # Feature modules
│   │   └── dashboards/      # Role-based dashboards
│   ├── hooks/               # Shared React hooks
│   └── app/                 # Legacy (to be migrated)
│
├── server/                  # Backend API
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Auth, validation
│   │   └── data/            # Seed, dummy data
│   └── prisma/              # Database schema
│
├── data/                    # Data layer
│   ├── seed/                # Seeding scripts
│   └── fixtures/            # Test/demo data
│
└── docs/                    # Documentation
```

---

## Import Conventions

| Package | Import Path |
|---------|-------------|
| Types | `from 'packages/types'` |
| UI | `from 'packages/ui'` |
| Hooks | `from 'packages/hooks'` |
| Features | `from 'packages/features/...'` |

---

## Tech Stack

- **Frontend**: React, React Native, Expo, Next.js
- **Backend**: Hono, Prisma, PostgreSQL
- **Styling**: TailwindCSS, NativeWind
- **State**: React Query, Context API
