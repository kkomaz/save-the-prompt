/*
  # Fix is_admin modification restrictions

  1. Changes
    - Drop and recreate is_admin protection trigger with better error message
    - Update RLS policy for better clarity
    - Keep existing is_admin column and default value

  2. Security
    - Maintain RLS enabled
    - Prevent is_admin modifications through application
    - Allow admins to read maintenance status
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS prevent_is_admin_updates ON profiles;
DROP FUNCTION IF EXISTS prevent_is_admin_updates();

-- Create improved trigger function with clearer error message
CREATE OR REPLACE FUNCTION prevent_is_admin_updates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
    RAISE EXCEPTION 'The admin status cannot be modified through the application. Please contact system administrator.';
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate trigger
CREATE TRIGGER prevent_is_admin_updates
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_is_admin_updates();

-- Drop existing update policy
DROP POLICY IF EXISTS "Users can update their own profile except is_admin" ON profiles;

-- Create clearer update policy
CREATE POLICY "Users can update their own profile except is_admin"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id
  )
  WITH CHECK (
    auth.uid() = id AND
    is_admin IS NOT DISTINCT FROM (SELECT is_admin FROM profiles WHERE id = auth.uid())
  );