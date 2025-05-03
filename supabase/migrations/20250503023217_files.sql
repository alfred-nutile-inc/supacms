create sequence "public"."files_id_seq";

create table "public"."files" (
    "id" bigint not null default nextval('files_id_seq'::regclass),
    "resource_id" uuid not null,
    "resource_table_name" text not null,
    "field_name" text not null,
    "bucket" text not null,
    "path" text not null,
    "acl" text default 'public'::text,
    "filename" text not null,
    "mime_type" text,
    "size" bigint,
    "metadata" jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter sequence "public"."files_id_seq" owned by "public"."files"."id";

CREATE INDEX files_field_name_idx ON public.files USING btree (field_name);

CREATE UNIQUE INDEX files_pkey ON public.files USING btree (id);

CREATE INDEX files_resource_id_resource_table_name_idx ON public.files USING btree (resource_id, resource_table_name);

alter table "public"."files" add constraint "files_pkey" PRIMARY KEY using index "files_pkey";

grant delete on table "public"."files" to "anon";

grant insert on table "public"."files" to "anon";

grant references on table "public"."files" to "anon";

grant select on table "public"."files" to "anon";

grant trigger on table "public"."files" to "anon";

grant truncate on table "public"."files" to "anon";

grant update on table "public"."files" to "anon";

grant delete on table "public"."files" to "authenticated";

grant insert on table "public"."files" to "authenticated";

grant references on table "public"."files" to "authenticated";

grant select on table "public"."files" to "authenticated";

grant trigger on table "public"."files" to "authenticated";

grant truncate on table "public"."files" to "authenticated";

grant update on table "public"."files" to "authenticated";

grant delete on table "public"."files" to "service_role";

grant insert on table "public"."files" to "service_role";

grant references on table "public"."files" to "service_role";

grant select on table "public"."files" to "service_role";

grant trigger on table "public"."files" to "service_role";

grant truncate on table "public"."files" to "service_role";

grant update on table "public"."files" to "service_role";


