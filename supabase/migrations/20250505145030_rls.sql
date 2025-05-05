alter table "public"."files" enable row level security;

create policy "Allow delete for authenticated users"
on "public"."files"
as permissive
for delete
to authenticated
using (true);


create policy "Allow insert for authenticated users"
on "public"."files"
as permissive
for insert
to authenticated
with check (true);


create policy "Allow select for all"
on "public"."files"
as permissive
for select
to authenticated, anon
using (true);


create policy "Allow update for authenticated users"
on "public"."files"
as permissive
for update
to authenticated
using (true)
with check (true);



