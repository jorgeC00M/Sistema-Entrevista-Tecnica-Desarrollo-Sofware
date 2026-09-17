## Purpose

Permite al egresado elegir el área técnica y el nivel de dificultad con los que se ejecutará una entrevista simulada, tomando siempre el catálogo vigente que publica el backend en lugar de una lista fija en el cliente.

## ADDED Requirements

### Requirement: El catálogo ofrecido proviene del backend

La pantalla de selección SHALL obtener las áreas y los niveles disponibles del backend en cada carga. El cliente MUST NOT mantener su propia lista de áreas ni de niveles.

#### Scenario: Se ofrecen las áreas activas del catálogo

- **WHEN** el usuario abre la pantalla de selección y el backend responde con el catálogo
- **THEN** se muestran como opciones seleccionables exactamente las áreas y los niveles marcados como activos
- **AND** cada opción se rotula con el nombre que envía el backend, no con un texto fijo del cliente

#### Scenario: Un área dada de baja deja de ofrecerse

- **WHEN** un área se marca como inactiva en el backend
- **AND** el usuario abre la pantalla de selección
- **THEN** esa área no aparece entre las opciones

#### Scenario: El catálogo no se puede cargar

- **WHEN** la petición del catálogo falla
- **THEN** se muestra un mensaje de error explicando que no se pudieron cargar las opciones
- **AND** no se presenta una lista vacía sin explicación

### Requirement: La duración de la entrevista se anuncia desde el catálogo

La pantalla SHALL indicar cuántas preguntas tendrá la entrevista usando el valor que publica el backend. El cliente MUST NOT asumir un número fijo de preguntas.

#### Scenario: Se anuncia el total de preguntas vigente

- **WHEN** el backend informa que una entrevista consta de N preguntas
- **THEN** la pantalla anuncia al usuario que la entrevista consta de N preguntas

### Requirement: Iniciar una entrevista exige área y nivel

El sistema SHALL impedir que se inicie una entrevista sin haber elegido un área y un nivel.

#### Scenario: Falta una de las dos elecciones

- **WHEN** el usuario ha elegido solo el área, o solo el nivel, o ninguno
- **THEN** la acción de comenzar la entrevista permanece deshabilitada

#### Scenario: Ambas elecciones hechas

- **WHEN** el usuario ha elegido un área y un nivel
- **THEN** la acción de comenzar la entrevista queda habilitada

### Requirement: El inicio exitoso lleva a la entrevista

Al iniciar una entrevista, el sistema SHALL llevar al usuario a la conversación de esa entrevista recién creada.

#### Scenario: La entrevista se crea correctamente

- **WHEN** el usuario confirma el inicio y el backend crea la entrevista
- **THEN** el usuario pasa a la pantalla de conversación de esa entrevista

#### Scenario: El servicio de IA no está disponible

- **WHEN** el usuario confirma el inicio y el backend responde que el servicio de IA no está disponible
- **THEN** se muestra el mensaje de error devuelto por el backend
- **AND** el usuario permanece en la pantalla de selección con sus elecciones intactas

#### Scenario: El backend rechaza el área elegida

- **WHEN** el usuario confirma el inicio con un área que el backend ya no acepta
- **THEN** se muestra un mensaje de error
- **AND** el usuario permanece en la pantalla de selección
