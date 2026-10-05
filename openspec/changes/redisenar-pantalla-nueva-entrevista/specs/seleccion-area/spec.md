## Purpose

Permite al egresado configurar una entrevista simulada eligiendo el puesto al que
postula, el nivel de exigencia y —opcionalmente— la tecnología, y presentar esas
elecciones de forma que pueda compararlas y confirmar qué va a ocurrir antes de
empezar.

## ADDED Requirements

### Requirement: Las opciones de puesto se pueden comparar de un vistazo

La pantalla SHALL presentar todas las opciones de puesto simultáneamente visibles
cuando el ancho disponible lo permita, de modo que el usuario pueda compararlas
sin recordar las que quedaron fuera de la vista.

#### Scenario: Pantalla ancha

- **WHEN** el usuario abre la pantalla de configuración en una pantalla ancha
- **THEN** todas las opciones de puesto son visibles a la vez sin desplazarse

#### Scenario: Pantalla estrecha

- **WHEN** el ancho disponible no permite mostrarlas todas en paralelo
- **THEN** las opciones se apilan en una sola columna conservando el mismo
  contenido y el mismo orden

### Requirement: La información de cada opción no se duplica

La pantalla SHALL mostrar los temas que recorrerá la entrevista una sola vez, y
únicamente los del puesto que el usuario tiene elegido. Las opciones no
seleccionadas MUST NOT enumerar sus temas.

#### Scenario: Ningún puesto elegido todavía

- **WHEN** el usuario no ha elegido ningún puesto
- **THEN** no se muestra ninguna lista de temas

#### Scenario: Un puesto elegido

- **WHEN** el usuario elige un puesto
- **THEN** se muestran los temas de ese puesto en un solo lugar de la pantalla
- **AND** las demás opciones de puesto siguen sin enumerar temas

#### Scenario: El usuario cambia de puesto

- **WHEN** el usuario elige un puesto distinto al que tenía
- **THEN** los temas mostrados pasan a ser los del puesto nuevo

### Requirement: La acción de comenzar está siempre alcanzable

La acción que inicia la entrevista SHALL permanecer visible y accionable mientras
el usuario recorre la pantalla, sin exigirle desplazarse hasta el final del
contenido para encontrarla.

#### Scenario: El usuario se desplaza por la pantalla

- **WHEN** el contenido excede el alto de la ventana y el usuario se desplaza
- **THEN** la acción de comenzar la entrevista sigue visible

#### Scenario: La acción no tapa el control enfocado

- **WHEN** el usuario recorre los controles con el teclado y llega al último
- **AND** la acción de comenzar se presenta como elemento fijo sobre el contenido
- **THEN** el control enfocado queda visible y no queda oculto tras ese elemento

### Requirement: Cuando no se puede comenzar, la pantalla explica qué falta

Mientras falte alguna elección obligatoria, la pantalla SHALL indicar en texto qué
elección falta. Deshabilitar la acción MUST NOT ser la única señal de que no se
puede continuar.

#### Scenario: No se ha elegido nada

- **WHEN** el usuario no ha elegido puesto ni nivel
- **THEN** la pantalla indica que faltan ambas elecciones
- **AND** la acción de comenzar permanece deshabilitada

#### Scenario: Falta solo una elección

- **WHEN** el usuario ha elegido el puesto pero no el nivel
- **THEN** la pantalla indica que falta elegir el nivel
- **AND** la acción de comenzar permanece deshabilitada

#### Scenario: Todo lo obligatorio elegido

- **WHEN** el usuario ha elegido puesto y nivel
- **THEN** la pantalla deja de señalar elecciones pendientes
- **AND** la acción de comenzar queda habilitada

### Requirement: La pantalla anuncia cuándo llegará la calificación

La pantalla SHALL anunciar que la calificación y la retroalimentación se entregan
al terminar la entrevista. La pantalla MUST NOT prometer retroalimentación durante
la entrevista, porque el sistema no la publica hasta que la entrevista termina.

#### Scenario: Se anuncia el momento de la calificación

- **WHEN** el usuario consulta el resumen de la sesión que va a iniciar
- **THEN** se le informa que la calificación y la retroalimentación aparecen al
  terminar la entrevista

#### Scenario: Coherencia con la pantalla de la entrevista

- **WHEN** se comparan el anuncio de esta pantalla y el de la pantalla de la
  entrevista en curso
- **THEN** ambos afirman lo mismo sobre cuándo se entrega la calificación

### Requirement: El resumen refleja las elecciones vigentes

La pantalla SHALL mostrar un resumen de la sesión que va a iniciarse, derivado de
las elecciones actuales del usuario y actualizado cada vez que una cambia.

#### Scenario: El resumen recoge las tres elecciones

- **WHEN** el usuario ha elegido puesto, nivel y tecnología
- **THEN** el resumen nombra el puesto, el nivel y la tecnología elegidos
- **AND** indica cuántas preguntas tendrá la entrevista

#### Scenario: Sin preferencia de tecnología

- **WHEN** el usuario no fija una tecnología
- **THEN** el resumen no afirma ninguna tecnología

#### Scenario: Una elección cambia

- **WHEN** el usuario cambia una de sus elecciones
- **THEN** el resumen pasa a reflejar la elección nueva
