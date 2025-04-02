/*
  # Create maintenance table and policies

  1. New Tables
    - `maintenance`
      - `id` (uuid, primary key)
      - `is_active` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on maintenance table
    - Add policies for:
      - Everyone can read maintenance status
      - Only admins can update maintenance status
*/

-- Create maintenance table
CREATE TABLE maintenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read maintenance status"
  ON maintenance
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can update maintenance status"
  ON maintenance
  FOR UPDATE
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

-- Insert initial maintenance record
INSERT INTO maintenance (is_active) VALUES (false);