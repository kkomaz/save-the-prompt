/*
  # Allow is_anon_member updates

  1. Changes
    - Remove prevent_is_anon_member_updates trigger
    - Update RLS policy to allow is_anon_member updates
    - Keep updated_at trigger for change tracking

  2. Security
    - Maintain RLS enabled
    - Keep user-specific access control
    - Allow authenticated users to update their own profile including is_anon_member
*/

-- Drop the trigger that prevents is_anon_member updates
DROP TRIGGER IF EXISTS prevent_is_anon_member_updates ON profiles;
DROP FUNCTION IF EXISTS prevent_is_anon_member_updates();

-- Drop the existing update policy
DROP POLICY IF EXISTS "Users can update their own profile except is_anon_member" ON profiles;

-- Create new policy that allows all profile field updates
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Keep the updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure the updated_at trigger exists
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();