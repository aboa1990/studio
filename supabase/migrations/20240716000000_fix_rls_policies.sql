
-- Drop the old permissive select policy if it exists
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.company_profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles." ON public.company_profiles;

-- RLS Policies for company_profiles
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

-- 1. Allow authenticated users to view all profiles
CREATE POLICY "Authenticated users can view profiles."
ON public.company_profiles
FOR SELECT
TO authenticated
USING (true);

-- 2. Allow authenticated users to insert new profiles
CREATE POLICY "Authenticated users can create profiles."
ON public.company_profiles
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. Allow authenticated users to update profiles
CREATE POLICY "Authenticated users can update profiles."
ON public.company_profiles
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Allow authenticated users to delete profiles
CREATE POLICY "Authenticated users can delete profiles."
ON public.company_profiles
FOR DELETE
TO authenticated
USING (true);

-- RLS Policies for clients

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can manage their own clients." ON public.clients;
CREATE POLICY "Authenticated users can manage their own clients."
ON public.clients
FOR ALL
TO authenticated
USING ("profileId" IN (SELECT id FROM company_profiles));

-- RLS Policies for documents

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can manage their own documents." ON public.documents;
CREATE POLICY "Authenticated users can manage their own documents."
ON public.documents
FOR ALL
TO authenticated
USING ("profileId" IN (SELECT id FROM company_profiles));

-- RLS Policies for library_documents

ALTER TABLE public.library_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can manage their own library documents." ON public.library_documents;
CREATE POLICY "Authenticated users can manage their own library documents."
ON public.library_documents
FOR ALL
TO authenticated
USING ("profileId" IN (SELECT id FROM company_profiles));
