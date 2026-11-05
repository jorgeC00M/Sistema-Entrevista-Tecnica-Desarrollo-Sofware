## Context

Hoy «Retroalimentación» (`/retroalimentacion`, `RetroalimentacionPage`) llama a `GET /api/estadisticas/retroalimentacion/` (`RetroalimentacionView` → `apps/evaluaciones/selectors.py::calcular_retroalimentacion`) y muestra:
- `RepartoPorBandas`: las respuestas por banda en cada área;
- `ListaObservaciones`: las últimas 20 respuestas, con su filtro y su «Ver».

Un `grep` confirma que nada más usa esa vista, ese selector, `api/evaluaciones.ts` ni los tipos `RepartoPorArea`, `Observacion` y `RetroalimentacionAcumulada`. `/api/estadisticas/` solo sirve ese endpoint: el resto se retiró antes, y `EndpointDeEstadisticasRetiradoTest` lo comprueba.

## Goals / Non-Goals

**Goals:** quitar la pestaña y todo lo que quede sin uso, sin romper ninguna funcionalidad, y dejar en el Alcance de la tesis un texto que siga siendo cierto.

**Non-Goals:**
- tocar la evaluación, el reporte, el historial, la rúbrica o `medir_consistencia`;
- borrar datos o hacer migraciones;
- llevar el reparto por área a otra pantalla, que Jorge no quiso.

## Decisions

- **Se borran y no se dejan huérfanos:**
  - `apps/evaluaciones/views.py`, `urls.py` y `selectors.py`;
  - la línea `api/estadisticas/` de `config/urls.py`;
  - `features/retroalimentacion/` y `api/evaluaciones.ts`;
  - los tres tipos de `types/evaluacion.ts`.

  `apps/evaluaciones` sigue siendo una app: sus modelos, `services.py` (`calificar`, `guardar`), `rubricas.py`, `admin.py` y el comando de consistencia no cambian.
- **La ruta redirige, no desaparece.** `<Route path="/retroalimentacion" element={<Navigate to="/historial" replace />} />` en `router/index.tsx`. Con `replace`, «atrás» no vuelve a la ruta antigua. Es el mismo destino que ofrecía la pestaña para volver a las entrevistas.
- **Menú.** Se quita la entrada de `destinos.ts` («Tu progreso» queda con un destino), la de `titulosDeRuta.ts` y la mención en el comentario de `Header.tsx`. El ícono `brujula` puede quedar sin uso: si `grep` lo confirma, se quita de `trazosDeIconos.ts` y de `NombreDeIcono`.
- **Tests:**
  - se borra `test_retroalimentacion.py`;
  - `EndpointDeEstadisticasRetiradoTest` pasa a comprobar 404 en `/api/estadisticas/` y en `/api/estadisticas/retroalimentacion/`;
  - `DesglosePorAreaTest` se reescribe contra `/resultados/` (`intercambios[].area`). Sigue comprobando que cada pregunta guarda su área según `PLAN_POR_PUESTO` y que dos puestos distintos dan conjuntos de áreas distintos. Así no se pierde la cobertura de «el área vive en el intercambio»;
  - `TrazabilidadDeLaNotaTest` no cambia;
  - en `test_evaluaciones.py`, se quitan `URL_RETROALIMENTACION` y lo que quede sin uso.
- **Landing.** En `QueRecibes.tsx`, la tarjeta «Tu progreso» pasa a «El historial de tus entrevistas, tu evolución por nivel y puesto, y el reporte de cada una con su plan de mejora.».
- **Alcance de la tesis: se mejora, no se quita.** La viñeta (línea 329 del `.md`) también promete la retroalimentación por respuesta, que exige el objetivo 5. Solo sobra su final. Texto propuesto:

  > El sistema generará retroalimentación personalizada de cada entrevista, basada en el análisis de las respuestas: fortalezas, debilidades, sugerencias de mejora y los puntos clave que una respuesta completa debía cubrir, consolidada en un reporte con un plan de mejora y un veredicto redactado por la inteligencia artificial que no modifica la nota; el historial mostrará la evolución del desempeño del usuario entre entrevistas.

  Jorge además actualiza:
  - en la línea 518, «resultados, historial y retroalimentación» pasa a «resultados e historial»;
  - se quitan el «Panel de Retroalimentación», la Figura 17 y la Tabla 22 (líneas 1065-1076) y sus entradas en los índices (178 y 228), y se renumeran las figuras y tablas siguientes.

## Risks / Trade-offs

- **[Se pierde la vista de debilidades de varias entrevistas a la vez]** → Es lo que Jorge juzgó poco útil, porque las entrevistas suelen ser distintas. La evolución por nivel y puesto del historial sigue mostrando la tendencia.
- **[Un enlace o marcador a `/retroalimentacion`]** → Redirige a `/historial`.
- **[La tesis menciona el panel en varios lugares]** → Están listados arriba. Hasta que Jorge los actualice, el documento describe una pantalla que ya no existe.

## Migration Plan

No hay migración de datos. Para revertir se recuperan del historial de git los archivos borrados y la línea de `config/urls.py`.
