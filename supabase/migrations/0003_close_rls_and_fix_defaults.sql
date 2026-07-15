begin;

alter table public.reports alter column priority set default 'media';

create policy reports_closed on public.reports for all to anon, authenticated using (false) with check (false);
create policy report_analysis_closed on public.report_analysis for all to anon, authenticated using (false) with check (false);
create policy briefs_closed on public.briefs for all to anon, authenticated using (false) with check (false);
create policy follow_up_events_closed on public.follow_up_events for all to anon, authenticated using (false) with check (false);
create policy moderator_actions_closed on public.moderator_actions for all to anon, authenticated using (false) with check (false);
create policy whatsapp_identity_vault_closed on public.whatsapp_identity_vault for all to anon, authenticated using (false) with check (false);

commit;
