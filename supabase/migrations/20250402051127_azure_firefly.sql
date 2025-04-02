/*
  # Update profiles table policies for is_admin field

  1. Changes
    - Drop and recreate policies to handle is_admin field properly
    - Add trigger to prevent direct updates to is_admin field
    - Skip column creation since it already exists

  2. Security
    - Only allow reading is_admin status
    - Prevent direct updates to is_admin through RLS
    - Keep existing profile update capabilities
*/

-- Drop existing update policy
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile except is_admin" ON profiles;

-- Create new update policy that prevents is_admin modification
CREATE POLICY "Users can update their own profile except is_admin"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id
  )
  WITH CHECK (
    auth.uid() = id
    AND (
      -- Only allow update if is_admin is not being changed
      is_admin IS NOT DISTINCT FROM (SELECT is_admin FROM profiles WHERE id = auth.uid())
    )
  );

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS prevent_is_admin_updates ON profiles;
DROP FUNCTION IF EXISTS prevent_is_admin_updates();

-- Create a trigger to prevent updates to is_admin through SQL
CREATE OR REPLACE FUNCTION prevent_is_admin_updates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
    RAISE EXCEPTION 'Cannot modify is_admin field through application';
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER prevent_is_admin_updates
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_is_admin_updates();