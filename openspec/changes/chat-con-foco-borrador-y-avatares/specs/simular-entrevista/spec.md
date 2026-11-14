## ADDED Requirements

### Requirement: El campo de respuesta recupera el foco al llegar la pregunta
Mientras la respuesta enviada se evalúa, el campo de respuesta SHALL estar deshabilitado y su placeholder SHALL decir «Espera la siguiente pregunta…».

Cuando el campo se vuelve a habilitar, el sistema SHALL devolverle el foco, pero solo si se cumplen las dos condiciones:
- el usuario tenía el foco en el campo o en «Enviar» al enviar;
- el dispositivo tiene un puntero fino.

En dispositivos táctiles el sistema MUST NOT mover el foco por su cuenta.

#### Scenario: Responder con el teclado en una computadora
- **WHEN** el usuario escribe su respuesta, la envía con Enter y llega la siguiente pregunta
- **THEN** el cursor ya está en el campo y puede escribir sin hacer clic

#### Scenario: Mientras se evalúa
- **WHEN** la respuesta enviada se está evaluando
- **THEN** el campo está deshabilitado y su placeholder dice «Espera la siguiente pregunta…»

#### Scenario: En el celular
- **WHEN** el usuario envía su respuesta en un dispositivo táctil y llega la siguiente pregunta
- **THEN** el teclado no se abre solo y la pregunta queda visible

### Requirement: El borrador de la respuesta sobrevive a una recarga
El texto que el usuario escribe para una pregunta SHALL guardarse en su navegador. Si recarga la página o reabre la entrevista en curso, el texto SHALL volver a ese mismo campo.

El borrador:
- SHALL borrarse al enviar la respuesta;
- SHALL borrarse, junto con todos los demás borradores, al cerrar sesión;
- MUST NOT enviarse al servidor.

Si el navegador no permite guardar datos, la entrevista SHALL funcionar igual, sin borrador.

#### Scenario: Recargar a mitad de una respuesta
- **WHEN** el usuario escribe parte de su respuesta y recarga la página
- **THEN** la entrevista se retoma en la misma pregunta con el texto que había escrito

#### Scenario: Enviar la respuesta
- **WHEN** el usuario envía la respuesta
- **THEN** el borrador de esa pregunta deja de existir y el campo de la siguiente empieza vacío

#### Scenario: Cerrar sesión en un equipo compartido
- **WHEN** el usuario cierra sesión
- **THEN** el navegador ya no guarda ningún borrador de sus respuestas
