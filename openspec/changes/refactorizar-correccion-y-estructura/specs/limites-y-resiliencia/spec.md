## Purpose

Define qué hace el sistema cuando alguien pide más de lo razonable, cuando el
proveedor de inteligencia artificial falla o está mal configurado, y cuando la
interfaz encuentra un error inesperado — de modo que ni el coste de la evaluación
automatizada ni un fallo externo puedan dejar el servicio inservible.

## ADDED Requirements

### Requirement: El uso de la evaluación automatizada está acotado por usuario

El sistema SHALL limitar cuántas respuestas puede enviar a evaluar un mismo usuario
en una ventana de tiempo. Al superar ese límite, la petición MUST rechazarse sin
llegar al proveedor de inteligencia artificial.

#### Scenario: Un usuario supera su cupo de respuestas

- **WHEN** un usuario autenticado envía más respuestas de las permitidas en la
  ventana de tiempo vigente
- **THEN** el sistema rechaza la petición indicando que se excedió el límite
- **AND** no se consume ninguna llamada al proveedor de inteligencia artificial
- **AND** la entrevista queda intacta: la respuesta no se guarda ni se evalúa

#### Scenario: Un usuario dentro de su cupo no se ve afectado

- **WHEN** un usuario autenticado envía una respuesta estando por debajo del límite
- **THEN** la respuesta se evalúa con normalidad

### Requirement: Los accesos anónimos de autenticación están acotados

El sistema SHALL limitar los intentos de inicio de sesión y de registro por origen,
para que adivinar contraseñas o crear cuentas en masa tenga un coste.

#### Scenario: Intentos repetidos de inicio de sesión

- **WHEN** se envían repetidos intentos de inicio de sesión desde el mismo origen
  por encima del límite
- **THEN** los intentos siguientes se rechazan por exceso de peticiones
- **AND** la respuesta no revela si el correo existe o si la contraseña era correcta

### Requirement: La entrada del candidato tiene un tamaño máximo

El sistema SHALL rechazar una respuesta que exceda la longitud máxima admitida,
antes de enviarla al proveedor de inteligencia artificial.

#### Scenario: Respuesta demasiado larga

- **WHEN** el candidato envía una respuesta más larga que el máximo permitido
- **THEN** el sistema responde con un error de validación que indica el límite
- **AND** no se consume ninguna llamada al proveedor de inteligencia artificial

#### Scenario: Respuesta dentro del límite

- **WHEN** el candidato envía una respuesta de longitud admisible
- **THEN** la respuesta se procesa con normalidad

### Requirement: Un proveedor de IA no disponible se comunica como indisponibilidad temporal

Cuando el proveedor de inteligencia artificial no se puede usar —porque falta su
configuración, porque no responde, porque agota el tiempo de espera o porque falla
la red— el sistema SHALL responder como servicio temporalmente no disponible, y
MUST NOT exponer detalles internos del fallo al cliente.

#### Scenario: Proveedor mal configurado

- **WHEN** el proveedor activo no tiene su credencial configurada y llega una
  petición que lo necesita
- **THEN** el sistema responde indicando indisponibilidad temporal del servicio
- **AND** la respuesta no incluye traza de error ni detalles de configuración

#### Scenario: El proveedor no responde a tiempo

- **WHEN** una llamada al proveedor supera el tiempo máximo de espera
- **THEN** la llamada se aborta
- **AND** el sistema responde indicando indisponibilidad temporal
- **AND** el proceso que atiende la petición queda libre para atender otras

#### Scenario: Falla la red hacia el proveedor

- **WHEN** la conexión con el proveedor falla
- **THEN** el sistema responde indicando indisponibilidad temporal, no un error
  interno del servidor

### Requirement: Un fallo al evaluar no deja la entrevista en un estado intermedio

Si la evaluación de una respuesta se interrumpe por un fallo del proveedor, el
sistema SHALL dejar la entrevista en un estado desde el que el candidato pueda
reintentar, sin datos duplicados ni preguntas perdidas.

#### Scenario: Reintento tras un fallo del proveedor

- **WHEN** el proveedor falla durante la evaluación de una respuesta
- **AND** el candidato reintenta enviar la misma respuesta
- **THEN** la entrevista continúa desde donde estaba
- **AND** no se crean intercambios ni evaluaciones duplicadas

### Requirement: Un error inesperado de la interfaz no deja la pantalla en blanco

Cuando la interfaz encuentra un error inesperado al dibujar una pantalla, el sistema
SHALL mostrar un estado de error comprensible con una vía de recuperación, en lugar
de una página vacía.

#### Scenario: Error inesperado al dibujar una pantalla

- **WHEN** ocurre un error inesperado al renderizar una sección de la aplicación
- **THEN** el usuario ve un mensaje de error con una acción para recuperarse
- **AND** la navegación principal sigue siendo utilizable

### Requirement: El flujo de entrevista es operable con lector de pantalla

El campo donde el candidato escribe su respuesta SHALL tener un nombre accesible
propio, y el hilo de la entrevista SHALL anunciar las novedades que van llegando.

#### Scenario: El campo de respuesta se anuncia

- **WHEN** una persona con lector de pantalla llega al campo de respuesta
- **THEN** el lector anuncia para qué sirve el campo, no solo que es un cuadro de
  edición

#### Scenario: Llega la evaluación y la siguiente pregunta

- **WHEN** el sistema añade la evaluación de la respuesta y la siguiente pregunta al
  hilo
- **THEN** el contenido nuevo se anuncia sin que la persona tenga que buscarlo
- **AND** el hilo se desplaza para dejar visible lo más reciente
