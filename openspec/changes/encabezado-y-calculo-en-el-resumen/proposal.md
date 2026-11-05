## Why

En la «Transcripción» del reporte, cada pregunta abierta repite un bloque largo: los tres niveles en una lista, un «¿Cómo se calcula?» desplegable con los descriptores y «Una respuesta completa cubría». Con cinco preguntas, ese bloque se lee cinco veces y tapa la conversación. Lo que Jorge vio genérico («Definir el concepto con precisión…», 3/4 en todo) es el proveedor de pruebas: `backend/.env` tiene `IA_PROVEEDOR=fake`, que siempre devuelve los mismos niveles y puntos. Con un proveedor real, cada pregunta trae los suyos.

En el encabezado, los datos de la sesión van en una etiqueta encima del título, y el estado y la duración quedan aparte, a la derecha. Jorge los quiere en una sola línea, debajo del título.

## What Changes

- **Encabezado:** «Reporte de evaluación técnica» va primero. Debajo, en una sola línea: «Desarrollador Backend · Java / Spring · Junior · [Finalizada] 0m 37s». Se quita la etiqueta de encima del título y, por decisión de Jorge al aplicar, el número de sesión («Sesión #37»), que no le sirve al usuario. En pantallas angostas, la línea se parte donde haga falta.
- **Transcripción:** cada pregunta muestra la pregunta de la IA y tu respuesta. Debajo va **una línea discreta** con los niveles y su cuenta, por ejemplo «Conocimiento técnico (corrección) 3/4 · Profundidad (completitud) 2/4 · Claridad 3/4 → 100 · (3 + 2 + 3) / 12 = 67», y después las fortalezas, debilidades y sugerencias. Se quitan:
  - la lista de niveles;
  - el «¿Cómo se calcula?» de cada pregunta;
  - «Una respuesta completa cubría», que sigue visible para las 2 respuestas más bajas en «Temas a repasar» del Plan de mejora.
- **Resumen:** «Desglose de la evaluación» gana **un solo** «¿Cómo se calcula?». Muestra la fórmula general (`P = 100 · (n₁ + n₂ + n₃) / 12`) y lo que significa cada nivel de 0 a 4 en cada criterio. Así la nota sigue siendo explicable y se puede recalcular a mano, como promete el perfil de tesis.
- **Se elimina `DesgloseDeNota`**, que queda sin uso.

## Capabilities

### New Capabilities
<!-- Ninguna. -->

### Modified Capabilities
- `reporte-de-entrevista`: no tiene spec principal. La delta agrega la línea del encabezado, la transcripción compacta y el «¿Cómo se calcula?» único en el Resumen. Se ajustan dos deltas sin archivar: la de `reporte-de-entrevista-en-pestanas` (requisito de la Transcripción) y la de `formula-de-puntuacion` (dónde se publica la fórmula).

## Impact

- **Frontend:**
  - `features/resultados/pages/ResultadosPage.tsx`: el encabezado;
  - `PreguntaDeLaTranscripcion.tsx`;
  - `DesgloseDeLaEvaluacion.tsx`;
  - se borra `DesgloseDeNota.tsx`.
- **Specs** de `reporte-de-entrevista-en-pestanas` y `formula-de-puntuacion`.
- **Documentación:** `CLAUDE.md`, y la tabla del contenido del reporte en el perfil de tesis (líneas 1043-1044), que actualiza Jorge.
- Sin cambios en el backend, la API ni la rúbrica.
