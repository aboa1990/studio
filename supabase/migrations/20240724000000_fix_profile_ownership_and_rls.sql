ALTER TABLE public.company_profiles ADD COLUMN user_id uuid;
ALTER TABLE public.company_profiles ADD CONSTRAINT company_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.company_profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles." ON public.company_profiles;
DROP POLICY IF EXISTS "Authenticated users can create profiles." ON public.company_profiles;
DROP POLICY IF EXISTS "Authenticated users can update profiles." ON public.company_profiles;
DROP POLICY IF EXISTS "Authenticated users can manage their own company profile." ON public.company_profiles;

CREATE POLICY "Users can view their own company profiles." ON public.company_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own company profiles." ON public.company_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own company profiles." ON public.company_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own company profiles." ON public.company_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can manage their own clients." ON public.clients;
CREATE POLICY "Users can manage clients of their own profiles." ON public.clients FOR ALL TO authenticated
USING ((( SELECT company_profiles.user_id FROM company_profiles WHERE (company_profiles.id = clients."profileId")) = auth.uid()))
WITH CHECK ((( SELECT company_profiles.user_id FROM company_profiles WHERE (company_profiles.id = clients."profileId")) = auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can manage their own documents." ON public.documents;
CREATE POLICY "Users can manage documents of their own profiles." ON public.documents FOR ALL TO authenticated
USING ((( SELECT company_profiles.user_id FROM company_profiles WHERE (company_profiles.id = documents."profileId")) = auth.uid()))
WITH CHECK ((( SELECT company_profiles.user_id FROM company_profiles WHERE (company_profiles.id = documents."profileId")) = auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can manage their own library documents." ON public.library_documents;
CREATE POLICY "Users can manage library documents of their own profiles." ON public.library_documents FOR ALL TO authenticated
USING ((( SELECT company_profiles.user_id FROM company_profiles WHERE (company_profiles.id = library_documents."profileId")) = auth.uid()))
WITH CHECK ((( SELECT company_profiles.user_id FROM company_profiles WHERE (company_profiles.id = library_documents."profileId")) = auth.uid()));
