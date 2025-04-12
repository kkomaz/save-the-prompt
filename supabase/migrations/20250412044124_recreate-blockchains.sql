-- 🚨 Safe reset: Drop the broken `chains` table and recreate as `blockchains`
-- ⚠️ This will remove existing chains data and their relation to prompts

-- 1. Drop the foreign key constraint from prompts
ALTER TABLE prompts DROP CONSTRAINT IF EXISTS fk_chain_id;

-- 2. Drop the chain_id column from prompts
ALTER TABLE prompts DROP COLUMN IF EXISTS chain_id;

-- 3. Drop the old chains table
DROP TABLE IF EXISTS chains CASCADE;

-- 4. Create the new blockchains table
CREATE TABLE blockchains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable RLS
ALTER TABLE blockchains ENABLE ROW LEVEL SECURITY;

-- 6. Allow authenticated users to read blockchains
CREATE POLICY "Allow authenticated to read blockchains" ON blockchains
  FOR SELECT TO authenticated USING (true);

-- 7. Allow only admin users to insert blockchains
CREATE POLICY "Allow admin to insert blockchains" ON blockchains
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- 8. Add blockchains relationship to prompts
ALTER TABLE prompts ADD COLUMN blockchain_id UUID;

ALTER TABLE prompts ADD CONSTRAINT fk_blockchain_id
  FOREIGN KEY (blockchain_id) REFERENCES blockchains (id)
  ON DELETE SET NULL;
