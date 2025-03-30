# Components Organization

This directory contains all the React components used in the AI Menago application. The components are organized into subdirectories based on their functionality:

## Folder Structure

- **`/ui`**: Basic UI components that can be reused across the application
  - `ErrorView.tsx`: Error display component with retry functionality
  - `LoadingView.tsx`: Loading indicator component

- **`/business`**: Business-related components
  - `BusinessCard.tsx`: Card component to display business details
  - `BusinessList.tsx`: List component to display multiple businesses
  - `WorkersList.tsx`: List component to display workers/team members

- **`/tasks`**: Task-related components
  - `TaskCard.tsx`: Card component to display task details

- **`/forms`**: Form components
  - `AddTaskForm.tsx`: Form for adding new tasks
  - `CreateBusinessForm.tsx`: Form for creating new businesses

- **`/modals`**: Modal dialog components
  - `PhotoUploadModal.tsx`: Modal for taking and uploading verification photos

- **`/stats`**: Statistical and visualization components
  - `StatsCard.tsx`: Component for displaying performance statistics

## Imports

Components can be imported in two ways:

### 1. Direct Import

```typescript
import ErrorView from '@/components/ui/ErrorView';
```

### 2. Using Barrel Files (Recommended)

```typescript
import { ErrorView, LoadingView } from '@/components';
```

The barrel files (index.ts) in each directory export all components, making imports cleaner and more maintainable.

## Types

Common types are defined in the `/types` directory and can be imported as needed:

```typescript
import { Business, Worker } from '@/types/business';
``` 