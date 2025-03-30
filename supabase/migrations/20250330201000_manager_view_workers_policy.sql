/*
  # Add RLS policy for managers to view workers

  1. Changes
    - Add policy for managers to view all users from their business
    - This fixes the issue where managers can't see team members in the admin panel
*/

-- Function to check if a user is a manager of a business
CREATE OR REPLACE FUNCTION public.is_manager_of_business(business_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() 
      AND role = 'manager' 
      AND business_id = business_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add policy for managers to view all users from their business
CREATE POLICY "Managers can view all users from their business"
ON users
FOR SELECT
TO authenticated
USING (public.is_manager_of_business(business_id)); 