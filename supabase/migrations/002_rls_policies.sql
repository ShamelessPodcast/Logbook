-- =============================================================
-- Logbook — Row Level Security Policies
-- =============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.plate_locks enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.reposts enable row level security;
alter table public.follows enable row level security;
alter table public.plate_follows enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_posts enable row level security;
alter table public.listings enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.blocks enable row level security;

-- =============================================================
-- PROFILES
-- =============================================================
create policy "Profiles are publicly visible"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "New profile on signup"
  on public.profiles for insert
  with check (auth.uid() = id);

-- =============================================================
-- VEHICLES
-- =============================================================
create policy "Vehicles are publicly visible"
  on public.vehicles for select using (true);

create policy "Owners can insert vehicles"
  on public.vehicles for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update vehicles"
  on public.vehicles for update
  using (auth.uid() = owner_id);

create policy "Owners can delete vehicles"
  on public.vehicles for delete
  using (auth.uid() = owner_id);

-- =============================================================
-- PLATE LOCKS
-- =============================================================
create policy "Users can view own plate locks"
  on public.plate_locks for select
  using (auth.uid() = user_id);

create policy "Users can insert own plate locks"
  on public.plate_locks for insert
  with check (auth.uid() = user_id);

-- Updates only via service role (webhook)

-- =============================================================
-- POSTS
-- =============================================================
create policy "Posts are publicly visible when not deleted"
  on public.posts for select
  using (is_deleted = false);

create policy "Authenticated users can create posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "Authors can update own posts"
  on public.posts for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "Authors can soft-delete own posts"
  on public.posts for delete
  using (auth.uid() = author_id);

-- =============================================================
-- POST LIKES
-- =============================================================
create policy "Post likes are publicly visible"
  on public.post_likes for select using (true);

create policy "Authenticated users can like"
  on public.post_likes for insert
  with check (auth.uid() = user_id);

create policy "Users can unlike own likes"
  on public.post_likes for delete
  using (auth.uid() = user_id);

-- =============================================================
-- REPOSTS
-- =============================================================
create policy "Reposts are publicly visible"
  on public.reposts for select using (true);

create policy "Authenticated users can repost"
  on public.reposts for insert
  with check (auth.uid() = user_id);

create policy "Users can undo own reposts"
  on public.reposts for delete
  using (auth.uid() = user_id);

-- =============================================================
-- FOLLOWS
-- =============================================================
create policy "Follows are publicly visible"
  on public.follows for select using (true);

create policy "Authenticated users can follow"
  on public.follows for insert
  with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on public.follows for delete
  using (auth.uid() = follower_id);

-- =============================================================
-- PLATE FOLLOWS
-- =============================================================
create policy "Plate follows are publicly visible"
  on public.plate_follows for select using (true);

create policy "Users can follow plates"
  on public.plate_follows for insert
  with check (auth.uid() = user_id);

create policy "Users can unfollow plates"
  on public.plate_follows for delete
  using (auth.uid() = user_id);

-- =============================================================
-- CONVERSATIONS
-- =============================================================
create policy "Participants can view conversations"
  on public.conversations for select
  using (auth.uid() = any(participant_ids));

create policy "Participants can create conversations"
  on public.conversations for insert
  with check (auth.uid() = any(participant_ids));

-- =============================================================
-- MESSAGES
-- =============================================================
create policy "Participants can view messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and auth.uid() = any(c.participant_ids)
    )
  );

create policy "Participants can send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id and
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and auth.uid() = any(c.participant_ids)
    )
  );

create policy "Sender can update read status"
  on public.messages for update
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and auth.uid() = any(c.participant_ids)
    )
  );

-- =============================================================
-- GROUPS
-- =============================================================
create policy "Public groups are visible to all"
  on public.groups for select
  using (
    is_private = false or
    exists (
      select 1 from public.group_members gm
      where gm.group_id = id and gm.user_id = auth.uid()
    )
  );

create policy "Authenticated users can create groups"
  on public.groups for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update groups"
  on public.groups for update
  using (auth.uid() = owner_id);

create policy "Owners can delete groups"
  on public.groups for delete
  using (auth.uid() = owner_id);

-- =============================================================
-- GROUP MEMBERS
-- =============================================================
create policy "Group members are publicly visible for public groups"
  on public.group_members for select
  using (
    exists (
      select 1 from public.groups g
      where g.id = group_id and (g.is_private = false or g.owner_id = auth.uid())
    )
  );

create policy "Users can join public groups"
  on public.group_members for insert
  with check (auth.uid() = user_id);

create policy "Users can leave groups"
  on public.group_members for delete
  using (auth.uid() = user_id);

-- =============================================================
-- GROUP POSTS
-- =============================================================
create policy "Group posts visible to group members"
  on public.group_posts for select
  using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = group_id and gm.user_id = auth.uid()
    ) or
    exists (
      select 1 from public.groups g
      where g.id = group_id and g.is_private = false
    )
  );

create policy "Group members can post"
  on public.group_posts for insert
  with check (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = group_id and gm.user_id = auth.uid()
    )
  );

-- =============================================================
-- LISTINGS
-- =============================================================
create policy "Active listings are publicly visible"
  on public.listings for select
  using (status = 'active' or seller_id = auth.uid());

create policy "Authenticated users can create listings"
  on public.listings for insert
  with check (auth.uid() = seller_id);

create policy "Sellers can update own listings"
  on public.listings for update
  using (auth.uid() = seller_id);

create policy "Sellers can delete own listings"
  on public.listings for delete
  using (auth.uid() = seller_id);

-- =============================================================
-- NOTIFICATIONS
-- =============================================================
create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can mark notifications read"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Inserts only via service role (triggers/functions)

-- =============================================================
-- REPORTS
-- =============================================================
create policy "Users can submit reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

create policy "Users can view own reports"
  on public.reports for select
  using (auth.uid() = reporter_id);

-- =============================================================
-- BLOCKS
-- =============================================================
create policy "Users can view own blocks"
  on public.blocks for select
  using (auth.uid() = blocker_id);

create policy "Users can block"
  on public.blocks for insert
  with check (auth.uid() = blocker_id);

create policy "Users can unblock"
  on public.blocks for delete
  using (auth.uid() = blocker_id);
