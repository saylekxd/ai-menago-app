/*
  # Add RLS policy for workers to view other team members

  1. Changes
    - Add policy for workers to view other users from their business
    - Restrict sensitive data access for workers
    - Fix infinite recursion in policies
*/

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Managers can view all users from their business" ON users;
DROP POLICY IF EXISTS "Users can view team members from their business" ON users;
DROP POLICY IF EXISTS "Users can view their complete profile" ON users;

-- Create a function to get user's business_id without recursion
CREATE OR REPLACE FUNCTION get_user_business()
RETURNS UUID AS $$
  SELECT business_id FROM users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Create a function to check user's role without recursion
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Create a secure view for limited user data
CREATE OR REPLACE VIEW public.user_profiles AS
SELECT 
  id,
  first_name,
  last_name,
  role,
  business_id,
  CASE 
    WHEN id = auth.uid() OR get_user_role() IN ('admin', 'manager')
    THEN email 
    ELSE NULL 
  END as email
FROM users;

-- Single policy for viewing users that covers all cases
CREATE POLICY "Users can view appropriate data"
ON users
FOR SELECT
TO authenticated
USING (
  id = auth.uid() OR -- Can always see own data
  business_id = get_user_business() -- Can see others in same business
);

-- Grant necessary permissions
GRANT SELECT ON public.user_profiles TO authenticated;
REVOKE ALL ON FUNCTION get_user_business() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_user_business() TO authenticated;
REVOKE ALL ON FUNCTION get_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_user_role() TO authenticated;

-- Add comment explaining the policies
COMMENT ON VIEW public.user_profiles IS 'Secure view that provides limited user data based on role and permissions';
COMMENT ON FUNCTION get_user_business() IS 'Helper function to get current user''s business_id';
COMMENT ON FUNCTION get_user_role() IS 'Helper function to get current user''s role'; 