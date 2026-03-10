
-- Policies for public storage bucket
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'public');

DROP POLICY IF EXISTS "Allow authenticated users to upload" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'public' AND auth.role() = 'authenticated');
