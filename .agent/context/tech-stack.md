---
description: Approved technology stack and library choices. Never deviate without explicit approval.
---

# Tech Stack

> **Rule**: Use ONLY the libraries listed below. If unsure, ask before introducing a new dependency.

## Frontend (Shared)

| Category | ✅ Use | ❌ Never Use |
|----------|--------|--------------|
| **Styling** | NativeWind (Tailwind for RN) | StyleSheet.create(), inline styles |
| **State** | @tanstack/react-query | SWR, Redux, Zustand |
| **Forms** | React Hook Form | Formik, uncontrolled forms |
| **Icons** | lucide-react | FontAwesome, Heroicons |
| **Components** | Custom Nebula design system | Material UI, Chakra, shadcn |

## Frontend (Mobile - Expo)

| Category | ✅ Use | ❌ Never Use |
|----------|--------|--------------|
| **Framework** | Expo SDK 52+ | Bare React Native |
| **Navigation** | expo-router (file-based) | React Navigation directly |
| **Primitives** | `<View>`, `<Text>`, `<Pressable>` | `<div>`, `<span>`, `<button>` |
| **Storage** | expo-secure-store | AsyncStorage for sensitive data |

## Frontend (Web - Next.js)

| Category | ✅ Use | ❌ Never Use |
|----------|--------|--------------|
| **Framework** | Next.js 14+ (App Router) | Pages Router |
| **Primitives** | `<div>`, `<span>`, standard HTML | React Native primitives |
| **Auth** | next-auth / custom JWT | Firebase Auth |

## Backend

| Category | ✅ Use | ❌ Never Use |
|----------|--------|--------------|
| **Framework** | Hono | Express, Fastify |
| **ORM** | Prisma | TypeORM, Drizzle, raw SQL |
| **Database** | PostgreSQL (Supabase) | MySQL, MongoDB |
| **Auth** | JWT (jose library) | Passport.js |
| **Validation** | Zod | Joi, Yup |

## Shared

| Category | ✅ Use | ❌ Never Use |
|----------|--------|--------------|
| **TypeScript** | Strict mode enabled | `any` type (avoid) |
| **Package Manager** | npm | yarn, pnpm |
| **Runtime** | Node.js 20+ | Bun, Deno |

## Key Versions (package.json)

```json
{
  "expo": "~52.0.0",
  "react": "18.3.1",
  "react-native": "0.76.9",
  "next": "14.x",
  "hono": "4.x",
  "prisma": "6.x",
  "@tanstack/react-query": "5.x",
  "nativewind": "4.x"
}
```

## Decision Log

| Decision | Reason |
|----------|--------|
| NativeWind over StyleSheet | Consistent with Tailwind patterns, faster development |
| Hono over Express | Lightweight, edge-ready, better TypeScript support |
| Prisma over raw SQL | Type safety, migrations, easy relation handling |
| expo-router over React Navigation | File-based routing matches Next.js patterns |
