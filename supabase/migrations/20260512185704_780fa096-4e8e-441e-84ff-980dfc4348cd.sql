
create or replace function public.notify_thread_author_on_reply()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  t_user_id uuid;
  t_title text;
  t_slug text;
  replier_name text;
begin
  select user_id, title, slug into t_user_id, t_title, t_slug
  from public.forum_threads where id = new.thread_id;

  -- skip if author replied to own thread or thread missing
  if t_user_id is null or t_user_id = new.user_id then
    return new;
  end if;

  select coalesce(full_name, username, 'Someone') into replier_name
  from public.profiles where user_id = new.user_id;

  insert into public.notifications (user_id, type, title, message, link)
  values (
    t_user_id,
    'forum',
    'New reply on your thread',
    coalesce(replier_name, 'Someone') || ' replied to "' || left(t_title, 80) || '"',
    '/forum/' || t_slug
  );

  return new;
end $$;

drop trigger if exists trg_notify_thread_author on public.forum_replies;
create trigger trg_notify_thread_author
  after insert on public.forum_replies
  for each row execute function public.notify_thread_author_on_reply();
