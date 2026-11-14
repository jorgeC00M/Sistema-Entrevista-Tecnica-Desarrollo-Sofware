## Why

El marco teórico (Capítulo II) tiene cuatro problemas de citación que Jorge quiere corregir antes de entregarlo:

- **La autoría de tablas y figuras no se distingue.** Los pies dicen «(Elaboración Propia)» aunque algunas se armaron con varias obras, y los logotipos nombran a su dueño sin una referencia.
- **Las referencias de libros están incompletas.** Varias traen solo el ISBN, sin editorial ni enlace. La de Manning y Schütze apunta a https://nlp.stanford.edu/fsnlp/, que no abre.
- **Las fichas de cita se repiten.** El Word de trabajo repite la ficha completa de una obra cada vez que se vuelve a citar: 38 de las 88 fichas son repeticiones. En la herramienta de citas de Google Docs, una obra ya cargada solo se selecciona.
- **Las citas no siguen una regla de posición.** No respetan siempre la regla de cita narrativa, en medio o parentética, y los párrafos que combinan varias fuentes no siempre las enlazan con conectores naturales.

## What Changes

- **Tablas y figuras.** Debajo de cada tabla y figura va su línea «Fuente:», según su origen:
  - si se tomó tal cual de una obra, «Fuente: Autor (año)»;
  - si se armó con varias obras, «Fuente: Elaboración propia con base en Autor (año) y Autor (año)»;
  - si es un diagrama del sistema, «Fuente: Elaboración propia».

  Los logotipos de React y Django ganan su referencia y su ficha.
- **Referencias de libros:**
  - siguen APA 7, con editorial y URL y sin ISBN;
  - la ficha de cada libro gana el campo «Páginas», que pide la herramienta de citas;
  - la URL abre el libro o lleva adonde se puede leer o descargar legalmente;
  - cuando no existe un acceso legal al texto completo (libros comerciales), se usa el préstamo de Internet Archive o la página de la editorial;
  - las páginas que no se puedan verificar quedan como `[VERIFICAR página]`.
- **Obras ya citadas.** La primera aparición de una obra lleva su ficha completa y las siguientes, una línea «Selecciona la cita: Autor (año)». Solo cambia el Word de trabajo; el de entrega no lleva fichas.
- **Posición de las citas.** Se revisan los párrafos con cita y solo se corrigen los que no siguen la regla:
  - narrativa al inicio cuando el autor es el protagonista;
  - en medio para conectar con una idea propia;
  - parentética al final cuando importa el dato.

  En las síntesis de varias fuentes se usan conectores naturales. El contenido no cambia.
- **Fuera de alcance:**
  - el Capítulo I y el perfil;
  - el sistema;
  - el contenido de las secciones;
  - las figuras pendientes de dibujar.

## Capabilities

### New Capabilities
- `marco-teorico-citas`: cómo cita sus fuentes el marco teórico: la autoría de tablas y figuras, las referencias de libros, las obras repetidas y la posición de las citas.

### Modified Capabilities
<!-- ninguna -->

## Impact

- **`docs/marco-teorico-borrador.md`:** pies, líneas «Fuente:», referencias, tabla «Fichas de cita» y párrafos.
- **`docs/herramientas/generar_marco_teorico.py`:** el campo «Páginas» y la línea «Selecciona la cita».
- **Se regeneran** `docs/capitulo-2-marco-teorico.docx` y `docs/capitulo-2-marco-teorico-entrega.docx`.
- **Sin commit:** la tesis no va a git.
