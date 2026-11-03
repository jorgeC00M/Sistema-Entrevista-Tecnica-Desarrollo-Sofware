## ADDED Requirements

### Requirement: Cada enlace del Marco teórico está verificado
Cada enlace citado en el Capítulo II SHALL haberse abierto en la sesión de trabajo. Su estado SHALL registrarse en `docs/marco-teorico-fuentes.md` con uno de cinco valores:
- `abre`: muestra el texto completo;
- `resumen`: muestra solo el resumen;
- `pago`: el texto completo exige suscripción;
- `404`;
- `rechazado`.

Ningún enlace con estado `404` o `rechazado` SHALL quedar en el texto entregado.

#### Scenario: Enlace roto
- **WHEN** un enlace devuelve 404 o rechaza la conexión
- **THEN** se busca otra URL que lleve a la misma obra (repositorio, editorial o página del autor) y, si no existe, la fuente pasa a reemplazo

#### Scenario: Sitio que bloquea el acceso automático
- **WHEN** la editorial devuelve 403 al acceso automático, como ACM o Hindawi
- **THEN** la obra se verifica a través de un registro alternativo (arXiv, IDEAS/RePEc, Crossref o el repositorio del autor) y se anota qué registro se consultó

### Requirement: Cada obra tiene un enlace de texto completo abierto
Cada obra SHALL llevar su DOI cuando exista. Si el DOI lleva a una página de pago o que solo muestra el resumen, la obra SHALL llevar además un enlace de texto completo abierto. Una obra sin ninguna versión accesible SHALL reemplazarse por otra fuente que respalde la misma idea, o retirarse junto con la afirmación que sostenía. El reemplazo SHALL contar con la aprobación de Jorge.

#### Scenario: DOI de pago con versión abierta
- **WHEN** el DOI de un artículo de ACM lleva a una página de pago y existe su versión en arXiv
- **THEN** la referencia APA conserva el DOI y la ficha muestra la URL de arXiv como enlace de consulta

#### Scenario: Sin versión accesible
- **WHEN** no se encuentra ninguna versión de texto completo de una obra
- **THEN** se propone a Jorge una fuente sustituta y la obra original no se usa hasta que él apruebe

### Requirement: Ficha de cita debajo de cada párrafo citado
Debajo de cada párrafo que cita una obra, el Word de trabajo SHALL incluir una ficha por cada obra citada en él, con estos campos:
- **Tipo de fuente:** artículo de revista, artículo de congreso, libro, sitio web, informe o norma.
- **Modo de acceso.**
- **Título.**
- **Título del sitio web o de la revista.**
- **Autores:** nombre y apellido de cada persona, o el autor corporativo.
- **Fecha de publicación.**
- **Resumen:** dos líneas sobre el contenido de la obra, en color verde.
- **URL directa de consulta.**

Una obra citada en varios párrafos SHALL tener los mismos datos en todas sus fichas.

#### Scenario: Párrafo con dos citas
- **WHEN** un párrafo cita a Zheng et al. (2023) y a Gu et al. (2024)
- **THEN** debajo de su línea «Fuente:» aparecen dos fichas, una por obra, cada una con su resumen en verde

#### Scenario: Autor corporativo
- **WHEN** la obra es la documentación de PostgreSQL o los Términos Comerciales de Anthropic
- **THEN** el campo Autores contiene el autor corporativo (PostgreSQL Global Development Group, Anthropic) y no un nombre de persona

### Requirement: Las fechas no se inventan
La fecha de publicación SHALL registrarse con el detalle que muestra la fuente:
- día, mes y año para las páginas web y las noticias que los muestran;
- solo el año para los artículos y los libros;
- «s. f.» para las páginas sin fecha, acompañado de la fecha de consulta.

Ningún día ni mes SHALL completarse por deducción.

#### Scenario: Página de documentación sin fecha
- **WHEN** una página de documentación oficial no muestra fecha de publicación
- **THEN** la ficha dice «s. f.» y registra la fecha de consulta, y la referencia APA usa «(s. f.)» con «Recuperado el … de URL»

### Requirement: Se suman fuentes en español sin cambiar el enfoque
Donde una idea ya presente en el capítulo pueda respaldarse con una fuente arbitrada de SciELO, Redalyc o Dialnet, esa fuente SHALL proponerse a Jorge como cita adicional. Ninguna fuente internacional arbitrada SHALL retirarse solo por no estar en español.

#### Scenario: Fuente en español sobre retroalimentación
- **WHEN** se encuentra en SciELO un artículo arbitrado sobre retroalimentación formativa
- **THEN** se agrega como cita adicional en 2.1.11, con su ficha, después de la aprobación de Jorge

### Requirement: Word de entrega sin fichas
El script generador SHALL poder producir el Word con las fichas y también sin ellas. La versión sin fichas SHALL ser idéntica en texto, citas y referencias.

#### Scenario: Preparar la entrega
- **WHEN** Jorge ejecuta el script con la opción `--sin-fichas`
- **THEN** obtiene el capítulo con citas, líneas «Fuente:» y referencias, pero sin los bloques de ficha
