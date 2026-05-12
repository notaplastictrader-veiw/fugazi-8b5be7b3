
-- Reactions on threads or replies
create table public.forum_reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  target_type text not null check (target_type in ('thread','reply')),
  target_id uuid not null,
  reaction text not null check (reaction in ('like','fire','flag')),
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_id, reaction)
);

alter table public.forum_reactions enable row level security;

create policy "Public can view reactions" on public.forum_reactions
  for select using (true);
create policy "Users insert own reactions" on public.forum_reactions
  for insert to authenticated with check (user_id = auth.uid());
create policy "Users delete own reactions" on public.forum_reactions
  for delete to authenticated using (user_id = auth.uid());
create policy "Admins manage reactions" on public.forum_reactions
  for all to authenticated using (has_role('super_admin')) with check (has_role('super_admin'));

create index idx_forum_reactions_target on public.forum_reactions (target_type, target_id);

-- Reports for moderation queue
create table public.forum_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null,
  target_type text not null check (target_type in ('thread','reply')),
  target_id uuid not null,
  reason text not null default '',
  status text not null default 'open' check (status in ('open','dismissed','actioned')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid
);

alter table public.forum_reports enable row level security;

create policy "Users insert own reports" on public.forum_reports
  for insert to authenticated with check (reporter_id = auth.uid());
create policy "Users view own reports" on public.forum_reports
  for select to authenticated using (reporter_id = auth.uid());
create policy "Admins full access reports" on public.forum_reports
  for all to authenticated using (has_role('super_admin')) with check (has_role('super_admin'));

create index idx_forum_reports_status on public.forum_reports (status, created_at desc);
