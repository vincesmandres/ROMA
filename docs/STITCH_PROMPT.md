# ROMA: especificación para Stitch

## Cómo usar este documento

Usa primero el prompt maestro para generar la dirección visual y el dashboard. Después trabaja una pantalla por vez. Pide variantes únicamente cuando una decisión visual todavía no esté resuelta.

Stitch debe producir una propuesta visual y un prototipo navegable. La implementación final permanece en Next.js y debe conservar los contratos de datos, privacidad y accesibilidad de ROMA.

## Prompt maestro

```text
Design a responsive web application called ROMA, Red de Observación Manta Anónima, for civic report moderation in Manta, Ecuador.

ROMA is a privacy-first civic intelligence tool, not a social network, chatbot, marketing landing page, or generic analytics dashboard. Its users are trained moderators who review anonymous civic signals, prioritize them, generate action briefs, and track follow-up work.

Design the actual working product, starting with the moderator dashboard as the first screen.

Primary workflow:
1. See the most urgent civic reports.
2. Understand where they are happening.
3. Open one report and review the AI suggestion.
4. Decide the next action.
5. Track the report until resolution.

Required screens:
- Moderator dashboard.
- Report inbox.
- Report detail with AI analysis and human review actions.
- Territorial map with clustered approximate locations.
- Follow-up view with assigned actions and status.

Required dashboard content:
- Four compact metrics: received, needs attention, in follow-up, resolved.
- A prioritized report list with ID, short title, zone, category, priority, status, age, and action.
- A territorial map of Manta with aggregated report markers.
- A compact insight panel showing zones with increased activity.
- A privacy status indicator.

Required report detail content:
- Report ID, short title, zone, source, age, priority, status.
- Redacted report summary.
- Category, risks, AI confidence, recommended action.
- Human review controls.
- Generate brief action.
- Follow-up history.
- Traceability hash.

Visual direction:
- Quiet, operational, credible, and civic.
- Light neutral background, white surfaces, dark blue-gray text.
- Restrained blue as the primary action color.
- Green for resolved or privacy-protected states.
- Amber for attention and red only for critical risk.
- Compact cards, flat page sections, subtle borders, minimal shadows.
- Maximum 8px border radius.
- Dense but readable layout optimized for scanning.
- Use Lucide-style line icons.
- Avoid gradients, glowing effects, oversized hero typography, decorative blobs, excessive rounded cards, and marketing language.

UX rules:
- Every screen has one primary action.
- Priority, status, zone, and age are visible without opening a report.
- AI output is always labeled as a suggestion and shows confidence.
- Human review is required before escalation or resolution.
- Never show phone numbers, exact coordinates, identities, or raw sensitive text.
- Use approximate or aggregated map locations.
- Include loading, empty, error, and permission-denied states.
- Make the interface usable on desktop and mobile.

Do not invent additional product areas, charts, social features, chat interfaces, user profiles, public leaderboards, or unnecessary settings.
Create a coherent design system and use the same tokens, components, spacing, labels, statuses, and priority colors on every screen.
```

## Pantallas a generar en orden

### 1. Dashboard

Debe validar primero la jerarquía completa del producto. No añadir un hero ni una landing page antes de validar la operación del moderador.

### 2. Bandeja de reportes

Debe concentrarse en comparación, filtros y acciones rápidas. La tabla debe poder convertirse en lista en móvil.

### 3. Detalle de reporte

Debe ser el centro de decisión: resumen, riesgo, recomendación, revisión humana y seguimiento.

### 4. Mapa territorial

Debe apoyar la lectura de patrones. Nunca debe revelar la ubicación exacta de un ciudadano.

### 5. Seguimiento

Debe mostrar qué acción está pendiente, quién la tiene asignada, cuándo se actualizó y qué evidencia existe.

## Prompt de refinamiento

```text
Refine the current ROMA screen without adding new product scope.

Improve scanability for a moderator handling civic reports. Make the primary action obvious, reduce decorative UI, strengthen hierarchy between critical, high, medium, and low priority, and keep the report ID, zone, status, and age visible.

Preserve the existing ROMA design system, privacy-first behavior, approximate map locations, human-in-the-loop review, responsive layout, and accessible contrast. Do not add gradients, chat UI, social features, extra charts, or marketing copy.
```

## Criterios para aceptar una propuesta de Stitch

- Se entiende la pantalla en cinco segundos.
- El reporte crítico se distingue sin depender únicamente del color.
- La acción principal está clara.
- El detalle no necesita navegar a otra pantalla para decidir.
- El mapa no domina la operación.
- Los estados de carga, error y vacío están contemplados.
- El diseño puede traducirse a componentes React sin depender de HTML generado como arquitectura final.
- Los tokens de color, espaciado y tipografía pueden copiarse al sistema de estilos de ROMA.
- No aparecen datos personales ni coordenadas exactas.
