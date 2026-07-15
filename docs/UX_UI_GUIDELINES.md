# ROMA: guía de UX/UI

## Objetivo

ROMA debe ayudar a un moderador a responder tres preguntas en pocos segundos:

1. ¿Qué está ocurriendo?
2. ¿Qué necesita atención primero?
3. ¿Qué acción sigue?

La interfaz no debe parecer una red social, un chatbot ni un panel técnico. Debe sentirse como una herramienta de operación cívica: clara, sobria y rápida de escanear.

## Principios de producto

### 1. Reducir antes de añadir

Cada pantalla debe tener una acción principal. Si un dato no ayuda a decidir, revisar o dar seguimiento, no debe ocupar espacio visible.

### 2. Prioridad visible

La prioridad, el estado, la zona y la antigüedad del reporte deben verse sin abrir el detalle.

### 3. Una fuente de verdad

El reporte es el objeto principal. El análisis de IA, el brief y el seguimiento deben estar relacionados con ese reporte, no vivir como funciones aisladas.

### 4. IA como apoyo

La IA recomienda. La persona moderadora decide. Toda salida de IA debe mostrar confianza, contexto y una acción para revisar o corregir.

### 5. Privacidad por defecto

Nunca mostrar teléfono, identidad, coordenadas exactas ni texto sensible en superficies públicas. La ubicación pública debe ser aproximada o agregada.

### 6. Estado siempre explicable

Cada estado debe responder qué ocurrió y qué puede hacer la persona después.

## Arquitectura de información mínima

### Navegación principal

Mantener únicamente estas áreas:

- **Resumen:** métricas, alertas y señales recientes.
- **Reportes:** bandeja de moderación.
- **Mapa:** distribución territorial.
- **Seguimiento:** acciones, responsables y casos abiertos.

Las comunidades, automatizaciones, analítica avanzada y configuración deben permanecer secundarias hasta que exista una necesidad real.

### Flujo principal

```txt
Entrada
→ clasificación
→ revisión
→ acción
→ seguimiento
→ resolución
```

No crear una pantalla nueva si el flujo puede resolverse dentro del detalle del reporte.

## Dashboard

El dashboard debe priorizar:

1. Reportes críticos y de alta prioridad.
2. Reportes sin revisión.
3. Casos que llevan más tiempo abiertos.
4. Zonas con concentración de señales.
5. Acciones pendientes del moderador.

Las métricas deben ser pocas y accionables:

- total recibido;
- requiere atención;
- en seguimiento;
- resuelto.

Evitar métricas decorativas como crecimiento, porcentajes o actividad si no llevan a una decisión.

## Tabla de reportes

Columnas recomendadas:

- ID;
- título corto;
- zona;
- categoría;
- prioridad;
- estado;
- antigüedad;
- acción.

El título debe ser una síntesis, no el texto completo del reporte. El texto completo y los datos técnicos viven en el detalle.

## Detalle del reporte

El detalle debe concentrar:

- título y zona;
- prioridad y estado;
- resumen redactado;
- categoría;
- riesgos;
- confianza de IA;
- acción recomendada;
- historial de seguimiento;
- generar brief;
- cambiar estado;
- hash de trazabilidad.

La acción principal debe ser siempre evidente. No presentar cinco botones con igual peso visual.

## Mapa

El mapa es una herramienta de lectura, no el centro absoluto del producto.

Debe permitir:

- filtrar por prioridad;
- filtrar por categoría;
- filtrar por fecha;
- seleccionar una zona;
- abrir el reporte asociado;
- mostrar agrupaciones cuando haya muchos puntos.

Debe evitar:

- coordenadas exactas públicas;
- mapas saturados de marcadores;
- colores sin significado;
- animaciones permanentes;
- depender del mapa para entender el reporte.

## Estados de interfaz

Cada consulta o acción debe tener:

- carga;
- éxito;
- error recuperable;
- lista vacía;
- permiso insuficiente;
- datos demo, cuando aplique.

El estado demo debe ser visible para el equipo, pero no debe parecer un reporte ciudadano real.

## Sistema visual

### Color

Usar una base clara y neutral:

- fondo: gris muy claro;
- superficies: blanco;
- texto: azul grisáceo oscuro;
- acción primaria: azul sobrio;
- éxito: verde;
- advertencia: ámbar;
- crítico: rojo reservado.

El color rojo debe indicar riesgo o prioridad, no decorar.

### Tipografía

- títulos de página: 24-28 px;
- títulos de panel: 14-16 px;
- texto operativo: 11-13 px;
- etiquetas auxiliares: 9-10 px;
- interlineado cómodo;
- no usar texto en mayúsculas salvo etiquetas pequeñas.

### Espaciado

Usar una escala consistente de 4, 8, 12, 16, 24 y 32 px. Las tarjetas no deben estar anidadas dentro de otras tarjetas salvo que exista una relación funcional clara.

### Componentes

- botones con iconos Lucide cuando exista un icono conocido;
- tooltips para iconos no evidentes;
- estados como pills compactos;
- bordes suaves y esquinas de máximo 8 px;
- sombras mínimas;
- tablas para comparar muchos reportes;
- paneles laterales para detalle contextual.

## Responsive

En móvil:

- la navegación se convierte en menú;
- las métricas pasan a dos columnas;
- el detalle se convierte en pantalla completa o panel inferior;
- la tabla puede transformarse en lista de reportes;
- los botones principales permanecen accesibles;
- ningún texto debe desbordar ni solaparse.

## Accesibilidad

- contraste suficiente;
- controles con etiquetas accesibles;
- foco visible;
- navegación por teclado;
- no depender únicamente del color;
- mensajes de error claros;
- botones con tamaño táctil razonable;
- mapa acompañado siempre por una lista alternativa.

## Criterio de reducción

Antes de añadir una vista, componente o métrica, responder:

1. ¿Qué decisión permite tomar?
2. ¿Qué usuario la necesita?
3. ¿Con qué frecuencia se usa?
4. ¿Puede resolverse en una pantalla existente?
5. ¿Qué información sustituye o elimina?

Si no tiene una respuesta clara, debe esperar.

## Definition of Done para UX/UI

Una pantalla está lista cuando:

- se entiende su propósito en cinco segundos;
- tiene una acción principal clara;
- muestra carga, error y vacío;
- funciona con datos reales y demo;
- no expone datos sensibles;
- funciona en escritorio y móvil;
- no depende de texto de ayuda para explicar controles básicos;
- permite volver al flujo principal sin perder contexto.
