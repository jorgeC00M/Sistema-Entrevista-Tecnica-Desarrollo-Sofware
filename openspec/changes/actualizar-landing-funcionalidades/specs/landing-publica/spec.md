## Purpose

Presentar el sistema a quien todavía no tiene cuenta, describiendo con exactitud
lo que hace, y llevarlo al registro.

## ADDED Requirements

### Requirement: La landing describe solo lo que el sistema hace

Todo lo que la landing afirma sobre el funcionamiento MUST corresponder al
comportamiento actual del sistema. En particular SHALL decir que se elige un
puesto y un nivel (con tecnología opcional), que la nota se conoce al terminar
la entrevista y que las preguntas se ajustan a partir de la tercera. MUST NOT
afirmar que una misma respuesta obtiene siempre la misma nota, ni que los
resultados se ven al instante.

#### Scenario: Cómo se arma la entrevista

- **WHEN** el visitante lee cómo funciona
- **THEN** el primer paso dice que elige puesto y nivel, no un área

#### Scenario: Cuándo se ve la nota

- **WHEN** el visitante lee el encabezado o la vista previa
- **THEN** se indica que la nota se conoce al terminar la entrevista
- **AND** no aparece "resultados al instante"

#### Scenario: Qué garantiza la evaluación

- **WHEN** el visitante lee qué recibe
- **THEN** se explica que todas las respuestas se califican con la misma rúbrica y sin depender del orden de la entrevista
- **AND** no se promete que la misma respuesta obtenga siempre la misma nota

### Requirement: La landing presenta el seguimiento del progreso

La sección de lo que recibe el usuario SHALL mencionar el historial de
entrevistas, las estadísticas por tema y la retroalimentación acumulada.

#### Scenario: Progreso visible

- **WHEN** el visitante lee qué recibe al terminar
- **THEN** encuentra una tarjeta sobre su progreso con esas tres funciones

### Requirement: La landing presenta la revisión del CV

La landing SHALL incluir una sección sobre la revisión del currículum contra un
ATS que explique: qué datos extrae el ATS del CV, la comparación opcional con
una convocatoria (requisitos demostrados, declarados o ausentes, años y cargo) y
las sugerencias de redacción generadas por IA, rotuladas como tales. La sección
MUST aclarar que no se calcula un puntaje y por qué. SHALL ser accesible desde la
navegación del encabezado y del pie.

#### Scenario: Sección presente

- **WHEN** el visitante recorre la landing
- **THEN** encuentra la sección de revisión del CV con sus tres partes

#### Scenario: Sin puntaje

- **WHEN** el visitante lee la sección de CV
- **THEN** se indica que no hay un puntaje porque los ATS reales no puntúan

#### Scenario: Navegación

- **WHEN** el visitante pulsa "Revisión de CV" en el encabezado
- **THEN** la página se desplaza a esa sección

### Requirement: Los puestos se exploran mediante un carrusel navegable

La landing SHALL presentar los puestos del catálogo público en un carrusel, cada
uno con las áreas técnicas que recorre su entrevista. MUST mostrar solo los
puestos y áreas reales del catálogo. Conserva el comportamiento del carrusel
anterior: avance automático, flechas e indicadores, pausa al pasar el puntero,
deslizamiento táctil y tres, dos o una tarjeta visibles según el ancho; sin
navegación cuando todos los puestos caben a la vez. Reemplaza el requisito "Las
áreas técnicas se exploran mediante un carrusel navegable".

#### Scenario: Puesto con sus áreas

- **WHEN** el visitante ve la tarjeta de un puesto
- **THEN** ve el nombre del puesto, su descripción y las áreas que cubre su entrevista

#### Scenario: Todos caben

- **WHEN** el catálogo tiene tres puestos y la pantalla es de escritorio
- **THEN** se muestran los tres sin flechas ni indicadores

#### Scenario: Navegación en el teléfono

- **WHEN** el visitante abre la sección en un teléfono
- **THEN** ve un puesto a la vez y puede deslizar o usar las flechas para ver los demás

#### Scenario: Sin catálogo

- **WHEN** el catálogo público no responde
- **THEN** la sección de puestos y la franja de datos se omiten y el resto de la landing funciona

### Requirement: La franja de datos usa solo cifras del catálogo

La franja de datos SHALL mostrar la cantidad de puestos, de preguntas por
entrevista, de áreas técnicas y de niveles, todas tomadas del catálogo público.
MUST NOT mostrar cifras que no provengan de él.

#### Scenario: Cifras reales

- **WHEN** el catálogo publica 3 puestos, 5 preguntas, 7 áreas y 3 niveles
- **THEN** la franja muestra exactamente esas cuatro cifras
