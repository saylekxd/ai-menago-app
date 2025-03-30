/*
  # Add RLS policy for admins to view and manage their business
  
  1. Changes
    - Add policy for admins to view only their assigned business
    - Add policy for admins to update users in their business
    - This fixes the issue where admins can see other businesses
    - Allows admins to upgrade workers to managers
*/

-- Function to check if a user is an admin of a business
-- This function already exists but ensuring it's here for completeness
CREATE OR REPLACE FUNCTION public.is_admin_of_business(business_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() 
      AND role = 'admin' 
      AND business_id = business_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add policy for admins to only view their business
CREATE POLICY "Admins can only view their own business"
ON businesses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() 
    AND role = 'admin' 
    AND business_id = businesses.id
  )
);

-- Add policy for admins to update users in their business
CREATE POLICY "Admins can update users in their business"
ON users
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users admin
    WHERE admin.id = auth.uid() 
    AND admin.role = 'admin' 
    AND admin.business_id = users.business_id
  )
);

-- Add policy for admins to update business details
CREATE POLICY "Admins can update their business"
ON businesses
FOR UPDATE
TO authenticated
USING (public.is_admin_of_business(id)); 