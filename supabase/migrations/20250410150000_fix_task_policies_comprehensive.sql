/*
  # Comprehensive Fix for Task Policies
  
  1. Changes
    - Fix the read policy to allow managers/admins to view tasks in their business
    - Update the write policy to allow proper task assignment
    - This reverts some of the changes from 20250402120000_fix_task_read_policy.sql
    - Resolves the "new row violates row-level security policy" error
*/

-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Users can only view tasks assigned to them" ON tasks;
DROP POLICY IF EXISTS "Managers can create and assign tasks to any user in their business" ON tasks;
DROP POLICY IF EXISTS "Only managers can create tasks" ON tasks;
DROP POLICY IF EXISTS "Managers can assign tasks to any user in their business" ON tasks;

-- Create a policy that allows users to see tasks assigned to them
-- AND allows managers/admins to see all tasks in their business
CREATE POLICY "Task visibility policy"
ON tasks
FOR SELECT
TO authenticated
USING (
  assigned_to = (SELECT user_id FROM users WHERE id = auth.uid())
  OR 
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.business_id = tasks.business_id
    AND (users.role = 'manager' OR users.role = 'admin')
  )
);

-- Create a policy for task creation that properly checks business relationships
CREATE POLICY "Task creation policy"
ON tasks
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND (users.role = 'manager' OR users.role = 'admin')
    AND users.business_id = tasks.business_id
  )
);

-- Create an update policy for tasks
CREATE POLICY "Task update policy"
ON tasks
FOR UPDATE
TO authenticated
USING (
  -- Users can update their own tasks
  (assigned_to = (SELECT user_id FROM users WHERE id = auth.uid()))
  OR
  -- Managers/admins can update any task in their business
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.business_id = tasks.business_id
    AND (users.role = 'manager' OR users.role = 'admin')
  )
); 