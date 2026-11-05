## Why

Hoy «Revisar mi CV» abre una pantalla donde el usuario primero tiene que elegir entre dos pestañas, «Análisis general» y «Análisis dirigido». Jorge ve que esa entrada no le queda clara al usuario final: desde el menú no se sabe que hay dos herramientas.

Las dos producen resultados distintos:
- el general tiene «Resumen y Formato» y «Plan de Mejora»;
- el dirigido tiene «Resumen», «Match con la Oferta» y «Plan de Mejora».

Por eso son dos destinos y no dos formas de llenar el mismo formulario. Es distinto de «Simular entrevista»: ahí la convocatoria solo rellena los campos y las dos pestañas terminan en la misma entrevista, así que se queda como está.

## What Changes

- **Menú.** «Prepararte» pasa a tener dos entradas, en vez de la única «Revisar mi CV»:
  - **«Analizar CV»**, solo el CV;
  - **«Comparar con oferta»**, CV + convocatoria.
- **Rutas simétricas.** Ninguna se puede confundir con otra:
  - «Analizar CV»: entrada en `/mi-cv/analisis` y resultado en `/mi-cv/analisis/:id`.
  - «Comparar con oferta»: entrada en `/mi-cv/oferta` y resultado en `/mi-cv/oferta/:id`.

  Cada entrada del menú se marca como actual en todo lo que empieza por su dirección.
- **BREAKING (solo URL):** se eliminan `/mi-cv` y `/mi-cv/:id`, sin redirección, como decidió Jorge para no dejar código muerto. Un enlace viejo cae en la ruta comodín: va a `/` y de ahí a `/simular-entrevista`, igual que `/nueva-entrevista`.
- **La entrada pierde las pestañas.** Cada pantalla muestra su par de tarjetas:
  - «Analizar CV»: «Tu CV» y «¿Qué revisamos?»;
  - «Comparar con oferta»: «Tu CV» y «Convocatoria».

  La fila 2/3 – 1/3 y el botón «Analizar CV» no cambian.
- **Historial por tipo.** Cada pantalla muestra solo los análisis de su tipo. Se quita la columna «Tipo de análisis», que repetiría lo mismo en todas las filas, y su «Ver» abre la ruta del tipo.
- **Encabezado.** El título y el `h1` oculto pasan de «Revisar mi CV» a «Analizar CV» o «Comparar con oferta». Cada una tiene su subtítulo.
- **Acciones del resultado:**
  - «Analizar otro» vuelve a la entrada de su tipo;
  - «Compara con una convocatoria» lleva a «Comparar con oferta» con el mismo CV ya elegido y el foco en la convocatoria.

  El archivo y la convocatoria se conservan entre las dos pantallas, porque todo cuelga de `/mi-cv`.
- **No cambian:**
  - el backend, la API, el resultado y sus pestañas;
  - la entrevista;
  - las redirecciones `/progreso` y `/retroalimentacion` (Jorge las dejó fuera de este cambio);
  - la tesis (el perfil no nombra «Revisar mi CV»).

## Capabilities

### New Capabilities
- `cv-en-dos-destinos`: el análisis de CV se ofrece como dos destinos del menú, cada uno con su ruta, su entrada y su historial.

### Modified Capabilities
- (ninguna en specs principales; se anotan las deltas sin archivar `tipo-de-analisis-en-pestanas` y `sidebar-por-etapas`, que describen las pestañas y «Revisar mi CV»)

## Impact

- **Frontend:**
  - `router/index.tsx`;
  - `components/layout/{destinos.ts,titulosDeRuta.ts}`;
  - `components/layout/Sidebar/SidebarNavItem.tsx`;
  - `features/curriculum/pages/CurriculumPage.tsx`;
  - `features/curriculum/components/{EntradaDelAnalisis,HistorialDeAnalisis}.tsx`;
  - `features/curriculum/hallazgos.ts`, que recibe `rutaDelAnalisis` con su test;
  - el comentario de `components/LimiteDeError.tsx`.
- **Documentación:** `CLAUDE.md` (la sección de la pantalla de CV y el sidebar).
- **Backend:** ninguno.
