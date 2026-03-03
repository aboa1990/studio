
CREATE TABLE "public"."company_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text",
    "address" "text",
    "logo_url" "text"
);

CREATE TABLE "public"."documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profileId" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "number" "text" NOT NULL,
    "clientName" "text" NOT NULL,
    "clientEmail" "text",
    "clientAddress" "text",
    "items" "jsonb" NOT NULL,
    "taxRate" "numeric" DEFAULT 0,
    "date" "date" NOT NULL,
    "dueDate" "date",
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "currency" "text" DEFAULT 'MVR'::"text",
    "subtotal" "numeric" NOT NULL,
    "taxAmount" "numeric" NOT NULL,
    "total" "numeric" NOT NULL,
    "terms" "text",
    "notes" "text",
    "attachments" "jsonb"
);

CREATE TABLE "public"."clients" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profileId" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "email" "text",
    "address" "text"
);

CREATE TABLE "public"."library_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profileId" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "data" "text" NOT NULL
);

ALTER TABLE ONLY "public"."company_profiles" ADD CONSTRAINT "company_profiles_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."documents" ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."clients" ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."library_documents" ADD CONSTRAINT "library_documents_pkey" PRIMARY KEY ("id");

ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."company_profiles"(id);
ALTER TABLE "public"."clients" ADD CONSTRAINT "clients_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."company_profiles"(id);
ALTER TABLE "public"."library_documents" ADD CONSTRAINT "library_documents_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."company_profiles"(id);
