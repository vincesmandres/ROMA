begin;

alter table public.reports
  add column if not exists text_redacted text,
  add column if not exists summary text,
  add column if not exists risks jsonb,
  add column if not exists recommended_action text,
  add column if not exists whatsapp_message text,
  add column if not exists confidence numeric,
  add column if not exists report_hash text;

alter table public.reports alter column text_redacted set not null;
alter table public.reports drop constraint if exists reports_category_check;
alter table public.reports drop constraint if exists reports_priority_check;
alter table public.reports add constraint reports_category_check check (category is null or category in ('residuos_contaminacion', 'fuga_agua', 'infraestructura_danada', 'accesibilidad', 'riesgo_comunitario', 'servicios_publicos', 'ambiente_playas', 'otro'));
alter table public.reports add constraint reports_priority_check check (priority is null or priority in ('baja', 'media', 'alta', 'critica'));
alter table public.reports add constraint reports_confidence_check check (confidence is null or confidence between 0 and 1);
create unique index if not exists reports_report_hash_idx on public.reports(report_hash) where report_hash is not null;

alter table public.report_analysis rename column model_name to model;
alter table public.report_analysis add column if not exists category text;
alter table public.report_analysis add column if not exists priority text;
alter table public.report_analysis alter column risks type jsonb using case when risks is null then null else to_jsonb(risks) end;
alter table public.report_analysis add constraint report_analysis_category_check check (category is null or category in ('residuos_contaminacion', 'fuga_agua', 'infraestructura_danada', 'accesibilidad', 'riesgo_comunitario', 'servicios_publicos', 'ambiente_playas', 'otro'));
alter table public.report_analysis add constraint report_analysis_priority_check check (priority is null or priority in ('baja', 'media', 'alta', 'critica'));
create index if not exists report_analysis_report_id_idx on public.report_analysis(report_id);

alter table public.briefs rename column content to brief;
alter table public.briefs add column if not exists recommended_next_steps jsonb;
alter table public.briefs add column if not exists brief_hash text;

alter table public.follow_up_events rename column notes to note;
alter table public.follow_up_events rename column actor_id to created_by;

alter table public.whatsapp_identity_vault rename column identity_hash to phone_hmac;
alter table public.whatsapp_identity_vault rename column encrypted_phone to phone_encrypted;
alter table public.whatsapp_identity_vault add column if not exists retention_expires_at timestamptz;

comment on table public.reports is 'Redacted civic reports. Closed RLS until moderator authentication is integrated.';
comment on table public.whatsapp_identity_vault is 'Isolated encrypted WhatsApp identity data for trusted server-side functions only.';

commit;
