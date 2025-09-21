-- Storage policies for 'documents' bucket
-- Allow authenticated users to manage files in their own folder (userId/*)

-- SELECT policy
create policy if not exists "Users can view their own documents"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- INSERT policy
create policy if not exists "Users can upload their own documents"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- UPDATE policy
create policy if not exists "Users can update their own documents"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- DELETE policy
create policy if not exists "Users can delete their own documents"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);