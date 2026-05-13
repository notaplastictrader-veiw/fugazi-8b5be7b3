
-- PROFILE FOLLOWS
create table public.profile_follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null,
  followed_id uuid not null,
  created_at timestamptz not null default now(),
  unique (follower_id, followed_id),
  check (follower_id <> followed_id)
);
alter table public.profile_follows enable row level security;

create policy "Public can view follows" on public.profile_follows for select using (true);
create policy "Users follow others" on public.profile_follows for insert
  to authenticated with check (follower_id = auth.uid());
create policy "Users unfollow" on public.profile_follows for delete
  to authenticated using (follower_id = auth.uid());

create index idx_profile_follows_follower on public.profile_follows(follower_id);
create index idx_profile_follows_followed on public.profile_follows(followed_id);

-- FORUM BEST ANSWER
alter table public.forum_threads
  add column if not exists best_reply_id uuid references public.forum_replies(id) on delete set null;

-- PROFILES: opt-in journal stats publication
alter table public.profiles
  add column if not exists show_journal_stats boolean not null default false;
