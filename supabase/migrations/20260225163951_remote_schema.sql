


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."boardy_status" AS ENUM (
    'not-referred',
    'referred',
    'onboarding-in-progress',
    'onboarded',
    'declined'
);


ALTER TYPE "public"."boardy_status" OWNER TO "postgres";


CREATE TYPE "public"."conversion_path" AS ENUM (
    'boardy-referral',
    'consulting',
    'nurture',
    'network'
);


ALTER TYPE "public"."conversion_path" OWNER TO "postgres";


CREATE TYPE "public"."message_status" AS ENUM (
    'drafted',
    'queued-for-review',
    'approved',
    'sent',
    'bounced'
);


ALTER TYPE "public"."message_status" OWNER TO "postgres";


CREATE TYPE "public"."message_type" AS ENUM (
    'boardy-intro',
    'onboarding-nudge',
    'relationship-building',
    'follow-up',
    'check-in'
);


ALTER TYPE "public"."message_type" OWNER TO "postgres";


CREATE TYPE "public"."personalization_level" AS ENUM (
    'template',
    'light-ai',
    'full-ai'
);


ALTER TYPE "public"."personalization_level" OWNER TO "postgres";


CREATE TYPE "public"."relationship_stage" AS ENUM (
    'intake',
    'active-boardy-onboarding',
    'active-nurture',
    'warm',
    'dormant',
    'converted',
    'archived'
);


ALTER TYPE "public"."relationship_stage" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."founder_changes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "founder_id" "uuid" NOT NULL,
    "field_name" "text" NOT NULL,
    "old_value" "text",
    "new_value" "text" NOT NULL,
    "changed_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."founder_changes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."founders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "company_name" "text" NOT NULL,
    "source" "text" NOT NULL,
    "stage" "text",
    "raise_amount" "text",
    "sector" "text",
    "one_liner" "text",
    "deck_link" "text",
    "referring_partner" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."founders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "relationship_id" "uuid" NOT NULL,
    "type" "public"."message_type" NOT NULL,
    "status" "public"."message_status" NOT NULL,
    "personalization_level" "public"."personalization_level" NOT NULL,
    "subject" "text" NOT NULL,
    "body" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."relationship_changes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "relationship_id" "uuid" NOT NULL,
    "field_name" "text" NOT NULL,
    "old_value" "text",
    "new_value" "text" NOT NULL,
    "changed_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."relationship_changes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."relationships" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "scout_id" "uuid" NOT NULL,
    "founder_id" "uuid" NOT NULL,
    "stage" "public"."relationship_stage" DEFAULT 'intake'::"public"."relationship_stage" NOT NULL,
    "boardy_status" "public"."boardy_status" DEFAULT 'not-referred'::"public"."boardy_status" NOT NULL,
    "cadence_position" integer DEFAULT 0 NOT NULL,
    "interaction_count" integer DEFAULT 0 NOT NULL,
    "next_touchpoint" timestamp with time zone,
    "last_interaction_at" timestamp with time zone,
    "last_interaction_channel" "text",
    "last_interaction_summary" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."relationships" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."scout_changes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "scout_id" "uuid" NOT NULL,
    "field_name" "text" NOT NULL,
    "old_value" "text",
    "new_value" "text" NOT NULL,
    "changed_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."scout_changes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."scouts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "connected_email_account" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."scouts" OWNER TO "postgres";


ALTER TABLE ONLY "public"."founder_changes"
    ADD CONSTRAINT "founder_changes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."founders"
    ADD CONSTRAINT "founders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."relationship_changes"
    ADD CONSTRAINT "relationship_changes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."relationships"
    ADD CONSTRAINT "relationships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."scout_changes"
    ADD CONSTRAINT "scout_changes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."scouts"
    ADD CONSTRAINT "scouts_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "founders_email_idx" ON "public"."founders" USING "btree" ("email");



CREATE UNIQUE INDEX "scouts_email_idx" ON "public"."scouts" USING "btree" ("email");



ALTER TABLE ONLY "public"."founder_changes"
    ADD CONSTRAINT "founder_changes_founder_id_founders_id_fk" FOREIGN KEY ("founder_id") REFERENCES "public"."founders"("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_relationship_id_relationships_id_fk" FOREIGN KEY ("relationship_id") REFERENCES "public"."relationships"("id");



ALTER TABLE ONLY "public"."relationship_changes"
    ADD CONSTRAINT "relationship_changes_relationship_id_relationships_id_fk" FOREIGN KEY ("relationship_id") REFERENCES "public"."relationships"("id");



ALTER TABLE ONLY "public"."relationships"
    ADD CONSTRAINT "relationships_founder_id_founders_id_fk" FOREIGN KEY ("founder_id") REFERENCES "public"."founders"("id");



ALTER TABLE ONLY "public"."relationships"
    ADD CONSTRAINT "relationships_scout_id_scouts_id_fk" FOREIGN KEY ("scout_id") REFERENCES "public"."scouts"("id");



ALTER TABLE ONLY "public"."scout_changes"
    ADD CONSTRAINT "scout_changes_scout_id_scouts_id_fk" FOREIGN KEY ("scout_id") REFERENCES "public"."scouts"("id");





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";








































































































































































GRANT ALL ON TABLE "public"."founder_changes" TO "anon";
GRANT ALL ON TABLE "public"."founder_changes" TO "authenticated";
GRANT ALL ON TABLE "public"."founder_changes" TO "service_role";



GRANT ALL ON TABLE "public"."founders" TO "anon";
GRANT ALL ON TABLE "public"."founders" TO "authenticated";
GRANT ALL ON TABLE "public"."founders" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."relationship_changes" TO "anon";
GRANT ALL ON TABLE "public"."relationship_changes" TO "authenticated";
GRANT ALL ON TABLE "public"."relationship_changes" TO "service_role";



GRANT ALL ON TABLE "public"."relationships" TO "anon";
GRANT ALL ON TABLE "public"."relationships" TO "authenticated";
GRANT ALL ON TABLE "public"."relationships" TO "service_role";



GRANT ALL ON TABLE "public"."scout_changes" TO "anon";
GRANT ALL ON TABLE "public"."scout_changes" TO "authenticated";
GRANT ALL ON TABLE "public"."scout_changes" TO "service_role";



GRANT ALL ON TABLE "public"."scouts" TO "anon";
GRANT ALL ON TABLE "public"."scouts" TO "authenticated";
GRANT ALL ON TABLE "public"."scouts" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";


