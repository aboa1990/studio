ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage their own company profile."
ON public.company_profiles
FOR ALL
TO authenticated
USING (auth.uid() = id);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage their own clients." ON public.clients;
CREATE POLICY "Authenticated users can manage their own clients."
ON public.clients
FOR ALL
TO authenticated
USING (auth.uid() = "profileId");

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage their own documents." ON public.documents;
CREATE POLICY "Authenticated users can manage their own documents."
ON public.documents
FOR ALL
TO authenticated
USING (auth.uid() = "profileId");

ALTER TABLE public.library_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage their own library documents." ON public.library_documents;
CREATE POLICY "Authenticated users can manage their own library documents."
ON public.library_documents
FOR ALL
TO authenticated
USING (auth.uid() = "profileId");
