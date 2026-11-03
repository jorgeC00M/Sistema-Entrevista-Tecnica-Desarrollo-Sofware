## Why

«Revisar mi CV» responde dos preguntas distintas:
- **Solo con el CV:** «¿el ATS puede leer mi CV?»
- **Con una convocatoria:** «¿mi CV cubre lo que pide este aviso?»

Hoy no se distinguen:
- **En la entrada,** la convocatoria es un botón de texto plegado al pie de la tarjeta, así que quien no lo ve cree que la pantalla solo revisa el formato.
- **En el resultado,** las dos rutas se ven casi iguales. Lo más importante de la segunda, si cubres el aviso, está en la tercera pestaña.
- **El veredicto** es un «5/8» que no dice si está bien o mal.
- **Los motivos** se dan con palabras («tu CV tiene dos columnas»), sin mostrar lo que el ATS realmente leyó.

Este cambio reabre a propósito la pantalla que `cv-cierre-final` dio por cerrada. No corrige un defecto: rediseña cómo se presentan las dos rutas, con decisiones que el usuario aprobó una por una.

## What Changes

- **Entrada a dos columnas, sin elegir modo:**
  - a la izquierda «Tu CV (obligatorio)»;
  - a la derecha «Convocatoria (opcional)», que explica qué se gana al darla.

  Se quita el plegable y su botón, que queda como código muerto. El botón principal dice «Revisar mi CV» o «Revisar y comparar» según haya o no convocatoria. En el celular, las columnas se apilan.
- **Atajo «Compara con una convocatoria»** en el resultado sin convocatoria: vuelve a la entrada con el CV todavía elegido y el foco en la columna de la convocatoria.
- **Veredicto de legibilidad en palabras,** arriba del espejo del ATS:
  - «El ATS no puede leer tu CV»;
  - «El ATS lee tu CV con pérdidas»;
  - «El ATS lee tu CV completo».

  Sale de reglas sobre los hallazgos que ya existen, nombra la causa principal y no lleva número.
- **«Así ve tu CV el ATS»:** un plegable con el texto plano que se extrajo, con los títulos de sección reconocidos resaltados. Debajo, la lista «Lo que el ATS no ve y por qué»: encabezado, cuadros de texto, dos columnas, tablas, imágenes, habilidades en barras y texto oculto.
  - Endpoint nuevo de solo lectura: `GET /api/curriculums/<id>/texto/`, solo para el dueño (404 para otro usuario).
- **Resumen sin convocatoria:** una tarjeta «Tecnologías por las que te encontrarían», con el inventario actual.
- **Resumen con convocatoria:** un bloque «Frente a este aviso» al principio, con:
  - las palabras clave del aviso en chips de tres estados (✓ demostrado, ◐ solo en habilidades, ✗ no está), separadas en obligatorias y deseables, con ícono y texto además del color;
  - la cobertura, la experiencia y el cargo;
  - la línea «Si el reclutador busca las obligatorias del aviso, aparecerías / no aparecerías: te faltan …».
- **El tipo de revisión tiene nombre:** «Revisión del CV» o «Comparado con convocatoria», igual en la barra de contexto y en el historial.
- **Sigue sin haber puntaje numérico.**

Fuera de alcance:
- las preguntas de filtro de título, idioma y ubicación, y el diccionario ampliado, que van en `filtros-y-diccionario-de-convocatoria`;
- el puesto de referencia sin convocatoria, que se descartó.

## Capabilities

### New Capabilities
<!-- Ninguna. -->

### Modified Capabilities
- `revision-de-cv`: cambian la entrada y la presentación del resultado. Se agregan el veredicto, la vista del texto que lee el ATS y el bloque «Frente a este aviso». No hay spec principal en `openspec/specs/`, así que el delta usa ADDED, igual que los cambios anteriores del módulo.

## Impact

- **Backend (`apps/curriculums/`):**
  - `selectors.py`, `views.py` y `urls.py`, por el endpoint `texto/`;
  - tests en `tests/test_curriculums.py`.

  No hay migración, `VERSION_DE_REGLAS` no cambia y no se llama a la IA.
- **Frontend (`features/curriculum/`):**
  - `EntradaDelAnalisis.tsx`, `ResultadoDelAnalisis.tsx`, `ResumenDelAnalisis.tsx`, `HistorialDeAnalisis.tsx` y `BrechaDeRequisitos.tsx`;
  - `hallazgos.ts` (con su test) y `pages/CurriculumPage.tsx`;
  - componentes nuevos para el veredicto, el texto del ATS y «Frente a este aviso»;
  - `api/curriculums.ts` y `types/curriculum.ts`.
- **Documentación:**
  - `CLAUDE.md`, en la sección del módulo de CV;
  - `openspec/changes/cv-cierre-final/pendientes.md`.
