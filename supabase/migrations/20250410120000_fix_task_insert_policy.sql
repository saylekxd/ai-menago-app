/*
  # Fix RLS policy for task assignment
  
  1. Changes
    - Fix the policy that allows managers to assign tasks to any user in their business
    - This resolves the "new row violates row-level security policy for table tasks" error
*/

-- First, drop the existing policy for task assignment
DROP POLICY IF EXISTS "Managers can assign tasks to any user in their business" ON tasks;
DROP POLICY IF EXISTS "Only managers can create tasks" ON tasks;

-- Create a more permissive policy for task creation that allows proper assignment
CREATE POLICY "Managers and admins can create and assign tasks"
ON tasks
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() 
    AND (users.role = 'manager' OR users.role = 'admin')
    AND users.business_id = tasks.business_id
  )
);

-- Add a helper function to check if the current user is from the same business as a task
CREATE OR REPLACE FUNCTION public.is_same_business_as_task(task_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.tasks t ON u.business_id = t.business_id
    WHERE u.id = auth.uid() 
    AND t.id = task_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 