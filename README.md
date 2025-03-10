# Business Task Manager

A mobile application for businesses to manage tasks, track progress, and organize workflow efficiently.

## Overview

Business Task Manager is a comprehensive task management solution that allows business owners and managers to:
- Create and manage task lists
- Track task progress and completion
- Organize tasks by priority and deadline
- Manage business information and statistics

## Technology Stack

- **Frontend**: React Native with Expo
- **Routing**: Expo Router
- **Backend**: Supabase
- **UI Components**: Custom components with Expo libraries
- **Authentication**: Supabase Authentication

## Features

- **Business Management**: Create and view business details
- **Task Management**: Create, view, update, and delete tasks
- **Authentication**: Secure login and account management
- **Statistics**: View business and task performance metrics

## Getting Started

### Prerequisites

- Node.js (LTS version)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository
```bash
git clone [repository-url]
cd task-manager-service-business
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

## Project Structure

- `app/`: Contains the application routes and layouts
- `components/`: Reusable UI components
- `lib/`: Utility functions and service integrations
- `hooks/`: Custom React hooks
- `assets/`: Images, fonts, and other static assets
- `types/`: TypeScript type definitions
- `supabase/`: Supabase configuration and helpers

## Key Components

- `BusinessCard`: Displays business information
- `TaskCard`: Displays task details
- `AddTaskForm`: Form for creating new tasks
- `CreateBusinessForm`: Form for creating new business profiles
- `StatsCard`: Displays business and task statistics

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

For any questions or support, please contact [project-maintainer-email]. 