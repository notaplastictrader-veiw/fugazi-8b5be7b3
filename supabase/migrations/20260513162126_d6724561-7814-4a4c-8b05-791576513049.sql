-- Saved Matches
create table public.saved_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null default 'My Match',
  answers jsonb not null default '{}'::jsonb,
  result jsonb not null default '[]'::jsonb,
  notify_on_new boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.saved_matches enable row level security;
create policy "Users view own saved_matches" on public.saved_matches for select to authenticated using (user_id = auth.uid());
create policy "Users insert own saved_matches" on public.saved_matches for insert to authenticated with check (user_id = auth.uid());
create policy "Users update own saved_matches" on public.saved_matches for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users delete own saved_matches" on public.saved_matches for delete to authenticated using (user_id = auth.uid());
create policy "Admins full access saved_matches" on public.saved_matches for all to authenticated using (has_role('super_admin'::app_role)) with check (has_role('super_admin'::app_role));
create trigger update_saved_matches_updated_at before update on public.saved_matches for each row execute function public.update_updated_at_column();

-- Saved Searches
create table public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null default 'My Search',
  scope text not null default 'brokers',
  filters jsonb not null default '{}'::jsonb,
  notify_on_new boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.saved_searches enable row level security;
create policy "Users view own saved_searches" on public.saved_searches for select to authenticated using (user_id = auth.uid());
create policy "Users insert own saved_searches" on public.saved_searches for insert to authenticated with check (user_id = auth.uid());
create policy "Users update own saved_searches" on public.saved_searches for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users delete own saved_searches" on public.saved_searches for delete to authenticated using (user_id = auth.uid());
create policy "Admins full access saved_searches" on public.saved_searches for all to authenticated using (has_role('super_admin'::app_role)) with check (has_role('super_admin'::app_role));
create trigger update_saved_searches_updated_at before update on public.saved_searches for each row execute function public.update_updated_at_column();

-- Notification Preferences
create table public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  weekly_digest boolean not null default true,
  new_match_alerts boolean not null default true,
  scam_alerts boolean not null default true,
  forum_replies boolean not null default true,
  email_enabled boolean not null default false,
  inapp_enabled boolean not null default true,
  last_digest_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.notification_preferences enable row level security;
create policy "Users view own notification_preferences" on public.notification_preferences for select to authenticated using (user_id = auth.uid());
create policy "Users insert own notification_preferences" on public.notification_preferences for insert to authenticated with check (user_id = auth.uid());
create policy "Users update own notification_preferences" on public.notification_preferences for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Admins full access notification_preferences" on public.notification_preferences for all to authenticated using (has_role('super_admin'::app_role)) with check (has_role('super_admin'::app_role));
create trigger update_notification_preferences_updated_at before update on public.notification_preferences for each row execute function public.update_updated_at_column();