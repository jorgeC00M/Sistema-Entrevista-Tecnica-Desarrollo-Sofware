## Why

El módulo de CV cubre los fallos de parseo más conocidos (capa de texto,
columnas, tablas, secciones, fechas), pero le faltan reglas que los ATS reales
aplican y que dejan a un candidato fuera de la búsqueda del reclutador: el único
rechazo automático real (las preguntas de filtro por años de experiencia), los
filtros por ubicación y la búsqueda booleana literal (sigla frente a nombre
largo). Además, el propio extractor tiene el mismo punto ciego que critica: en
un DOCX no lee cuadros de texto ni encabezado/pie de página, así que el módulo
no puede avisar de lo que no ve.

## What Changes

- **Años de experiencia reales**: el campo "Antigüedad" pasa de contar periodos
  ("3 periodos") a calcular la experiencia ("2 años y 4 meses"), fusionando
  empleos simultáneos y mirando solo la sección de experiencia.
- **Años excluyentes**: si la convocatoria pide "mínimo N años", el mapa de
  evidencia compara lo pedido con lo que el ATS calcula.
- **Cargo**: si la convocatoria nombra un cargo reconocible, se comprueba si el
  CV lo evidencia.
- **Ubicación**: nuevo campo de la ficha (8 en vez de 7) y debilidad si falta.
- **Sigla y nombre largo**: aviso cuando un término aparece solo de una forma.
- **Zonas que el ATS no lee**: cuadros de texto y encabezado/pie de página;
  crítico si el contacto solo está ahí.
- **Texto oculto**: texto blanco o diminuto en PDF.
- **Idioma distinto** entre CV y convocatoria.
- **Versión de reglas**: un análisis guardado con reglas anteriores se recalcula
  al volver a subir el mismo CV, sin duplicar el registro.
- **Limpieza**: se elimina el conteo de periodos (`_contar_rangos`), la lista de
  campos escrita a mano en dos sitios, el cálculo duplicado de `parseabilidad` y
  `con_convocatoria` en los serializers, el serializado manual de la brecha y la
  constante sin uso `DESTINO_PRINCIPAL` del frontend.
- **BREAKING** (solo de contrato interno): la parseabilidad pasa de "x/7" a
  "x/8". Los análisis viejos conservan su "x/7" hasta que se recalculen.

## Capabilities

### New Capabilities
- `revision-de-cv`: reglas de parseo y de comparación con la convocatoria que el
  diagnóstico del CV aplica (se añaden requisitos; el resto de la capacidad está
  descrita en los cambios `analizar-cv-contra-convocatoria` e
  `historial-de-cv-y-frontera-con-ia`, aún sin archivar).

### Modified Capabilities

## Impact

- **Backend, sin Django**: `integrations/documentos/{extractor,ats,secciones,
  terminos,convocatoria,brecha}.py`; nuevos `fechas.py`, `idioma.py`,
  `ubicaciones.py`.
- **Backend, app**: `apps/curriculums/{models,services,serializers,admin}.py`;
  migración `0006` (un `AddField` con default).
- **API**: `POST /api/curriculums/` y `GET /api/curriculums/<id>/` publican el
  campo Ubicación, los hallazgos nuevos y, en `brecha`, `experiencia`, `cargo` e
  `idioma_distinto`. Ningún campo existente cambia de forma.
- **Frontend**: `types/curriculum.ts`, `BrechaDeRequisitos.tsx`;
  `components/layout/destinos.ts` (limpieza).
- **Tests**: fixtures nuevas (PDF y DOCX) y los que fijan "7/7" pasan a "8/8".
- Sin dependencias nuevas, sin red, sin IA.
