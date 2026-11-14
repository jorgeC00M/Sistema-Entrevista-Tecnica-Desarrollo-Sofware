## Purpose

Define cómo el marco teórico de la tesis atribuye sus tablas y figuras, referencia sus libros, presenta las obras ya citadas y ubica las citas dentro de cada párrafo.

## ADDED Requirements

### Requirement: Cada tabla y figura indica su fuente según su origen
Debajo de cada tabla y figura del marco teórico, la línea «Fuente:» SHALL decir, según su origen:
- «Fuente: Autor (año)», si se tomó tal cual de una obra;
- «Fuente: Elaboración propia con base en Autor (año) y Autor (año)», si se armó a partir de varias obras;
- «Fuente: Elaboración propia», si es un diagrama del propio sistema.

Toda obra nombrada en esa línea SHALL tener su referencia y su ficha de cita. El título de la tabla o figura MUST NOT repetir la autoría.

#### Scenario: Tabla armada con varias obras
- **WHEN** se lee la Tabla 3, que resume a Adamopoulou y Moussiades (2020) y a Zhao et al. (2023)
- **THEN** debajo dice «Fuente: Elaboración propia con base en Adamopoulou y Moussiades (2020) y Zhao et al. (2023)»

#### Scenario: Logotipo tomado de su dueño
- **WHEN** se lee la figura del logotipo de React
- **THEN** debajo dice «Fuente: Meta (s. f.)» y la lista de referencias incluye esa obra

#### Scenario: Diagrama del sistema
- **WHEN** se lee la figura de la arquitectura del sistema
- **THEN** debajo dice «Fuente: Elaboración propia»

### Requirement: Las referencias de libros llevan editorial, enlace y página
Cada referencia de libro SHALL seguir APA 7 con autor, año, título, edición, editorial y URL, y MUST NOT llevar ISBN.

La URL:
- SHALL abrir el libro o una página desde donde se lo pueda leer o descargar legalmente;
- cuando el libro es comercial y no tiene acceso abierto, SHALL ser la del préstamo en Internet Archive o la de la editorial;
- MUST NOT apuntar a copias no autorizadas.

La ficha de cita de cada libro SHALL tener el campo «Páginas». Una página que no se pudo verificar SHALL marcarse `[VERIFICAR página]` y figurar en «Para revisar manualmente».

#### Scenario: Libro de acceso abierto
- **WHEN** se abre el enlace de la referencia de Pro Git
- **THEN** se ve el texto del libro, y su ficha indica la página de lo citado

#### Scenario: Libro comercial
- **WHEN** se lee la referencia de Sommerville (2016)
- **THEN** incluye la editorial Pearson y un enlace a su página de préstamo o de la editorial, sin ISBN

#### Scenario: Enlace caído
- **WHEN** se lee la referencia de Manning y Schütze (1999)
- **THEN** su enlace ya no es https://nlp.stanford.edu/fsnlp/

### Requirement: Una obra ya citada solo se selecciona
En el Word de trabajo:
- la primera vez que aparece una obra, SHALL mostrarse su ficha completa;
- cada vez siguiente, SHALL mostrarse una sola línea «Selecciona la cita: Autor (año)», en lugar de repetir la ficha.

El Word de entrega MUST NOT llevar fichas ni esas líneas.

#### Scenario: Segunda cita de la misma obra
- **WHEN** Zhao et al. (2023) se cita en una sección y vuelve a citarse en otra
- **THEN** la primera muestra su ficha completa y la segunda solo «Selecciona la cita: Zhao et al. (2023)»

### Requirement: La cita se ubica según lo que se quiere destacar
Cada cita del marco teórico SHALL ir en una de estas tres posiciones:
- **Al principio, como cita narrativa**, cuando se destaca al autor: el apellido integrado en la oración y el año entre paréntesis.
- **En medio**, cuando conecta la idea del autor con una afirmación propia.
- **Al final, como cita parentética**, cuando importa el dato: autor y año entre paréntesis.

Los párrafos que sintetizan varias fuentes SHALL enlazarlas con conectores naturales («Por su parte», «En la misma línea», «En contraste») y MUST NOT encadenar citas sin relación entre ellas.

Las correcciones MUST NOT cambiar lo que el texto afirma.

#### Scenario: El autor es el protagonista
- **WHEN** un párrafo presenta lo que propuso un autor
- **THEN** empieza con la cita narrativa, por ejemplo «Fielding (2000) definió…»

#### Scenario: Síntesis de dos fuentes
- **WHEN** un párrafo combina lo que dicen dos obras
- **THEN** las enlaza con un conector y cada idea lleva su cita
