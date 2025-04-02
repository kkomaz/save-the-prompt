/*
  # Sync Database Schema

  1. Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp with time zone)

    - `protocols`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp with time zone)

    - `prompts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `category_id` (uuid, references categories)
      - `protocol_id` (uuid, references protocols)
      - `text` (text)
      - `created_at` (timestamp with time zone)
      - `fromheyanon` (boolean, default false)

    - `favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `prompt_id` (uuid, references prompts)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on all tables
    - Add policies for:
      - Public read access to categories and protocols
      - Authenticated users can manage their own prompts and favorites
      - Special policies for HeyAnon prompts
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS prompts;
DROP TABLE IF EXISTS protocols;
DROP TABLE IF EXISTS categories;

-- Create categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create protocols table
CREATE TABLE protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create prompts table
CREATE TABLE prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  category_id uuid REFERENCES categories NOT NULL,
  protocol_id uuid REFERENCES protocols NOT NULL,
  text text NOT NULL,
  fromheyanon boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create favorites table
CREATE TABLE favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  prompt_id uuid REFERENCES prompts NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, prompt_id)
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Categories Policies
CREATE POLICY "Anyone can read categories"
  ON categories
  FOR SELECT
  USING (true);

-- Protocols Policies
CREATE POLICY "Anyone can read protocols"
  ON protocols
  FOR SELECT
  USING (true);

-- Prompts Policies
CREATE POLICY "Anyone can read prompts"
  ON prompts
  FOR SELECT
  USING (true);

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

CREATE POLICY "Users can delete their own prompts"
  ON prompts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Favorites Policies
CREATE POLICY "Users can view their own favorites"
  ON favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites"
  ON favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert default categories
INSERT INTO categories (name) VALUES
  ('Staking/LSDs'),
  ('Lend & Borrow'),
  ('Trading'),
  ('Swaps'),
  ('Liquidity Pool'),
  ('Cross Chain');

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