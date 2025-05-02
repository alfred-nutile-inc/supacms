create policy "Articles are viewable by authenticated users"
on "public"."articles"
as permissive
for select
to authenticated
using (true);


create policy "Articles can be created by authenticated users"
on "public"."articles"
as permissive
for insert
to authenticated
with check (true);


create policy "Articles can be deleted by authenticated users"
on "public"."articles"
as permissive
for delete
to authenticated
using (true);


create policy "Articles can be updated by authenticated users"
on "public"."articles"
as permissive
for update
to authenticated
using (true)
with check (true);


create policy "Authors are viewable by authenticated users"
on "public"."authors"
as permissive
for select
to authenticated
using (true);


create policy "Authors can be created by authenticated users"
on "public"."authors"
as permissive
for insert
to authenticated
with check (true);


create policy "Authors can be deleted by authenticated users"
on "public"."authors"
as permissive
for delete
to authenticated
using (true);


create policy "Authors can be updated by authenticated users"
on "public"."authors"
as permissive
for update
to authenticated
using (true)
with check (true);



