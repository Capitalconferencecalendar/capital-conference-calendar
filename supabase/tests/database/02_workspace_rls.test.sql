begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;
select no_plan();

-- The transaction rolls back the two users and all workspace fixtures.
insert into auth.users (id, email) values
  ('00000000-0000-4000-8000-0000000000a1', 'workspace-a@example.test'),
  ('00000000-0000-4000-8000-0000000000b2', 'workspace-b@example.test'),
  ('00000000-0000-4000-8000-0000000000c3', 'workspace-c@example.test');

insert into public.profiles (user_id, display_name) values
  ('00000000-0000-4000-8000-0000000000b2', 'User B');
insert into public.user_schedule (user_id, event_id) values
  ('00000000-0000-4000-8000-0000000000a1', 'rec-schedule-a'),
  ('00000000-0000-4000-8000-0000000000b2', 'rec-schedule-b');
insert into public.lists (id, user_id, name) values
  ('10000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-0000000000a1', 'A list'),
  ('10000000-0000-4000-8000-0000000000b2', '00000000-0000-4000-8000-0000000000b2', 'B list');
insert into public.list_events (list_id, event_id) values
  ('10000000-0000-4000-8000-0000000000a1', 'rec-list-a'),
  ('10000000-0000-4000-8000-0000000000b2', 'rec-list-b');
insert into public.saved_views (id, user_id, name, filters, filter_mode) values
  ('20000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-0000000000a1', 'A view', '{}', 'and'),
  ('20000000-0000-4000-8000-0000000000b2', '00000000-0000-4000-8000-0000000000b2', 'B view', '{}', 'or');

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-0000000000a1';

select lives_ok(
  $$insert into public.profiles (user_id, display_name) values ('00000000-0000-4000-8000-0000000000a1', 'User A')$$,
  'A can create A profile'
);
select is((select count(*) from public.profiles where user_id = '00000000-0000-4000-8000-0000000000a1'), 1::bigint, 'A can read A profile');
select is((select count(*) from public.profiles where user_id = '00000000-0000-4000-8000-0000000000b2'), 0::bigint, 'A cannot read B profile');
select throws_ok(
  $$insert into public.profiles (user_id) values ('00000000-0000-4000-8000-0000000000c3')$$,
  '42501', null, 'A cannot create C profile'
);
select lives_ok(
  $$update public.profiles set display_name = 'A updated', updated_at = '2000-01-01' where user_id = '00000000-0000-4000-8000-0000000000a1'$$,
  'A can update A profile'
);
select is((select updated_at from public.profiles where user_id = '00000000-0000-4000-8000-0000000000a1'), now(), 'Profile timestamp cannot be spoofed');
with affected as (
  update public.profiles set display_name = 'stolen'
  where user_id = '00000000-0000-4000-8000-0000000000b2' returning user_id
)
select is((select count(*) from affected), 0::bigint, 'A cannot update B profile');
select throws_ok(
  $$update public.profiles set user_id = '00000000-0000-4000-8000-0000000000c3' where user_id = '00000000-0000-4000-8000-0000000000a1'$$,
  '42501', null, 'A cannot transfer A profile to C'
);
with affected as (
  delete from public.profiles where user_id = '00000000-0000-4000-8000-0000000000b2' returning user_id
)
select is((select count(*) from affected), 0::bigint, 'A cannot delete B profile');
select lives_ok(
  $$delete from public.profiles where user_id = '00000000-0000-4000-8000-0000000000a1'$$,
  'A can delete A profile'
);

select is((select count(*) from public.user_schedule), 1::bigint, 'A reads only A schedule');
select lives_ok(
  $$insert into public.user_schedule (user_id, event_id) values ('00000000-0000-4000-8000-0000000000a1', 'rec-schedule-a2')$$,
  'A can add to A schedule'
);
select throws_ok(
  $$insert into public.user_schedule (user_id, event_id) values ('00000000-0000-4000-8000-0000000000b2', 'rec-schedule-b2')$$,
  '42501', null, 'A cannot add to B schedule'
);
select throws_ok(
  $$insert into public.user_schedule (user_id, event_id) values ('00000000-0000-4000-8000-0000000000a1', 'rec-schedule-a')$$,
  '23505', null, 'Duplicate schedule event is rejected'
);
select throws_ok(
  $$update public.user_schedule set event_id = 'changed' where user_id = '00000000-0000-4000-8000-0000000000a1'$$,
  '42501', null, 'Schedule UPDATE is not granted'
);
with affected as (
  delete from public.user_schedule where user_id = '00000000-0000-4000-8000-0000000000b2' returning id
)
select is((select count(*) from affected), 0::bigint, 'A cannot delete B schedule event');
select lives_ok(
  $$delete from public.user_schedule where user_id = '00000000-0000-4000-8000-0000000000a1' and event_id = 'rec-schedule-a2'$$,
  'A can remove A schedule event'
);

select is((select count(*) from public.lists), 1::bigint, 'A reads only A lists');
select lives_ok(
  $$insert into public.lists (id, user_id, name) values ('10000000-0000-4000-8000-0000000000a2', '00000000-0000-4000-8000-0000000000a1', 'New A list')$$,
  'A can create A list'
);
select throws_ok(
  $$insert into public.lists (user_id, name) values ('00000000-0000-4000-8000-0000000000b2', 'Unauthorized list')$$,
  '42501', null, 'A cannot create B list'
);
select lives_ok(
  $$update public.lists set name = 'Updated A list', updated_at = '2000-01-01' where id = '10000000-0000-4000-8000-0000000000a2'$$,
  'A can update A list'
);
select is((select updated_at from public.lists where id = '10000000-0000-4000-8000-0000000000a2'), now(), 'List timestamp cannot be spoofed');
with affected as (
  update public.lists set name = 'stolen'
  where id = '10000000-0000-4000-8000-0000000000b2' returning id
)
select is((select count(*) from affected), 0::bigint, 'A cannot update B list');
select throws_ok(
  $$update public.lists set user_id = '00000000-0000-4000-8000-0000000000b2' where id = '10000000-0000-4000-8000-0000000000a2'$$,
  '42501', null, 'A cannot transfer A list to B'
);
with affected as (
  delete from public.lists where id = '10000000-0000-4000-8000-0000000000b2' returning id
)
select is((select count(*) from affected), 0::bigint, 'A cannot delete B list');
select lives_ok(
  $$delete from public.lists where id = '10000000-0000-4000-8000-0000000000a2'$$,
  'A can delete A list'
);

select is((select count(*) from public.list_events), 1::bigint, 'A reads only A list events');
select lives_ok(
  $$insert into public.list_events (list_id, event_id) values ('10000000-0000-4000-8000-0000000000a1', 'rec-list-a2')$$,
  'A can add an event to A list'
);
select throws_ok(
  $$insert into public.list_events (list_id, event_id) values ('10000000-0000-4000-8000-0000000000b2', 'rec-list-b2')$$,
  '42501', null, 'A cannot add an event to B list'
);
select throws_ok(
  $$insert into public.list_events (list_id, event_id) values ('10000000-0000-4000-8000-0000000000a1', 'rec-list-a')$$,
  '23505', null, 'Duplicate list event is rejected'
);
with affected as (
  delete from public.list_events where list_id = '10000000-0000-4000-8000-0000000000b2' returning event_id
)
select is((select count(*) from affected), 0::bigint, 'A cannot delete B list event');
select lives_ok(
  $$delete from public.list_events where list_id = '10000000-0000-4000-8000-0000000000a1' and event_id = 'rec-list-a2'$$,
  'A can remove an event from A list'
);

select is((select count(*) from public.saved_views), 1::bigint, 'A reads only A saved views');
select lives_ok(
  $$insert into public.saved_views (id, user_id, name, filters, filter_mode, search_query, from_date, to_date)
    values ('20000000-0000-4000-8000-0000000000a2', '00000000-0000-4000-8000-0000000000a1', 'New A view', '{}', 'and', 'conference', '2026-10-01', '2026-10-31')$$,
  'A can create A saved view with search and dates'
);
select throws_ok(
  $$insert into public.saved_views (user_id, name, filters, filter_mode)
    values ('00000000-0000-4000-8000-0000000000b2', 'Unauthorized view', '{}', 'and')$$,
  '42501', null, 'A cannot create B saved view'
);
select lives_ok(
  $$update public.saved_views set name = 'Updated A view', filter_mode = 'or', updated_at = '2000-01-01' where id = '20000000-0000-4000-8000-0000000000a2'$$,
  'A can update A saved view'
);
select is((select updated_at from public.saved_views where id = '20000000-0000-4000-8000-0000000000a2'), now(), 'Saved-view timestamp cannot be spoofed');
with affected as (
  update public.saved_views set name = 'stolen'
  where id = '20000000-0000-4000-8000-0000000000b2' returning id
)
select is((select count(*) from affected), 0::bigint, 'A cannot update B saved view');
select throws_ok(
  $$update public.saved_views set user_id = '00000000-0000-4000-8000-0000000000b2' where id = '20000000-0000-4000-8000-0000000000a2'$$,
  '42501', null, 'A cannot transfer A saved view to B'
);
select throws_ok(
  $$insert into public.saved_views (user_id, name, filters, filter_mode)
    values ('00000000-0000-4000-8000-0000000000a1', 'Bad mode', '{}', 'xor')$$,
  '23514', null, 'Invalid filter_mode is rejected'
);
select throws_ok(
  $$insert into public.saved_views (user_id, name, filters, filter_mode, from_date, to_date)
    values ('00000000-0000-4000-8000-0000000000a1', 'Bad dates', '{}', 'and', '2026-10-31', '2026-10-01')$$,
  '23514', null, 'Reversed date range is rejected'
);
with affected as (
  delete from public.saved_views where id = '20000000-0000-4000-8000-0000000000b2' returning id
)
select is((select count(*) from affected), 0::bigint, 'A cannot delete B saved view');
select lives_ok(
  $$delete from public.saved_views where id = '20000000-0000-4000-8000-0000000000a2'$$,
  'A can delete A saved view'
);

select * from finish();
rollback;
