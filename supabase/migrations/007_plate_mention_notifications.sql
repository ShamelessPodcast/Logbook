-- =============================================================
-- Migration 007: plate_mention notification type
-- =============================================================

-- Add plate_mention to the notifications type constraint
alter table public.notifications
  drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check
  check (type in (
    'like', 'reply', 'repost', 'follow', 'mention',
    'plate_message', 'mot_reminder', 'tax_reminder',
    'plate_mention'
  ));
