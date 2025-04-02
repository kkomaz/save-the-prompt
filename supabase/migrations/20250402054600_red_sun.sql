/*
  # Prevent is_anon_member updates through application

  1. Changes
    - Add trigger to prevent is_anon_member updates through application
    - Update RLS policy to prevent is_anon_member modifications
    - Keep other profile fields updatable by users

  2. Security
    - Maintain RLS enabled
    - Keep user-specific access control
    - Block is_anon_member updates through application
    - Allow is_anon_member updates through direct SQL
*/

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS prevent_is_anon_member_updates ON profiles;
DROP FUNCTION IF EXISTS prevent_is_anon_member_updates();

-- Create trigger function to prevent is_anon_member updates
CREATE OR REPLACE FUNCTION prevent_is_anon_member_updates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_anon_member IS DISTINCT FROM OLD.is_anon_member THEN
    RAISE EXCEPTION 'The HeyAnon member status cannot be modified through the application. Please contact system administrator.';
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER prevent_is_anon_member_updates
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_is_anon_member_updates();

-- Drop existing update policy
DROP POLICY IF EXISTS "Users can update their own profile except is_admin" ON profiles;

-- Create new update policy that prevents both is_admin and is_anon_member modifications
CREATE POLICY "Users can update their own profile except protected fields"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id
  )
  WITH CHECK (
    auth.uid() = id AND
    is_admin IS NOT DISTINCT FROM (SELECT is_admin FROM profiles WHERE id = auth.uid()) AND
    is_anon_member IS NOT DISTINCT FROM (SELECT is_anon_member FROM profiles WHERE id = auth.uid())
  );