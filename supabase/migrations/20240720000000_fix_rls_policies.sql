DROP POLICY IF EXISTS "Allow ALL for authenticated users" ON public.company_profiles;
CREATE POLICY "Allow ALL for authenticated users" ON public.company_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow ALL for authenticated users" ON public.clients;
CREATE POLICY "Allow ALL for authenticated users" ON public.clients FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow ALL for authenticated users" ON public.documents;
CREATE POLICY "Allow ALL for authenticated users" ON public.documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow ALL for authenticated users" ON public.library_documents;
CREATE POLICY "Allow ALL for authenticated users" ON public.library_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
