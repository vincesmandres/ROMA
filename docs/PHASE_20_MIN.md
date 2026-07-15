# Fase actual y corte rapido

## Fase actual

ROMA esta en la fase de MVP tecnico conectado parcialmente:

- Interfaz principal, reportes publicos, seguimiento y detalle: listos.
- Validacion, redaccion y hash de reportes: listos.
- CLI, migracion y seed de Supabase: listos en el repositorio.
- Persistencia remota y dashboard con datos reales: pendientes de credenciales.
- OpenAI, WhatsApp, mapas reales y Semaphore: fases posteriores.

## Objetivo de los proximos 20 minutos

1. Completar `.env.local` con URL, publishable key y service role de Supabase.
2. Ejecutar `npx supabase login`.
3. Enlazar el proyecto: `npx supabase link --project-ref TU_PROJECT_REF`.
4. Revisar y aplicar: `npx supabase db push --dry-run` y luego `npx supabase db push`.
5. Probar `POST /api/reports` y revisar el reporte en la tabla `reports`.
6. Agregar `OPENAI_API_KEY` solo despues de confirmar que la persistencia funciona.

## Fuera del corte

WhatsApp, OpenStreetMap, Semaphore, autenticacion, briefs persistentes y despliegue final requieren configuracion y pruebas propias. Intentar cerrarlos ahora aumentaria el riesgo sin mejorar el primer flujo verificable.
