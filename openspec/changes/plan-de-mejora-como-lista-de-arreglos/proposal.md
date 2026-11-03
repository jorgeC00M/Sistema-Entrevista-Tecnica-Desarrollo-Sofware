## Why

Hoy «Plan de Mejora» es una sucesión de bloques:
- un conteo («n correcciones medidas · m sugerencias de IA»);
- «Lo que ya funciona»;
- la lista de correcciones con su «Encontramos» y su «Así:»;
- las viñetas y la redacción con IA.

Se lee como un informe, no como algo que hacer. Jorge pidió convertir las correcciones en una lista de pendientes:
- una tarjeta «Arreglar el formato»;
- en cada fila, una casilla para marcarla como hecha, la acción y lo que hay que corregir, y a la derecha un «AHORA» y un «DESPUÉS»;
- sin puntajes ni porcentaje de avance.

Aprobó cuatro decisiones:
- **AHORA es el diagnóstico medido y DESPUÉS el ejemplo.** El CV original no se guarda, así que no se inventa un fragmento.
- **Las casillas se guardan en el backend.**
- **Se quitan «Lo que ya funciona» y el aviso «La IA no encontró nada que sugerir».**
- **Igual en los dos tipos de análisis.**

## What Changes

- **Tarjeta «Arreglar el formato».** Primera en «Plan de Mejora», con la frase «Hazlo primero: si el sistema no lee un dato, tampoco lo puede comparar.».
- **Una fila por corrección medida, en orden de gravedad:**
  - **Izquierda:** una casilla cuadrada «marcar como hecho». Es un botón real, con `aria-pressed` y un `aria-label` que nombra el arreglo, y muestra un check cuando está marcada.
  - **Centro:** la acción («Pásalo a una sola columna»), la etiqueta de su severidad («RESTA VISIBILIDAD», «IMPIDE LA LECTURA», «DETALLE») y cómo hacerlo (su detalle).
  - **Derecha:** dos cajas apiladas. «AHORA» con lo que se encontró («Tu CV está maquetado a dos columnas») y «DESPUÉS» con el ejemplo de cómo debe quedar, si la corrección lo tiene. En pantallas angostas bajan debajo del texto.
- **Sin correcciones,** una fila con el icono de éxito: «No hay arreglos de formato pendientes».
- **Sin puntaje, porcentaje ni conteo de avance:** solo el estado de cada casilla.
- **Las casillas se guardan por análisis en el backend.**
  - Campo nuevo `AnalisisATS.arreglos_hechos` (migración `0008`).
  - Endpoint nuevo `POST /api/curriculums/<id>/arreglos/`.
  - Si el diagnóstico se recalcula, las casillas se vacían.
- **Se quitan de la pestaña:**
  - el conteo de correcciones medidas y sugerencias;
  - «Lo que ya funciona»;
  - el aviso «La IA no encontró nada que sugerir para este CV».

  Siguen los avisos de «pidiendo sugerencias» y de fallo con «Reintentar».
- **Quedan debajo de la tarjeta:** las viñetas de logro y la redacción con IA.
- **Código muerto:** `ConservaloAlCorregir.tsx` y la lista de correcciones anterior, junto con lo que quede sin uso.

## Capabilities

### New Capabilities
- `revision-de-cv`: la pestaña «Plan de Mejora» como lista de arreglos con casillas guardadas. Aún no tiene spec principal, así que la delta es ADDED, como en los cambios anteriores.

### Modified Capabilities

## Impact

- **Backend:**
  - en `apps/curriculums/`: `models.py`, la migración `0008`, `serializers.py`, `services.py`, `views.py`, `urls.py` y sus tests;
  - el API gana `arreglos_hechos` en el análisis y el endpoint `arreglos/`.
- **Frontend:**
  - `types/curriculum.ts` y `api/curriculums.ts`;
  - en `features/curriculum/components/`: `ResultadoDelAnalisis`, `AvisoDeRevision`, el nuevo `ArreglosDeFormato`, y se borran `ConservaloAlCorregir` y `ListaDeHallazgos` si quedan sin uso;
  - en `components/ui/`, la nueva `CasillaHecho`.
- **Specs sin archivar que se ajustan:** `estado-del-cv-por-datos-clave`, `pestanas-del-resultado-por-tipo`, `correcciones-accionables-y-menos-pestanas`, `resumen-en-dos-columnas-y-ejemplos` y `sin-preguntas-probables-en-el-resumen`.
- **Documentación:** `CLAUDE.md`.
- **Sin cambios** en la medición, la versión de reglas, la IA ni el Resumen.
