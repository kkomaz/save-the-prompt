/*
  # Create invite codes system

  1. New Tables
    - `invites`
      - `id` (uuid, primary key)
      - `code` (text, unique)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `expires_at` (timestamp)
      - `created_by` (uuid, references auth.users)

  2. Security
    - Enable RLS on invites table
    - Add policies for:
      - Admins can create and manage invite codes
      - Anyone can read invite codes (to validate them)
      - Prevent reuse of invite codes
*/

-- Create invites table
CREATE TABLE invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_by uuid REFERENCES auth.users NOT NULL
);

-- Enable Row Level Security
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Create an index for faster lookups
CREATE INDEX invites_code_idx ON invites(code);
CREATE INDEX invites_user_id_idx ON invites(user_id);

-- Create policies
CREATE POLICY "Admins can manage invite codes"
  ON invites
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

CREATE POLICY "Anyone can read unused invite codes"
  ON invites
  FOR SELECT
  USING (
    user_id IS NULL AND
    (expires_at IS NULL OR expires_at > now())
  );