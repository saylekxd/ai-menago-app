# Admin Page Refactoring Plan

## Goals
- Convert admin page to a template for team management
- Make specific components visible to 'worker' role users
- Add company dashboard for all users
- Implement additional useful features

## Task Breakdown

### 1. Restructure Admin Page Layout
- [x] Rename page from "Admin Panel" to "Team Dashboard"
- [x] Create role-based component visibility system
- [x] Move logout functionality to a common header

### 2. Team Members Component for Workers
- [x] Extract WorkersList into standalone component
- [x] Modify to show read-only view for workers
- [x] Hide role management controls for non-admins

### 3. Company Dashboard for All Users
- [x] Create CompanyDetails component
- [x] Display company name, logo, and description
- [x] Show relevant business metrics (member count, active tasks)
- [x] Add company announcements section

### 4. Additional Features
- [ ] Personal performance metrics widget
- [ ] Team activity feed
- [ ] Upcoming deadlines/calendar view
- [ ] Quick communication tools (team chat or messaging)
- [ ] Notification center
- [ ] User profile customization

## Implementation Approach

### Phase 1: Refactor Existing Code
```tsx
// Conditional rendering based on user role
{isManager ? (
  <ManagerOnlyComponent />
) : (
  <WorkerView />
)}

// Replace unauthorized message with role-appropriate view
```

### Phase 2: Add New Components
```tsx
<CompanyDashboard 
  businessDetails={currentBusiness}
  userRole={userDetails.role}
/>

<TeamDirectory 
  workers={workers}
  isEditable={isAdmin || isManager} 
/>
```

### Phase 3: Enhance User Experience
- Implement proper loading states and transitions
- Add animations for better UX
- Ensure responsive design for all screen sizes 