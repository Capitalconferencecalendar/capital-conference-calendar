-- User workspace records reference Airtable event IDs; event data stays in Airtable.
create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  company text,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_schedule (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  event_id text not null check (btrim(event_id) <> ''),
  created_at timestamptz not null default now(),
  constraint user_schedule_user_event_unique unique (user_id, event_id)
);

create table public.lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 120),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.list_events (
  list_id uuid not null references public.lists (id) on delete cascade,
  event_id text not null check (btrim(event_id) <> ''),
  created_at timestamptz not null default now(),
  primary key (list_id, event_id)
);

create table public.saved_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 120),
  filters jsonb not null check (jsonb_typeof(filters) = 'object'),
  search_query text,
  filter_mode text not null check (filter_mode in ('and', 'or')),
  from_date date,
  to_date date,
  event_count integer check (event_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint saved_views_date_order check (from_date is null or to_date is null or from_date <= to_date)
);

-- Primary keys and the schedule uniqueness constraint already cover their owner/list lookups.
create index lists_user_id_idx on public.lists (user_id);
create index saved_views_user_id_idx on public.saved_views (user_id);

create function public.set_user_workspace_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_user_workspace_updated_at();

create trigger lists_updated_at
before update on public.lists
for each row execute function public.set_user_workspace_updated_at();

create trigger saved_views_updated_at
before update on public.saved_views
for each row execute function public.set_user_workspace_updated_at();

alter table public.profiles enable row level security;
alter table public.user_schedule enable row level security;
alter table public.lists enable row level security;
alter table public.list_events enable row level security;
alter table public.saved_views enable row level security;

revoke all on public.profiles, public.user_schedule, public.lists, public.list_events, public.saved_views from public, anon, authenticated;
grant select, insert, update, delete on public.profiles, public.lists, public.saved_views to authenticated;
grant select, insert, delete on public.user_schedule, public.list_events to authenticated;

create policy profiles_select_own on public.profiles
  for select to authenticated using (user_id = (select auth.uid()));
create policy profiles_insert_own on public.profiles
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy profiles_update_own on public.profiles
  for update to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy profiles_delete_own on public.profiles
  for delete to authenticated using (user_id = (select auth.uid()));

create policy user_schedule_select_own on public.user_schedule
  for select to authenticated using (user_id = (select auth.uid()));
create policy user_schedule_insert_own on public.user_schedule
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy user_schedule_delete_own on public.user_schedule
  for delete to authenticated using (user_id = (select auth.uid()));

create policy lists_select_own on public.lists
  for select to authenticated using (user_id = (select auth.uid()));
create policy lists_insert_own on public.lists
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy lists_update_own on public.lists
  for update to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy lists_delete_own on public.lists
  for delete to authenticated using (user_id = (select auth.uid()));

create policy saved_views_select_own on public.saved_views
  for select to authenticated using (user_id = (select auth.uid()));
create policy saved_views_insert_own on public.saved_views
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy saved_views_update_own on public.saved_views
  for update to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy saved_views_delete_own on public.saved_views
  for delete to authenticated using (user_id = (select auth.uid()));

create policy list_events_select_own on public.list_events
  for select to authenticated using (
    exists (
      select 1 from public.lists
      where lists.id = list_events.list_id and lists.user_id = (select auth.uid())
    )
  );
create policy list_events_insert_own on public.list_events
  for insert to authenticated with check (
    exists (
      select 1 from public.lists
      where lists.id = list_events.list_id and lists.user_id = (select auth.uid())
    )
  );
create policy list_events_delete_own on public.list_events
  for delete to authenticated using (
    exists (
      select 1 from public.lists
      where lists.id = list_events.list_id and lists.user_id = (select auth.uid())
    )
  );
