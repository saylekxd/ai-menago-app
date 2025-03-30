/*
  # Fix RLS policy for viewing tasks
  
  1. Changes
    - Update the task view policy to strictly filter by assigned_to
    - Ensure workers, managers and admins can only see their own tasks
    - Remove the previous policy that allowed managers to see all tasks
*/

-- First, drop the existing policy for viewing tasks
DROP POLICY IF EXISTS "Users can view tasks assigned to them" ON tasks;

-- Create a new policy that strictly enforces assigned_to for all users
CREATE POLICY "Users can only view tasks assigned to them"
ON tasks
FOR SELECT
TO authenticated
USING (
  assigned_to = (SELECT user_id FROM users WHERE id = auth.uid())
);

-- For debugging purposes, add function to check assigned tasks
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT user_id FROM users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 