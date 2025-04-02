/*
  # Fix relationship between prompts and profiles tables

  1. Changes
    - Add foreign key relationship between prompts.user_id and profiles.id
    - Update query to use proper join syntax

  2. Security
    - Maintain existing RLS policies
    - Ensure proper access control
*/

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'prompts_user_id_profiles_fkey'
  ) THEN
    ALTER TABLE prompts
    ADD CONSTRAINT prompts_user_id_profiles_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id);
  END IF;
END $$;