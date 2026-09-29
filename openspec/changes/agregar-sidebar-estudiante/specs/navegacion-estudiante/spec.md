## Purpose

Define cómo se mueve el estudiante por su zona privada: qué destinos tiene siempre a mano, cómo la navegación refleja que dejó una entrevista sin terminar, y cómo sigue siendo utilizable cuando la pantalla no da para una barra lateral fija.

## ADDED Requirements

### Requirement: La navegación vive en un solo sitio

El sistema SHALL ofrecer la navegación de la zona autenticada en una barra lateral. Los mismos destinos MUST NOT aparecer simultáneamente en la barra lateral y en el encabezado.

#### Scenario: El estudiante entra a su zona privada

- **WHEN** un usuario autenticado abre cualquier pantalla de la aplicación
- **THEN** ve la barra lateral con sus destinos
- **AND** el encabezado no repite esos destinos

#### Scenario: Los destinos permanentes están disponibles

- **WHEN** el estudiante mira la barra lateral
- **THEN** encuentra accesos a iniciar una entrevista nueva, a su historial y progreso, a su retroalimentación acumulada y a su perfil
- **AND** encuentra la acción de cerrar sesión

#### Scenario: La sección actual se distingue

- **WHEN** el estudiante está en una de esas secciones
- **THEN** su acceso en la barra lateral se muestra como activo
- **AND** esa distinción no depende únicamente del color

### Requirement: La navegación avisa de una entrevista sin terminar

Cuando el estudiante tenga una entrevista en progreso, la barra lateral SHALL ofrecer un acceso directo para retomarla, indicando de qué entrevista se trata.

#### Scenario: Hay una entrevista a medias

- **WHEN** el estudiante tiene una entrevista en estado en progreso
- **THEN** la barra lateral muestra un acceso para continuarla
- **AND** ese acceso indica el área de la entrevista y en qué pregunta se quedó
- **AND** activarlo lleva a la conversación de esa entrevista

#### Scenario: No hay ninguna a medias

- **WHEN** el estudiante no tiene ninguna entrevista en progreso
- **THEN** ese acceso no aparece

#### Scenario: Varias entrevistas a medias

- **WHEN** el estudiante tiene más de una entrevista en progreso
- **THEN** el acceso corresponde a la más reciente

#### Scenario: El aviso se actualiza al terminar

- **WHEN** el estudiante termina la entrevista que tenía en curso
- **THEN** el acceso para continuarla deja de mostrarse

### Requirement: La barra lateral se adapta a pantallas estrechas

En anchos donde una barra fija dejaría sin espacio al contenido, la navegación SHALL ocultarse y poder abrirse bajo demanda, sin perder ningún destino.

#### Scenario: Visita desde un teléfono

- **WHEN** el estudiante abre la aplicación en una pantalla estrecha
- **THEN** la barra lateral no ocupa espacio permanente
- **AND** existe un control visible para abrirla
- **AND** el contenido de la pantalla se lee sin desplazamiento horizontal

#### Scenario: Abrir y cerrar la navegación

- **WHEN** el estudiante activa el control de menú
- **THEN** la navegación se muestra sobre el contenido con todos sus destinos
- **AND** puede cerrarse con la tecla de escape, activando el control de nuevo, o interactuando fuera de ella

#### Scenario: Navegar la cierra

- **WHEN** el estudiante elige un destino con la navegación abierta en pantalla estrecha
- **THEN** la navegación se cierra al llegar al destino

### Requirement: La barra lateral se puede plegar en pantallas anchas

En pantallas donde la barra es fija, el estudiante SHALL poder plegarla a una franja de iconos para recuperar ancho de contenido, sin perder ningún destino.

#### Scenario: Plegar la barra

- **WHEN** el estudiante activa el control de plegado
- **THEN** la barra se reduce a una franja de iconos
- **AND** el área de contenido se ensancha para ocupar el espacio liberado
- **AND** todos los destinos siguen siendo alcanzables

#### Scenario: Los destinos plegados se siguen identificando

- **WHEN** la barra está plegada
- **THEN** cada destino conserva una descripción textual accesible, aunque su etiqueta no se muestre

#### Scenario: Volver a desplegar

- **WHEN** el estudiante activa el control estando plegada
- **THEN** la barra recupera su ancho y sus etiquetas

### Requirement: La navegación es operable con teclado

Toda la navegación SHALL ser alcanzable y operable sin ratón, y el foco MUST NOT perderse al abrir o cerrar la versión desplegable.

#### Scenario: Recorrido con teclado

- **WHEN** el estudiante tabula por la aplicación
- **THEN** alcanza cada destino de la navegación
- **AND** el elemento enfocado es siempre visible

#### Scenario: El foco vuelve donde estaba

- **WHEN** el estudiante abre la navegación desplegable y la cierra sin elegir destino
- **THEN** el foco regresa al control que la abrió

#### Scenario: El foco no se escapa

- **WHEN** la navegación está abierta sobre el contenido
- **THEN** el recorrido con teclado se mantiene dentro de ella hasta que se cierra

### Requirement: El perfil del estudiante es consultable

El sistema SHALL permitir al estudiante consultar los datos de su cuenta.

#### Scenario: Consulta del perfil

- **WHEN** el estudiante abre su perfil
- **THEN** ve su nombre, su correo y su fecha de registro
- **AND** ve su carnet cuando lo haya indicado

#### Scenario: El perfil es de solo lectura

- **WHEN** el estudiante consulta su perfil
- **THEN** no se le ofrece editar esos datos
