/*
  # Add HeyAnon Support

  1. Changes
    - Add `fromheyanon` boolean column to prompts table with default false
    - Add RLS policies for HeyAnon member support

  2. Security
    - Update RLS policies to handle HeyAnon member permissions:
      - Regular users can only create non-HeyAnon prompts
      - HeyAnon members can create HeyAnon prompts
      - Users can only update their own prompts based on HeyAnon status
*/

-- Add fromheyanon column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'prompts' AND column_name = 'fromheyanon'
  ) THEN
    ALTER TABLE prompts ADD COLUMN fromheyanon boolean DEFAULT false;
  END IF;
END $$;

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can create their own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can update their own prompts" ON prompts;
DROP POLICY IF EXISTS "Users can set fromHeyAnon to false" ON prompts;
DROP POLICY IF EXISTS "Users can update their regular prompts" ON prompts;
DROP POLICY IF EXISTS "isAnonMember users can update fromHeyAnon prompts" ON prompts;

-- Create new policies for prompt creation and management
CREATE POLICY "Users can create their own prompts"
  ON prompts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.uid() = user_id) AND 
    ((NOT fromheyanon) OR ((auth.jwt()->>'isanonmember')::boolean))
  );

CREATE POLICY "Users can update their regular prompts"
  ON prompts
  FOR UPDATE
  TO authenticated
  USING (
    (auth.uid() = user_id) AND 
    (NOT fromheyanon)
  )
  WITH CHECK (
    (auth.uid() = user_id) AND 
    (NOT fromheyanon)
  );

CREATE POLICY "Users can set fromHeyAnon to false"
  ON prompts
  FOR UPDATE
  TO authenticated
  USING (
    (auth.uid() = user_id) AND 
    fromheyanon
  )
  WITH CHECK (
    (auth.uid() = user_id) AND 
    (NOT fromheyanon)
  );

CREATE POLICY "isAnonMember users can update fromHeyAnon prompts"
  ON prompts
  FOR UPDATE
  TO authenticated
  USING (
    (auth.uid() = user_id) AND 
    fromheyanon AND 
    ((auth.jwt()->>'isanonmember')::boolean)
  )
  WITH CHECK (
    (auth.uid() = user_id) AND 
    fromheyanon AND 
    ((auth.jwt()->>'isanonmember')::boolean)
  );