# ROMA: configuración y operación

## Estado actual

ROMA usa el proyecto Supabase conectado como fuente principal del dashboard. La migración `supabase/migrations/0001_initial_roma_schema.sql` crea `reports`, `report_analysis`, `briefs`, `follow_up_events`, `moderator_actions` y `whatsapp_identity_vault`, junto con sus restricciones e índices.

Todas las tablas tienen Row Level Security habilitado y no conceden acceso a `anon` ni `authenticated`. Hasta incorporar autenticación de moderadores, producción muestra un estado vacío seguro. En desarrollo, los datos demo solo se usan si faltan por completo las variables públicas de Supabase.

## Variables de entorno

La integración de Supabase en Vercel configura estas variables para Production, Preview y Development:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (preferida)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (compatibilidad)

El navegador nunca usa `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY` ni credenciales de Postgres. Las claves de OpenAI y WhatsApp también deben permanecer exclusivamente en servidor o Edge Functions.

Para desarrollo fuera de v0, copia `.env.example` a `.env.local` y completa solo los valores necesarios. Nunca confirmes `.env.local` en Git.

## Modelo de privacidad

- `reports` no almacena nombre, teléfono ni identificadores directos del remitente.
- `whatsapp_identity_vault` mantiene la identidad cifrada y aislada del reporte cívico.
- La ubicación es voluntaria; se admite geohash o coordenadas aproximadas.
- Las clasificaciones de IA son sugerencias y requieren revisión humana.
- ROMA no emite alertas oficiales.

## Desbloquear acceso de moderadores

El siguiente paso es incorporar Clerk y verificar su JWT en Supabase. Después se deben crear políticas RLS explícitas para el rol de moderador, con privilegios mínimos por operación, y registrar cada acción en `moderator_actions`. No abras políticas públicas temporales para visualizar reportes.

## Verificación

Antes de desplegar o fusionar cambios:

1. Ejecuta `npm run lint`.
2. Ejecuta `npm run build`.
3. Comprueba que las variables públicas estén presentes en los tres entornos de Vercel.
4. Revisa los asesores de seguridad y rendimiento de Supabase.
5. Verifica en el navegador la carga, el estado vacío, los filtros y el reintento.

## Próximas integraciones

1. Añadir Clerk y políticas RLS de moderador.
2. Implementar análisis estructurado en una función de servidor.
3. Crear el webhook de WhatsApp en una Edge Function.
4. Persistir eventos de seguimiento y briefs.
5. Añadir Semaphore para señales anónimas y nullifiers.
6. Reemplazar el mapa demostrativo por una capa cartográfica real.
