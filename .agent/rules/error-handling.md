---
description: Error handling patterns for API and UI consistency.
---

# Error Handling Rules

> **Rule**: Consistent error handling = better debugging + better UX

---

## API Error Response Format

### Standard Structure
```typescript
// ✅ Always return this shape on errors
{
  success: false,
  error: "Human readable message",
  code: "ERROR_CODE",
  details?: any  // Optional additional info
}

// ✅ Success response
{
  success: true,
  data: { ... }
}
```

### Error Codes
| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Valid token but wrong role |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `CONFLICT` | 409 | Duplicate or state conflict |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Backend Error Handling

### Route Handler Pattern
```typescript
router.get('/resource/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const user = c.get('user');
    
    const item = await prisma.resource.findUnique({
      where: { id, school_id: user.school_id }
    });
    
    if (!item) {
      return c.json({ 
        success: false, 
        error: 'Resource not found',
        code: 'NOT_FOUND' 
      }, 404);
    }
    
    return c.json({ success: true, data: item });
    
  } catch (error) {
    console.error('Error fetching resource:', error);
    return c.json({ 
      success: false, 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR' 
    }, 500);
  }
});
```

### Validation Pattern
```typescript
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().datetime()
});

router.post('/resource', async (c) => {
  try {
    const body = await c.req.json();
    const validated = schema.parse(body);
    // ... use validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ 
        success: false, 
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors
      }, 400);
    }
    throw error;
  }
});
```

---

## Frontend Error Handling

### React Query Error Handling
```typescript
const { data, error, isError } = useQuery({
  queryKey: ['resource'],
  queryFn: async () => {
    const res = await client.get('/resource');
    if (!res.data.success) {
      throw new Error(res.data.error);
    }
    return res.data.data;
  }
});

if (isError) {
  return <ErrorDisplay message={error.message} />;
}
```

### Mutation Error Handling
```typescript
const mutation = useMutation({
  mutationFn: (data) => client.post('/resource', data),
  onError: (error) => {
    // Show toast notification
    toast.error(error.message || 'Something went wrong');
  },
  onSuccess: () => {
    toast.success('Resource created!');
    queryClient.invalidateQueries({ queryKey: ['resource'] });
  }
});
```

---

## Error UI Components

### Error Display
```tsx
// For query errors in content area
function ErrorDisplay({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View className="p-8 flex flex-col items-center justify-center gap-4">
      <AlertCircle className="w-8 h-8 text-red-500" />
      <Text className="text-red-600 font-medium">{message}</Text>
      {onRetry && (
        <SovereignButton onClick={onRetry}>Retry</SovereignButton>
      )}
    </View>
  );
}
```

### Toast Notifications
```tsx
// Use sonner for toasts
import { toast } from 'sonner';

// Success
toast.success('Changes saved successfully');

// Error
toast.error('Failed to save changes');

// Loading
toast.promise(saveData(), {
  loading: 'Saving...',
  success: 'Saved!',
  error: 'Failed to save'
});
```

### Form Validation Display
```tsx
{errors.email && (
  <Text className="text-xs text-red-500 mt-1">
    {errors.email.message}
  </Text>
)}
```

---

## Specific Error Scenarios

### Auth Errors
```typescript
// Frontend: Redirect to login on 401
if (error.response?.status === 401) {
  localStorage.removeItem('sovereign_token');
  window.location.href = '/login';
}
```

### Network Errors
```typescript
// Show offline indicator
if (error.message === 'Network Error') {
  return <OfflineIndicator />;
}
```

### Not Found
```typescript
// API returns 404
if (error.response?.status === 404) {
  return <NotFoundPage />;
}
```

---

## Logging Rules

### What to Log
| Level | When | Example |
|-------|------|---------|
| `console.error` | Actual errors | API failures, exceptions |
| `console.warn` | Recoverable issues | Missing optional data |
| `console.log` | Debug only | Remove before commit |

### Production Logging
```typescript
// ✅ Log useful context
console.error('Failed to fetch students:', {
  userId: user.id,
  schoolId: user.school_id,
  error: error.message
});

// ❌ Don't log sensitive data
console.error('Login failed:', { password: '...' }); // NEVER!
```
