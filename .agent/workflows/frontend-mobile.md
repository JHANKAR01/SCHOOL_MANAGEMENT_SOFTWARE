---
description: How to build features for Expo/React Native mobile app (iOS & Android).
---

# Frontend Mobile (Expo) Workflow

> **Platform**: Expo SDK 52+ with expo-router
> **Styling**: NativeWind (Tailwind CSS for React Native)

---

## Quick Start

```bash
# Run mobile app
cd apps/mobile
npx expo start
```

---

## File Structure

```
apps/mobile/
├── app/                    # expo-router pages (file-based routing)
│   ├── _layout.tsx         # Root layout
│   ├── index.tsx           # Home screen
│   ├── (auth)/             # Auth group
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (dashboard)/        # Dashboard group
│       ├── teacher/
│       ├── parent/
│       └── student/
├── components/             # Mobile-specific components
└── assets/                 # Images, fonts
```

---

## Creating a New Screen

### Step 1: Create the File
```tsx
// apps/mobile/app/parent/attendance.tsx

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useAcademics } from '../../../../packages/hooks';

export default function AttendanceScreen() {
  const { attendance } = useAcademics();
  
  return (
    <ScrollView className="flex-1 bg-white dark:bg-slate-900">
      <View className="p-4">
        <Text className="text-xl font-bold text-slate-900 dark:text-white">
          Attendance
        </Text>
        {/* Content */}
      </View>
    </ScrollView>
  );
}
```

### Step 2: Navigation
File-based routing means the URL matches the file path:
- `app/parent/attendance.tsx` → `/parent/attendance`

---

## Required Imports

### React Native Primitives (MUST USE)
```tsx
// ✅ Always import from react-native
import { 
  View,         // Instead of <div>
  Text,         // Instead of <span> or <p>
  ScrollView,   // For scrollable content
  Pressable,    // Instead of <button>
  TextInput,    // Instead of <input>
  Image,        // Instead of <img>
  FlatList,     // For lists
  SafeAreaView  // For safe areas
} from 'react-native';

// ❌ NEVER use HTML elements
import { div, span, button } from 'react';  // NO!
```

### Shared Components
```tsx
import { 
  StatCard, 
  SovereignButton, 
  SovereignBadge 
} from '../../../../packages/app/components/SovereignComponents';

import { NebulaCard } from '../../../../packages/app/components/nebula/NebulaCard';
```

### Hooks
```tsx
import { useFinance } from '../../../../packages/hooks';
import { useAcademics } from '../../../../packages/hooks/useAcademics';
```

---

## Styling with NativeWind

### Basic Usage
```tsx
// ✅ Correct - NativeWind classes
<View className="flex-1 bg-white p-4">
  <Text className="text-lg font-bold text-slate-900">
    Hello
  </Text>
</View>

// ❌ Wrong - StyleSheet
const styles = StyleSheet.create({...});
<View style={styles.container}>
```

### Common Patterns

**Flexbox Layout**
```tsx
<View className="flex-row items-center justify-between">
  <Text>Left</Text>
  <Text>Right</Text>
</View>
```

**Cards**
```tsx
<View className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
  <Text>Card content</Text>
</View>
```

**Dark Mode**
```tsx
<View className="bg-white dark:bg-slate-900">
  <Text className="text-slate-900 dark:text-white">
    Adapts to dark mode
  </Text>
</View>
```

---

## Platform-Specific Code

```tsx
import { Platform } from 'react-native';

// Conditional styling
<View className={Platform.OS === 'ios' ? 'pt-12' : 'pt-8'}>

// Conditional logic
if (Platform.OS === 'android') {
  // Android-specific behavior
}
```

---

## Navigation

### Using expo-router
```tsx
import { Link, useRouter } from 'expo-router';

// Declarative navigation
<Link href="/parent/attendance">
  <Text>View Attendance</Text>
</Link>

// Programmatic navigation
const router = useRouter();
router.push('/parent/attendance');
router.back();
```

---

## Data Fetching

### Pattern: Use Shared Hooks
```tsx
import { useFinance } from '../../../../packages/hooks';

export default function PaymentsScreen() {
  const { invoices, isLoading } = useFinance();
  
  if (isLoading) {
    return <ActivityIndicator />;
  }
  
  return (
    <FlatList
      data={invoices}
      renderItem={({ item }) => <InvoiceCard invoice={item} />}
    />
  );
}
```

---

## Checklist for New Mobile Screens

- [ ] File created in `apps/mobile/app/`
- [ ] Uses React Native primitives (View, Text, etc.)
- [ ] Styled with NativeWind classes
- [ ] Uses hooks from `packages/hooks/`
- [ ] Handles loading and error states
- [ ] Works in both light and dark mode
- [ ] Tested on both iOS and Android (Expo Go)
