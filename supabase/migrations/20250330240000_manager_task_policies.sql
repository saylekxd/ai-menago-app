/*
  # Add RLS policy for managers to assign tasks to any user
  
  1. Changes
    - Add policy for managers to assign tasks to any user in their business
    - This fixes the issue where managers could only assign tasks to workers
*/

-- Add policy for managers to assign tasks to any user in their business
CREATE POLICY "Managers can assign tasks to any user in their business"
ON tasks
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() 
    AND (role = 'manager' OR role = 'admin')
    AND business_id = tasks.business_id
  )
);

-- Allow managers to update tasks in their business
CREATE POLICY "Managers can update tasks in their business"
ON tasks
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() 
    AND (role = 'manager' OR role = 'admin')
    AND business_id = tasks.business_id
  )
); 