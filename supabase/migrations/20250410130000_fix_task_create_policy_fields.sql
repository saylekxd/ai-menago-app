/*
  # Fix task creation policy to handle proper ID relationships
  
  1. Changes
    - Update the task insert policy to properly handle user_id and auth.uid differences
    - This ensures managers can assign tasks to any user in their business
*/

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Managers and admins can create and assign tasks" ON tasks;
DROP POLICY IF EXISTS "Only managers can create tasks" ON tasks;
DROP POLICY IF EXISTS "Managers can assign tasks to any user in their business" ON tasks;

-- Create a new policy that explicitly allows managers and admins to create tasks
-- and properly checks the relationship between auth.uid() and user_id
CREATE POLICY "Managers can create and assign tasks to any user in their business"
ON tasks
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users creator
    WHERE creator.id = auth.uid() -- Match the auth.uid with the creator's id
    AND (creator.role = 'manager' OR creator.role = 'admin')
    AND creator.business_id = tasks.business_id
    AND EXISTS (
      -- Verify the assigned_to user belongs to the same business
      SELECT 1 FROM public.users assignee
      WHERE assignee.user_id = tasks.assigned_to
      AND assignee.business_id = creator.business_id
    )
  )
); 