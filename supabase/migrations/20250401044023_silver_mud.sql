/*
  # Create profiles table with restricted is_anon_member field

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `is_anon_member` (boolean, read-only)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on profiles table
    - Add policies for:
      - Users can read their own profile
      - Users can update their own profile (excluding is_anon_member)
    
  3. Triggers
    - Prevent updates to is_anon_member column through RLS
    - Auto-update updated_at timestamp
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  is_anon_member boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile except is_anon_member" ON profiles;

-- Create policies
CREATE POLICY "Users can read their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create a policy that allows updates but excludes is_anon_member
CREATE POLICY "Users can update their own profile except is_anon_member"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id
  )
  WITH CHECK (
    auth.uid() = id
    AND (
      -- Only allow update if is_anon_member is not being changed
      is_anon_member IS NOT DISTINCT FROM (SELECT is_anon_member FROM profiles WHERE id = auth.uid())
    )
  );

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS prevent_is_anon_member_updates() CASCADE;

-- Create a trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a trigger to prevent updates to is_anon_member through SQL
CREATE OR REPLACE FUNCTION prevent_is_anon_member_updates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_anon_member IS DISTINCT FROM OLD.is_anon_member THEN
    RAISE EXCEPTION 'Cannot modify is_anon_member field';
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER prevent_is_anon_member_updates
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_is_anon_member_updates();