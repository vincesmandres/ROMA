-- Minimal local fixture for testing the dashboard without production data.
-- Run with: npm run supabase:reset

insert into public.reports (
  source, zone, text_redacted, category, priority, status, summary, risks,
  recommended_action, confidence, location_geohash, report_hash
)
values (
  'web_form',
  'Centro de Manta',
  'Fuga visible en calle 13',
  'fuga_agua',
  'critica',
  'escalated',
  'Perdida constante de agua sobre la calzada.',
  '["Desperdicio de agua", "Dano de infraestructura"]'::jsonb,
  'Validar la fuga y derivar a la empresa de agua.',
  0.92,
  'demo-centro-manta',
  'demo-seed-roma-0247'
)
on conflict do nothing;
