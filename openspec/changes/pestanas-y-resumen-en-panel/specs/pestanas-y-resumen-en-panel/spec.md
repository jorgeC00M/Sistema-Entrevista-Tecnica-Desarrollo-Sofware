## Purpose

Presentar los dos modos de configurar la entrevista como pestañas con nombres claros, y reunir dentro del mismo panel los campos, el resumen de lo elegido y la acción de iniciar.

## ADDED Requirements

### Requirement: Modos como pestañas

El formulario SHALL ofrecer dos pestañas: "Personalizada" (seleccionada al entrar) y "Con convocatoria". Deben exponerse como una lista de pestañas, con la seleccionada indicada visualmente y para lectores de pantalla. Con el foco en una pestaña, las flechas izquierda y derecha MUST seleccionar la anterior y la siguiente (dando la vuelta), e Inicio y Fin la primera y la última. Solo la pestaña seleccionada MUST ser alcanzable con Tab.

#### Scenario: Cambiar con el teclado
- **WHEN** el foco está en "Personalizada" y el usuario pulsa flecha derecha
- **THEN** queda seleccionada "Con convocatoria", recibe el foco y se muestra la entrada de la convocatoria

#### Scenario: Lector de pantalla
- **WHEN** un usuario de lector de pantalla llega a las pestañas
- **THEN** se anuncia "Personalizada, pestaña, seleccionada, 1 de 2"

#### Scenario: Volver a Personalizada
- **WHEN** después de analizar una convocatoria el usuario selecciona "Personalizada"
- **THEN** los campos conservan sus valores y la entrevista deja de usar la convocatoria

### Requirement: Resumen dentro del panel

Debajo de los campos, dentro del mismo panel, el formulario SHALL mostrar el resumen de la configuración:
- **completa:** "Puesto · Tecnología · Nivel · N preguntas" y, si el puesto tiene áreas, "Cubre: …";
- **incompleta:** el primer campo que falta ("Elige el nivel").

Si la configuración viene de una convocatoria en uso, el resumen MUST mostrar la etiqueta "Desde convocatoria". La pantalla MUST NOT mostrar una barra fija aparte.

#### Scenario: Configuración completa
- **WHEN** el usuario elige QA Tester / Automatizador, Junior y Playwright
- **THEN** bajo el campo Tecnología se lee "QA Tester / Automatizador · Playwright · Junior · 5 preguntas" y "Cubre: Fundamentos de Programación, Pruebas de Software, Bases de Datos"

#### Scenario: Falta un campo
- **WHEN** solo está elegido el puesto
- **THEN** el resumen dice "Elige el nivel"

### Requirement: Botón "Iniciar entrevista"

El botón para empezar SHALL decir "Iniciar entrevista" y ubicarse abajo a la derecha del panel. MUST tener tamaño compacto, sin ocupar todo el ancho del panel en ningún tamaño de pantalla. MUST estar deshabilitado mientras falte algún campo, e indicar que está cargando mientras se inicia la entrevista. Un error al iniciar MUST mostrarse dentro del panel, junto al botón.

#### Scenario: Iniciar
- **WHEN** la configuración está completa y el usuario pulsa "Iniciar entrevista"
- **THEN** el botón muestra que está cargando y, al crearse la entrevista, se abre la entrevista

#### Scenario: Error al iniciar
- **WHEN** el servidor rechaza el inicio
- **THEN** el mensaje aparece dentro del panel, encima del botón, y el botón vuelve a estar disponible

#### Scenario: Foco tras repetir
- **WHEN** "Repetir última" aplica una configuración completa
- **THEN** el foco va a "Iniciar entrevista"
