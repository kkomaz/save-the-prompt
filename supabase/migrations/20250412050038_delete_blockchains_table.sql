-- 🚨 Safe teardown of blockchains table and cleanup of its relations
-- This will drop the blockchains table and remove its FK from prompts

-- 1. Drop foreign key constraint if it exists
ALTER TABLE prompts DROP CONSTRAINT IF EXISTS fk_blockchain_id;

-- 2. Drop the blockchain_id column from prompts if it exists
ALTER TABLE prompts DROP COLUMN IF EXISTS blockchain_id;

-- 3. Drop RLS policies on blockchains if they exist
DROP POLICY IF EXISTS "Allow authenticated to read blockchains" ON blockchains;
DROP POLICY IF EXISTS "Allow admin to insert blockchains" ON blockchains;

-- 4. Disable RLS if enabled
ALTER TABLE blockchains DISABLE ROW LEVEL SECURITY;

-- 5. Drop the blockchains table
DROP TABLE IF EXISTS blockchains CASCADE;
