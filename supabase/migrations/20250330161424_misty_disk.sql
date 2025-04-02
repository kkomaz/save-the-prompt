/*
  # Add protocols table and update prompts structure

  1. New Tables
    - `protocols`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)

  2. Changes
    - Update `prompts` table:
      - Remove `protocol` column
      - Add `protocol_id` column referencing protocols table

  3. Security
    - Enable RLS on `protocols` table
    - Add policy for public read access to protocols
*/

-- Create protocols table
CREATE TABLE protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS and add policies
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read protocols"
  ON protocols
  FOR SELECT
  USING (true);

-- Update prompts table
ALTER TABLE prompts DROP COLUMN protocol;
ALTER TABLE prompts ADD COLUMN protocol_id uuid REFERENCES protocols(id);

-- Insert default protocols
INSERT INTO protocols (name) VALUES
  ('Lido'),
  ('Marinade'),
  ('Jito'),
  ('Beets Fi'),
  ('Sanctum'),
  ('Sky'),
  ('Aave'),
  ('Spark'),
  ('Venus'),
  ('Kamino'),
  ('PancakeSwap'),
  ('Solana'),
  ('Balancer'),
  ('Meteora'),
  ('LayerZero'),
  ('deBridge'),
  ('Magpie'),
  ('Misc');