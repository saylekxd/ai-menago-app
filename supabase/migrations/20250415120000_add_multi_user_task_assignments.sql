/*
  # Add Multi-User Task Assignment Capability
  
  1. Changes
    - Remove assigned_to column from tasks table
    - Create new task_assignments junction table
    - Update RLS policies for tasks and task_assignments tables
    - Add utility functions for task assignments
*/

-- Create task_assignments junction table
CREATE TABLE IF NOT EXISTS task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(user_id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  verification_photo_url TEXT,
  UNIQUE(task_id, user_id)  -- Prevent duplicate assignments
);

-- Add RLS to task_assignments
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;

-- Update the tasks table by making assigned_to nullable (to support migration)
ALTER TABLE tasks 
ALTER COLUMN assigned_to DROP NOT NULL;

-- Function to check if a user is assigned to a task
CREATE OR REPLACE FUNCTION public.is_user_assigned_to_task(task_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM task_assignments
    WHERE task_id = $1
    AND user_id = (SELECT user_id FROM users WHERE id = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user can manage a task
CREATE OR REPLACE FUNCTION public.can_manage_task(task_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tasks t
    JOIN users u ON u.business_id = t.business_id
    WHERE t.id = $1
    AND u.id = auth.uid()
    AND (u.role = 'manager' OR u.role = 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS policies for task_assignments

-- Users can see assignments for tasks they're assigned to or can manage
CREATE POLICY "Task assignment visibility policy"
ON task_assignments
FOR SELECT
TO authenticated
USING (
  (
    SELECT user_id FROM users WHERE id = auth.uid()
  ) = user_id
  OR 
  can_manage_task(task_id)
);

-- Only managers and admins can create task assignments
CREATE POLICY "Task assignment creation policy"
ON task_assignments
FOR INSERT
TO authenticated
WITH CHECK (
  can_manage_task(task_id)
);

-- Users can update their own assignments, managers can update any
CREATE POLICY "Task assignment update policy"
ON task_assignments
FOR UPDATE
TO authenticated
USING (
  (
    SELECT user_id FROM users WHERE id = auth.uid()
  ) = user_id
  OR 
  can_manage_task(task_id)
);

-- Only managers and admins can delete task assignments
CREATE POLICY "Task assignment deletion policy"
ON task_assignments
FOR DELETE
TO authenticated
USING (
  can_manage_task(task_id)
);

-- Update task policies to handle multi-user assignments
DROP POLICY IF EXISTS "Task visibility policy" ON tasks;
DROP POLICY IF EXISTS "Task creation policy" ON tasks;
DROP POLICY IF EXISTS "Task update policy" ON tasks;

-- Task visibility now checks task_assignments too
CREATE POLICY "Task visibility policy"
ON tasks
FOR SELECT
TO authenticated
USING (
  is_user_assigned_to_task(id)
  OR 
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.business_id = tasks.business_id
    AND (users.role = 'manager' OR users.role = 'admin')
  )
);

-- Only managers can create tasks
CREATE POLICY "Task creation policy"
ON tasks
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.business_id = tasks.business_id
    AND (users.role = 'manager' OR users.role = 'admin')
  )
);

-- Task update policy adjusted for multi-user assignments
CREATE POLICY "Task update policy"
ON tasks
FOR UPDATE
TO authenticated
USING (
  is_user_assigned_to_task(id)
  OR 
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.business_id = tasks.business_id
    AND (users.role = 'manager' OR users.role = 'admin')
  )
); 