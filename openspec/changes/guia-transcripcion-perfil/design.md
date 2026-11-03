## Context

Ver `proposal.md`, en «Why».

La fuente es la diferencia entre la versión confirmada de la copia Markdown y la actual. Se obtiene con `git diff -- "docs/Copia de Copia de PerfilJorgeV3.docx.md"`, sin las líneas de imágenes en base64. La copia corregida ya contiene el texto final; la guía no redacta nada nuevo, solo lo ordena para transcribirlo.

## Goals / Non-Goals

**Goals:**
- Que la guía se pueda seguir de arriba abajo con el Word abierto, sin mirar el Markdown.
- Explicar cada imagen y cada tabla lo suficiente para armarlas sin adivinar.

**Non-Goals:**
- Generar el Word.
- Tomar las capturas.
- Exportar los diagramas.
- Cambiar el contenido aprobado de los capítulos.
- Tocar los capítulos IV en adelante.

## Decisions

**D1. Formato de la entrada.**

```
C1-07 · 1.5 Alcance · viñeta 1 · REEMPLAZAR
Buscar:   «La  plataforma web estará disponible…»
Texto nuevo:
  …
Por qué: …
```

Las imágenes agregan tres campos, «Qué debe mostrar», «Referente / origen» y «Pie». Las tablas agregan cinco: «Para qué sirve», «Columnas», «Contenido», «Pie» y «Formato».

El texto nuevo va en un bloque aparte para copiarlo sin arrastrar las marcas del Markdown: las tablas van como tabla y no con barras, y sin `\.` ni `###`.

**D2. Ubicación por búsqueda.** El Word no tiene los mismos números de línea que el Markdown. Por eso cada entrada da la sección y las primeras palabras del texto que se busca con Ctrl+F.

**D3. Capturas reproducibles.**
- **Condiciones de toma:** backend con `IA_PROVEEDOR=fake`, ventana de 1280 px y usuario de prueba con datos inventados (nunca datos reales: el documento es público).
- **Contenido previo:** las capturas de historial y retroalimentación se toman con al menos tres entrevistas hechas.
- **Por cada captura:** la ruta, por ejemplo `/nueva-entrevista`, y el estado de la pantalla, por ejemplo «Backend · Semi-Senior · Django elegidos».

**D4. Diagramas.**
- **Exportación:** se pega el `.mmd` en mermaid.live y se exporta en PNG a 2× (o en SVG si el Word lo admite). Se inserta al ancho de la página y centrado.
- **Resumen:** cada entrada resume en viñetas lo que muestra el diagrama, para que el texto que lo presenta pueda describirlo.

**D5. Logotipos.**
- **De dónde se descargan:** de su sitio oficial: React desde react.dev, Django desde la página de logotipos de djangoproject.com.
- **Pie:** la fuente va en el pie de figura.
- **Alternativa:** si el tutor prefiere no usar logotipos, la guía indica que la Figura 5 (arquitectura) puede reemplazar a las Figuras 3 y 4 juntas, renumerando las siguientes.

**D6. La guía se genera con un script** a partir del diff y se revisa a mano. Un script de verificación comprueba que todos los bloques del diff, todas las figuras y todas las tablas aparezcan en la guía.

**D7. Formato de entrega: Word como principal y Markdown como consulta.** Un `.md` abierto con el Bloc de notas muestra símbolos (`|`, `**`, `###`), y sus tablas no se pegan como tablas en Word. Por eso:
- **Script:** `docs/herramientas/generar_guia.py` define las entradas **una sola vez**, como una lista de datos (ubicación, acción, buscar, texto nuevo, por qué, y la tabla o la imagen), y escribe los dos archivos a partir de ella. Así el `.docx` y el `.md` nunca difieren.
- **Formato del `.docx`:**
  - cada entrada es un encabezado de nivel 2, y los capítulos son de nivel 1, para que aparezcan en el panel de navegación;
  - el «Texto nuevo» va en un párrafo con sombreado gris claro;
  - cada tabla del documento es una tabla real con el estilo «Table Grid» y el encabezado en negrita.
- **Dependencias:** se ejecuta con `backend/.venv/Scripts/python.exe`, que ya tiene `python-docx` por el módulo de CV. No se agrega ninguna dependencia, y `pandoc` no está instalado.

## Risks / Trade-offs

- **[El Word oficial difiere de la copia Markdown en algún párrafo]** → La búsqueda usa pocas palabras. Si no se encuentra el texto, la entrada da la sección para ubicarlo a mano.
- **[Guía larga, con unas 24 tablas]** → Va numerada y con un índice al principio, para retomar donde se dejó.
