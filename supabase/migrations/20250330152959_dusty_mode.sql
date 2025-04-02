/*
  # Initial Schema Setup

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp with time zone)

    - `prompts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `category_id` (uuid, references categories)
      - `protocol` (text)
      - `text` (text)
      - `created_at` (timestamp with time zone)

    - `favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `prompt_id` (uuid, references prompts)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on all tables
    - Add policies for:
      - Everyone can read categories
      - Everyone can read prompts
      - Authenticated users can create/update/delete their own prompts
      - Authenticated users can manage their favorites
*/

-- Create categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create prompts table
CREATE TABLE prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  category_id uuid REFERENCES categories NOT NULL,
  protocol text NOT NULL,
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create favorites table
CREATE TABLE favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  prompt_id uuid REFERENCES prompts NOT NULL,
  created_at timestamptz DEFAULT now(),
  -- Add unique constraint to prevent duplicate favorites
  UNIQUE(user_id, prompt_id)
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Categories Policies
CREATE POLICY "Anyone can read categories"
  ON categories
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
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompts"
  ON prompts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

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