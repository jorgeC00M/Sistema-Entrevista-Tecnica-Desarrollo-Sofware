## Why

En «Revisar mi CV», el tipo de análisis se elige con dos tarjetas-radio (`tipo-de-analisis-en-tarjetas-compactas`). En cambio, «Nueva entrevista» resuelve la misma decisión, con convocatoria o sin ella, con dos pestañas (`Pestanas`). Usar dos controles distintos para la misma idea obliga a aprender dos patrones, y la crítica de la pantalla lo marcó como una inconsistencia.

Además, elegir el tipo cambia todo el formulario de abajo: es un cambio de vista, que es justo para lo que existen las pestañas. Jorge propuso las pestañas y aprobó el boceto con dos decisiones:
- el CV ocupa siempre media fila;
- el historial va fuera de las pestañas.

## What Changes

- **Pestañas en vez de tarjetas.** El tipo de análisis se elige con dos pestañas, «Análisis general» y «Análisis dirigido», con el componente `Pestanas` de «Nueva entrevista»: patrón ARIA *tabs*, flechas, y en el celular el ancho se reparte en dos columnas.
- **El panel de cada pestaña** empieza con su pregunta («¿El ATS lee mi CV?» / «¿Encajo en el aviso?»). Debajo:
  - «Tu CV», siempre en la mitad izquierda;
  - solo en el dirigido, «Convocatoria» a la derecha, a la misma altura;
  - la línea de lo que falta y «Analizar CV».
- **El historial queda debajo, fuera de las pestañas,** igual en ambas y sin filtrar.
- **No cambia:**
  - se entra con «Análisis general» elegido;
  - la convocatoria se conserva al cambiar de pestaña y no se envía en general;
  - «Compara con una convocatoria» lleva a «dirigido» con el foco en la convocatoria.
- **Código muerto:** se borra `EleccionDeTipo.tsx`. `components/ui/estilosDeOpcion.ts` vuelve a tener un solo consumidor (`EleccionDeVia`), así que sus clases vuelven a ese componente y el archivo se borra.

## Capabilities

### New Capabilities
- `revision-de-cv`: el control con el que se elige el tipo de análisis. Aún no tiene spec principal, así que la delta es ADDED, como en los cambios anteriores.

### Modified Capabilities

## Impact

- **Frontend:**
  - `features/curriculum/components/EntradaDelAnalisis.tsx`;
  - `EleccionDeTipo.tsx`, que se borra;
  - `features/curriculum/hallazgos.ts`: la pregunta de cada tipo, junto a `tipoDeRevision`;
  - `features/seleccion/components/EleccionDeVia.tsx`;
  - `components/ui/estilosDeOpcion.ts`, que se borra.
- **Specs:** la delta de `tipo-de-analisis-en-tarjetas-compactas`, sin archivar, pasa a remitir a este cambio.
- **Documentación:** `CLAUDE.md`.
- **Sin cambios** en el backend, el API, `CurriculumPage` ni el historial.
