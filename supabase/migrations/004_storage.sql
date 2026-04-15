-- =============================================================
-- Logbook — Storage Buckets + Policies
-- =============================================================

-- Create storage buckets
insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('post-images', 'post-images', true),
  ('listing-images', 'listing-images', true),
  ('group-covers', 'group-covers', true),
  ('vehicle-images', 'vehicle-images', true)
on conflict (id) do nothing;

-- Avatar bucket policies
create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Post images policies
create policy "Anyone can view post images"
  on storage.objects for select
  using (bucket_id = 'post-images');

create policy "Authenticated users can upload post images"
  on storage.objects for insert
  with check (
    bucket_id = 'post-images' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own post images"
  on storage.objects for delete
  using (
    bucket_id = 'post-images' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Listing images policies
create policy "Anyone can view listing images"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "Authenticated users can upload listing images"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-images' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own listing images"
  on storage.objects for delete
  using (
    bucket_id = 'listing-images' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Vehicle images policies
create policy "Anyone can view vehicle images"
  on storage.objects for select
  using (bucket_id = 'vehicle-images');

create policy "Owners can upload vehicle images"
  on storage.objects for insert
  with check (
    bucket_id = 'vehicle-images' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Owners can delete own vehicle images"
  on storage.objects for delete
  using (
    bucket_id = 'vehicle-images' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
