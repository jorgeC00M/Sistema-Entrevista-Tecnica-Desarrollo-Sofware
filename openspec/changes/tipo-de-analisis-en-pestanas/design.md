## Context

Hoy `EntradaDelAnalisis` pinta `EleccionDeTipo`: dos tarjetas-radio con `clasesDeOpcion`, de `components/ui/estilosDeOpcion.ts`, compartida con `EleccionDeVia`. Debajo pinta una grilla `lg:grid-cols-2` con «Tu CV» y, en el dirigido, «Convocatoria», y al final el botón. `CurriculumPage` guarda `tipo` (`'general'` al entrar) y pinta `HistorialDeAnalisis` debajo de la entrada.

`SeleccionPuestoPage` (líneas 249-261) ya usa `Pestanas` con un único `role="tabpanel"` (`id` = `idPanel`, `aria-labelledby` = `${idBase}-${valor}`) para «Personalizada» / «Con convocatoria».

## Goals / Non-Goals

**Goals:**
- El mismo patrón que «Nueva entrevista» para la misma decisión.
- El CV en el mismo sitio en las dos pestañas.
- Borrar lo que quede sin uso.

**Non-Goals:**
- Cambiar el estado de `CurriculumPage`, `faltaParaAnalizar`, el envío, el historial o el resultado.
- Guardar la pestaña en la URL; «Nueva entrevista» tampoco lo hace.

## Decisions

**D1. Pestañas (`Pestanas`) y no tarjetas.**
- Elegir el tipo cambia el contenido de abajo, así que es un cambio de vista. `Pestanas` documenta justo eso: «Para cambiar de vista. Un interruptor de opciones dentro de un formulario es `ControlSegmentado`».
- Reutilizarlo trae el patrón ARIA *tabs* completo, sin código nuevo.
- `repartir` hace que en el celular las dos pestañas compartan el ancho.

**D2. Un solo `role="tabpanel"`, como en `SeleccionPuestoPage`.**
- El panel contiene la pregunta, la grilla, el error, la línea de lo que falta y el botón.
- Las tarjetas «Tu CV» y «Convocatoria» siguen siendo las mismas, con sus refs (`refZonaDelCv`, `refZonaDeConvocatoria`), así que «Analizar otro» y «Compara con una convocatoria» funcionan sin cambios.

**D3. La pregunta de cada tipo vive en `hallazgos.ts`.**
- `preguntaDelTipo(tipo)` va junto a `tipoDeRevision`, en el único sitio donde se nombra el tipo.
- Antes estaba en `EleccionDeTipo.OPCIONES`, que se borra.

**D4. El historial fuera del panel.**
- Ya se pinta en `CurriculumPage`, después de `EntradaDelAnalisis`, así que no hay nada que mover.
- La columna «Tipo de análisis» distingue las filas, y filtrar por pestaña escondería la evolución del CV.

**D5. Código muerto.**
- Se borran `EleccionDeTipo.tsx` y `estilosDeOpcion.ts`.
- `clasesDeOpcion` vuelve a ser una constante local de `EleccionDeVia`, el único consumidor que queda (como en `tipo-de-analisis-en-combo`).

## Risks / Trade-offs

- **[Riesgo]** Las pestañas se parecen a las del resultado («Resumen» / «Mejorar»). → **Mitigación:** nunca aparecen juntas, porque la entrada (`/mi-cv`) y el resultado (`/mi-cv/:id`) son vistas distintas, y cada lista de pestañas tiene su nombre accesible.
- **[Trade-off]** En «general» queda media fila vacía a la derecha del CV. Se acepta para que el CV no salte al cambiar de pestaña.
