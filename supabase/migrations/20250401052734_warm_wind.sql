/*
  # Fix permissions and policies for prompts table

  1. Changes
    - Add policy to allow reading user metadata for display names
    - Update prompt creation policy to handle display names correctly
    - Update prompt update policy to handle display names correctly

  2. Notes
    - Ensures proper access to user metadata for display name lookups
    - Maintains existing RLS policies while fixing permission issues
*/

-- First, ensure we have the right policies for auth.users access
CREATE POLICY "Allow authenticated users to read user metadata"
  ON auth.users
  FOR SELECT
  TO authenticated
  USING (true);

-- Update the prompts creation policy to handle display names correctly
DROP POLICY IF EXISTS "Users can create their own prompts" ON prompts;
CREATE POLICY "Users can create their own prompts"
  ON prompts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    display_name = (
      SELECT COALESCE(raw_user_meta_data->>'display_name', 'Anonymous')
      FROM auth.users
      WHERE id = auth.uid()
    )
  );

-- Update the prompts update policy
DROP POLICY IF EXISTS "Users can update their own prompts" ON prompts;
CREATE POLICY "Users can update their own prompts"
  ON prompts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    display_name = (
      SELECT display_name
      FROM prompts
      WHERE id = prompts.id
    )
  );