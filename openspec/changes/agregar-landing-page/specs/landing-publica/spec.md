## Purpose

Presenta el servicio a quien todavía no tiene cuenta, con la información suficiente para que decida registrarse, y reparte la ruta raíz entre el visitante anónimo, que ve esa presentación, y el usuario con sesión, que espera encontrar su aplicación.

## ADDED Requirements

### Requirement: La raíz es pública para quien no tiene sesión

La ruta `/` SHALL ser accesible sin autenticación y mostrar la presentación del servicio. El visitante MUST NOT ser redirigido a la pantalla de inicio de sesión antes de haber podido leerla.

#### Scenario: Visitante anónimo abre la aplicación

- **WHEN** una persona sin sesión abre la ruta raíz
- **THEN** ve la presentación del servicio
- **AND** no se le pide autenticarse para leerla

#### Scenario: Usuario con sesión abre la raíz

- **WHEN** una persona con sesión activa abre la ruta raíz
- **THEN** el sistema la lleva directamente a iniciar una entrevista
- **AND** no ve la presentación

#### Scenario: La sesión caducada no atrapa al visitante

- **WHEN** una persona cuyo token ya no es válido abre la ruta raíz
- **THEN** ve la presentación del servicio en lugar de un error

### Requirement: La presentación explica el servicio antes de pedir nada

La presentación SHALL comunicar, sin exigir registro previo, qué hace el sistema, cómo se desarrolla una entrevista y qué recibe el usuario al terminarla.

#### Scenario: El visitante entiende el funcionamiento

- **WHEN** el visitante recorre la presentación
- **THEN** encuentra explicado el recorrido de una entrevista, desde elegir área y nivel hasta recibir los resultados
- **AND** encuentra cuántas preguntas tiene una entrevista
- **AND** encuentra qué devuelve la evaluación: una puntuación, fortalezas, debilidades y sugerencias

#### Scenario: El visitante conoce el alcance real

- **WHEN** el visitante recorre la presentación
- **THEN** encuentra indicado que la evaluación la genera una inteligencia artificial y no sustituye a un entrevistador humano

### Requirement: Las áreas y niveles mostrados provienen del backend

La presentación SHALL obtener del backend las áreas técnicas y los niveles que anuncia. El cliente MUST NOT mantener su propia copia de esas listas.

#### Scenario: Se anuncian las áreas activas

- **WHEN** el visitante abre la presentación y el backend responde
- **THEN** se muestran las áreas y los niveles marcados como activos, con el nombre que envía el backend

#### Scenario: Un área dada de baja deja de anunciarse

- **WHEN** un área se marca como inactiva en el backend
- **AND** un visitante abre la presentación
- **THEN** esa área no aparece entre las anunciadas

#### Scenario: El catálogo no se puede cargar

- **WHEN** la petición del catálogo falla
- **THEN** la presentación se muestra igualmente con el resto de su contenido
- **AND** la sección de áreas se omite en lugar de dejar un hueco roto o bloquear la página

### Requirement: El catálogo público no exige autenticación

El sistema SHALL exponer las áreas y los niveles activos en un recurso que no requiera sesión. Ese recurso MUST NOT revelar información distinta de la que la presentación anuncia.

#### Scenario: Petición sin credenciales

- **WHEN** se solicita el catálogo público sin token de autenticación
- **THEN** la respuesta es exitosa e incluye las áreas y los niveles activos

#### Scenario: El catálogo autenticado no se ve afectado

- **WHEN** se solicita el catálogo de la aplicación sin token de autenticación
- **THEN** la respuesta sigue siendo no autorizada, como antes de este cambio

### Requirement: La presentación ofrece una vía clara al registro

La presentación SHALL ofrecer en todo momento una acción para crear cuenta y otra para iniciar sesión, e incluir un cierre explícito que invite a comenzar una entrevista.

#### Scenario: Acciones siempre disponibles

- **WHEN** el visitante está en cualquier punto de la presentación
- **THEN** tiene a la vista una acción para crear cuenta y otra para iniciar sesión

#### Scenario: Llamado de cierre

- **WHEN** el visitante llega al final de la presentación
- **THEN** encuentra la invitación a iniciar una entrevista
- **AND** desde ella puede ir a crear cuenta o a iniciar sesión si ya tiene una

#### Scenario: El visitante decide registrarse

- **WHEN** el visitante activa la acción de crear cuenta
- **THEN** el sistema lo lleva al formulario de registro

#### Scenario: El visitante ya tiene cuenta

- **WHEN** el visitante activa la acción de iniciar sesión
- **THEN** el sistema lo lleva al formulario de inicio de sesión

### Requirement: La presentación identifica el origen académico del proyecto

La presentación SHALL declarar que se trata de un Proyecto de Grado de Ingeniería de Sistemas de la UMSS, con su autor y año, y ofrecer un medio de contacto.

#### Scenario: Identificación visible

- **WHEN** el visitante llega al pie de la presentación
- **THEN** encuentra la identificación académica del proyecto con autor y año
- **AND** encuentra un correo de contacto
- **AND** encuentra enlaces a las secciones de la presentación y a las acciones de acceso

### Requirement: La presentación es usable en pantallas pequeñas

La presentación SHALL ser legible y operable en la anchura de un teléfono, sin desplazamiento horizontal.

#### Scenario: Visita desde un teléfono

- **WHEN** el visitante abre la presentación en una pantalla estrecha
- **THEN** todo el contenido es legible sin desplazamiento horizontal
- **AND** las acciones de crear cuenta e iniciar sesión siguen siendo alcanzables
