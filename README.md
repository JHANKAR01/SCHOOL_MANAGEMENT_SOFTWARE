# Project Sovereign
hello 
A "Sovereign" School ERP designed for the Indian K-12 market. This repository uses a monorepo structure (simulated here) to support Web (Next.js) and Mobile (Expo).

## Project Philosophy
1. **Ownership First**: No middleman fees.
2. **Tier 3 Ready**: Offline-first, low-literacy UX.
3. **Multi-Tenant**: Single codebase, multiple schools isolated by `school_id`.

## Architecture

- **`prisma/`**: Database schema with Multi-tenancy and RLS enabled.
- **`packages/api/src/upi-engine.ts`**: Zero-fee UPI deep link generation.
- **`packages/app/features/attendance/`**: Offline-first attendance logic using TanStack Query.
- **`apps/expo/app/login.tsx`**: Dynamic Branding Engine entry point.

## Getting Started

1. **Database Setup**:
   ```bash
   npx prisma migrate dev
   # Ensure the RLS migration in prisma/migrations/0_init/migration.sql is applied
   ```

2. **Run Web**:
   ```bash
   npm run dev
   ```

3. **Mock Credentials**:
   - School 1: `demo.admin` / `password`
   - School 2: `dav.admin` / `password`

## Key Features

- **Geofencing**: Attendance only allowed within 50m of school coordinates.
- **Optimistic UI**: Green checks appear instantly, sync happens in background.
- **Dynamic Branding**: The app changes colors and logos based on the login.
