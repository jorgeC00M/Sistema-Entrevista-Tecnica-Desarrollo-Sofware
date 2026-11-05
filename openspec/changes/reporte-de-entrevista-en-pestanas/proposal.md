## Why

El reporte de una entrevista (`/entrevista/:id/resultados`, al que lleva el «Ver» de «Historial y progreso») es una sola columna larga: la nota con sus criterios y la prioridad, y después las cinco preguntas una tras otra, cada una con su respuesta, niveles, puntos clave, fortalezas, debilidades y sugerencias. Todo está a la misma altura, así que no queda claro qué leer primero ni qué hacer después. Tampoco hay ningún texto que resuma la entrevista en palabras.

## What Changes

- **El reporte tiene un encabezado y tres pestañas**: «Resumen», «Plan de mejora» y «Transcripción».
- **Encabezado:** «Ver historial», sesión, puesto · tecnología · nivel, estado y duración.
- **Resumen:**
  - la puntuación global con su banda («75/100 · Aceptable») y la diferencia con la entrevista anterior;
  - a su lado, el **«Veredicto de la IA»**, un párrafo de 2-3 líneas;
  - debajo, el **«Desglose de la evaluación»**: los **3 criterios de siempre** con nombres más claros («Conocimiento técnico (corrección)», «Profundidad (completitud)», «Claridad») en barras de nivel sobre 4;
  - al pie, **Fortalezas** y **Debilidades**, 2 de cada una, en dos columnas.
- **Plan de mejora**, titulado «Tareas para tu próxima entrevista», con tres bloques:
  - **Temas a repasar:** las 2 respuestas más bajas, con su área y lo que debía cubrir una respuesta completa;
  - **Cómo mejorar tu comunicación:** un consejo según el criterio más débil;
  - **Práctica recomendada:** el mismo puesto y nivel, o el nivel siguiente si la banda es «Sólido», con «Practicar».
- **Transcripción:** un acordeón por pregunta, con el título «Pregunta N: Tema (Puntaje: X/100)». Al abrirlo se ve en formato de chat la pregunta de la IA, tu respuesta y el «Análisis IA»: niveles, «¿Cómo se calcula?», lo que debía cubrir, fortalezas, debilidades y sugerencias.
- **Nueva llamada final a la IA, que solo redacta el veredicto.**
  - Ocurre dentro del último «Enviar», después de cerrar la entrevista y fuera de su transacción. Recibe las evaluaciones ya guardadas, no las respuestas.
  - **Nunca cambia la nota.** Se guarda una sola vez y el código descarta el texto si da una nota o un porcentaje, o si concluye aptitud.
  - Si falla, la entrevista se cierra igual y el reporte muestra un párrafo armado con reglas, con «Reintentar».
  - Un endpoint aparte cubre el reintento, las entrevistas abandonadas y las anteriores a este cambio.
- **No cambia:** la rúbrica (3 criterios con el mismo peso), la fórmula, el evaluador y sus prompts, el resumen calculado sin IA, «Historial y progreso» y «Retroalimentación».

## Capabilities

### New Capabilities
<!-- Ninguna. -->

### Modified Capabilities
- `reporte-de-entrevista`: no tiene spec principal (vive en el cambio sin archivar `reporte-final-entrevista`). La delta agrega el reporte en pestañas, el veredicto de la IA con su respaldo, el plan de mejora y la transcripción.

## Impact

- **Backend:**
  - `integrations/ia/`: el `Protocol RedactorDeVeredicto` y el prompt `prompts/veredicto.py` con su parser; `prompts/guardas.py`, que recibe `_CONCLUYE_APTITUD` desde `revisor_cv.py`; además, el fake, la cadena y `factory.get_redactor_de_veredicto()`.
  - `apps/entrevistas/`: el campo `Entrevista.veredicto_ia` con su migración `0009`, `services.redactar_veredicto()` (que también llama `responder()`), el endpoint `POST /api/entrevistas/<id>/veredicto/` con throttle propio y la clave `veredicto` en `/resultados/`.
  - Tests y una copia fijada del prompt nuevo.
- **Frontend:**
  - `features/resultados/`: la página pasa a pestañas, se agregan componentes por pestaña, el hook `useVeredicto` y las reglas puras con su test en Vitest;
  - `ResumenFinal` y `PanelCualitativo` se reparten en los componentes nuevos y se eliminan;
  - `api/entrevistas.ts` gana `pedirVeredicto` y el timeout de 90 s para `responder`;
  - el texto de espera del chat en la última pregunta.
- **Costo:** de 9 a 10 llamadas a la IA por entrevista completa.
- **Documentación:** `CLAUDE.md`. El perfil de tesis debería mencionar el «redactor del veredicto» como un rol separado del evaluador; queda anotado para que Jorge lo actualice.
