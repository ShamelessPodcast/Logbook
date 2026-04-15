-- =============================================================
-- Logbook — Functions & Triggers
-- =============================================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, moniker, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'moniker', 'user_' || substr(new.id::text, 1, 8)),
    new.raw_user_meta_data->>'moniker'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at timestamps
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_vehicles_updated_at before update on public.vehicles
  for each row execute function public.set_updated_at();
create trigger set_posts_updated_at before update on public.posts
  for each row execute function public.set_updated_at();
create trigger set_groups_updated_at before update on public.groups
  for each row execute function public.set_updated_at();
create trigger set_listings_updated_at before update on public.listings
  for each row execute function public.set_updated_at();

-- Increment/decrement like_count
create or replace function public.handle_post_like()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set like_count = like_count + 1 where id = new.post_id;
    -- Create notification
    insert into public.notifications(user_id, actor_id, type, post_id)
    select p.author_id, new.user_id, 'like', new.post_id
    from public.posts p
    where p.id = new.post_id and p.author_id != new.user_id;
  elsif TG_OP = 'DELETE' then
    update public.posts set like_count = like_count - 1 where id = old.post_id;
  end if;
  return null;
end;
$$;

create trigger on_post_like
  after insert or delete on public.post_likes
  for each row execute function public.handle_post_like();

-- Increment/decrement repost_count
create or replace function public.handle_repost()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set repost_count = repost_count + 1 where id = new.post_id;
  elsif TG_OP = 'DELETE' then
    update public.posts set repost_count = repost_count - 1 where id = old.post_id;
  end if;
  return null;
end;
$$;

create trigger on_repost
  after insert or delete on public.reposts
  for each row execute function public.handle_repost();

-- Increment reply_count on parent post
create or replace function public.handle_post_reply()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'INSERT' and new.reply_to_id is not null then
    update public.posts set reply_count = reply_count + 1 where id = new.reply_to_id;
    -- Create notification
    insert into public.notifications(user_id, actor_id, type, post_id)
    select p.author_id, new.author_id, 'reply', new.id
    from public.posts p
    where p.id = new.reply_to_id and p.author_id != new.author_id;
  end if;
  return null;
end;
$$;

create trigger on_post_reply
  after insert on public.posts
  for each row execute function public.handle_post_reply();

-- Increment profile post_count
create or replace function public.handle_post_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'INSERT' and new.reply_to_id is null and new.repost_of_id is null then
    update public.profiles set post_count = post_count + 1 where id = new.author_id;
  end if;
  return null;
end;
$$;

create trigger on_post_insert_count
  after insert on public.posts
  for each row execute function public.handle_post_count();

-- Follow counts + notification
create or replace function public.handle_follow()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'INSERT' then
    update public.profiles set follower_count = follower_count + 1 where id = new.following_id;
    update public.profiles set following_count = following_count + 1 where id = new.follower_id;
    insert into public.notifications(user_id, actor_id, type)
    values (new.following_id, new.follower_id, 'follow');
  elsif TG_OP = 'DELETE' then
    update public.profiles set follower_count = follower_count - 1 where id = old.following_id;
    update public.profiles set following_count = following_count - 1 where id = old.follower_id;
  end if;
  return null;
end;
$$;

create trigger on_follow
  after insert or delete on public.follows
  for each row execute function public.handle_follow();

-- Group member count
create or replace function public.handle_group_member()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'INSERT' then
    update public.groups set member_count = member_count + 1 where id = new.group_id;
  elsif TG_OP = 'DELETE' then
    update public.groups set member_count = member_count - 1 where id = old.group_id;
  end if;
  return null;
end;
$$;

create trigger on_group_member
  after insert or delete on public.group_members
  for each row execute function public.handle_group_member();

-- Update conversation on new message
create or replace function public.handle_new_message()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.conversations
  set
    last_message_at = new.created_at,
    last_message_preview = left(new.content, 100)
  where id = new.conversation_id;
  return null;
end;
$$;

create trigger on_new_message
  after insert on public.messages
  for each row execute function public.handle_new_message();
