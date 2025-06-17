-- Migration: Add trigger to automatically create user records
-- This fixes the signup issue where users aren't created in the users table

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    'customer'  -- Default role for new users
  )
  ON CONFLICT (id) DO NOTHING;  -- Prevent duplicate entries
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires when a new user is created in auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;

-- Update RLS policy for users table to allow inserts during signup
DROP POLICY IF EXISTS users_insert_policy ON users;
CREATE POLICY users_insert_policy ON users 
FOR INSERT 
WITH CHECK (true);  -- Allow anyone to insert during signup process

-- Ensure existing admin users have proper records
DO $$
BEGIN
  -- Insert any missing admin users that might exist in auth.users but not in public.users
  INSERT INTO public.users (id, email, role)
  SELECT 
    au.id,
    au.email,
    CASE 
      WHEN au.email LIKE '%admin%' THEN 'admin'::user_role
      ELSE 'customer'::user_role
    END as role
  FROM auth.users au
  LEFT JOIN public.users pu ON au.id = pu.id
  WHERE pu.id IS NULL
  ON CONFLICT (id) DO NOTHING;
END $$;