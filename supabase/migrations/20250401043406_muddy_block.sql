/*
  # Remove fromHeyAnon column

  1. Changes
    - Remove `fromheyanon` column from prompts table
    - Remove policies related to fromHeyAnon

  2. Security
    - Update policies to remove fromHeyAnon checks
*/

-- Drop policies that reference fromheyanon
DROP POLICY IF EXISTS "Users can create their own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can update their regular prompts" ON prompts;
DROP POLICY IF EXISTS "Users can set fromHeyAnon to false" ON prompts;
DROP POLICY IF EXISTS "isAnonMember users can update fromHeyAnon prompts" ON prompts;

-- Create new simplified policies
CREATE POLICY "Users can create their own prompts"
  ON prompts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Drop the existing policy before recreating it to avoid conflicts
DROP POLICY IF EXISTS "Users can update their own prompts" ON prompts;
CREATE POLICY "Users can update their own prompts"
  ON prompts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Remove fromheyanon column
ALTER TABLE prompts DROP COLUMN IF EXISTS fromheyanon;

