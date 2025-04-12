-- Allow authenticated users to SELECT from chains
CREATE POLICY "Allow all authenticated to read chains" ON chains
FOR SELECT
TO authenticated
USING (true);

-- Re-enable RLS in case anything changed
ALTER TABLE chains ENABLE ROW LEVEL SECURITY;
