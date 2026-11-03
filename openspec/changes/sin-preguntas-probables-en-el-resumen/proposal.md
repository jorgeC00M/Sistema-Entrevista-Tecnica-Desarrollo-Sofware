## Why

Al final del Resumen, debajo de «Practicar la entrevista», hay un desplegable «Preguntas que podrían hacerte (n)», rotulado «Sugerencia de IA». Jorge no lo ve necesario: la práctica real es la entrevista simulada, que tiene su propio plan por puesto, y estas preguntas no la alimentan. Decidió quitarlo solo de la pantalla. El backend sigue recibiendo las preguntas sin mostrarlas, y quitarlas de la IA queda para un cambio aparte, porque toca el prompt y sus copias fijas.

## What Changes

- **Se quita el desplegable** «Preguntas que podrían hacerte (n)» de `PreguntasProbables`.
- **Se mantiene** el botón «Practicar la entrevista», con su puesto sugerido.
- **El aviso de la revisión con IA** («La IA no encontró nada que sugerir para este CV») deja de contar las preguntas. Así no se queda callado cuando la IA solo devolvió preguntas, que ya no se muestran.
- **El componente pasa a llamarse `PracticarLaEntrevista`**, que es lo único que muestra, y se borra el código del desplegable que queda sin uso.

## Capabilities

### New Capabilities
- `revision-de-cv`: el cierre del Resumen sin preguntas probables. Aún no tiene spec principal, así que la delta es ADDED, como en los cambios anteriores.

### Modified Capabilities

## Impact

- **Frontend:** en `features/curriculum/components/`:
  - `PreguntasProbables.tsx` pasa a ser `PracticarLaEntrevista.tsx`;
  - se ajustan `ResumenDelAnalisis.tsx` (el import) y `AvisoDeRevision.tsx` (el conteo).
- **Specs sin archivar:** `correcciones-accionables-y-menos-pestanas` («La práctica de la entrevista cierra el Resumen» describía el desplegable) se ajusta.
- **Documentación:** `CLAUDE.md`.
- **Sin cambios en el backend, el API, el prompt ni el tipo `RevisionIA`.** El campo `preguntas` sigue llegando y se documenta que el frontend no lo muestra.
