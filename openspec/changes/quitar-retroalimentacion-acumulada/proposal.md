## Why

La pestaña «Retroalimentación» junta todas las respuestas del usuario: un reparto por bandas por área y sus últimas 20 observaciones. Pero cada entrevista suele ser de otro puesto, otra tecnología u otro nivel, así que ese acumulado mezcla cosas que no se comparan. Desde `reporte-de-entrevista-en-pestanas`, además, el reporte de cada entrevista ya trae la retroalimentación útil:
- el Resumen, con el veredicto y las fortalezas y debilidades;
- el Plan de mejora;
- la Transcripción, con las debilidades y sugerencias de cada respuesta.

Las observaciones de la pestaña repiten ese contenido sueltas y desordenadas. Jorge decidió quitarla y quitar también lo que queda sin uso, sin romper ninguna funcionalidad.

## What Changes

- **Se quita la pestaña «Retroalimentación»** del menú (grupo «Tu progreso», que queda con «Historial y progreso»). La ruta `/retroalimentacion` redirige a `/historial`, para que un enlace guardado no termine en error.
- **Se quita el endpoint** `GET /api/estadisticas/retroalimentacion/` con su vista, su `urls.py` y `apps/evaluaciones/selectors.py` (`calcular_retroalimentacion`, `MAXIMO_OBSERVACIONES`). También el prefijo `/api/estadisticas/` de `config/urls.py`, que ya no sirve nada más.
- **Se quita en el frontend** `features/retroalimentacion/` (página, `ListaObservaciones`, `RepartoPorBandas`, `useRetroalimentacion`), `api/evaluaciones.ts` y los tipos `RepartoPorArea`, `Observacion` y `RetroalimentacionAcumulada`.
- **Tests:**
  - se borra `test_retroalimentacion.py`;
  - `test_evaluaciones.py` comprueba que los dos endpoints dan 404;
  - el test de que cada pregunta guarda su propia área se reescribe contra `/resultados/`, para no perder esa cobertura.
- **Landing:** la tarjeta «Tu progreso» deja de prometer «promedio por tema y retroalimentación acumulada».
- **No cambia:**
  - la evaluación, el reporte, el historial con su evolución y las tablas de la base de datos (no hay migración);
  - `apps/evaluaciones` (modelos, servicios, rúbricas, `medir_consistencia`);
  - `ListaRetroalimentacion`, `ControlSegmentado` y `EnlaceDeAccion`, que se siguen usando.
- **Tesis:** el Alcance **se mejora, no se quita**. Solo sobra su final, «…además de una retroalimentación acumulada…». Salen el Panel de Retroalimentación (Figura 17 y Tabla 22) y la palabra «retroalimentación» de la lista de incrementos.

## Capabilities

### New Capabilities
<!-- Ninguna. -->

### Modified Capabilities
- `sidebar-por-etapas`: no tiene spec principal (vive en el cambio sin archivar del mismo nombre). La delta agrega que «Tu progreso» solo tiene «Historial y progreso» y que la retroalimentación vive en el reporte de cada entrevista. Se ajustan las deltas sin archivar que mencionan la pestaña: `sidebar-por-etapas`, `buscador-y-evolucion-en-historial` y `pantallas-responsivas`.

## Impact

- **Backend:** `apps/evaluaciones/{views,urls,selectors}.py` (se borran), `config/urls.py`, `tests/test_retroalimentacion.py` (se borra) y `tests/test_evaluaciones.py`.
- **Frontend:** `features/retroalimentacion/` (se borra), `api/evaluaciones.ts` (se borra), `types/evaluacion.ts`, `router/index.tsx`, `components/layout/{destinos,titulosDeRuta}.ts`, `Header.tsx` (un comentario) y `features/landing/sections/QueRecibes.tsx`.
- **Documentación:** `CLAUDE.md` y el perfil de tesis (Jorge).
- **API:** `/api/estadisticas/retroalimentacion/` pasa a 404. Solo la usaba esta pantalla.
