-- Create the chains table
CREATE TABLE chains (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on the chains table
ALTER TABLE chains ENABLE ROW LEVEL SECURITY;

-- Policy to allow only is_admin users to insert into chains
CREATE POLICY "Allow admins to insert chains" ON chains
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
);

-- Policy to allow everyone (public) to read chains
CREATE POLICY "Allow public to read chains" ON chains
FOR SELECT
TO public
USING (true);

-- Add chain_id column to prompts table (optional by default since it allows NULL)
ALTER TABLE prompts
ADD COLUMN chain_id UUID;

-- Add foreign key constraint to link prompts.chain_id to chains.id
ALTER TABLE prompts
ADD CONSTRAINT fk_chain_id
FOREIGN KEY (chain_id)
REFERENCES chains (id)
ON DELETE SET NULL;