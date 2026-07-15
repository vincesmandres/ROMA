begin;

create extension if not exists pgcrypto;

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique default ('ROMA-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  title text not null check (char_length(title) between 3 and 180),
  description text not null check (char_length(description) between 3 and 5000),
  category text not null check (category in ('waste_pollution', 'water_leak', 'accessibility', 'damaged_infrastructure', 'environment_beaches', 'public_safety', 'other')),
  priority text not null default 'medium' check (priority in ('critical', 'high', 'medium', 'low')),
  status text not null default 'pending' check (status in ('pending', 'in_review', 'escalated', 'resolved')),
  zone text not null check (char_length(zone) between 2 and 120),
  location_geohash text check (location_geohash is null or location_geohash ~ '^[0-9bcdefghjkmnpqrstuvwxyz]{4,12}$'),
  latitude double precision check (latitude is null or latitude between -90 and 90),
  longitude double precision check (longitude is null or longitude between -180 and 180),
  source text not null default 'web' check (source in ('web', 'whatsapp')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.report_analysis (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null unique references public.reports(id) on delete cascade,
  summary text,
  risks text,
  recommended_action text,
  confidence numeric(5,4) check (confidence is null or confidence between 0 and 1),
  model_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.briefs (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 180),
  content text not null check (char_length(content) between 3 and 10000),
  status text not null default 'draft' check (status in ('draft', 'approved', 'archived')),
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.follow_up_events (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  event_type text not null check (event_type in ('note', 'status_change', 'escalation', 'resolution', 'contact_attempt')),
  notes text,
  from_status text check (from_status is null or from_status in ('pending', 'in_review', 'escalated', 'resolved')),
  to_status text check (to_status is null or to_status in ('pending', 'in_review', 'escalated', 'resolved')),
  actor_id text,
  created_at timestamptz not null default now()
);

create table public.moderator_actions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.reports(id) on delete set null,
  moderator_id text not null,
  action text not null check (action in ('view', 'review', 'edit', 'escalate', 'resolve', 'generate_brief', 'export')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.whatsapp_identity_vault (
  id uuid primary key default gen_random_uuid(),
  identity_hash text not null unique,
  encrypted_phone text not null,
  consent_at timestamptz,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reports_status_idx on public.reports(status);
create index reports_priority_idx on public.reports(priority);
create index reports_category_idx on public.reports(category);
create index reports_zone_idx on public.reports(zone);
create index reports_created_at_idx on public.reports(created_at desc);
create index reports_location_geohash_idx on public.reports(location_geohash) where location_geohash is not null;
create index briefs_report_id_idx on public.briefs(report_id);
create index follow_up_events_report_created_idx on public.follow_up_events(report_id, created_at desc);
create index moderator_actions_report_created_idx on public.moderator_actions(report_id, created_at desc);

create or replace function public.set_updated_at()
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

create trigger reports_set_updated_at before update on public.reports for each row execute function public.set_updated_at();
create trigger report_analysis_set_updated_at before update on public.report_analysis for each row execute function public.set_updated_at();
create trigger briefs_set_updated_at before update on public.briefs for each row execute function public.set_updated_at();
create trigger whatsapp_identity_vault_set_updated_at before update on public.whatsapp_identity_vault for each row execute function public.set_updated_at();

alter table public.reports enable row level security;
alter table public.report_analysis enable row level security;
alter table public.briefs enable row level security;
alter table public.follow_up_events enable row level security;
alter table public.moderator_actions enable row level security;
alter table public.whatsapp_identity_vault enable row level security;

comment on table public.reports is 'Civic reports without direct personal identifiers. RLS is closed until moderator authentication is integrated.';
comment on table public.whatsapp_identity_vault is 'Isolated encrypted WhatsApp identity data. Access only from trusted server-side functions.';

revoke all on all tables in schema public from anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

commit;
