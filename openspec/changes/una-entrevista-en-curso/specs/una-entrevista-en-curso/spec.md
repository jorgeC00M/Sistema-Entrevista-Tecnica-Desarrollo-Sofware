## Purpose

Asegura que un usuario tenga a lo sumo una entrevista en curso, que nunca pierda una sin decidirlo, y que el acceso para retomarla esté siempre al día.

## ADDED Requirements

### Requirement: Una sola entrevista en curso por usuario
Un usuario MUST NOT tener más de una entrevista en curso a la vez. El servidor SHALL garantizarlo de modo que dos pedidos simultáneos tampoco lo logren. Al pedir iniciar una entrevista con otra en curso:
- el servidor SHALL responder 409, con los datos de la entrevista en curso;
- MUST NOT crear nada ni llamar a la IA.

Antes de comprobarlo, el servidor SHALL cerrar las entrevistas vencidas del usuario, de modo que una vencida no bloquee.

#### Scenario: Iniciar con otra en curso
- **WHEN** el usuario tiene una entrevista de Backend en curso y pide iniciar otra
- **THEN** recibe 409 con la entrevista de Backend, y no se crea ninguna entrevista nueva

#### Scenario: La anterior ya venció
- **WHEN** la entrevista en curso superó su límite y el usuario pide iniciar otra
- **THEN** la anterior se cierra según la regla del límite y la nueva se crea

#### Scenario: Dos pestañas a la vez
- **WHEN** el usuario pulsa «Comenzar» en dos pestañas casi al mismo tiempo
- **THEN** solo una entrevista queda en curso y la otra pestaña recibe 409

### Requirement: Abandonar y empezar en un paso
Al iniciar, el usuario SHALL poder pedir que se abandone la entrevista en curso:
- la anterior SHALL quedar «Abandonada», sin nota, y la nueva SHALL crearse en la misma operación;
- si la creación de la nueva falla, la anterior MUST quedar en curso, sin cambios.

#### Scenario: Abandonar y empezar
- **WHEN** el usuario elige «Abandonarla y empezar»
- **THEN** la entrevista anterior queda «Abandonada» y empieza la nueva

#### Scenario: Falla la IA al crear la nueva
- **WHEN** el proveedor de IA falla al generar las preguntas de la nueva
- **THEN** la anterior sigue en curso, con su tiempo y sus respuestas, y no se crea ninguna nueva

### Requirement: Aviso en «Simular entrevista»
Con una entrevista en curso, «Simular entrevista» SHALL mostrar arriba el aviso «Tienes una entrevista en curso: <puesto> · quedan m min», con la acción «Continuarla», que lleva a esa entrevista. La pantalla MUST seguir permitiendo configurar otra.

#### Scenario: Entrar con una en curso
- **WHEN** el usuario con una entrevista en curso abre «Simular entrevista»
- **THEN** ve el aviso con el puesto y los minutos restantes, y puede pulsar «Continuarla»

### Requirement: Modal de inicio con una entrevista en curso
Si al pulsar «Iniciar entrevista» hay una en curso, conocida por la interfaz o informada por el 409, el modal de inicio SHALL:
- decir qué entrevista está en curso y cuántos minutos le quedan;
- decir que, si se empieza la nueva, esa se abandona, no tendrá nota y no podrá retomarse;
- ofrecer «Continuar la de <puesto>», que lleva a la entrevista en curso, y «Abandonarla y empezar», con estilo de acción destructiva.

El foco inicial SHALL estar en «Continuar la de <puesto>». La X y Esc MUST cerrar el modal sin hacer nada.

#### Scenario: Confirmar por error con el teclado
- **WHEN** el modal se abre y el usuario pulsa Enter sin moverse
- **THEN** va a la entrevista en curso y no se abandona nada

#### Scenario: El sidebar estaba desactualizado
- **WHEN** la interfaz no sabía de la entrevista en curso y el servidor responde 409 al pulsar «Comenzar»
- **THEN** el modal pasa a su variante con la entrevista en curso, con los datos que dio el servidor

### Requirement: «Continuar» del sidebar siempre al día
El botón «Continuar» del sidebar SHALL:
- mostrarse como «Continuar · m min», con los minutos restantes y sin el número de pregunta;
- pasar a un aspecto de aviso al quedar 5 minutos o menos;
- con el sidebar plegado, decir en su tooltip el puesto y los minutos restantes.

SHALL aparecer en cuanto se inicia una entrevista y desaparecer en cuanto se finaliza, se abandona o vence, sin recargar la página.

#### Scenario: Empezar una entrevista
- **WHEN** el usuario inicia una entrevista y vuelve a otra sección
- **THEN** el sidebar muestra «Continuar · 30 min» sin recargar la página

#### Scenario: Terminar o abandonar
- **WHEN** el usuario finaliza o abandona su entrevista en curso
- **THEN** el sidebar deja de mostrar «Continuar»

#### Scenario: Últimos minutos
- **WHEN** quedan 4 minutos
- **THEN** el botón muestra «Continuar · 4 min» con el aspecto de aviso
