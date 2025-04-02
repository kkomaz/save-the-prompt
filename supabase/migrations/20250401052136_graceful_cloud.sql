/*
  # Add display_name column to prompts table

  1. Changes
    - Add display_name column to prompts table with default value
    - Update policies to ensure display_name matches user's display_name on insert
    - Prevent display_name modification on update

  2. Security
    - Ensure display_name can only be set to the user's actual display_name
    - Prevent display_name from being modified after creation
*/

-- Add display_name column with a default value
ALTER TABLE prompts ADD COLUMN display_name text DEFAULT 'Anonymous' NOT NULL;

-- Update existing rows to use user's display name
UPDATE prompts
SET display_name = COALESCE(
  (
    SELECT raw_user_meta_data->>'display_name'
    FROM auth.users
    WHERE id = prompts.user_id
  ),
  'Anonymous'
);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can update their own prompts" ON prompts;

-- Create policy for creating prompts
CREATE POLICY "Users can create their own prompts"
  ON prompts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    display_name = COALESCE(
      (
        SELECT raw_user_meta_data->>'display_name'
        FROM auth.users
        WHERE id = auth.uid()
      ),
      'Anonymous'
    ) AND (
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

-- Create policy for updating prompts (excluding display_name)
CREATE POLICY "Users can update their own prompts"
  ON prompts
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id AND
    -- Ensure display_name matches the original value
    display_name = (SELECT display_name FROM prompts WHERE id = prompts.id) AND (
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
      (fromHeyAnon AND NOT (SELECT fromHeyAnon FROM prompts WHERE id = prompts.id))
    )
  );