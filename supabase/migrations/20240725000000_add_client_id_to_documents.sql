ALTER TABLE public.documents ADD COLUMN client_id uuid;

ALTER TABLE public.documents
ADD CONSTRAINT documents_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;