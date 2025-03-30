# AI-Menago App Design Document

## Project Overview

AI-Menago is a comprehensive task management application built with React Native and Expo, designed to help businesses efficiently manage and track tasks across different user roles. The app facilitates task assignment, verification, performance monitoring, and business administration through an intuitive mobile interface.

## Core Technology Stack

- **Frontend**: React Native with Expo (SDK 52)
- **Navigation**: Expo Router (file-based routing)
- **Backend/Database**: Supabase 
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **UI Components**: Custom components with React Native primitives
- **Icons**: Lucide React Native
- **Type Safety**: TypeScript

## App Architecture

### Data Model

The application is built around the following key entities:

1. **Users**:
   - Roles: Admin, Manager, Worker
   - Associated with a specific business
   - Personal details (name, email)

2. **Businesses**:
   - Business profile information
   - Industry categorization 

3. **Tasks**:
   - Title and description
   - Due date and status tracking
   - Photo verification requirements
   - Assignment to specific users
   - Business association
   - Recurrence patterns (for recurring tasks)
   - Priority levels (High, Medium, Low)
   - Tags and hierarchical grouping

4. **Task Performance**:
   - Weekly performance metrics
   - Completed/pending/overdue task counts
   - User-specific performance tracking

5. **Task Comments**:
   - User attribution
   - Timestamp
   - Comment content
   - Association with specific tasks

### App Structure

- **Authentication Flow**: Login/registration screens with role-based access
- **Tab-based Navigation**: Main dashboard, performance metrics, and admin panel
- **Component Architecture**: Modular UI components for consistent UI/UX
- **Custom Hooks**: Business logic separation and reusability
- **Offline Handling**: Notification system for offline status

## Current Features

### User Authentication & Authorization
- Secure login and registration
- Role-based access control (Admin, Manager, Worker)
- Persistent sessions with secure token storage

### Task Management
- View assigned tasks with due dates
- Mark tasks as complete
- Photo verification for task completion
- Task filtering based on user role

### Task Creation & Assignment
- Managers can create new tasks
- Assign tasks to specific workers
- Set due dates and requirements

### Performance Tracking
- Weekly performance metrics
- Visualization of completed vs. pending tasks
- Historical performance data

### Business Administration
- Create and manage businesses
- User management within businesses
- Business-specific task isolation

### Media Handling
- Camera integration for task verification
- Image upload to Supabase storage
- Optimized image processing for mobile devices

## Planned Features

### Task Recurrence System
- **Recurrence Patterns**:
  - Daily recurrence with optional weekday selection
  - Weekly recurrence with customizable day selection
  - Monthly recurrence with day-of-month options
  - Custom recurrence intervals
- **Recurrence Management**:
  - End date or occurrence count options
  - Ability to modify all future instances or single instance
  - Template-based recurring task creation
- **Admin Controls**:
  - Admin/manager exclusive recurring task creation
  - Bulk assignment of recurring tasks
  - Recurrence pattern templates

### Dual Task Grouping System
- **Tag-based Grouping**:
  - Multiple tags can be assigned to a single task
  - Flat tag structure for maximum flexibility
  - Color-coded tags for visual organization
  - Tag filtering in task lists
  - Tag management interface for admins/managers
- **Hierarchical Grouping**:
  - Parent-child relationship between tasks
  - Multi-level nesting for complex projects
  - Collapsible task hierarchies in UI
  - Progress aggregation up the hierarchy
  - Drag-and-drop management interface

### Task Priority System
- **Priority Levels**:
  - High - tasks requiring immediate attention
  - Medium - standard tasks with normal urgency
  - Low - tasks that can be postponed if necessary
- **Priority-related Features**:
  - Visual priority indicators (colors, icons)
  - Automatic task sorting based on priority
  - Priority-based filtering
  - Reporting that considers task priorities

### Comment System
- Thread-based comments on tasks
- @mentions for team members
- Timestamp and user attribution
- Comment notification system
- Rich text formatting (basic)

### Offline Mode Handling
- Network status detection
- Clear offline status indicators
- Informative notifications about offline limitations
- Read-only access to cached data when offline
- Automatic retry when connection is restored

### Enhanced Notifications
- Push notifications for new task assignments
- Due date reminders
- Task completion alerts for managers

### Advanced Reporting
- Detailed performance analytics
- Exportable reports
- Custom time period selection

### Team Collaboration
- Task comments and discussion
- Team performance metrics
- Collaborative task assignment

### Enhanced Media Features
- Document attachments for tasks
- Voice notes for task details

## Technical Considerations

### Performance Optimization
- FlatList virtualization for task lists
- Image compression before upload
- Lazy loading of non-critical components
- Pagination for large data sets

### Cross-Platform Compatibility
- Responsive design for various screen sizes
- Platform-specific adaptations when necessary
- Web support considerations

### Security
- Secure data transmission with HTTPS
- Token-based authentication
- Business data isolation
- Input validation and sanitization

### Scalability
- Efficient database queries via MCP
- Pagination for large data sets
- Optimized state management

## Development Workflow

### Code Organization
- Feature-based directory structure
- Shared components and hooks
- Consistent naming conventions

### Testing Strategy
- Manual testing of all features
- Cross-platform verification
- Edge case testing (slow networks, large datasets)

### Deployment Pipeline
- Expo EAS Build for app generation
- Continuous integration/deployment
- Version management

## User Experience Goals

- Intuitive and simple interface
- Fast and responsive interactions
- Clear task status visualization
- Seamless photo verification process
- Accessible to users of all technical levels
- Clear offline status indication

## Future Roadmap

### Phase 1: Core Enhancement (1-2 weeks)
- Implementation of recurring tasks
- Enhanced error handling
- Basic offline detection
- User profile improvements

### Phase 2: Advanced Features (3-4 weeks)
- Dual task grouping system
- Enhanced filtering and sorting
- Performance optimizations
- Cross-platform testing

### Phase 3: Collaborative Features (5-6 weeks)
- Task comments
- Task priority system
- Enhanced reporting
- Finalize for production release

