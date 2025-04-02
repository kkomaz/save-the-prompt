/*
  # Add fromHeyAnon column to prompts table

  1. Changes
    - Add fromHeyAnon column to prompts table with default false
    - Update RLS policies to restrict fromHeyAnon updates to anon members only

  2. Security
    - Only users with is_anon_member=true can set fromHeyAnon=true
    - All users can set fromHeyAnon=false
    - Regular users can only create prompts with fromHeyAnon=false
*/

-- Add fromHeyAnon column
ALTER TABLE prompts ADD COLUMN fromHeyAnon boolean DEFAULT false;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can update their own prompts" ON prompts;

-- Create policy for creating prompts
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

-- Create policy for updating prompts
CREATE POLICY "Users can update their own prompts"
  ON prompts
  FOR UPDATE
  TO authenticated
  USING (
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
      (fromHeyAnon AND NOT (SELECT fromHeyAnon FROM prompts WHERE id = prompts.id FOR UPDATE))
    )
  );