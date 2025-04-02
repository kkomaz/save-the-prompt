/*
  # Add fromHeyAnon column and update policies

  1. Changes
    - Add fromHeyAnon column to prompts table
    - Update policies to handle fromHeyAnon permissions

  2. Security
    - Only allow is_anon_member users to set fromHeyAnon to true
    - Maintain basic CRUD security for regular prompts
*/

-- Add fromHeyAnon column if it doesn't exist
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS "fromHeyAnon" boolean DEFAULT false;

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
  WITH CHECK (
    auth.uid() = user_id AND (
      -- Regular users can only create with fromHeyAnon=false
      (NOT fromHeyAnon) OR
      -- Anon members can set fromHeyAnon=true
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND is_anon_member = true
      )
    )
  );

CREATE POLICY "Users can update their own prompts"
  ON prompts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND (
      -- Allow updates if:
      -- 1. User is an anon member
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND is_anon_member = true
      ) OR
      -- 2. The prompt is not a fromHeyAnon prompt
      (NOT fromHeyAnon) OR
      -- 3. User is setting fromHeyAnon from true to false
      (fromHeyAnon AND NOT NEW.fromHeyAnon)
    )
  );

CREATE POLICY "Users can delete their own prompts"
  ON prompts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);