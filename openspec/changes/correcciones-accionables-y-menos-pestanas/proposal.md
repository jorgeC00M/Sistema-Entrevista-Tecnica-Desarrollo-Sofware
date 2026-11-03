## Why

Al revisar el resultado de «Revisar mi CV», el usuario encontró cuatro problemas:

1. **«Mejorar» no se entiende.** El título de cada corrección es un diagnóstico («Tu CV está maquetado a dos columnas») y no dice qué hacer. El texto mezcla el porqué con el cómo y usa jerga como «parser».
2. **La pestaña «Tecnologías» sobra.** Muestra la misma lista que «Tecnologías por las que te encontrarían» en el Resumen.
3. **La pestaña «Entrevista» no necesita ser una pestaña.** Tiene un botón y las preguntas de la IA, y el Resumen ya termina con el mismo botón.
4. **«Así ve tu CV el ATS» no aporta.** Su lista «Lo que el ATS no ve y por qué» repite Mejorar, y el texto plano no se entiende sin esa explicación.

Además, el usuario decidió quitar también la pestaña «Requisitos»: su detalle y las sugerencias de la IA por requisito pasan a «Frente a este aviso», en el Resumen. El resultado queda siempre con **Resumen · Mejorar**.

Esto reabre la pantalla cerrada por `cv-cierre-final`, con cada decisión aprobada por el usuario.

## What Changes

- **Correcciones con título de acción:**
  - Cada debilidad gana `accion`, un imperativo como «Pásalo a una sola columna». Pasa a ser el título.
  - Debajo, «Encontramos: …» muestra el diagnóstico de siempre (`titulo`).
  - Después va `detalle`, reescrito en lenguaje llano: qué le pasa al CV dentro del ATS y cómo arreglarlo.
  - «Lo primero que mejorar» también muestra la acción.
- **`VERSION_DE_REGLAS` sube de 5 a 6:**
  - cambia lo que produce `analizar()`, así que los análisis guardados se recalculan al volver a subir el CV;
  - los JSON de versiones anteriores se sirven con `accion: ""`, y el frontend muestra el título de antes.
- **BREAKING: se elimina «Así ve tu CV el ATS».**
  - Se van el endpoint `GET /api/curriculums/<id>/texto/`, su componente, la función de la API, el tipo y el mapa de motivos (`MOTIVOS_DE_INVISIBILIDAD` / `loQueElAtsNoVe`).
  - Las explicaciones de ese mapa pasan a los detalles de las correcciones.
- **Pestañas:**
  - quedan siempre dos: Resumen · Mejorar;
  - se eliminan Tecnologías, Requisitos y Entrevista;
  - se borran `InventarioDeTerminos` y `BrechaDeRequisitos`, que repetían otras vistas.
- **«Frente a este aviso» reúne todo lo de la convocatoria:**
  - la búsqueda del reclutador;
  - los chips, ahora de solo lectura;
  - el aviso cuando no se reconocieron secciones;
  - experiencia, cargo y filtros, con sus sugerencias de IA;
  - un plegable «Cómo cubrir lo que te falta» con las sugerencias por término;
  - los términos que el CV tiene y el aviso no pide.
- **La práctica, al final del Resumen:**
  - el botón «Practicar la entrevista», siempre visible;
  - las preguntas de la IA en un plegable cerrado «Preguntas que podrían hacerte (n)».
- **Código muerto que se elimina:**
  - `idDeRequisito`;
  - la navegación a otras pestañas;
  - el bloque de práctica duplicado;
  - los imports y comentarios que queden sin uso.

## Capabilities

### New Capabilities
<!-- Ninguna. -->

### Modified Capabilities
- `revision-de-cv`. Cubre:
  - las correcciones accionables;
  - el resultado en dos pestañas;
  - los requisitos y la práctica en el Resumen;
  - la vista del texto del ATS, que se elimina.

  Va como delta ADDED, igual que los cambios anteriores del módulo, porque la capacidad no tiene spec principal.

  Reemplaza dos requisitos de la delta de `diferenciar-revision-y-comparacion-de-cv`, que no está archivada: el texto del ATS y el comportamiento del chip. Esa delta se ajusta en este mismo cambio.

## Impact

- **Backend:**
  - `integrations/documentos/ats.py`: `Hallazgo.accion`, los detalles y la versión 6;
  - `apps/curriculums/serializers.py`;
  - `views.py`, `urls.py` y `selectors.py`: se quita el endpoint del texto;
  - tests en `tests/integration/test_ats.py` y `apps/curriculums/tests/test_curriculums.py`.
- **Frontend, componentes en `features/curriculum/components/`:**
  - cambian `ResultadoDelAnalisis`, `ResumenDelAnalisis`, `FrenteAlAviso`, `ListaDeHallazgos` y `PreguntasProbables`;
  - se borran `TextoDelATS`, `InventarioDeTerminos` y `BrechaDeRequisitos`.
- **Frontend, lógica y API:**
  - `hallazgos.ts` y `requisitos.ts`, con sus tests;
  - `api/curriculums.ts` y `types/curriculum.ts`.
- **Sin migración:** los hallazgos se guardan como JSON.
- **Documentación:**
  - `CLAUDE.md`;
  - `openspec/changes/cv-cierre-final/pendientes.md`;
  - la delta spec de `diferenciar-revision-y-comparacion-de-cv`.
