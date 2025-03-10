/*
  # Add management functions for business administration

  1. Changes
    - Add function to check if user is admin of a business
    - Add function to check if user is member of a business
    - Ensure proper RLS policies for the new management interfaces
  
  2. Security
    - Only authenticated users can create businesses
    - Users can only see businesses they belong to unless they are admins
*/

-- Function to check if a user is admin/manager of a business
CREATE OR REPLACE FUNCTION public.is_business_admin(business_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND business_id = $1
    AND (role = 'admin' OR role = 'manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user is a member of a business
CREATE OR REPLACE FUNCTION public.is_business_member(business_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND business_id = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for businesses table if they don't exist
DO $$
BEGIN
  -- Create policy for authenticated users to insert businesses
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'businesses' AND policyname = 'Users can create businesses'
  ) THEN
    CREATE POLICY "Users can create businesses" 
    ON businesses FOR INSERT 
    TO authenticated 
    WITH CHECK (true);
  END IF;

  -- Create policy for authenticated users to view businesses
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'businesses' AND policyname = 'Users can view businesses they belong to'
  ) THEN
    CREATE POLICY "Users can view businesses they belong to" 
    ON businesses FOR SELECT 
    TO authenticated 
    USING (
      is_business_member(id) 
      OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );
  END IF;

  -- Create policy for authenticated users to update businesses
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'businesses' AND policyname = 'Only admins can update businesses'
  ) THEN
    CREATE POLICY "Only admins can update businesses" 
    ON businesses FOR UPDATE 
    TO authenticated 
    USING (is_business_admin(id))
    WITH CHECK (is_business_admin(id));
  END IF;

END $$;

-- Make sure RLS is enabled on the businesses table
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;