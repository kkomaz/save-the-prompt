/*
  # Create prompts table

  1. New Tables
    - `prompts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `category` (text)
      - `protocol` (text)
      - `text` (text)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `prompts` table
    - Add policies for:
      - Users can read all prompts (public)
      - Users can create their own prompts
      - Users can update their own prompts
      - Users can delete their own prompts
*/

CREATE TABLE IF NOT EXISTS prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  category text NOT NULL,
  protocol text NOT NULL,
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read prompts
CREATE POLICY "Anyone can read prompts"
  ON prompts
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to create their own prompts
CREATE POLICY "Users can create their own prompts"
  ON prompts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own prompts
CREATE POLICY "Users can update their own prompts"
  ON prompts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own prompts
CREATE POLICY "Users can delete their own prompts"
  ON prompts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);