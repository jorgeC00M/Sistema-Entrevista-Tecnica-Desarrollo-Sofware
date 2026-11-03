## Why

En el análisis CV + convocatoria, las tres pestañas mezclan dos preguntas distintas: ¿el ATS lee mi CV? y ¿mi CV dice lo que pide la oferta? El Resumen abre con una franja de búsqueda que repite «Match». «Match con la Oferta» junta chips, búsqueda, requisitos del puesto y extras en una sola tarjeta. Y «Plan de Mejora» propone un solo camino por palabra que falta, cuando la persona puede no haberla usado nunca.

## What Changes

Todo lo que sigue se aplica solo al análisis dirigido; el general no cambia.

- **Barra del resultado:** debajo del nombre del archivo, «frente a <cargo>» si el cargo se detectó y, si no, «frente a la convocatoria». La empresa no se mide, así que no se muestra.
- **Resumen:**
  - se quita la franja «si el reclutador busca… / Ver el match»;
  - el panel derecho del banner pone lado a lado «Formato» (igual que en el general) y «Requisitos de la oferta», con una fila «No se detectó [término] obligatorio/deseable» por cada requisito ausente y la nota «“No se detectó” indica que no está escrito en tu CV, no que no lo sepas.». En pantallas angostas se apilan;
  - la dona y el estado siguen midiendo solo los datos extraídos;
  - debajo, el espejo a ancho completo y la práctica. No hay tarjeta de tecnologías.
- **Match con la Oferta:**
  - dos columnas: «Coinciden» (con evidencia, solo en habilidades o sin secciones reconocidas, cada uno con una nota de dónde aparece) y «No detectados en tu CV», con su nota al pie. Primero los obligatorios;
  - debajo, la tarjeta «Lectura general»: un párrafo de la IA con la etiqueta «Generado por IA» y la nota «Este texto solo resume lo detectado arriba…». Nunca concluye si la persona es apta;
  - después, «Requisitos del puesto» con experiencia, cargo y filtros;
  - se quitan la línea de búsqueda del reclutador y «Tienes pero no te lo piden».
- **Plan de Mejora:**
  - «Arreglar el formato», sin casilla;
  - después, «Palabras clave no detectadas» («Dos caminos según tu caso…»), con una sección por término ausente: chip, tipo y, en las deseables, «Prioriza primero las obligatorias». Cada sección tiene dos cajas: «Si ya lo usaste: muéstralo» (cómo y un ejemplo) y «Si aún no: apréndelo» (proyecto, curso o certificación). Las dos cajas aparecen siempre, con la sugerencia de IA o con una pauta fija;
  - sustituye a «Cubrir lo que pide la oferta».
- **Revisión con IA, versión 2:**
  - agrega `lectura` y, por requisito ausente, `muestralo`, `ejemplo` y `aprendelo`;
  - el parser descarta una lectura que juzgue la aptitud o dé un porcentaje;
  - las revisiones anteriores se vuelven a pedir al abrir el análisis.
- **Código muerto:** `BusquedaDelReclutador`, `busquedaDelReclutador` y `CubrirLaOferta`; `FrenteAlAviso` se reduce a `RequisitosDelPuesto`.

## Capabilities

### New Capabilities
- `revision-de-cv`: no tiene spec principal; la delta agrega los requisitos de las tres pestañas del dirigido y de la revisión v2.

### Modified Capabilities
<!-- Ninguna con spec principal: las deltas sin archivar que definían la franja, «Frente a este aviso» y «Cubrir lo que pide la oferta» se ajustan para remitir a este cambio. -->

## Impact

- **Backend:**
  - `integrations/ia/prompts/revisor_cv.py`: entrada `demostrados`, prompt, esquema y parser;
  - `integrations/ia/fake.py`;
  - `apps/curriculums/revision.py`: `version` y `necesita_revision`;
  - los tests de integración y de `curriculums`.
  - Sin migraciones, sin cambios en las reglas medidas y sin cambio de `VERSION_DE_REGLAS`.
- **Frontend:**
  - en `features/curriculum/`: `ResultadoDelAnalisis`, `ResumenDelAnalisis`, `VeredictoDeLegibilidad` y `requisitos.ts`;
  - componentes nuevos: `RequisitosNoDetectados`, `ColumnasDeMatch`, `LecturaGeneral`, `RequisitosDelPuesto` y `PalabrasClaveNoDetectadas`;
  - se borran `BusquedaDelReclutador`, `CubrirLaOferta` y `FrenteAlAviso`;
  - `hooks/useRevisionDelCv.ts` y los tipos.
- **Specs sin archivar que se ajustan:**
  - `pestanas-del-resultado-por-tipo`;
  - `correcciones-accionables-y-menos-pestanas`;
  - `diferenciar-revision-y-comparacion-de-cv`;
  - `plan-de-mejora-sin-casilla-y-con-brechas`.
- **`CLAUDE.md`.**
