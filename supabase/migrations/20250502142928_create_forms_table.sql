-- Migration: Create forms table for storing JSON-based form configurations
-- Purpose: Add a table to store form definitions for Supabase-backed admin dashboard
-- Affected: public.forms
-- RLS: Enabled, with permissive policies for anon and authenticated roles

create table public.forms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  table_name text not null,
  json jsonb not null,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.forms enable row level security;

-- Policies: Allow select, insert, update, delete for both anon and authenticated roles
create policy "Allow select for all" on public.forms for select to anon, authenticated using (true);
create policy "Allow insert for all" on public.forms for insert to anon, authenticated with check (true);
create policy "Allow update for all" on public.forms for update to anon, authenticated using (true) with check (true);
create policy "Allow delete for all" on public.forms for delete to anon, authenticated using (true);

-- Index for fast lookup by table_name
create index idx_forms_table_name on public.forms(table_name);

-- Table comment
do $$ begin
  comment on table public.forms is 'Stores JSON form configurations for admin dashboard, including field types, validation, and relationships.';
end $$; 