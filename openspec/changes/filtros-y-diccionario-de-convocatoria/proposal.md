## Why

La única «pregunta de filtro» que el sistema compara hoy entre la convocatoria y el CV son los años de experiencia. Los avisos de Bolivia piden además, como excluyentes:
- título profesional («Titulado en Ing. de Sistemas»);
- idioma («Inglés intermedio»);
- ubicación o modalidad («Presencial en Cochabamba»).

Un reclutador filtra por eso. Si el CV no lo dice, el candidato no lo sabe.

Además, el diccionario de términos (`terminos.py`, unos 105) no reconoce herramientas que esos avisos piden a menudo, como Power BI, SAP o Jira. Un requisito que no se reconoce no aparece en el mapa, y el usuario no se entera de que le falta.

Este cambio va después de `diferenciar-revision-y-comparacion-de-cv`. Está separado porque **mide cosas nuevas**: necesita pruebas propias con avisos reales antes de afirmarle algo a un usuario.

## What Changes

- **Nuevo módulo `integrations/documentos/filtros.py`.** Lee del bloque obligatorio del aviso tres filtros y busca cada uno en el CV:
  - **Título:** grado y carrera del aviso, contra la sección Educación del CV y su estado (titulado, egresado o estudiante).
  - **Idioma:** idioma y nivel del aviso, contra una sección Idiomas, nueva en `secciones.py`, o contra todo el CV.
  - **Ubicación y modalidad:** ciudad y modalidad del aviso, contra el campo Ubicación que ya detecta el espejo.
- **Estados de cada filtro:**
  - `cumple`;
  - `no_aparece` («No aparece en tu CV»);
  - `no_verificable`.

  **Nunca se dice «no cumples».** Si el aviso no permite entender el filtro, ese filtro no se informa.
- **`Brecha` gana `filtros`.** No cuentan en la cobertura, igual que la experiencia.
- **Diccionario ampliado** con herramientas frecuentes en avisos de Bolivia (BI, ERP, gestión, diseño y sistemas), con sus variantes.
- **`VERSION_DE_REGLAS` sube de 4 a 5:** cambia lo que producen `analizar()` y `brecha.calcular()`.
- **Frontend:** cada filtro es una fila de «Frente a este aviso» y de la pestaña Requisitos, debajo de la experiencia, con los aspectos compartidos.

## Capabilities

### New Capabilities
<!-- Ninguna. -->

### Modified Capabilities
- `revision-de-cv`: el mapa de evidencia agrega las preguntas de filtro y reconoce más términos. Va como delta ADDED, igual que los cambios anteriores del módulo.

## Impact

- **Backend:**
  - `integrations/documentos/` (`filtros.py` nuevo, `secciones.py`, `terminos.py`, `brecha.py`, `ats.py` por la versión);
  - `apps/curriculums/revision.py`, solo si la IA debe recibir los filtros (no se planea).
  - **Tests:** `tests/integration/` para las reglas, más casos en `apps/curriculums/tests`.
- **Frontend:**
  - `types/curriculum.ts`;
  - `features/curriculum/aspectos.ts`;
  - `FrenteAlAviso` y `BrechaDeRequisitos`.
- **Sin migración:** `brecha` ya es un `JSONField`. Los análisis guardados con la versión 4 se recalculan al volver a subir el CV.
- **Depende de** `diferenciar-revision-y-comparacion-de-cv` (componentes `FrenteAlAviso` y `aspectos.ts`).
