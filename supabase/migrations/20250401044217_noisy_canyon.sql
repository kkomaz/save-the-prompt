/*
  # Add insert policy for profiles table

  1. Changes
    - Add policy to allow authenticated users to create their own profile

  2. Security
    - Only allow users to create a profile with their own user ID
*/

-- Drop existing insert policy if it exists
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;

-- Create policy for profile creation
CREATE POLICY "Users can create their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);