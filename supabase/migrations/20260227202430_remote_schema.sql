create type "public"."enrichment_protocol" as enum ('webhook', 'api', 'file');


  create table "public"."enrichment_changes" (
    "id" uuid not null default gen_random_uuid(),
    "enrichment_id" uuid not null,
    "field_name" text not null,
    "old_value" text,
    "new_value" text not null,
    "changed_at" timestamp with time zone not null default now()
      );



  create table "public"."enrichments" (
    "id" uuid not null default gen_random_uuid(),
    "founder_id" uuid not null,
    "source" text not null,
    "protocol" public.enrichment_protocol not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


CREATE UNIQUE INDEX enrichment_changes_pkey ON public.enrichment_changes USING btree (id);

CREATE UNIQUE INDEX enrichments_pkey ON public.enrichments USING btree (id);

alter table "public"."enrichment_changes" add constraint "enrichment_changes_pkey" PRIMARY KEY using index "enrichment_changes_pkey";

alter table "public"."enrichments" add constraint "enrichments_pkey" PRIMARY KEY using index "enrichments_pkey";

alter table "public"."enrichment_changes" add constraint "enrichment_changes_enrichment_id_enrichments_id_fk" FOREIGN KEY (enrichment_id) REFERENCES public.enrichments(id) not valid;

alter table "public"."enrichment_changes" validate constraint "enrichment_changes_enrichment_id_enrichments_id_fk";

alter table "public"."enrichments" add constraint "enrichments_founder_id_founders_id_fk" FOREIGN KEY (founder_id) REFERENCES public.founders(id) not valid;

alter table "public"."enrichments" validate constraint "enrichments_founder_id_founders_id_fk";

grant delete on table "public"."enrichment_changes" to "anon";

grant insert on table "public"."enrichment_changes" to "anon";

grant references on table "public"."enrichment_changes" to "anon";

grant select on table "public"."enrichment_changes" to "anon";

grant trigger on table "public"."enrichment_changes" to "anon";

grant truncate on table "public"."enrichment_changes" to "anon";

grant update on table "public"."enrichment_changes" to "anon";

grant delete on table "public"."enrichment_changes" to "authenticated";

grant insert on table "public"."enrichment_changes" to "authenticated";

grant references on table "public"."enrichment_changes" to "authenticated";

grant select on table "public"."enrichment_changes" to "authenticated";

grant trigger on table "public"."enrichment_changes" to "authenticated";

grant truncate on table "public"."enrichment_changes" to "authenticated";

grant update on table "public"."enrichment_changes" to "authenticated";

grant delete on table "public"."enrichment_changes" to "service_role";

grant insert on table "public"."enrichment_changes" to "service_role";

grant references on table "public"."enrichment_changes" to "service_role";

grant select on table "public"."enrichment_changes" to "service_role";

grant trigger on table "public"."enrichment_changes" to "service_role";

grant truncate on table "public"."enrichment_changes" to "service_role";

grant update on table "public"."enrichment_changes" to "service_role";

grant delete on table "public"."enrichments" to "anon";

grant insert on table "public"."enrichments" to "anon";

grant references on table "public"."enrichments" to "anon";

grant select on table "public"."enrichments" to "anon";

grant trigger on table "public"."enrichments" to "anon";

grant truncate on table "public"."enrichments" to "anon";

grant update on table "public"."enrichments" to "anon";

grant delete on table "public"."enrichments" to "authenticated";

grant insert on table "public"."enrichments" to "authenticated";

grant references on table "public"."enrichments" to "authenticated";

grant select on table "public"."enrichments" to "authenticated";

grant trigger on table "public"."enrichments" to "authenticated";

grant truncate on table "public"."enrichments" to "authenticated";

grant update on table "public"."enrichments" to "authenticated";

grant delete on table "public"."enrichments" to "service_role";

grant insert on table "public"."enrichments" to "service_role";

grant references on table "public"."enrichments" to "service_role";

grant select on table "public"."enrichments" to "service_role";

grant trigger on table "public"."enrichments" to "service_role";

grant truncate on table "public"."enrichments" to "service_role";

grant update on table "public"."enrichments" to "service_role";


