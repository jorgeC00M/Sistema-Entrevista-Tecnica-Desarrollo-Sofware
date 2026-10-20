## Why

"Revisar mi CV" lleva tres críticas y tres cambios (`cv-en-pasos-y-pestanas`, `cv-critica-p1`, `cv-critica-2`). La puntuación pasó de 25 a 24 y luego a 28/40, pero cada pasada encontró pendientes nuevos y el ciclo no cerraba. El usuario pide **una solución final**.

Este cambio corrige **todo** lo que dejó abierta la tercera crítica (el P1, los cuatro P2 y las observaciones menores), en un solo paquete y sin abrir decisiones nuevas. Además fija un **criterio de terminado**: una vez cumplido, la pantalla se da por cerrada y solo se vuelve a tocar por un fallo real (P0/P1), no por pulido.

## What Changes

- **"Mejorar" empieza por las correcciones** (P1).
  - El espejo del ATS queda solo en el Resumen, con su párrafo explicativo; deja de repetirse.
  - Cada una de las tres correcciones principales del Resumen enlaza a la suya en "Mejorar".
- **Conteo honesto** (P2): la pestaña se llama "Mejorar", sin número. Dentro del panel, una línea separa "n correcciones medidas" de "m sugerencias de IA". Nada crece solo ni mezcla lo medido con lo sugerido.
- **Robustez** (P2):
  - **Subida:** estado "Leyendo tu CV…" anunciado mientras se analiza, y el error junto al botón que lo causó, no arriba de la página.
  - **Tiempo agotado o fallo de red:** mensaje propio ("puede que ya esté en tus análisis anteriores") y se refresca el historial.
  - **Historial:** abrir un análisis muestra un estado de carga.
  - **Recarga:** nueva ruta **`/mi-cv/:id`**; recargar o compartir la URL abre el mismo análisis.
  - **CV ilegible:** el botón pasa a ser "Subir otro archivo" y limpia el archivo elegido.
- **Jerarquía y color** (P2):
  - **Títulos:** los de tarjeta principal usan el mismo papel (`headline-md`, Fraunces); "Tus análisis anteriores" baja a secundario; la lista de correcciones tiene un título real.
  - **Color:** se quita el borde ámbar decorativo, y el icono de cada corrección toma el color de su severidad.
  - **Rótulo:** se quita "Antes de la entrevista", que va encima del `h1`.
- **Accesibilidad:**
  - el espejo vuelve a ser una lista de definición válida;
  - la convocatoria sin requisitos deja de usar `role="alert"`;
  - la zona de arrastre se liga a su límite y a su error;
  - el foco del resultado anuncia también los campos que lee el ATS.
- **Pestañas en móvil** (P2): por debajo de 640 px, cuatro columnas iguales siempre visibles, y la fila de pestañas se queda fija bajo la cabecera.
- **Menores:**
  - el plural sobrante del historial;
  - "campos" junto al "5/8" del historial;
  - la instrucción de la convocatoria pasa de solo placeholder a texto visible;
  - un aviso cuando la IA responde sin sugerencias;
  - la zona de arrastre muestra solo el archivo cuando ya hay uno;
  - "Arrastra" no aparece en pantallas táctiles;
  - "Para la entrevista" usa `Tarjeta` como el resto;
  - las viñetas salen del título del espejo del ATS (no son un filtro ATS);
  - un ejemplo de viñeta de proyecto o tesis además del laboral.
- **Criterio de terminado** en `design.md` (D8), con la última crítica de verificación.

## Capabilities

### New Capabilities
- `cv-cierre-final`: el estado terminado de la pantalla "Revisar mi CV".

### Modified Capabilities
- Ninguna archivada. Ajusta lo que fijaron los cambios sin archivar `cv-en-pasos-y-pestanas`, `cv-critica-p1` y `cv-critica-2`: la pestaña "Mejorar", el conteo y el panel del CV ilegible. Se archiva el último de los cuatro.

## Impact

- **Frontend:**
  - `router/index.tsx` y `components/layout/titulosDeRuta.ts`, por la ruta `/mi-cv/:id`;
  - todo `features/curriculum/` (página, componentes, `hallazgos.ts`);
  - `components/ui/Pestanas.tsx`, con una variante de reparto en columnas.
- **Backend:** sin cambios. `GET /api/curriculums/<id>/` ya existe y responde 404 a lo ajeno.
- **Documentación:** `CLAUDE.md`, en la sección de la pantalla del CV.
