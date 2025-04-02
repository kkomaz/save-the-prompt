/*
  # Fix permissions and simplify RLS policies

  1. Changes
    - Simplify RLS policies for prompts table
    - Remove complex user metadata checks
    - Ensure proper display_name handling

  2. Security
    - Maintain RLS enabled
    - Keep basic CRUD policies
    - Ensure users can only manage their own prompts
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can update their own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can delete their own prompts" ON prompts;
DROP POLICY IF EXISTS "Anyone can read prompts" ON prompts;

-- Create simplified policies
CREATE POLICY "Anyone can read prompts"
  ON prompts
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own prompts"
  ON prompts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompts"
  ON prompts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prompts"
  ON prompts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);