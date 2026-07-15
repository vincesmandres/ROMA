# ROMA: estado del proyecto

## Base publicada

- Rama estable: `main`.
- Rama de trabajo: `feat/roma-clean-ux`.
- Dashboard Next.js funcionando con datos demo.
- Build y lint verificados.
- Guías UX/UI y handoff para Stitch versionadas.
- Configuración inicial para Vercel, Supabase, OpenAI, WhatsApp y Semaphore documentada.

## Estado funcional actual

```text
[hecho] Dashboard de moderación demo
[hecho] Métricas, tabla, búsqueda y filtro
[hecho] Detalle contextual de reporte
[hecho] Mapa territorial visual demo
[hecho] Responsive y estados vacíos básicos
[hecho] Guías UX/UI y Stitch
[hecho] Migración inicial de datos
[pendiente] Aplicar migración en Supabase
[pendiente] Conectar dashboard a Supabase
[pendiente] Formulario público /reportar
[pendiente] Análisis estructurado con OpenAI
[pendiente] Autenticación de moderadores
[pendiente] Briefs y seguimiento persistente
[pendiente] Webhook de WhatsApp
[pendiente] Ubicación aproximada y mapa real
[pendiente] Semaphore y nullifiers
```

## Próximo corte recomendado

El siguiente incremento debe ser pequeño y verificable:

```text
Supabase schema
→ consulta de reportes
→ dashboard con datos reales
→ loading/error/empty states
→ filtros sobre datos reales
```

No integrar WhatsApp, ZK ni geocodificación antes de tener ese flujo estable.

## Revisión previa a merge

- Confirmar que la migración fue revisada y aplicada en el proyecto correcto.
- Confirmar RLS y rol de moderador.
- Configurar solo variables de entorno en Vercel.
- No versionar `.env.local` ni claves privadas.
- Ejecutar `npm run lint` y `npm run build`.
- Verificar el deployment de preview antes de fusionar a `main`.
