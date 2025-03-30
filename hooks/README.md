# Custom Hooks

This directory contains all the custom React hooks used in the AI Menago application. These hooks encapsulate business logic and provide a clean separation of concerns.

## Available Hooks

- **`useAuth.ts`**: Handles authentication state and methods
- **`useUserDetails.ts`**: Fetches and manages user profile details
- **`useTasks.ts`**: Manages tasks operations (fetching, adding, completing)
- **`usePerformance.ts`**: Fetches and processes performance statistics
- **`useBusinesses.ts`**: Handles business and worker management operations
- **`usePhotoUpload.ts`**: Manages photo capturing, selection, and uploading

## Usage

Hooks can be imported in two ways:

### 1. Direct Import

```typescript
import { useUserDetails } from '@/hooks/useUserDetails';
```

### 2. Using Barrel File (Recommended)

```typescript
import { useAuth, useUserDetails } from '@/hooks';
```

## Best Practices

1. **Stateful Logic**: Use hooks to extract stateful logic from components
2. **Reusability**: Design hooks to be reusable across components
3. **Single Responsibility**: Each hook should have a single responsibility
4. **Error Handling**: Include proper error handling in hooks
5. **Loading States**: Hooks should expose loading states for UI feedback

## Example

```typescript
import { useUserDetails } from '@/hooks';

function MyComponent() {
  const {
    userDetails,
    loading,
    error,
    refetchUserDetails,
    isManager
  } = useUserDetails(user);

  if (loading) return <LoadingView />;
  if (error) return <ErrorView message={error} onRetry={refetchUserDetails} />;

  return (
    // Component UI using userDetails
  );
}
``` 