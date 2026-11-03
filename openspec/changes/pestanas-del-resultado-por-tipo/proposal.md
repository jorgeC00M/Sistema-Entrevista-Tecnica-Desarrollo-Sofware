## Why

El resultado de «Revisar mi CV» tiene las mismas dos pestañas, «Resumen» y «Mejorar», en los dos tipos de análisis. En el dirigido, todo lo que tiene que ver con el aviso («Frente a este aviso»: palabras clave, experiencia, cargo, filtros, cómo cubrir lo que falta) se apila dentro del Resumen, encima del veredicto y del espejo. Así el Resumen del dirigido es mucho más largo y mezcla dos preguntas: si el ATS lo lee y si encaja en el aviso.

Jorge quiere que las pestañas nombren lo que contiene cada análisis y que el match con la oferta tenga su propia pestaña. Aprobó el boceto con dos decisiones:
- el Resumen del dirigido abre con una sola línea de match y un enlace;
- en el celular, el nombre largo de la pestaña puede partirse en dos líneas.

## What Changes

- **Análisis general:** las pestañas pasan a llamarse «Resumen y Formato» y «Plan de Mejora».
- **Análisis dirigido:** tres pestañas, «Resumen», «Match con la Oferta» y «Plan de Mejora».
  - **Resumen** abre con la frase medida de búsqueda («Si el reclutador busca las palabras obligatorias del aviso, no aparecerías: te faltan Docker y Redis» o «…aparecerías») y un botón «Ver el match». Debajo va lo mismo que en el general: el veredicto, el espejo, «Lo que debes hacer», «Consérvalo al corregir» y la práctica.
  - **Match con la Oferta** reúne todo «Frente a este aviso»: los chips por estado, la experiencia, el cargo, los filtros, «Cómo cubrir lo que te falta» y «Tienes pero no te lo piden». Si el aviso no tiene requisitos reconocidos, muestra ese aviso.
- **Plan de Mejora** es lo que hoy es «Mejorar», sin cambios de contenido. «Ver todo en Mejorar» pasa a «Ver todo en Plan de Mejora».
- **Reutilización:** la frase de búsqueda se extrae de `FrenteAlAviso` a un componente propio, `BusquedaDelReclutador`, que usan el Resumen y el Match. Sigue habiendo una sola definición.

## Capabilities

### New Capabilities
- `revision-de-cv`: las pestañas del resultado según el tipo de análisis. Aún no tiene spec principal, así que la delta es ADDED, como en los cambios anteriores.

### Modified Capabilities

## Impact

- **Frontend:**
  - en `features/curriculum/components/`: `ResultadoDelAnalisis`, `ResumenDelAnalisis`, `FrenteAlAviso`, `LoQueDebesHacer` y el nuevo `BusquedaDelReclutador`;
  - si hace falta, `components/ui/Pestanas.tsx` (que el texto pueda partirse con `repartir`).
- **Specs sin archivar que describen «Resumen / Mejorar» o el aviso dentro del Resumen:** `correcciones-accionables-y-menos-pestanas`, `resumen-en-dos-columnas-y-ejemplos` y `diferenciar-revision-y-comparacion-de-cv`.
- **Documentación:** `CLAUDE.md`.
- **Sin cambios** en el backend, el API, la medición, la entrada ni el CV ilegible (que sigue sin pestañas).
