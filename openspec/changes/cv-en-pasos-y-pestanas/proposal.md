## Why

"Revisar mi CV" no es fácil de usar:
- **La entrada empieza por lo opcional:** la convocatoria va primero y el CV, que es obligatorio y lleva "Analizar mi CV", va segundo.
- **El resultado es una columna de nueve bloques seguidos**, sin resumen ni forma de saltar entre ellos. Lo más importante (qué corregir primero) queda enterrado.
- **Tras analizar,** el formulario sigue arriba ocupando espacio, el historial desaparece y no hay un "analizar otro" explícito.

## What Changes

- **Entrada en una sola tarjeta:**
  - primero "Tu currículum" (PDF o DOCX);
  - debajo, "Comparar con una convocatoria (opcional)", que se despliega solo si el usuario la quiere; al plegarla se vacía lo que tenía;
  - "Analizar mi CV" a la derecha;
  - el historial de análisis, debajo de la tarjeta.
- **Resultado con barra de contexto:** el nombre del archivo, con o sin convocatoria, la fecha y "Analizar otro". "Analizar otro" vuelve a la entrada conservando el archivo y la convocatoria, para reanalizar tras corregir.
- **Resultado en pestañas** con el componente de pestañas existente:
  - **Resumen:** las cifras clave y las 3 debilidades más graves;
  - **Qué corregir:** el espejo del ATS, qué corregir y qué conservar;
  - **Requisitos** con convocatoria, o **Tecnologías** sin ella;
  - **Viñetas:** viñetas de logro y redacción;
  - **Para la entrevista:** las preguntas probables.

  Las pestañas sin contenido no aparecen.
- **Se mantienen los términos actuales** ("ATS", "parseabilidad", "Qué ve el ATS"); solo cambia la estructura.
- **Código muerto:** se elimina `SubirArchivo.tsx`, cuyo contenido pasa a la entrada única, y `ResumenDeSeveridad` si queda sin uso.

## Capabilities

### New Capabilities
- `cv-en-pasos-y-pestanas`: cómo se pide el análisis del CV y cómo se presenta su resultado.

### Modified Capabilities
- Ninguna con spec archivado. El layout de dos columnas para la entrada que fijó `pantallas-responsivas` (sin archivar) queda reemplazado.

## Impact

- **Frontend:**
  - `features/curriculum/pages/CurriculumPage.tsx`, que pasa a solo estado y orquestación;
  - nuevos `components/{EntradaDelAnalisis, ResultadoDelAnalisis, ResumenDelAnalisis}.tsx`;
  - nuevos `hallazgos.ts` y `hallazgos.test.ts`;
  - `CampoConvocatoria.tsx`, que deja de ser una tarjeta propia;
  - `ListaDeHallazgos.tsx`, si se elimina `ResumenDeSeveridad`.
- **Documentación:** `CLAUDE.md`, en el módulo CV.
- **Sin cambios:** backend, API y análisis.
