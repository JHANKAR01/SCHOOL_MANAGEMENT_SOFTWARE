---
description: How to build features for Next.js web application.
---

# Frontend Web (Next.js) Workflow

> **Platform**: Next.js 14+ with App Router
> **Styling**: Tailwind CSS (standard, not NativeWind)

---

## Quick Start

```bash
# Run web app
cd apps/web
npm run dev
```

---

## File Structure

```
apps/web/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── (dashboard)/        # Dashboard routes
│       └── [role]/
│           └── page.tsx
├── pages/                  # Legacy pages (some exist)
│   └── super-admin/
│       └── onboarding.tsx
└── components/             # Web-specific components
```

---

## Creating a New Page

### App Router (Preferred)
```tsx
// apps/web/app/admin/users/page.tsx

import { UserAccessControl } from '../../../../../packages/app/features/admin/UserAccessControl';

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <UserAccessControl />
    </div>
  );
}

export const metadata = {
  title: 'User Management | Sovereign School',
  description: 'Manage user access and permissions'
};
```

### Pages Router (Legacy)
```tsx
// apps/web/pages/super-admin/settings.tsx

import { SuperAdminSettings } from '../../../packages/app/features/super-admin/Settings';

export default function SettingsPage() {
  return <SuperAdminSettings />;
}
```

---

## Key Differences from Mobile

| Feature | Mobile (Expo) | Web (Next.js) |
|---------|---------------|---------------|
| Elements | `<View>`, `<Text>` | `<div>`, `<span>` |
| Styling | NativeWind | Tailwind CSS |
| Navigation | expo-router | next/navigation |
| Storage | SecureStore | localStorage |

---

## Styling

### Standard Tailwind (NOT NativeWind)
```tsx
// ✅ Web - Standard HTML + Tailwind
<div className="flex items-center justify-between p-4">
  <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
    Action
  </button>
</div>

// ❌ Don't use React Native primitives in web-only pages
<View className="flex-1">  // Wrong for web-only code
```

---

## Using Shared Components

Since shared components use React Native primitives, they work on web via React Native Web:

```tsx
// These work on both platforms!
import { 
  StatCard, 
  SovereignButton 
} from '../../../../packages/app/components/SovereignComponents';

export default function Dashboard() {
  return (
    <div className="p-6">
      {/* Shared components work here */}
      <StatCard title="Students" value="2,145" />
      <SovereignButton onClick={handleClick}>
        Save Changes
      </SovereignButton>
    </div>
  );
}
```

---

## Server Components vs Client Components

### Server Component (Default)
```tsx
// apps/web/app/dashboard/page.tsx
// No "use client" directive - runs on server

import { prisma } from '../../../server/src/db';

export default async function DashboardPage() {
  // Can fetch directly from DB in server components
  const stats = await getStats();
  return <Dashboard stats={stats} />;
}
```

### Client Component
```tsx
// apps/web/app/dashboard/interactive-section.tsx
'use client';  // Required for hooks, state, effects

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export function InteractiveSection() {
  const [count, setCount] = useState(0);
  // Client-side logic here
}
```

---

## Data Fetching Options

### Option 1: Shared Hooks (Client Components)
```tsx
'use client';
import { useFinance } from '../../../../packages/hooks';

export function FinanceSection() {
  const { invoices, isLoading } = useFinance();
  // ...
}
```

### Option 2: Server Actions (Server Components)
```tsx
// Server component - fetch directly
export default async function Page() {
  const data = await fetch('http://localhost:3001/api/finance/invoices');
  const invoices = await data.json();
  return <InvoiceList invoices={invoices} />;
}
```

---

## SEO & Metadata

```tsx
// apps/web/app/dashboard/page.tsx

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Sovereign School',
  description: 'School management dashboard',
};

export default function Page() {
  return <Dashboard />;
}
```

---

## Authentication on Web

```tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function AuthGuard({ children }) {
  const router = useRouter();
  
  useEffect(() => {
    const token = localStorage.getItem('sovereign_token');
    if (!token) {
      router.push('/login');
    }
  }, []);
  
  return children;
}
```

---

## Checklist for New Web Pages

- [ ] File created in `apps/web/app/` or `apps/web/pages/`
- [ ] Uses standard HTML elements (`div`, `span`, etc.)
- [ ] Styled with Tailwind CSS
- [ ] Has proper metadata for SEO
- [ ] Uses `'use client'` directive if needed
- [ ] Works with shared components from packages/app
- [ ] Handles authentication
- [ ] Responsive design (mobile-friendly)
