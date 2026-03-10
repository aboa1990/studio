
-- Enable RLS on company_profiles
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for company_profiles
DROP POLICY IF EXISTS "Allow full access to own profiles" ON company_profiles;
CREATE POLICY "Allow full access to own profiles" ON company_profiles
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
