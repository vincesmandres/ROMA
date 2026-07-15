# ROMA: configuración y operación

## Información del Proyecto

- **Repositorio:** `vincesmandres/ROMA` (GitHub)
- **URL Git:** `https://github.com/vincesmandres/ROMA.git`
- **Proyecto Vercel:** `roma`
- **Proyecto Supabase:** `iflvopghdiamnxkmjacu`

## Estado actual

ROMA usa el proyecto Supabase `iflvopghdiamnxkmjacu` como fuente principal del dashboard. La migración `supabase/migrations/0001_initial_roma_schema.sql` crea `reports`, `report_analysis`, `briefs`, `follow_up_events`, `moderator_actions` y `whatsapp_identity_vault`, junto con sus restricciones e índices.

Todas las tablas tienen Row Level Security habilitado con políticas explícitas de denegación para `anon` y `authenticated`. Hasta incorporar autenticación de moderadores, producción muestra un estado vacío seguro. En desarrollo, los datos demo solo se usan si faltan por completo las variables públicas de Supabase.

## Variables de entorno requeridas

La integración de Supabase en Vercel configura automáticamente:

- `NEXT_PUBLIC_SUPABASE_URL` = `https://iflvopghdiamnxkmjacu.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Supabase genera)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (compatibilidad)

**Debes agregar manualmente en Vercel (Settings → Vars):**

- `OPENAI_API_KEY` ← Desde https://platform.openai.com/api-keys (⚠️ requerida)
- `OPENAI_MODEL=gpt-4o` (opcional, default)

**Futuro (WhatsApp):**

- `WHATSAPP_VERIFY_TOKEN`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_APP_SECRET`

**Futuro (Seguridad):**

- `SUPABASE_SERVICE_ROLE_KEY` (solo servidor, nunca cliente)
- `ENCRYPTION_KEY` (bóveda de identidades)
- `NEXT_PUBLIC_APP_URL` (URL pública)

El navegador nunca accede a `SUPABASE_SERVICE_ROLE_KEY`, claves de OpenAI ni credenciales de Postgres. Estas deben permanecer exclusivamente en servidor o Edge Functions.

Para desarrollo fuera de v0, copia `.env.example` a `.env.local` y completa solo los valores necesarios. Nunca confirmes `.env.local` en Git.

## Modelo de privacidad

- `reports` no almacena nombre, teléfono ni identificadores directos del remitente.
- `whatsapp_identity_vault` mantiene la identidad cifrada y aislada del reporte cívico.
- La ubicación es voluntaria; se admite geohash o coordenadas aproximadas.
- Las clasificaciones de IA son sugerencias y requieren revisión humana.
- ROMA no emite alertas oficiales.

## Tablas Supabase

**Proyecto ID:** `iflvopghdiamnxkmjacu`

- **reports** – Reportes cívicos redactados (sin identificadores directos)
- **report_analysis** – Clasificación IA, riesgos, acciones recomendadas, confianza
- **briefs** – Resúmenes para moderadores y próximos pasos
- **follow_up_events** – Historial: notas, cambios de estado, escalaciones
- **moderator_actions** – Auditoría: quién hizo qué y cuándo
- **whatsapp_identity_vault** – Números cifrados con consentimiento y retención

## Desbloquear acceso de moderadores

El siguiente paso es incorporar Clerk y verificar su JWT en Supabase. Después se deben crear políticas RLS explícitas para el rol de moderador, con privilegios mínimos por operación, y registrar cada acción en `moderator_actions`. No abras políticas públicas temporales para visualizar reportes.

Ejemplo de política futura:
```sql
create policy "moderators_can_read" on reports
  for select to authenticated
  using (auth.jwt() ->> 'role' = 'moderator');
```

## Verificación

Antes de desplegar o fusionar cambios:

1. Ejecuta `npm run lint`.
2. Ejecuta `npm run build`.
3. Comprueba que las variables públicas estén presentes en los tres entornos de Vercel.
4. Revisa los asesores de seguridad y rendimiento de Supabase.
5. Verifica en el navegador la carga, el estado vacío, los filtros y el reintento.

## Integración OpenAI

**API Key requerida:** `OPENAI_API_KEY` desde https://platform.openai.com/api-keys

ROMA usa OpenAI para analizar reportes. El flujo esperado:

1. Ciudadano envía reporte → Se guarda en tabla `reports`
2. Servidor llama a OpenAI con el texto del reporte
3. Respuesta de OpenAI crea fila en `report_analysis` con:
   - `category` – Tipo de issue clasificado
   - `priority` – baja / media / alta / critica
   - `summary` – Descripción generada por IA
   - `risks` – Riesgos identificados (array JSON)
   - `recommended_action` – Acción sugerida
   - `confidence` – Puntuación 0–1

**Modelos soportados:**
- `gpt-4o` (recomendado, más rápido)
- `gpt-4-turbo` (más capaz)

Esta funcionalidad debe residir en una Edge Function o servidor de Supabase, nunca en cliente.

## Próximas integraciones

1. Añadir Clerk y políticas RLS de moderador.
2. Implementar análisis estructurado en Edge Function + OpenAI.
3. Crear webhook de WhatsApp en una Edge Function.
4. Persistir eventos de seguimiento y briefs.
5. Añadir Semaphore para señales anónimas y nullifiers.
6. Reemplazar mapa demo por capa cartográfica real.
