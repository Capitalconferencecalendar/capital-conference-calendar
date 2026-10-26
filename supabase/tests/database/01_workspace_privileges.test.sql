begin;
set local role postgres;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;
select no_plan();

with workspace_tables(table_name) as (
  values ('profiles'), ('user_schedule'), ('lists'), ('list_events'), ('saved_views')
), operations(privilege) as (
  values ('SELECT'), ('INSERT'), ('UPDATE'), ('DELETE'), ('TRUNCATE'), ('REFERENCES'), ('TRIGGER')
)
select is(
  has_table_privilege('anon', format('public.%I', table_name), privilege),
  false,
  format('anon cannot %s public.%I', privilege, table_name)
)
from workspace_tables cross join operations;

with allowed(table_name, privileges) as (
  values
    ('profiles', array['SELECT', 'INSERT', 'UPDATE', 'DELETE']),
    ('user_schedule', array['SELECT', 'INSERT', 'DELETE']),
    ('lists', array['SELECT', 'INSERT', 'UPDATE', 'DELETE']),
    ('list_events', array['SELECT', 'INSERT', 'DELETE']),
    ('saved_views', array['SELECT', 'INSERT', 'UPDATE', 'DELETE'])
), operations(privilege) as (
  values ('SELECT'), ('INSERT'), ('UPDATE'), ('DELETE'), ('TRUNCATE'), ('REFERENCES'), ('TRIGGER')
)
select is(
  has_table_privilege('authenticated', format('public.%I', table_name), privilege),
  privilege = any(privileges),
  format('authenticated %s on public.%I matches the grant matrix', privilege, table_name)
)
from allowed cross join operations;

-- MAINTAIN is not accepted by has_table_privilege on older PostgreSQL versions.
select ok(
  not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    cross join lateral aclexplode(coalesce(c.relacl, acldefault('r', c.relowner))) acl
    where n.nspname = 'public'
      and c.relname in ('profiles', 'user_schedule', 'lists', 'list_events', 'saved_views')
      and acl.privilege_type = 'MAINTAIN'
      and acl.grantee in (
        0,
        (select oid from pg_roles where rolname = 'anon'),
        (select oid from pg_roles where rolname = 'authenticated')
      )
  ),
  'No anonymous or authenticated MAINTAIN grant exists'
);

select ok(c.relrowsecurity, format('%I has RLS enabled', c.relname))
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('profiles', 'user_schedule', 'lists', 'list_events', 'saved_views');

select is(
  (select count(*) from pg_constraint con
   join pg_class c on c.oid = con.conrelid
   join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public'
     and c.relname in ('profiles', 'user_schedule', 'lists', 'list_events', 'saved_views')
     and con.contype = 'f' and con.confdeltype = 'c'),
  5::bigint,
  'All workspace foreign keys cascade on parent deletion'
);

with required(index_name) as (
  values
    ('profiles_pkey'), ('user_schedule_user_event_unique'),
    ('lists_user_id_idx'), ('list_events_pkey'), ('saved_views_user_id_idx')
)
select ok(
  exists (select 1 from pg_indexes where schemaname = 'public' and indexname = required.index_name),
  format('%I supports an owner or list lookup', index_name)
)
from required;

select is(
  (select count(*) from pg_policies
   where schemaname = 'public'
     and tablename in ('profiles', 'user_schedule', 'lists', 'list_events', 'saved_views')),
  18::bigint,
  'Expected ownership policies exist'
);

select ok(
  roles = array['authenticated']::name[],
  format('%I.%I policy %I targets only authenticated', schemaname, tablename, policyname)
)
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles', 'user_schedule', 'lists', 'list_events', 'saved_views');

select ok(
  not p.prosecdef and p.proconfig && array['search_path=', 'search_path=""'],
  'updated_at trigger uses SECURITY INVOKER and an empty search_path'
)
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'set_user_workspace_updated_at';

select * from finish();
rollback;
