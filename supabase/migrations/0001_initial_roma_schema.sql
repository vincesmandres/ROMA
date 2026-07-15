-- ROMA initial schema. Apply through Supabase MCP/CLI after reviewing RLS policies.
-- This migration intentionally keeps citizen identity separate from public reports.

create extension if not exists pgcrypto;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'web_form',
  zone text not null,
  text_redacted text not null,
  category text,
  priority text,
  status text not null default 'pending',
  summary text,
  risks jsonb not null default '[]'::jsonb,
  recommended_action text,
  whatsapp_message text,
  confidence numeric,
  location_geohash text,
  report_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reports_status_check check (status in ('pending', 'in_review', 'escalated', 'resolved')),
  constraint reports_priority_check check (priority is null or priority in ('baja', 'media', 'alta', 'critica')),
  constraint reports_confidence_check check (confidence is null or (confidence >= 0 and confidence <= 1))
);

create table if not exists public.report_analysis (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  model text,
  category text,
  priority text,
  summary text,
  risks jsonb not null default '[]'::jsonb,
  recommended_action text,
  confidence numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.briefs (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  title text,
  brief text not null,
  recommended_next_steps jsonb not null default '[]'::jsonb,
  brief_hash text,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.follow_up_events (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  event_type text not null,
  note text,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.moderator_actions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  moderator_id text not null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.whatsapp_identity_vault (
  id uuid primary key default gen_random_uuid(),
  phone_hmac text unique,
  phone_encrypted text,
  retention_expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists reports_status_idx on public.reports(status);
create index if not exists reports_priority_idx on public.reports(priority);
create index if not exists reports_category_idx on public.reports(category);
create index if not exists reports_zone_idx on public.reports(zone);
create index if not exists reports_created_at_idx on public.reports(created_at desc);
create index if not exists reports_location_geohash_idx on public.reports(location_geohash);
create index if not exists report_analysis_report_id_idx on public.report_analysis(report_id);
create index if not exists briefs_report_id_idx on public.briefs(report_id);
create index if not exists follow_up_events_report_id_idx on public.follow_up_events(report_id);

alter table public.reports enable row level security;
alter table public.report_analysis enable row level security;
alter table public.briefs enable row level security;
alter table public.follow_up_events enable row level security;
alter table public.moderator_actions enable row level security;
alter table public.whatsapp_identity_vault enable row level security;

-- Policies are intentionally not opened to anon/authenticated until Clerk/Supabase
-- moderator identity is configured. Webhooks should use a server-side secret.
