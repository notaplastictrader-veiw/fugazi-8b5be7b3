-- Voting window controls on categories
alter table public.award_categories
  add column if not exists voting_starts_at timestamptz,
  add column if not exists voting_ends_at timestamptz,
  add column if not exists nominations_open boolean not null default false;

-- One vote per user per category
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'award_votes_user_category_unique'
  ) then
    alter table public.award_votes
      add constraint award_votes_user_category_unique unique (user_id, category_id);
  end if;
end $$;

-- Enforce voting window via trigger
create or replace function public.enforce_voting_window()
returns trigger language plpgsql security definer set search_path = public as $$
declare cat record;
begin
  select voting_starts_at, voting_ends_at, is_active
    into cat from public.award_categories where id = new.category_id;
  if not found or not cat.is_active then
    raise exception 'Category not available for voting';
  end if;
  if cat.voting_starts_at is not null and now() < cat.voting_starts_at then
    raise exception 'Voting has not opened yet';
  end if;
  if cat.voting_ends_at is not null and now() > cat.voting_ends_at then
    raise exception 'Voting has closed for this category';
  end if;
  return new;
end $$;

drop trigger if exists trg_enforce_voting_window on public.award_votes;
create trigger trg_enforce_voting_window
  before insert on public.award_votes
  for each row execute function public.enforce_voting_window();

-- Community nominations
create table if not exists public.award_nominations (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null,
  user_id uuid not null,
  broker_id uuid,
  title text not null,
  subtitle text default '',
  reason text default '',
  status text not null default 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.award_nominations enable row level security;

create policy "Public can view approved nominations" on public.award_nominations
  for select to anon, authenticated using (status = 'approved');
create policy "Users view own nominations" on public.award_nominations
  for select to authenticated using (user_id = auth.uid());
create policy "Users insert own nominations" on public.award_nominations
  for insert to authenticated with check (user_id = auth.uid());
create policy "Admins full access nominations" on public.award_nominations
  for all to authenticated using (has_role('super_admin'::app_role)) with check (has_role('super_admin'::app_role));