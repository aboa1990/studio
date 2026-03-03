ALTER TABLE "public"."company_profiles"
ADD COLUMN "phone" text,
ADD COLUMN "gst_number" text,
ADD COLUMN "authorized_signatory" text,
ADD COLUMN "bank_details" text, -- Changed from jsonb to text
ADD COLUMN "signature_url" text;
