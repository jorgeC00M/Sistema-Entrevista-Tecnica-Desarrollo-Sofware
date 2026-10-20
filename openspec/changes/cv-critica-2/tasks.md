## 1. Backend: el diagnóstico primero

- [x] 1.1 En `apps/curriculums/services.py`, quitar `_guardar_revision()` de los dos caminos de `analizar()` y crear `revisar(usuario, pk, revisor=None)`, que reconstruye `DocumentoExtraido` desde `Curriculum` y respeta `necesita_revision()` (D1). Actualizar los docstrings.
- [x] 1.2 Crear `CurriculumRevisionView` (`POST`, `IsAuthenticated`, `throttle_scope="revisar-cv"`), la ruta `<int:pk>/revision/` y la tasa `"revisar-cv": "30/hour"` en `config/settings/base.py`.
- [x] 1.3 En `ats.py`, el detalle de `sin_capa_de_texto` según el formato (PDF, DOCX con cuadros, otro DOCX) y `VERSION_DE_REGLAS = 3` (D3). Añadir tests en `tests/integration/test_ats.py`.
- [x] 1.4 Actualizar y añadir tests en `apps/curriculums/tests/`:
  - `POST /curriculums/` no llama al proveedor y devuelve `revision_ia: null`;
  - `POST …/revision/` devuelve las sugerencias y en una segunda llamada no vuelve a llamar al proveedor;
  - reintenta tras `no_disponible`;
  - responde 404 para un análisis ajeno;
  - la frontera estática y el guardia `sys.meta_path` cubren el nuevo camino.

  Adaptar los tests existentes que esperaban la revisión en la primera respuesta. Ejecutar `python manage.py test` en verde, con el conteo nuevo.

## 2. Frontend: sugerencias después

- [x] 2.1 En `api/curriculums.ts`, crear `pedirRevision(id, signal)` con `timeoutMs: 120_000` y corregir el comentario de `analizarCurriculum` (D2).
- [x] 2.2 En `CurriculumPage.tsx`, añadir el efecto ligado a `resultado?.id` que pide la revisión cuando `revision_ia === null`, con estado `pidiendo | lista | fallo`, fusión en `resultado`, aborto al cambiar y reintento.
- [x] 2.3 En `AvisoDeRevision.tsx`, añadir el estado "Pidiendo sugerencias a la IA…" en `aria-live` y "Reintentar sugerencias"; mostrarlo en las pestañas que dependen de la IA.

## 3. Frontend: coherencia y móvil

- [x] 3.1 En `hallazgos.ts`, crear `porMejorar()` con su test; rótulo `Mejorar · n` en la pestaña y "Ver todo en Mejorar" sin número (D4).
- [x] 3.2 En el panel del CV ilegible, el título según `curriculum.formato` y la línea "El ATS extrae 0/8 campos" en lugar del espejo completo (D3).
- [x] 3.3 Cambiar `text-headline-lg` por `text-headline-md`. Ampliar `estilos.test.ts` para que falle con familias de texto no definidas en `tokens.css`, y verificarlo inyectando una violación (D5).
- [x] 3.4 Móvil (D6):
  - `Pestanas` con `gap-4 sm:gap-6`;
  - rótulos cortos;
  - `practica.ts::destinoDePractica` compartido y "Practicar la entrevista" al final del Resumen;
  - apilado en `EspejoDelATS` (siempre) y en `FilaDeRequisito`.

## 4. Verificación y documentación

- [x] 4.1 Ejecutar `pnpm exec tsc --noEmit`, `pnpm test` (incluida la guarda de estilos ampliada), `pnpm run lint` (sin avisos nuevos) y `pnpm run build`, todos en verde.
- [x] 4.2 Actualizar `CLAUDE.md`:
  - en el módulo CV, la IA en una segunda petición (`POST …/revision/`), la reconstrucción desde `Curriculum.texto` y el reintento;
  - en "Every rule is one function…", `VERSION_DE_REGLAS = 3`;
  - en el sistema de estilos, la guarda de tokens tipográficos;
  - el conteo de tests.
- [ ] 4.3 Prueba manual que cubra:
  - analizar con un proveedor lento (el espejo al instante y las sugerencias después);
  - un proveedor caído (Reintentar);
  - abrir desde el historial un análisis sin revisión;
  - un PDF escaneado y un DOCX con cuadros de texto;
  - 375 y 320 px (pestañas y enlace a practicar).

  Después, volver a ejecutar `/impeccable critique` y compararla con el 24/40. Si no se puede ejecutar, queda **sin marcar**.
