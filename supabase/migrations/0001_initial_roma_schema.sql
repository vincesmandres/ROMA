begin;

create extension if not exists pgcrypto;

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  source text,
  zone text not null,
  text_redacted text not null,
  category text check (category is null or category in ('residuos_contaminacion', 'fuga_agua', 'infraestructura_danada', 'accesibilidad', 'riesgo_comunitario', 'servicios_publicos', 'ambiente_playas', 'otro')),
  priority text check (priority is null or priority in ('baja', 'media', 'alta', 'critica')),
  status text not null default 'pending' check (status in ('pending', 'in_review', 'escalated', 'resolved')),
  summary text,
  risks jsonb,
  recommended_action text,
  whatsapp_message text,
  confidence numeric check (confidence is null or confidence between 0 and 1),
  location_geohash text check (location_geohash is null or location_geohash ~ '^[0-9bcdefghjkmnpqrstuvwxyz]{4,12}$'),
  report_hash text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.report_analysis (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  model text,
  category text check (category is null or category in ('residuos_contaminacion', 'fuga_agua', 'infraestructura_danada', 'accesibilidad', 'riesgo_comunitario', 'servicios_publicos', 'ambiente_playas', 'otro')),
  priority text check (priority is null or priority in ('baja', 'media', 'alta', 'critica')),
  summary text,
  risks jsonb,
  recommended_action text,
  confidence numeric check (confidence is null or confidence between 0 and 1),
  created_at timestamptz not null default now()
);

create table public.briefs (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  title text,
  brief text not null,
  recommended_next_steps jsonb,
  brief_hash text,
  created_by text,
  created_at timestamptz not null default now()
);

create table public.follow_up_events (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  event_type text,
  note text,
  created_by text,
  created_at timestamptz not null default now()
);

create table public.moderator_actions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.reports(id) on delete set null,
  moderator_id text not null,
  action text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table public.whatsapp_identity_vault (
  id uuid primary key default gen_random_uuid(),
  phone_hmac text unique,
  phone_encrypted text,
  retention_expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index reports_status_idx on public.reports(status);
create index reports_priority_idx on public.reports(priority);
create index reports_category_idx on public.reports(category);
create index reports_zone_idx on public.reports(zone);
create index reports_created_at_idx on public.reports(created_at desc);
create index reports_location_geohash_idx on public.reports(location_geohash) where location_geohash is not null;
create index report_analysis_report_id_idx on public.report_analysis(report_id);
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

alter table public.reports enable row level security;
alter table public.report_analysis enable row level security;
alter table public.briefs enable row level security;
alter table public.follow_up_events enable row level security;
alter table public.moderator_actions enable row level security;
alter table public.whatsapp_identity_vault enable row level security;

comment on table public.reports is 'Redacted civic reports. Closed RLS until moderator authentication is integrated.';
comment on table public.whatsapp_identity_vault is 'Isolated encrypted WhatsApp identity data for trusted server-side functions only.';

revoke all on all tables in schema public from anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

commit;
