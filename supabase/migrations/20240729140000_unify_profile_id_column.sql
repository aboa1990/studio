
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='profileId') THEN
    ALTER TABLE public.documents RENAME COLUMN "profileId" TO profile_id;
  END IF;
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='profileId') THEN
    ALTER TABLE public.clients RENAME COLUMN "profileId" TO profile_id;
  END IF;
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='library_documents' AND column_name='profileId') THEN
    ALTER TABLE public.library_documents RENAME COLUMN "profileId" TO profile_id;
  END IF;
END $$;
