-- Migration: Add many-to-many relationship between prompts and cryptos

-- Step 1: Create the junction table `prompt_cryptos`
CREATE TABLE prompt_cryptos (
  prompt_id uuid NOT NULL,
  crypto_id uuid NOT NULL,
  PRIMARY KEY (prompt_id, crypto_id),
  CONSTRAINT fk_prompt FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE,
  CONSTRAINT fk_crypto FOREIGN KEY (crypto_id) REFERENCES cryptos(id) ON DELETE CASCADE
);

-- Step 2: Add indexes for faster lookups (optional but recommended)
CREATE INDEX idx_prompt_cryptos_prompt_id ON prompt_cryptos(prompt_id);
CREATE INDEX idx_prompt_cryptos_crypto_id ON prompt_cryptos(crypto_id);

-- Step 3: Migrate existing data from prompts.crypto_id to prompt_cryptos
INSERT INTO prompt_cryptos (prompt_id, crypto_id)
SELECT id, crypto_id
FROM prompts
WHERE crypto_id IS NOT NULL;

-- Step 4: Drop the crypto_id column from prompts
ALTER TABLE prompts
DROP COLUMN crypto_id;

-- Step 5: Comment for documentation
COMMENT ON TABLE prompt_cryptos IS 'Junction table to store many-to-many relationships between prompts and cryptos';