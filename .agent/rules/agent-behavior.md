---
description: Guidelines for AI agent behavior when working on this project.
---

# Agent Behavior Guidelines

> These rules define HOW the AI agent should work on this project.

---

## 👑 Priority Hierarchy

When instructions conflict, follow this order of authority (Highest to Lowest):

1. **User's Direct Instructions** (Current conversation)
2. **Project Rules** (`.agent/rules/*.md`)
3. **Project Workflows** (`.agent/workflows/*.md`)
4. **Project Context** (`.agent/context/*.md`)
5. **Detailed Templates** (`.agent/templates/*.txt`)
6. **External Skills** (`.agent/external-skills/`) ← LOWEST PRIORITY

## 🧠 Before Writing ANY Code

```
1. Read .agent/rules/common-pitfalls.md
2. Check if similar code exists (don't reinvent)
3. Verify the target folder (packages/app vs apps/web vs apps/mobile)
4. Confirm import paths are correct
```

---

## 🎯 Decision Priorities

When making trade-offs, prioritize in this order:

1. **Mobile Compatibility** - Never break React Native
2. **Type Safety** - No `any` types without justification
3. **Security** - Always include `school_id` for RLS
4. **Consistency** - Match existing patterns
5. **Simplicity** - Less code > clever code

---

## 💬 Communication Style

### DO ✅
- Be concise and direct
- Use tables for comparisons and summaries
- Use backticks for `file names`, `function names`, `code`
- Acknowledge mistakes openly
- Ask clarifying questions when requirements are ambiguous

### DON'T ❌
- Over-apologize ("I'm so sorry for the confusion...")
- Repeat the same explanation multiple times
- Use vague language ("I think", "maybe", "perhaps")
- Make assumptions about business logic without asking

---

## 📋 Response Formatting

| Situation | Format |
|-----------|--------|
| Explaining options | Numbered list |
| Comparing approaches | Table |
| Showing file changes | Diff block |
| Listing files | Bullet list with paths |
| Summarizing work | Brief paragraph + table |

---

## ⚠️ When to STOP and ASK

Always ask before:

1. **Deleting files** - "I will delete X. Confirm?"
2. **Schema changes** - "This will affect the database. Proceed?"
3. **Breaking changes** - "This will break existing functionality..."
4. **Ambiguous requirements** - "Do you mean A or B?"
5. **Multiple valid approaches** - "Option 1 vs Option 2 - which do you prefer?"

---

## 🔧 Code Writing Rules

### Imports
```typescript
// ✅ Correct order
1. React/React Native
2. Third-party libraries
3. Local components (@/components)
4. Local hooks (@/hooks)
5. Local utils (@/utils)
6. Types
```

### Components (in packages/app)
```typescript
// ✅ Always use React Native primitives
import { View, Text, Pressable } from 'react-native';

// ❌ Never use HTML in shared code
// No <div>, <span>, <p>, <button>
```

### API Calls
```typescript
// ✅ Always use the client wrapper
import { client } from '@/api/client';
const data = await client.get('/endpoint');

// ❌ Never use raw fetch
// No fetch('/api/...')
```

---

## 🧪 After Making Changes

1. **Verify imports** - No broken paths
2. **Check for TypeScript errors** - No red squiggles
3. **Test affected platforms** - If touching shared code, consider both web and mobile
4. **Update documentation** - If behavior changed, update relevant .md files

---

## 📁 File Placement Decision Tree

```
Is it used by BOTH web and mobile?
├── YES → packages/app/
│   ├── Component → packages/app/components/
│   ├── Feature → packages/app/features/<domain>/
│   └── Hook → packages/hooks/
│
└── NO → Platform-specific folder
    ├── Web only → apps/web/
    └── Mobile only → apps/mobile/
```

---

## 🚨 Red Flags to Watch For

Stop immediately if you see:

| Red Flag | Action |
|----------|--------|
| Importing from `packages/api` | ❌ Deleted folder - use `server/` |
| Using `<div>` in `packages/app` | ❌ Use `<View>` |
| Using `fetch()` directly | ❌ Use `client.ts` |
| Missing `school_id` in query | ❌ Add for RLS |
| Importing `apps/web` into `packages/app` | ❌ Circular dependency |

---

## 📚 Required Reading Order

When starting a new session, read in this order:

1. `.agent/README.md` - Project overview
2. `.agent/rules/common-pitfalls.md` - Known issues
3. `.agent/context/current-status.md` - What's in progress
4. Relevant workflow file for the task
