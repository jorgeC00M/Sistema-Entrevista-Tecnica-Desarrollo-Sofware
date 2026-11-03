## Why

En «Revisar mi CV» el tipo de análisis se deduce de si la convocatoria tiene texto. El usuario no ve que existen dos análisis distintos hasta que el botón cambia de nombre. Jorge quiere que **elegir el tipo sea el primer gesto**, y que los análisis anteriores se lean como una tabla, como el historial de entrevistas.

Esto reabre la pantalla del CV, que estaba cerrada, con aprobación explícita del usuario, igual que en los cambios anteriores.

## What Changes

- **BREAKING (UI):** la entrada deja de deducir el modo. Hay dos opciones:
  - **«Análisis general»:** ¿el ATS lee mi CV?
  - **«Análisis dirigido»:** ¿encajo en el aviso?

  Al entrar no hay ninguna marcada, y siempre se puede cambiar de una a otra.
- **Disposición:**
  - **Computadora:** a la izquierda, «Tu CV» y, debajo, «Convocatoria» (solo en dirigido); a la derecha, «Tipo de análisis».
  - **Celular:** tipo → CV → convocatoria.
- **Botón «Analizar CV»:** su texto ya no cambia según lo que se cargó. Está apagado hasta que el análisis elegido tiene lo que necesita, y una línea junto al botón dice lo que falta.
- **Convocatoria en «General»:** si se vuelve a «General», la convocatoria cargada se conserva pero no se envía.
- **Nombre del tipo:** se llama «Análisis general» / «Análisis dirigido» en la barra del resultado y en el historial. Antes eran «Revisión del CV» / «Comparado con convocatoria».
- **Historial en tabla:**
  - columnas Fecha · Archivo CV · Tipo de análisis · Estado del CV · Campos leídos · Ver;
  - paginada de a 10;
  - en el celular, cada fila se muestra como tarjeta.
- **«Estado del CV»:** es el veredicto de legibilidad en palabras (Ilegible / Con pérdidas / Completo), nunca un número. La lista del API gana el campo `veredicto`.
- **Código que se elimina:**
  - el modo deducido y el texto doble del botón;
  - la fila-botón del historial y su `onAbrir`;
  - la excepción de estilos que esa fila necesitaba.

## Capabilities

### New Capabilities
- `revision-de-cv`: la entrada con tipo de análisis explícito y el historial de análisis en tabla. La capacidad no tiene spec principal todavía; sus requisitos viven en las deltas de cambios sin archivar, así que esta delta también es ADDED.

### Modified Capabilities

## Impact

- **Frontend:**
  - en `features/curriculum/`: `EntradaDelAnalisis`, `EleccionDeTipo` (nuevo), `HistorialDeAnalisis`, `VeredictoDeLegibilidad`, `ResultadoDelAnalisis`, `CurriculumPage`, `hallazgos.ts` y su test;
  - `features/seleccion/components/EleccionDeVia.tsx` (clases compartidas);
  - `components/ui/estilosDeOpcion.ts` (nuevo);
  - `types/curriculum.ts` y `estilos.test.ts`.
- **Backend:**
  - `apps/curriculums/models.py` (`AnalisisATS.veredicto`);
  - `serializers.py` (`CurriculumListaSerializer.veredicto`);
  - sus tests.
- **API y reglas:** sin migración. `VERSION_DE_REGLAS` no cambia, porque la medición no cambia. `GET /api/curriculums/` agrega un campo y no quita ninguno.
- **Specs:**
  - la delta de `diferenciar-revision-y-comparacion-de-cv`, sin archivar: sus requisitos «sin pedir que se elija una» y «Cada análisis nombra su tipo» se ajustan para no contradecir este cambio;
  - `CLAUDE.md`.
