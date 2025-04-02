/*
  # Fix maintenance table policies

  1. Changes
    - Drop existing policies
    - Create new policies with proper conditions
    - Add index on is_active column for better performance

  2. Security
    - Allow public read access to maintenance status
    - Restrict updates to admin users only
    - Prevent deletion of maintenance records
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read maintenance status" ON maintenance;
DROP POLICY IF EXISTS "Only admins can update maintenance status" ON maintenance;

-- Create new policies
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
      SELECT 1
      FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- Add index for better performance
CREATE INDEX IF NOT EXISTS maintenance_is_active_idx ON maintenance(is_active);

-- Ensure at least one record exists
INSERT INTO maintenance (is_active)
SELECT false
WHERE NOT EXISTS (SELECT 1 FROM maintenance);