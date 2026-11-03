## Why

El jurado tiene que poder abrir y leer cada fuente del Marco teórico (`docs/capitulo-2-marco-teorico.docx`). Hoy no siempre es posible:

- **Enlaces que no abren.** Jorge revisó algunos y no estaban disponibles. Durante el cambio `profundizar-marco-teorico` ya se habían detectado estos fallos:
  - el informe *Hidden Workers*: hbs.edu devuelve 404 y el enlace alternativo no se comprobó;
  - par.nsf.gov rechazó la conexión, así que no se pudo abrir ninguno de los dos estudios de Behroozi;
  - el DOI de Powell et al. (2018) no se pudo confirmar.
- **DOI de pago.** Varias obras (ACM, Wiley, APA PsycNet) solo muestran el resumen a quien no está suscrito.

Además, Jorge registra sus citas con la herramienta de citas de Google Docs, que pide los datos campo por campo. Hoy tiene que deducirlos de la referencia APA.

## What Changes

- **Verificar los 50 enlaces.** Se abre cada uno en la sesión y se anota su estado: abre, solo resumen, pago, 404 o rechazado.
- **Dos enlaces por obra.** Cada obra conserva su DOI y suma un enlace de texto completo abierto: arXiv, ACL Anthology, SciELO, Redalyc, Dialnet, un repositorio institucional o la página del autor.
- **Reemplazo de fuentes sin acceso.** Si no existe ninguna versión accesible, la fuente se reemplaza por otra que respalde la misma idea, o se retira. El reemplazo requiere la aprobación de Jorge.
- **Fuentes en español.** Se suman fuentes de SciELO, Redalyc o Dialnet donde respalden ideas ya presentes en el texto. Las internacionales arbitradas se mantienen.
- **Fichas de cita.** Debajo de cada párrafo citado del Word va una ficha por obra con los campos de Google Docs:
  - tipo de fuente;
  - modo de acceso;
  - título;
  - título del sitio web o de la revista;
  - autores (personas o corporativos);
  - fecha de publicación;
  - un resumen de dos líneas en verde;
  - la URL directa.
- **Archivos que se actualizan:** el borrador, las referencias APA 7, la lista de verificación y el script generador. Una opción del script genera el Word sin las fichas, para la entrega.

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `perfil-academico`: se agregan requisitos sobre la accesibilidad de las fuentes y sobre las fichas de cita del Marco teórico.

## Impact

- **Se modifican:**
  - `docs/marco-teorico-borrador.md`: enlaces, fichas, referencias y lista de verificación;
  - `docs/marco-teorico-fuentes.md`: estado de cada enlace;
  - `docs/herramientas/generar_marco_teorico.py`: bloques de ficha y la opción `--sin-fichas`;
  - `docs/capitulo-2-marco-teorico.docx`.
- **No se tocan:** el código del sistema, los Capítulos I y III ni el `.md` del perfil.
- **Depende de** la búsqueda web y del agente `web-fetch`. Algunos sitios bloquean el acceso automático (ACM y Hindawi devuelven 403), así que esos casos se resuelven con un repositorio alternativo.
