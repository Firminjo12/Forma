create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  email_confirmed_at timestamptz,
  approval_status text not null default 'pending'
    check (approval_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists email_confirmed_at timestamptz;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "Users can read their own registration status" on public.profiles;
create policy "Users can read their own registration status"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
revoke all on table public.admin_users from anon, authenticated;

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, email_confirmed_at, created_at)
  values (new.id, coalesce(new.email, ''), new.email_confirmed_at, new.created_at)
  on conflict (id) do update
  set email = excluded.email,
      email_confirmed_at = excluded.email_confirmed_at;
  return new;
end;
$$;

drop trigger if exists create_profile_after_signup on auth.users;
create trigger create_profile_after_signup
  after insert or update on auth.users
  for each row execute procedure public.create_profile_for_new_user();

insert into public.profiles (id, email, email_confirmed_at, created_at)
select id, coalesce(email, ''), email_confirmed_at, created_at
from auth.users
on conflict (id) do update
set email = excluded.email,
    email_confirmed_at = excluded.email_confirmed_at;

create or replace function public.get_current_account_state()
returns table (approval_status text, is_admin boolean, email_confirmed boolean)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  return query
  select
    profile.approval_status,
    exists (
      select 1
      from public.admin_users admin
      where admin.user_id = auth.uid()
    ),
    profile.email_confirmed_at is not null
  from public.profiles profile
  where profile.id = auth.uid();
end;
$$;

create or replace function public.list_pending_signups()
returns table (user_id uuid, email text, created_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.admin_users admin
    where admin.user_id = auth.uid()
  ) then
    raise exception 'Administrator access required';
  end if;

  return query
  select profile.id, profile.email, profile.created_at
  from public.profiles profile
  where profile.approval_status = 'pending'
    and profile.email_confirmed_at is not null
  order by profile.created_at asc;
end;
$$;

create or replace function public.review_signup(p_user_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.admin_users admin
    where admin.user_id = auth.uid()
  ) then
    raise exception 'Administrator access required';
  end if;

  if p_status not in ('approved', 'rejected') then
    raise exception 'Invalid registration status';
  end if;

  update public.profiles
  set approval_status = p_status
  where id = p_user_id
    and approval_status = 'pending';

  if not found then
    raise exception 'Pending registration not found';
  end if;
end;
$$;

revoke all on function public.create_profile_for_new_user() from public, anon, authenticated;
revoke all on function public.get_current_account_state() from public, anon;
revoke all on function public.list_pending_signups() from public, anon;
revoke all on function public.review_signup(uuid, text) from public, anon;
grant execute on function public.get_current_account_state() to authenticated;
grant execute on function public.list_pending_signups() to authenticated;
grant execute on function public.review_signup(uuid, text) to authenticated;
