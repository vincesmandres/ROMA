begin;

alter table public.reports
  drop constraint if exists reports_source_check;

alter table public.reports
  add constraint reports_source_check
  check (source in ('web', 'whatsapp', 'telegram'));

commit;
