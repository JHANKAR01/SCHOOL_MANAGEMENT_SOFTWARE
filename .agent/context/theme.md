---
description: Nebula design system - colors, components, and styling conventions.
---

# Nebula Design System

> **Location**: `packages/ui/theme/nebula.ts`
> **Styling**: NativeWind (Tailwind for React Native)

---

## Color Palette

### Primary Colors
| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| Primary | `indigo-600` | `indigo-500` | Buttons, links, accents |
| Secondary | `slate-600` | `slate-400` | Secondary text, borders |
| Background | `white` | `slate-900` | Page backgrounds |
| Surface | `slate-50` | `slate-800` | Cards, panels |

### Semantic Colors
| Name | Color | Usage |
|------|-------|-------|
| Success | `green-500` | Completed, approved, positive |
| Warning | `yellow-500` | Pending, attention needed |
| Error | `red-500` | Failed, rejected, errors |
| Info | `blue-500` | Information, notes |

### Status Badges
```tsx
// ✅ Use SovereignBadge component
<SovereignBadge status="success">Approved</SovereignBadge>
<SovereignBadge status="warning">Pending</SovereignBadge>
<SovereignBadge status="error">Rejected</SovereignBadge>
```

---

## Typography

### Headings
```tsx
// Page title
<Text className="text-2xl font-bold text-slate-900 dark:text-white">
  Dashboard
</Text>

// Section header
<Text className="text-lg font-semibold text-slate-800 dark:text-slate-200">
  Recent Activity
</Text>

// Card title
<Text className="text-base font-medium text-slate-700 dark:text-slate-300">
  Student Details
</Text>
```

### Body Text
```tsx
// Primary text
<Text className="text-sm text-slate-600 dark:text-slate-400">
  Content here
</Text>

// Secondary/muted text
<Text className="text-xs text-slate-500 dark:text-slate-500">
  Subtitle or hint
</Text>
```

---

## Components

### Cards (NebulaCard)
```tsx
<NebulaCard className="p-4">
  {/* Content */}
</NebulaCard>

// Classes applied:
// bg-white dark:bg-slate-800
// rounded-xl
// border border-slate-200 dark:border-slate-700
// shadow-sm
```

### Buttons (NebulaButton)
```tsx
// Primary action
<NebulaButton variant="primary" onClick={handleClick}>
  Submit
</NebulaButton>

// Secondary action
<NebulaButton variant="secondary" onClick={handleCancel}>
  Cancel
</NebulaButton>

// Danger action
<NebulaButton variant="danger" onClick={handleDelete}>
  Delete
</NebulaButton>
```

### Inputs (NebulaInput)
```tsx
<NebulaInput
  label="Email Address"
  value={email}
  onChange={setEmail}
  placeholder="user@school.edu"
/>
```

### Stat Cards (StatCard)
```tsx
<StatCard
  title="Total Students"
  value="2,145"
  icon={<Users className="w-5 h-5" />}
  trend={{ value: 12, isPositive: true }}
/>
```

---

## Spacing

| Size | Class | Pixels |
|------|-------|--------|
| xs | `p-1`, `gap-1` | 4px |
| sm | `p-2`, `gap-2` | 8px |
| md | `p-4`, `gap-4` | 16px |
| lg | `p-6`, `gap-6` | 24px |
| xl | `p-8`, `gap-8` | 32px |

---

## Responsive Design

### Breakpoints
| Name | Min Width | Usage |
|------|-----------|-------|
| Default | 0px | Mobile phones |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Desktops |

### Pattern
```tsx
// Mobile-first approach
<View className="flex-col md:flex-row">
  <View className="w-full md:w-1/2">
    {/* Content */}
  </View>
</View>
```

---

## Dark Mode

### Detection
```tsx
import { useTheme } from '../../provider/ThemeProvider';

const { isDarkMode } = useTheme();
```

### Usage
```tsx
// ✅ Use Tailwind dark: prefix
<View className="bg-white dark:bg-slate-900">

// ❌ Don't use conditional classes manually
<View className={isDarkMode ? 'bg-slate-900' : 'bg-white'}>
```

---

## Icon Usage

### Library
Always use `lucide-react`:
```tsx
import { Users, Calendar, ChevronRight } from 'lucide-react';
```

### Sizing
| Context | Size | Class |
|---------|------|-------|
| Inline text | 16px | `w-4 h-4` |
| Button icon | 16px | `w-4 h-4` |
| Card icon | 20px | `w-5 h-5` |
| Stat card | 20px | `w-5 h-5` |
| Empty state | 40px | `w-10 h-10` |

---

## Do's and Don'ts

| ✅ Do | ❌ Don't |
|-------|---------|
| Use NativeWind classes | Use StyleSheet.create() |
| Use semantic colors (success/error) | Use raw hex codes |
| Use component library (Nebula) | Build one-off styled components |
| Mobile-first responsive | Desktop-first with mobile patches |
| Use dark: prefix | Manual isDarkMode conditionals |
