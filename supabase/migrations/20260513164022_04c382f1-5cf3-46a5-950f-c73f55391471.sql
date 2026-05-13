create table if not exists public.client_error_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  message text not null,
  stack text default '',
  route text default '',
  user_agent text default '',
  app_version text default '',
  severity text not null default 'error',
  created_at timestamptz not null default now()
);
alter table public.client_error_log enable row level security;
create index if not exists idx_client_error_log_created on public.client_error_log(created_at desc);

create policy "Anyone can log errors" on public.client_error_log
  for insert to anon, authenticated with check (true);
create policy "Admins read errors" on public.client_error_log
  for select to authenticated using (has_role('super_admin'::app_role));
create policy "Admins manage errors" on public.client_error_log
  for all to authenticated using (has_role('super_admin'::app_role)) with check (has_role('super_admin'::app_role));