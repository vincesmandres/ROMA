begin;

alter table public.reports
  drop constraint if exists reports_source_check;

alter table public.reports
  add constraint reports_source_check
  check (source in ('web', 'whatsapp', 'telegram'));

update public.reports
set source = 'telegram', whatsapp_message = null
where source = 'whatsapp' and whatsapp_message = 'source:telegram';

commit;
