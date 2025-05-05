drop index if exists "public"."files_resource_id_resource_table_name_idx";

alter table "public"."files" alter column "resource_id" drop not null;

alter table "public"."files" alter column "resource_id" set data type bigint using "resource_id"::bigint;

alter table "public"."files" disable row level security;


