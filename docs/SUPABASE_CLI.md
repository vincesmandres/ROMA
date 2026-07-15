# Supabase por terminal

El CLI queda instalado como dependencia de desarrollo y la estructura local vive en `supabase/`.

## Local

El stack local requiere Docker Desktop, Rancher Desktop o Podman ejecutandose:

```powershell
npm run supabase:start
npm run supabase:reset
npm run supabase:types
npm run supabase:stop
```

## Remoto

```powershell
npx supabase login
npx supabase link --project-ref TU_PROJECT_REF
npx supabase db push --dry-run
npx supabase db push
```

El endpoint `POST /api/reports` valida, redacta y hashea el texto antes de persistirlo. Para escritura protegida usa `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` solo en servidor. Nunca se debe enviar la service role al navegador ni subir `.env.local`.
