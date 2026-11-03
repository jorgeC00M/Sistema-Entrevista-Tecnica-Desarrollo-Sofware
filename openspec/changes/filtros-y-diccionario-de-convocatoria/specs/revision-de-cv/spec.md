## Purpose

Diagnosticar por qué un currículum queda fuera de la búsqueda de un reclutador que usa un ATS, midiendo el documento regla por regla y sin publicar nunca un puntaje.

## ADDED Requirements

### Requirement: Las preguntas de filtro del aviso se buscan en el CV
Cuando la convocatoria pida, en su bloque obligatorio, un título profesional, un idioma, o una ubicación o modalidad, el análisis SHALL informar cada uno como una pregunta de filtro con uno de estos estados:
- `cumple`: el CV lo muestra;
- `no_aparece`: el CV no lo menciona;
- `no_verificable`: el CV menciona algo relacionado, pero no alcanza para decidir.

El sistema MUST NOT presentar un filtro como «no cumples». La ausencia en el CV se informa como «No aparece en tu CV».

Un filtro que el texto del aviso no permita identificar con reglas MUST NOT informarse. Lo que diga el bloque de deseables MUST NOT generar filtros.

Los filtros MUST NOT contar en la cobertura de obligatorias ni de deseables.

#### Scenario: Egresado frente a un aviso que pide titulado
- **WHEN** el aviso pide «Titulado en Ingeniería de Sistemas» y la sección Educación del CV dice «Egresado de Ingeniería de Sistemas»
- **THEN** el filtro de título se informa como `no_verificable`, con la nota de que el aviso pide título y el CV dice egresado

#### Scenario: Idioma no mencionado
- **WHEN** el aviso pide «Inglés intermedio» y el CV no menciona el inglés
- **THEN** el filtro de idioma se informa como «No aparece en tu CV»

#### Scenario: Idioma con nivel suficiente
- **WHEN** el aviso pide inglés intermedio y el CV dice «Inglés: B2»
- **THEN** el filtro de idioma se informa como `cumple`

#### Scenario: Ubicación coincidente
- **WHEN** el aviso pide trabajo presencial en Cochabamba y la ubicación detectada del CV es Cochabamba
- **THEN** el filtro de ubicación se informa como `cumple`

#### Scenario: Una materia no es un título
- **WHEN** el aviso menciona «conocimientos de ingeniería de software» sin pedir un grado
- **THEN** no se informa ningún filtro de título

#### Scenario: Pedido solo como deseable
- **WHEN** el aviso pone «Inglés avanzado» bajo «Deseable»
- **THEN** no se informa filtro de idioma

### Requirement: El diccionario reconoce las herramientas frecuentes en avisos locales
El diccionario de términos SHALL reconocer, con sus variantes y con límites de palabra, herramientas de BI, ERP, gestión de proyectos, diseño y sistemas operativos que aparecen a menudo en avisos de Bolivia. Por ejemplo: Power BI, Excel avanzado, SAP, Tableau, Jira, Figma y Linux.

Un término nuevo MUST NOT encajar dentro de otra palabra.

#### Scenario: Power BI en el aviso y en el CV
- **WHEN** el aviso pide «PowerBI» y el CV dice «Power BI» en su experiencia
- **THEN** el requisito Power BI aparece como demostrado

#### Scenario: Sin falso positivo
- **WHEN** un texto dice «sapiencia»
- **THEN** no se reconoce SAP

### Requirement: Un cambio de reglas recalcula los análisis anteriores
Al cambiar lo que producen el análisis o la brecha, `VERSION_DE_REGLAS` SHALL subir. Un análisis guardado con una versión anterior SHALL recalcularse cuando se vuelva a subir el mismo CV con la misma convocatoria.

#### Scenario: CV analizado antes de los filtros
- **WHEN** un usuario vuelve a subir un CV analizado con la versión 4
- **THEN** el análisis se recalcula con la versión 5 e incluye los filtros
