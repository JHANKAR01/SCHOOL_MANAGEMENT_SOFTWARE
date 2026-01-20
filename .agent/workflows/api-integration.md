---
description: How frontend should communicate with backend API.
---

# API Integration Workflow

> **Rule**: Never use raw `fetch()`. Always use the `client` wrapper.

---

## The API Client

### Location
```
packages/app/api/client.ts
```

### Usage
```typescript
import client from '../api/client';

// GET request
const response = await client.get('/finance/invoices');

// POST request
const response = await client.post('/finance/invoices', {
  studentId: 'std_001',
  amount: 5000
});

// PATCH request
const response = await client.patch('/finance/invoices/inv_001', {
  status: 'PAID'
});

// DELETE request
const response = await client.delete('/finance/invoices/inv_001');
```

---

## Why Use Client Instead of fetch()

| Feature | Raw fetch() | client wrapper |
|---------|-------------|----------------|
| Base URL | Must hardcode | Auto-configured |
| Auth Header | Must add manually | Auto-added |
| Error handling | Manual | Standardized |
| TypeScript | Manual types | Inferred |

```typescript
// ❌ Raw fetch - DON'T DO THIS
const response = await fetch('http://localhost:3001/api/finance/invoices', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();

// ✅ Client wrapper - DO THIS
const response = await client.get('/finance/invoices');
const data = response.data;
```

---

## React Query Integration

### Creating a Hook
```typescript
// packages/hooks/useInventory.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
}

// Query hook
export const useInventoryItems = () => {
  return useQuery<InventoryItem[]>({
    queryKey: ['inventory-items'],
    queryFn: async () => {
      const response = await client.get('/inventory/items');
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutation hook
export const useAddInventoryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newItem: Omit<InventoryItem, 'id'>) =>
      client.post('/inventory/items', newItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
    }
  });
};
```

### Using in Components
```tsx
import { useInventoryItems, useAddInventoryItem } from '../../hooks/useInventory';

function InventoryList() {
  const { data: items, isLoading, error } = useInventoryItems();
  const addItem = useAddInventoryItem();
  
  if (isLoading) return <Loader />;
  if (error) return <Error message={error.message} />;
  
  const handleAdd = () => {
    addItem.mutate({ name: 'New Item', quantity: 10 });
  };
  
  return (
    <View>
      {items?.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}
      <Button onPress={handleAdd} loading={addItem.isPending}>
        Add Item
      </Button>
    </View>
  );
}
```

---

## Query Keys Convention

```typescript
// Simple resource
['invoices']
['students']
['inventory-items']

// With filters/params
['invoices', { status: 'PENDING' }]
['students', { classId: 'cls_10A' }]

// Single resource
['invoice', invoiceId]
['student', studentId]

// Nested resource
['class', classId, 'students']
['exam', examId, 'results']
```

---

## Error Handling in Hooks

```typescript
export const useInventoryItems = () => {
  return useQuery<InventoryItem[]>({
    queryKey: ['inventory-items'],
    queryFn: async () => {
      try {
        const response = await client.get('/inventory/items');
        if (!response.data.success) {
          throw new Error(response.data.error);
        }
        return response.data.data;
      } catch (error) {
        // Re-throw for React Query to handle
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000
  });
};
```

---

## Optimistic Updates

```typescript
export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => client.patch(`/inventory/items/${id}`, data),
    
    // Optimistic update
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['inventory-items'] });
      
      const previousItems = queryClient.getQueryData(['inventory-items']);
      
      queryClient.setQueryData(['inventory-items'], (old) =>
        old?.map(item => item.id === id ? { ...item, ...data } : item)
      );
      
      return { previousItems };
    },
    
    // Rollback on error
    onError: (err, variables, context) => {
      queryClient.setQueryData(['inventory-items'], context?.previousItems);
    },
    
    // Refetch on success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
    }
  });
};
```

---

## Common Patterns

### Pagination
```typescript
export const usePaginatedStudents = (page: number, limit: number) => {
  return useQuery({
    queryKey: ['students', { page, limit }],
    queryFn: async () => {
      const response = await client.get(`/students?page=${page}&limit=${limit}`);
      return {
        data: response.data.data,
        total: response.data.total,
        totalPages: response.data.totalPages
      };
    },
    keepPreviousData: true
  });
};
```

### Search/Filter
```typescript
export const useSearchStudents = (query: string) => {
  return useQuery({
    queryKey: ['students', 'search', query],
    queryFn: async () => {
      const response = await client.get(`/students/search?q=${query}`);
      return response.data.data;
    },
    enabled: query.length >= 2 // Only search with 2+ characters
  });
};
```

### Dependent Queries
```typescript
const { data: user } = useUser();
const { data: profile } = useQuery({
  queryKey: ['profile', user?.id],
  queryFn: () => client.get(`/profiles/${user.id}`),
  enabled: !!user?.id // Only run when user is loaded
});
```

---

## Checklist for New API Integration

- [ ] Hook created in `packages/hooks/`
- [ ] Uses `client` wrapper, not raw fetch
- [ ] Query key follows naming convention
- [ ] Handles loading state
- [ ] Handles error state
- [ ] Re-exported from `packages/hooks/index.ts`
- [ ] TypeScript interfaces defined
- [ ] Invalidates related queries on mutation
