## Context

- **`CurriculumPage`** sirve hoy `/mi-cv` y `/mi-cv/:id`. Guarda `tipo` (`'general' | 'dirigido'`) en el estado y se lo pasa a `EntradaDelAnalisis`, que lo pinta como `Pestanas` sobre un `role="tabpanel"`.
- **`HistorialDeAnalisis`** muestra todos los análisis, con una columna «Tipo de análisis» que lee `con_convocatoria`.
- **El menú** (`destinos.ts`) tiene un solo destino, `/mi-cv` «Revisar mi CV». `SidebarNavItem` usa `NavLink` con `end`, así que hoy en `/mi-cv/:id` no se marca ningún destino.
- **`LimiteDeError`** agrupa todo lo que empieza por `/mi-cv` (`SECCIONES_CON_ESTADO_COMPARTIDO`), así que la página no se vuelve a montar entre esas rutas y el archivo elegido sobrevive.
- **Tanto `Curriculum` como `CurriculumEnLista`** traen `con_convocatoria`. El backend decide el tipo solo por si se envía la convocatoria.

## Goals / Non-Goals

**Goals:**
- dos destinos claros desde el menú;
- rutas que no se confundan entre sí;
- una entrada sin decisión previa;
- el historial por tipo;
- no perder el CV al pasar de uno a otro;
- no dejar rutas sin uso.

**Non-Goals:**
- cambiar el backend o la API;
- tocar el resultado y sus pestañas;
- tocar «Simular entrevista»;
- quitar `/progreso` o `/retroalimentacion` (Jorge las dejó fuera);
- agregar un filtro de historial que el usuario maneje.

## Decisions

- **Rutas simétricas** (en `router/index.tsx`, todas con `CurriculumPage`):
  - `/mi-cv/analisis`
  - `/mi-cv/analisis/:id`
  - `/mi-cv/oferta`
  - `/mi-cv/oferta/:id`

  Ningún segmento fijo ocupa el lugar de un `:id`, así que no importa el orden en el router, en los títulos ni en el menú. Se descartó `/mi-cv` + `/mi-cv/oferta`, porque `oferta` encajaba en `/mi-cv/:id` y obligaba a cuidar el orden en tres sitios.
- **Sin rutas viejas.** `/mi-cv` y `/mi-cv/:id` se quitan del router sin redirección. Así lo decidió Jorge, con el mismo criterio que `/nueva-entrevista`: con todos los enlaces internos cambiados, serían código muerto. Un enlace viejo cae en `path="*"` → `/` → `EntradaRaiz` → `/simular-entrevista`.
- **El tipo se deriva de la ruta y deja de ser estado.** `CurriculumPage` lee `const tipo = matchPath('/mi-cv/oferta/*', pathname) ? 'dirigido' : 'general'`. `setTipo` desaparece; para cambiar de tipo se navega. `TipoDeAnalisis` y `puedeAnalizar(tipo, …)` no cambian.
- **Helper puro `rutaDelAnalisis(conConvocatoria, id?)`** en `hallazgos.ts`, con test de Vitest:
  - devuelve `/mi-cv/analisis`, `/mi-cv/analisis/<id>`, `/mi-cv/oferta` o `/mi-cv/oferta/<id>`;
  - lo usan el `navigate` tras analizar, el «Ver» del historial, `volverA` y la corrección por tipo;
  - es la única fuente de la forma de la URL.
- **Corrección por tipo.** Solo ocurre si se escribe a mano un id en la ruta del otro tipo. Cuando el análisis cargado (`visible`) no coincide con `tipo`, se navega a la ruta correcta con `replace`. Va en un efecto que solo navega, sin `setState`, para no sumar advertencias de lint.
- **Menú por prefijo.**
  - `Destino` gana `prefijo?: boolean`, y `SidebarNavItem` pasa `end={!destino.prefijo}` a `NavLink`.
  - `destinos.ts`:
    - `{ ruta: '/mi-cv/analisis', etiqueta: 'Analizar CV', icono: 'resultados', prefijo: true }`;
    - `{ ruta: '/mi-cv/oferta', etiqueta: 'Comparar con oferta', icono: 'documento', prefijo: true }`.

  Con prefijo, `NavLink` marca la entrada y todos sus resultados, y los dos prefijos no se solapan. Los demás destinos siguen con `end`.
- **Encabezado.** En `titulosDeRuta.ts` se reemplazan las dos entradas de `/mi-cv` por:
  - `/mi-cv/oferta/*`: «Comparar con oferta», con el subtítulo «Cómo encaja tu currículum en una convocatoria»;
  - `/mi-cv/analisis/*`: «Analizar CV», con el subtítulo «Qué lee un ATS de tu currículum».

  El `h1` `sr-only` de `CurriculumPage` usa el mismo texto según `tipo`.
- **`EntradaDelAnalisis`.**
  - Se quitan `Pestanas`, el `role="tabpanel"`, `TIPOS`, `onTipo` y los `useId`.
  - El contenido queda en un `div` con la misma fila `lg:grid-cols-[2fr_1fr]`.
  - Recibe `tipo` como prop de solo lectura para elegir la tarjeta derecha.
  - Su docstring se reescribe.
- **`HistorialDeAnalisis`.**
  - Recibe `tipo` y filtra con `fila.con_convocatoria === (tipo === 'dirigido')` antes de paginar.
  - Se quitan la columna `tipo`, el componente `Tipo` y su uso en `TarjetaDeAnalisis`, junto con los imports que queden sin uso.
  - «Ver» usa `rutaDelAnalisis`.
- **Acciones del resultado.**
  - `volverA(ruta, zona)` recibe la ruta.
  - «Analizar otro» y «Subir otro» van a `rutaDelAnalisis(visible.con_convocatoria)`.
  - «Compara con una convocatoria» va a `rutaDelAnalisis(true)` con el foco en la convocatoria.
- **Lo que se conserva:** `archivo`, `convocatoria` y `archivoConvocatoria` siguen en el estado de `CurriculumPage`. `SECCIONES_CON_ESTADO_COMPARTIDO = ['/mi-cv']` cubre los dos prefijos, así que cambiar de destino conserva el archivo. Solo se actualiza su comentario.

## Risks / Trade-offs

- **[Un marcador viejo `/mi-cv` o `/mi-cv/<id>` deja de abrir el análisis]** → Es lo que Jorge eligió. El usuario llega a la app y encuentra el análisis en el historial de su destino.
- **[El usuario esperaba ver todos sus análisis juntos]** → Cada pantalla muestra los suyos. Si alguno queda vacío, el historial no se pinta, igual que hoy.
- **[Un enlace interno olvidado a `/mi-cv`]** → Un `grep` final de `'/mi-cv'` y `` `/mi-cv/ `` en `frontend/src`: solo deben quedar `rutaDelAnalisis`, el router, `destinos.ts`, `titulosDeRuta.ts` y `LimiteDeError`.
- **[La tesis]** → El perfil no nombra «Revisar mi CV» ni las pestañas de tipo. Si en otra parte se describe esa pantalla, Jorge lo revisa.

## Migration Plan

No hay migración de datos. Para revertir se restauran `/mi-cv`, `/mi-cv/:id`, las pestañas de entrada y el destino único.
