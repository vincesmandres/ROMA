# ROMA: configuración y siguientes pasos

## Estado actual

El dashboard funciona con datos demo y no necesita credenciales externas. La interfaz ya está preparada para reemplazar el origen local por Supabase.

## Lo que debes conseguir

### 1. Supabase

- Crear un proyecto en Supabase.
- Guardar la URL del proyecto.
- Guardar la publishable key.
- Crear después las tablas `reports`, `report_analysis`, `briefs` y `follow_up_events`.
- Mantener activado Row Level Security en las tablas expuestas.

Supabase será la fuente principal de datos, el almacenamiento de archivos, los eventos en tiempo real y las Edge Functions para webhooks.

### 2. OpenAI

- Crear una API key.
- Elegir el modelo disponible para salida JSON estructurada.
- Definir un límite de gasto para el MVP.

La key debe vivir únicamente en servidor o Edge Functions. Nunca debe exponerse al navegador.

### 3. WhatsApp Cloud API

- Crear una aplicación en Meta for Developers.
- Configurar una cuenta de WhatsApp Business.
- Registrar un número de prueba o producción.
- Obtener `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` y `WHATSAPP_BUSINESS_ACCOUNT_ID`.
- Definir un `WHATSAPP_VERIFY_TOKEN` propio.
- Configurar un webhook HTTPS para mensajes entrantes.

El primer flujo aceptará texto y ubicación compartida voluntariamente. El número del remitente se tratará como dato sensible y se mantendrá separado del reporte público.

### 4. Semaphore

- Crear una estrategia para registrar miembros elegibles del grupo.
- Definir si el grupo será solo de demo o tendrá una autoridad comunitaria real.
- Elegir la red de prueba si se usa anclaje on-chain.
- Guardar únicamente el identificador de grupo en configuración.

Semaphore probará pertenencia y evitará doble señalización; no probará que un reporte sea verdadero ni que la ubicación sea correcta.

### 5. Mapas

- Elegir un proveedor de tiles para producción.
- Configurar una URL de estilo en `NEXT_PUBLIC_MAP_STYLE_URL`.
- Mostrar atribución de OpenStreetMap cuando se use información OSM.
- Usar geocodificación con caché y límites respetuosos.

Para la demo inicial, el mapa mostrado es visual y usa coordenadas de ejemplo. No representa una integración real de ubicación.

## Copiar configuración

```powershell
Copy-Item .env.example .env.local
```

No subas `.env.local` al repositorio.

## Orden de integración

1. Conectar el dashboard a una consulta de Supabase.
2. Añadir políticas RLS y roles de moderador.
3. Implementar análisis de reportes con OpenAI.
4. Crear el webhook de WhatsApp en una Edge Function.
5. Persistir zonas aproximadas y eventos de seguimiento.
6. Añadir Semaphore para señales anónimas y nullifiers.
7. Reemplazar el mapa demo por una capa cartográfica real.
