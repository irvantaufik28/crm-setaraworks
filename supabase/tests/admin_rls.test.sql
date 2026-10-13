begin;
select plan(12);

select tests.rls_enabled('public', 'users');
select tests.rls_enabled('public', 'leads');
select tests.rls_enabled('public', 'activities');
select tests.rls_enabled('public', 'follow_ups');
select tests.rls_enabled('public', 'proposals');
select tests.rls_enabled('public', 'deals');

set local role anon;
select is_empty($$ select * from public.users $$, 'anon cannot read users');
select is_empty($$ select * from public.leads $$, 'anon cannot read leads');
select is_empty($$ select * from public.activities $$, 'anon cannot read activities');
select is_empty($$ select * from public.follow_ups $$, 'anon cannot read follow ups');
select is_empty($$ select * from public.proposals $$, 'anon cannot read proposals');
select is_empty($$ select * from public.deals $$, 'anon cannot read deals');

select * from finish();
rollback;

