CREATE TABLE "public"."clients" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profileId" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "email" "text",
    "address" "text",
    "contactPerson" "text",
    "phone" "text",
    "gstNumber" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."clients" ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");

ALTER TABLE "public"."clients" ADD CONSTRAINT "clients_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."company_profiles"("id") ON DELETE CASCADE;
