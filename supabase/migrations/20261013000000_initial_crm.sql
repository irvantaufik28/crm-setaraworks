create extension if not exists pgcrypto;

create type public.user_role as enum ('admin');
create type public.lead_status as enum ('new', 'contacted', 'discussion', 'proposal_sent', 'negotiation', 'won', 'lost');
create type public.lead_source as enum ('threads', 'instagram', 'whatsapp', 'google_maps', 'referral', 'direct_outreach', 'freelance_platform', 'website', 'other');
create type public.activity_type as enum ('whatsapp', 'phone', 'instagram', 'threads', 'email', 'meeting', 'proposal', 'follow_up', 'note', 'status_change');
create type public.follow_up_status as enum ('pending', 'completed', 'missed', 'cancelled');
create type public.proposal_status as enum ('draft', 'sent', 'negotiation', 'accepted', 'rejected');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default 'Admin SetaraWorks',
  role public.user_role not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company_name text,
  phone text,
  whatsapp text,
  email text,
  instagram text,
  website text,
  location text,
  source public.lead_source not null default 'other',
  service_interest text not null,
  budget_min numeric(14, 2) check (budget_min is null or budget_min >= 0),
  budget_max numeric(14, 2) check (budget_max is null or budget_max >= 0),
  estimated_value numeric(14, 2) check (estimated_value is null or estimated_value >= 0),
  status public.lead_status not null default 'new',
  last_contact_at timestamptz,
  next_follow_up_at timestamptz,
  notes text,
  created_by uuid not null references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint valid_budget_range check (budget_min is null or budget_max is null or budget_max >= budget_min)
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  user_id uuid not null references public.users(id),
  type public.activity_type not null,
  note text not null,
  activity_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  assigned_to uuid not null references public.users(id),
  type public.activity_type not null,
  scheduled_at timestamptz not null,
  note text,
  status public.follow_up_status not null default 'pending',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  proposal_number text,
  title text not null,
  value numeric(14, 2) not null check (value >= 0),
  status public.proposal_status not null default 'draft',
  sent_at date,
  valid_until date,
  file_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null unique references public.leads(id) on delete cascade,
  final_value numeric(14, 2) not null check (final_value >= 0),
  closed_at date not null,
  project_name text not null,
  notes text,
  created_at timestamptz not null default now()
);

create index leads_status_idx on public.leads(status) where archived_at is null;
create index leads_source_idx on public.leads(source) where archived_at is null;
create index leads_next_follow_up_idx on public.leads(next_follow_up_at) where archived_at is null;
create index leads_created_at_idx on public.leads(created_at desc);
create index leads_created_by_idx on public.leads(created_by);
create index activities_lead_activity_idx on public.activities(lead_id, activity_at desc);
create index activities_user_idx on public.activities(user_id);
create index follow_ups_status_schedule_idx on public.follow_ups(status, scheduled_at);
create index follow_ups_lead_idx on public.follow_ups(lead_id);
create index follow_ups_assigned_to_idx on public.follow_ups(assigned_to);
create index proposals_lead_idx on public.proposals(lead_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at before update on public.users for each row execute function public.set_updated_at();
create trigger leads_set_updated_at before update on public.leads for each row execute function public.set_updated_at();
create trigger follow_ups_set_updated_at before update on public.follow_ups for each row execute function public.set_updated_at();
create trigger proposals_set_updated_at before update on public.proposals for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(coalesce(new.email, 'Admin'), '@', 1)),
    'admin'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.users
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

alter table public.users enable row level security;
alter table public.leads enable row level security;
alter table public.activities enable row level security;
alter table public.follow_ups enable row level security;
alter table public.proposals enable row level security;
alter table public.deals enable row level security;

revoke all on public.users, public.leads, public.activities, public.follow_ups, public.proposals, public.deals from anon;
grant select, insert, update, delete on public.users, public.leads, public.activities, public.follow_ups, public.proposals, public.deals to authenticated;

create policy "admins manage users" on public.users for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins manage leads" on public.leads for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins manage activities" on public.activities for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins manage follow ups" on public.follow_ups for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins manage proposals" on public.proposals for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins manage deals" on public.deals for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

revoke execute on function public.handle_new_auth_user() from public, anon, authenticated;

