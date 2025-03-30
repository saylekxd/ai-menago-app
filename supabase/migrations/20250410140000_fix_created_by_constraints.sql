/*
  # Fix created_by field constraints for tasks table
  
  1. Changes
    - Add logging for debugging task creation issues
    - Create a function to help with task assignment and creation
*/

-- Add function to help debug user ID mapping issues
CREATE OR REPLACE FUNCTION public.debug_task_insert()
RETURNS TRIGGER AS $$
BEGIN
  RAISE LOG 'Task Insert Debug - Auth UID: %, User ID mapping: %, Assigned to: %, Created by: %, Business ID: %',
    auth.uid(),
    (SELECT user_id FROM users WHERE id = auth.uid()),
    NEW.assigned_to,
    NEW.created_by,
    NEW.business_id;
    
  -- Get the user_id for the authenticated user
  NEW.created_by := (SELECT user_id FROM users WHERE id = auth.uid());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically set created_by to the correct user_id
DROP TRIGGER IF EXISTS set_created_by_user_id ON tasks;
CREATE TRIGGER set_created_by_user_id
BEFORE INSERT ON tasks
FOR EACH ROW
EXECUTE FUNCTION public.debug_task_insert(); 