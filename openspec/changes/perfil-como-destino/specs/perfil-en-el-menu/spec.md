## ADDED Requirements

### Requirement: «Mi perfil» es un destino del menú
El menú lateral SHALL tener un tercer grupo, «Tu cuenta», debajo de «Tu progreso», con un solo destino, «Mi perfil» (`/perfil`). Ese destino SHALL comportarse como los demás:
- se marca como actual en `/perfil`;
- con el menú plegado o en el riel de tablet, muestra un tooltip «Mi perfil»;
- aparece igual en el cajón de celular, y al elegirlo el cajón se cierra.

#### Scenario: Menú desplegado
- **WHEN** el usuario mira el sidebar en escritorio
- **THEN** ve, en orden, «PREPARARTE», «TU PROGRESO» y «TU CUENTA», y en este último «Mi perfil»

#### Scenario: Destino actual
- **WHEN** el usuario está en `/perfil`
- **THEN** «Mi perfil» está marcado como actual

#### Scenario: Menú plegado
- **WHEN** el sidebar está plegado y el usuario pasa el cursor o el foco por el ícono de «Mi perfil»
- **THEN** ve el tooltip «Mi perfil»

### Requirement: El pie del sidebar solo informa
El bloque del pie con el avatar, el nombre y el correo SHALL ser información y no un enlace: no recibe foco, no tiene chevron ni estilo de enlace, y al pulsarlo no navega. Plegado SHALL mostrar solo el avatar, con el nombre en un tooltip. «Cerrar sesión» MUST seguir debajo, sin cambios. Al perfil SHALL llegarse solo por el destino «Mi perfil».

#### Scenario: Un solo camino al perfil
- **WHEN** el usuario recorre el sidebar con Tab
- **THEN** el foco pasa por «Mi perfil» y por «Cerrar sesión», pero no por el bloque de su nombre

#### Scenario: Pie desplegado
- **WHEN** el usuario mira el pie del sidebar desplegado
- **THEN** ve su avatar, su nombre y su correo, y debajo «Cerrar sesión»
