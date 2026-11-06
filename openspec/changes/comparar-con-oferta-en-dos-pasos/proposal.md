## Why

La entrada de «Comparar con oferta» da a la convocatoria solo un tercio del ancho, aunque pesa tanto como el CV: sin ella no hay comparación. Encima la esconde tras un control «Pegar texto / Subir archivo» que obliga a elegir una vía antes de empezar.

Además, subir la convocatoria como archivo casi no se usa: un aviso vive en una página web (LinkedIn, Computrabajo, el sitio de la empresa), y lo natural es copiarlo. Es una opción más que entender, y código que mantener en el frontend y en el backend.

## What Changes

- **Dos paneles iguales:** desde 1024 px, la entrada de «Comparar con oferta» pasa a dos columnas iguales, «Paso 1 · Sube tu CV» a la izquierda y «Paso 2 · Pega la convocatoria» a la derecha, con la misma altura. Por debajo de 1024 px se apilan en ese orden.
- **El paso listo se marca:** cuando un paso está completo (el CV elegido, el texto pegado), su encabezado muestra un check con el texto «Listo», nunca solo un color.
- **La convocatoria solo se pega o escribe:**
  - se elimina el control «Pegar texto / Subir archivo» y la opción de subirla como archivo en el módulo de CV;
  - **BREAKING** (API): `POST /api/curriculums/` deja de aceptar `archivo_convocatoria`; si llega, se ignora.
- **Sin cambios:** «Analizar CV» se habilita igual que hoy (el CV y una convocatoria no vacía), y el análisis general mantiene su fila 2/3 – 1/3 con «Tu CV» y «¿Qué revisamos?», sin pasos.
- **Código muerto:** se elimina `ControlSegmentado`, que solo usaba este campo.

## Capabilities

### New Capabilities
- `entrada-de-comparar-con-oferta`: cómo se piden el CV y la convocatoria en «Comparar con oferta» (paneles, pasos, estado de cada paso, la convocatoria solo como texto) y qué acepta la API.

### Modified Capabilities
- (ninguna: el módulo de CV no tiene una spec principal; la entrada estaba descrita en deltas ya archivadas o por archivar)

## Impact

- **Frontend:**
  - `features/curriculum/components/EntradaDelAnalisis.tsx` y `CampoConvocatoria.tsx`;
  - `features/curriculum/pages/CurriculumPage.tsx`;
  - `features/curriculum/hallazgos.ts` (`puedeAnalizar` sin el archivo de la convocatoria) con sus tests;
  - `api/curriculums.ts`;
  - se elimina `components/ui/ControlSegmentado.tsx`, y se ajusta un comentario en `Pestanas.tsx`.
- **Backend:** `apps/curriculums/serializers.py` (`SubirCurriculumSerializer`) y `tests/test_curriculums.py`. `apps/common/archivos.py::texto_de_convocatoria` se queda: la usa «Simular entrevista › Con convocatoria», que sigue aceptando archivo.
- **Documentación:** `CLAUDE.md` (pantalla del CV y «Two routes») y la tesis, si menciona subir la convocatoria al módulo de CV.
