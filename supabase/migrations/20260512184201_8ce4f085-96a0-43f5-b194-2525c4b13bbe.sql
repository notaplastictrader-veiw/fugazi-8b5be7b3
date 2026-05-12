
-- Verified user check: has at least one published review
create or replace function public.is_verified_trader(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.reviews where user_id = _user_id and status = 'published')
$$;

-- FORUM THREADS
create table public.forum_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  slug text not null unique,
  body text not null default '',
  category text not null default 'general',
  pinned boolean not null default false,
  locked boolean not null default false,
  view_count integer not null default 0,
  reply_count integer not null default 0,
  last_reply_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.forum_threads enable row level security;

create policy "Public can view threads" on public.forum_threads for select using (true);
create policy "Verified traders can create threads" on public.forum_threads for insert
  to authenticated with check (user_id = auth.uid() and public.is_verified_trader(auth.uid()));
create policy "Authors can update own threads" on public.forum_threads for update
  to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Authors can delete own threads" on public.forum_threads for delete
  to authenticated using (user_id = auth.uid());
create policy "Admins full access threads" on public.forum_threads for all
  to authenticated using (has_role('super_admin'::app_role)) with check (has_role('super_admin'::app_role));

create trigger forum_threads_updated_at before update on public.forum_threads
  for each row execute function public.update_updated_at_column();

-- FORUM REPLIES
create table public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.forum_threads(id) on delete cascade,
  user_id uuid not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.forum_replies enable row level security;

create policy "Public can view replies" on public.forum_replies for select using (true);
create policy "Verified traders can reply" on public.forum_replies for insert
  to authenticated with check (
    user_id = auth.uid()
    and public.is_verified_trader(auth.uid())
    and not exists (select 1 from public.forum_threads t where t.id = thread_id and t.locked = true)
  );
create policy "Authors can update own replies" on public.forum_replies for update
  to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Authors can delete own replies" on public.forum_replies for delete
  to authenticated using (user_id = auth.uid());
create policy "Admins full access replies" on public.forum_replies for all
  to authenticated using (has_role('super_admin'::app_role)) with check (has_role('super_admin'::app_role));

-- Auto-update reply_count + last_reply_at
create or replace function public.sync_thread_reply_stats()
returns trigger language plpgsql security definer set search_path = public as $$
declare affected uuid;
begin
  if (tg_op = 'DELETE') then affected := old.thread_id; else affected := new.thread_id; end if;
  update public.forum_threads
    set reply_count = (select count(*) from public.forum_replies where thread_id = affected),
        last_reply_at = coalesce((select max(created_at) from public.forum_replies where thread_id = affected), created_at)
    where id = affected;
  return coalesce(new, old);
end $$;
create trigger forum_replies_sync after insert or delete on public.forum_replies
  for each row execute function public.sync_thread_reply_stats();

-- AWARDS
create table public.award_categories (
  id uuid primary key default gen_random_uuid(),
  year integer not null default extract(year from now())::int,
  slug text not null,
  title text not null,
  description text default '',
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (year, slug)
);
alter table public.award_categories enable row level security;
create policy "Public can view categories" on public.award_categories for select using (true);
create policy "Admins manage categories" on public.award_categories for all
  to authenticated using (has_role('super_admin'::app_role)) with check (has_role('super_admin'::app_role));

create table public.award_nominees (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.award_categories(id) on delete cascade,
  broker_id uuid,
  title text not null,
  subtitle text default '',
  logo_url text default '',
  vote_count integer not null default 0,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.award_nominees enable row level security;
create policy "Public can view nominees" on public.award_nominees for select using (true);
create policy "Admins manage nominees" on public.award_nominees for all
  to authenticated using (has_role('super_admin'::app_role)) with check (has_role('super_admin'::app_role));

create table public.award_votes (
  id uuid primary key default gen_random_uuid(),
  nominee_id uuid not null references public.award_nominees(id) on delete cascade,
  category_id uuid not null references public.award_categories(id) on delete cascade,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  unique (category_id, user_id)
);
alter table public.award_votes enable row level security;
create policy "Users view own votes" on public.award_votes for select to authenticated using (user_id = auth.uid());
create policy "Users cast votes" on public.award_votes for insert to authenticated with check (user_id = auth.uid());
create policy "Users delete own votes" on public.award_votes for delete to authenticated using (user_id = auth.uid());
create policy "Admins full access votes" on public.award_votes for all
  to authenticated using (has_role('super_admin'::app_role)) with check (has_role('super_admin'::app_role));

create or replace function public.sync_nominee_vote_count()
returns trigger language plpgsql security definer set search_path = public as $$
declare affected uuid;
begin
  if (tg_op = 'DELETE') then affected := old.nominee_id; else affected := new.nominee_id; end if;
  update public.award_nominees
    set vote_count = (select count(*) from public.award_votes where nominee_id = affected)
    where id = affected;
  return coalesce(new, old);
end $$;
create trigger award_votes_sync after insert or delete on public.award_votes
  for each row execute function public.sync_nominee_vote_count();
