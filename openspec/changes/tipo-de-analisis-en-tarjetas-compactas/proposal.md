## Why

`tipo-de-analisis-en-combo` puso «Tipo de análisis» en un combo (`<select>`) de fila completa. Jorge quiere volver a una selección con forma de tarjeta, que deje ver las dos opciones a la vez sin abrir nada. Esta vez las tarjetas deben ser compactas, ir centradas y lado a lado, y adaptarse al ancho de la pantalla. Aprobó el boceto con dos decisiones:
- en el celular las tarjetas siguen lado a lado;
- no van dentro de una tarjeta contenedora.

## What Changes

- **«Tipo de análisis» pasa a ser dos tarjetas-radio compactas,** centradas y lado a lado en todos los anchos. Solo una puede estar elegida a la vez. Cada tarjeta muestra:
  - icono;
  - nombre («Análisis general» / «Análisis dirigido»);
  - pregunta («¿El ATS lee mi CV?» / «¿Encajo en el aviso?»);
  - un indicador ●/○.
- **Sin caja contenedora:** el título «Tipo de análisis» va centrado sobre las tarjetas, sin otra tarjeta alrededor.
- **No cambia:**
  - «Análisis general» elegido al entrar;
  - «Tu CV» a la izquierda y «Convocatoria» a la derecha (solo en dirigido);
  - el botón «Analizar CV» y la línea de lo que falta;
  - el historial;
  - no hay ayuda bajo el tipo ni «¿Qué es un ATS?».
- **Reutilización:** el estilo de la opción-tarjeta (`clasesDeOpcion`) vuelve a `components/ui/estilosDeOpcion.ts`, compartido por `EleccionDeVia` y `EleccionDeTipo`. `EleccionDeTipo` deja de usar `CampoSelect`.

## Capabilities

### New Capabilities
- `revision-de-cv`: el control con el que se elige el tipo de análisis. La capacidad aún no tiene spec principal, así que la delta es ADDED, como en los cambios anteriores.

### Modified Capabilities

## Impact

- **Frontend:**
  - `features/curriculum/components/{EleccionDeTipo,EntradaDelAnalisis}.tsx`;
  - `features/seleccion/components/EleccionDeVia.tsx`;
  - `components/ui/estilosDeOpcion.ts`, de nuevo.
- **Specs:** la delta de `tipo-de-analisis-en-combo`, sin archivar, remite a este cambio para el control.
- **Documentación:** `CLAUDE.md`.
- **Sin cambios** en el backend, el API, `CurriculumPage` ni el historial.
