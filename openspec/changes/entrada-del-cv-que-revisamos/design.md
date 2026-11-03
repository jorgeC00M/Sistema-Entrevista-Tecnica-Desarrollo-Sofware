## Context

`EntradaDelAnalisis` pinta las pestañas (`tipo-de-analisis-en-pestanas`) y, en el panel, una grilla `lg:grid-cols-2`: «Tu CV» (con `ZonaDeArchivo` y la nota del candado) y, solo en el dirigido, «Convocatoria». Debajo van una línea `aria-live` con `faltaParaAnalizar(...)` (o el estado «Leyendo tu CV…») y «Analizar CV», `disabled={falta !== null}`.

Los campos que mide el ATS están definidos en `CAMPOS_DE_LA_FICHA` (`backend/integrations/documentos/ats.py`).

## Goals / Non-Goals

**Goals:**
- Quitar la nota de privacidad y los avisos sin perder el bloqueo del botón ni el anuncio de «Leyendo…».
- Ocupar la media fila vacía de «general» con información cierta y medida.

**Non-Goals:**
- Cambiar qué se mide, el backend, el API, las pestañas o el historial.
- Exponer la lista de campos por API. Sería lo más robusto, pero es desproporcionado para un texto fijo.

## Decisions

**D1. `puedeAnalizar` (booleano) en lugar de `faltaParaAnalizar` (mensaje).**
- Los textos que devolvía dejan de mostrarse, así que serían código muerto.
- La regla no cambia: hace falta el CV y, en el dirigido, el texto o el archivo de la convocatoria.
- Los tests conservan los mismos casos, ahora con booleanos.

**D2. La línea `aria-live` sigue montada.**
- Solo cambia su contenido: el estado de análisis o nada.
- Una región *live* que se monta junto con su texto no siempre se anuncia, así que se deja siempre presente.

**D3. Los 8 campos son una constante del frontend, `CAMPOS_QUE_BUSCA_EL_ATS`.**
- La lista va en `hallazgos.ts`, con un comentario que la ata a `CAMPOS_DE_LA_FICHA`, en el mismo orden, y un test la fija.
- *Alternativa descartada:* pedirla al API. Cambia una vez por versión de reglas, y el resultado de cada análisis ya trae sus campos reales.
- *Riesgo aceptado:* si el backend cambia la ficha, hay que tocar esta constante. Queda dicho en el comentario y en `CLAUDE.md`.

**D4. Las afirmaciones del panel son verificables.**
- Columnas: `geometria.py`.
- Imágenes: sin capa de texto.
- Encabezados y pies: `texto_en_encabezado`.
- Tablas: se extraen, pero pueden leerse desordenadas; está dicho en el detalle de su corrección.
- Viñetas: `vinetas.py`.
- No se promete OCR ni un puntaje.

## Risks / Trade-offs

- **[Riesgo]** Sin la línea de avisos, un botón apagado no dice por qué. → **Mitigación:** la zona vacía de «Tu CV» dice «Arrastra o elige», y la de la convocatoria muestra su placeholder. Lo que falta está a la vista. Lo decidió el usuario.
- **[Trade-off]** Sin la nota, la garantía de privacidad deja de estar en pantalla. Sigue siendo cierta, y `CLAUDE.md` y la tesis la documentan.
