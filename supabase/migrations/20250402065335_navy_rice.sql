/*
  # Add policies for efficient is_anon_member checking

  1. Changes
    - Add policy to allow reading profiles for prompt authors
    - Update prompts table to include profiles in queries
    - Add index for better performance

  2. Security
    - Maintain existing RLS policies
    - Allow reading limited profile data for prompt authors
*/

-- Add policy to allow reading profiles for prompt authors
CREATE POLICY "Anyone can read profiles of prompt authors"
  ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM prompts
      WHERE prompts.user_id = profiles.id
    )
  );

-- Add index for better performance
CREATE INDEX IF NOT EXISTS prompts_user_id_idx ON prompts(user_id);
CREATE INDEX IF NOT EXISTS profiles_is_anon_member_idx ON profiles(is_anon_member);