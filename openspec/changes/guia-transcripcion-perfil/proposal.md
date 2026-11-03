## Why

El cambio `actualizar-perfil-capitulos-1-a-3` corrigió los capítulos I a III en la copia Markdown del perfil, `docs/Copia de Copia de PerfilJorgeV3.docx.md`: suma 533 líneas, quita 88, y deja 19 figuras y 24 tablas. Pero el documento que se entrega es el **Word oficial**.

Pasar esos cambios a mano, comparando dos archivos, es lento y deja huecos fáciles de pasar por alto: una viñeta olvidada, un pie de figura con el número equivocado. Además, Jorge necesita saber qué debe mostrar cada imagen y de dónde sale, y qué explica cada tabla, para poder armarlas en Word.

## What Changes

Se genera una guía en español, ordenada como el documento y entregada en **dos formatos con el mismo contenido**:
- **`docs/guia-de-transcripcion-capitulos-1-a-3.docx`**, el principal para transcribir. Se abre con doble clic en Word. Sus tablas son tablas reales de Word, que se copian y pegan en el documento oficial. Cada entrada es un encabezado, así que aparece en el panel de navegación.
- **`docs/guia-de-transcripcion-capitulos-1-a-3.md`**, la copia de consulta, que se lee en VS Code con la vista previa (Ctrl+Shift+V).

Los dos los genera el script `docs/herramientas/generar_guia.py`, que usa `python-docx`, ya instalado en el entorno del backend.

**Cada entrada** lleva:
- un número, por ejemplo C1-07;
- su ubicación exacta;
- la acción: REEMPLAZAR, AGREGAR, ELIMINAR o CORREGIR;
- el inicio del texto anterior, para encontrarlo con Ctrl+F;
- el texto nuevo, listo para copiar;
- el motivo.

**Cada imagen** dice:
- qué debe mostrar;
- su referente u origen: el diagrama de `docs/diagramas/` y cómo exportarlo, la pantalla del sistema y en qué estado capturarla, o el sitio oficial del logotipo;
- su pie de figura exacto.

**Cada tabla** dice:
- para qué sirve, en 1 o 2 líneas que se pueden usar como párrafo introductorio;
- sus columnas;
- su contenido completo;
- su pie;
- un formato sugerido.

**Al cierre**, la guía incluye:
- la lista de marcas pendientes (`[VERIFICAR]` y `[CONFIRMAR]`), con la fuente que hay que consultar;
- las secciones nuevas para la tabla de contenido;
- cómo actualizar los índices en Word.

No se modifica el documento ni el código.

## Cómo abrirla

1. En `docs`, abre `guia-de-transcripcion-capitulos-1-a-3.docx` con doble clic. Abre al lado el documento oficial (Vista → Ver en paralelo).
2. En la guía, activa Vista → Panel de navegación para ir entrada por entrada.
3. **Párrafos:** busca en el oficial con Ctrl+F el texto de «Buscar» y reemplázalo por el recuadro «Texto nuevo». Pega con «Mantener solo texto».
4. **Tablas:** selecciona la tabla en la guía, cópiala y pégala en el oficial. Aplica el estilo de tabla del documento y agrega el pie con Referencias → Insertar título.
5. **Imágenes:**
   - **Diagramas:** copia el contenido del `.mmd`, pégalo en https://mermaid.live y usa Actions → PNG.
   - **Capturas:** abre la ruta del sistema que indica la guía y captura con Win+Shift+S.
6. Al terminar, usa Referencias → Actualizar tabla en el índice general y en los de figuras y tablas.

## Capabilities

### New Capabilities
- `guia-de-transcripcion`: la guía con la que se trasladan al Word oficial los cambios hechos en la copia Markdown del perfil.

### Modified Capabilities
<!-- Ninguna. -->

## Impact

- **Archivos nuevos:**
  - `docs/guia-de-transcripcion-capitulos-1-a-3.docx`;
  - `docs/guia-de-transcripcion-capitulos-1-a-3.md`;
  - `docs/herramientas/generar_guia.py`.
- **Fuentes, solo lectura:**
  - `git diff -- "docs/Copia de Copia de PerfilJorgeV3.docx.md"`;
  - `docs/diagramas/*.mmd`;
  - las rutas del frontend (`frontend/src/router/index.tsx`), para indicar dónde tomar cada captura.
- **Sin impacto en el sistema.**
