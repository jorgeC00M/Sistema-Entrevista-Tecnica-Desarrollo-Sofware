## Context

El cambio `profundizar-marco-teorico` produjo tres archivos:
- `docs/marco-teorico-borrador.md`, con 50 referencias en APA 7;
- `docs/marco-teorico-fuentes.md`, la tabla de fuentes;
- `docs/capitulo-2-marco-teorico.docx`, generado por `docs/herramientas/generar_marco_teorico.py`.

Cada párrafo citado termina en una línea «Fuente:» con uno o más enlaces.

Problemas conocidos de los enlaces:

| Fuente | Problema | Detalle |
| :---- | :---- | :---- |
| Hidden Workers (Fuller et al., 2021) | 404 | El enlace de hbs.edu da 404. El alternativo, en nahr.shrm.org, no se comprobó. |
| Behroozi et al. (2019, 2020) | Conexión rechazada | par.nsf.gov rechazó la conexión. |
| Ji et al. (2023), P. Liu et al. (2023) | 403 | ACM bloquea el acceso automático. |
| Chen et al. (2018) | 403 | Hindawi bloquea el acceso automático. |
| Powell et al. (2018) | DOI no confirmado | El DOI 10.1037/cbs0000108 abre APA PsycNet, pero no muestra contenido. |
| Levashina et al. (2014), Schmidt & Hunter (1998), Hattie & Timperley (2007), Shute (2008), Burrows et al. (2015) | Pago | Wiley, APA, SAGE y Springer suelen ser de pago. |
| Pressman & Maxim (2020), Sommerville (2016), Russell & Norvig (2022), Beck & Andres (2004) | Solo ISBN | Libros de pago, sin URL. |

Jorge decidió tres cosas:
1. Las fichas van debajo de cada cita, en un solo Word.
2. Se conserva el DOI y se agrega una versión abierta; la fuente se reemplaza solo si no existe ninguna.
3. Se combinan fuentes internacionales con fuentes en español.

## Goals / Non-Goals

**Goals:**
- Cada enlace del capítulo se abre y lleva a la obra citada.
- Cada obra tiene un texto completo que el jurado puede leer sin pagar, o se reemplaza.
- Cada cita tiene su ficha con los datos que pide la herramienta de citas de Google Docs.
- Se suman fuentes en español donde respalden ideas ya escritas.

**Non-Goals:**
- No se reescribe el capítulo. Solo cambian las citas, los enlaces y las fichas, y el texto mínimo donde se reemplace una fuente.
- No se tocan el perfil `.md` ni los Capítulos I y III.

## Decisions

### D1. Orden de preferencia de los enlaces
1. **DOI** (`https://doi.org/...`). Es lo que exige APA 7 y no caduca.
2. **Página de la editorial o del congreso:** ACL Anthology, OpenReview, proceedings de NeurIPS.
3. **Repositorio abierto:** arXiv, SciELO, Redalyc, Dialnet, repositorio institucional o página del autor.
4. **Documentación oficial** del producto o la norma.

**Google Scholar se usa solo para buscar.** Sus enlaces son resultados de búsqueda y no identifican de forma estable una obra.

La referencia APA lleva el DOI, o la URL cuando no hay DOI. La ficha lleva la **URL de consulta abierta**, que es la que el jurado puede leer.

### D2. Cómo se verifican los enlaces
- Se usa el agente `web-fetch` en lotes de unas 15 URL.
- Si un sitio bloquea el acceso automático (403), la obra se verifica a través de un registro alternativo: arXiv, Crossref (`api.crossref.org/works/<doi>`), IDEAS/RePEc, Semantic Scholar o el repositorio del autor. Se anota qué registro se consultó.
- Cada fuente se anota en `docs/marco-teorico-fuentes.md` con:
  - su estado: `abre`, `resumen`, `pago`, `404` o `rechazado`;
  - la URL de consulta elegida;
  - la fecha de verificación.

### D3. Correspondencia de cada campo de la ficha con Google Docs

| Campo de la ficha | Valor | En Google Docs |
| :---- | :---- | :---- |
| Tipo de fuente | Artículo de revista, Artículo de congreso, Libro, Sitio web, Informe o Norma | «Tipo de fuente». Si una categoría no existe en Google Docs, se usa la más cercana y se indica entre paréntesis. |
| Modo de acceso | Sitio web, Base de datos en línea o Impreso, según cómo se accede a la obra | «Modo de acceso» |
| Título | Título exacto de la obra | «Título» |
| Título del sitio web / revista | Revista, actas o sitio | «Título del sitio web» o «Revista» |
| Autores | Nombre y apellido de cada persona en el orden de la obra, o el autor corporativo | «Autores» (persona u organización) |
| Fecha de publicación | Según D4 | «Fecha de publicación» |
| Resumen | Dos líneas, en verde | No va en Google Docs; es para que Jorge sepa qué dice la obra. |
| URL | URL de consulta abierta (D1) | «URL» |

[VERIFICAR durante la implementación] Antes de completar las fichas se revisa cómo llama Google Docs a sus tipos de fuente y a su campo «modo de acceso», para escribir los mismos nombres.

### D4. Fechas
- **Páginas web y noticias que muestran fecha:** día, mes y año.
- **Artículos, libros, tesis y normas:** solo el año.
- **Páginas sin fecha:** «s. f.», más la fecha de consulta.

Nunca se deduce ni el día ni el mes.

### D5. Fuentes en español
- Se buscan en SciELO, Redalyc y Dialnet, solo para ideas que ya están en el texto: entrevista de empleo estructurada, ansiedad en la entrevista, retroalimentación formativa, sistemas de reclutamiento o ATS, chatbots en educación y evaluación automática.
- Se priorizan artículos arbitrados de los últimos 8 años.
- Se presentan a Jorge en una tabla para que los apruebe antes de integrarlos.

### D6. Una sola tabla de datos para las fichas
Los datos de cada ficha se escriben **una vez**, en una tabla «Fichas de cita» del borrador: una fila por obra, identificada con la misma clave que ya usa la referencia (por ejemplo `Zheng|2023`).

El script toma de la línea «Fuente:» de cada párrafo qué obras se citan y genera debajo una ficha por obra. Así, una obra citada en varios párrafos tiene siempre los mismos datos.

### D7. Formato en Word y opción `--sin-fichas`
- **Cada ficha** es un bloque sombreado en gris claro, a 9 pt, con los rótulos en negrita.
- **El resumen** va en verde, `RGBColor(0x1B, 0x7F, 0x3B)`.
- **Opción `--sin-fichas`:** el script genera el Word para la entrega, sin las fichas y con el resto idéntico.
- **Cruce de datos:** el cruce de citas que ya hace el script se amplía. Si una obra citada no tiene ficha, o una ficha no corresponde a ninguna cita, el script falla.

## Risks / Trade-offs

- **[Las fichas dentro del capítulo]** Si Jorge copia el Word con fichas al documento oficial, entregaría material de trabajo. → Mitigación: la opción `--sin-fichas` y un aviso en la primera página del Word de trabajo.
- **[Sitios que bloquean el acceso automático]** Que la herramienta no pueda abrir una página no significa que el jurado tampoco pueda. → Mitigación: verificar a través de registros alternativos (D2) y distinguir en la tabla `rechazado (automático)` de `404`.
- **[Libros sin versión abierta]** Pressman, Sommerville, Russell & Norvig y Beck son libros de pago. → Mitigación: se mantienen, porque son textos de referencia de la carrera. La ficha usa el modo de acceso «Impreso» y la URL de la ficha editorial, y se le avisa a Jorge que el jurado los consulta en biblioteca.
- **[Más fuentes, más verificación]** Cada fuente en español nueva es otra fila que Jorge debe comprobar. → Mitigación: se limitan a las que respaldan ideas existentes y requieren su aprobación.

## Open Questions

- ¿Jorge prefiere que el resumen en verde vaya también en el Word de entrega como nota al pie? Supuesto: no; solo en el de trabajo.
