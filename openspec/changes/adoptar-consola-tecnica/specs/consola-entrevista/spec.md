## Purpose

Define qué ve y qué sabe el candidato mientras responde una entrevista en curso: en qué punto del temario está, cuánto tiempo lleva y cómo fue calificada cada respuesta que ya entregó.

## ADDED Requirements

### Requirement: Retroalimentación visible tras cada respuesta

Cuando una respuesta queda evaluada, el sistema SHALL mostrar su puntuación y el comentario de la evaluación junto a esa respuesta dentro del hilo de la entrevista, sin esperar al final de la sesión.

La puntuación SHALL mostrarse con el color correspondiente a la banda que devolvió el servidor. El sistema NO SHALL recalcular la banda a partir del número.

#### Scenario: El candidato entrega una respuesta y recibe su calificación

- **WHEN** el candidato envía una respuesta y el servidor la evalúa correctamente
- **THEN** la puntuación y el comentario de esa evaluación aparecen asociados a la respuesta recién enviada, antes de que se presente la siguiente pregunta

#### Scenario: El candidato recarga la página a mitad de la entrevista

- **WHEN** el candidato vuelve a abrir una entrevista en curso que ya tiene respuestas evaluadas
- **THEN** cada respuesta previa se muestra con la puntuación y el comentario que le corresponden

#### Scenario: La evaluación falla

- **WHEN** el servidor no consigue evaluar la respuesta enviada
- **THEN** no se muestra ninguna puntuación para esa respuesta y el candidato puede reintentar el envío

### Requirement: Progreso explícito de la sesión

El sistema SHALL indicar en todo momento en qué pregunta está el candidato y cuántas preguntas tiene la entrevista, usando el total que informa el servidor.

#### Scenario: Entrevista de cinco preguntas en la tercera

- **WHEN** el candidato está respondiendo la pregunta 3 de una entrevista de 5
- **THEN** el sistema muestra el contador `03 / 05` y una barra de avance proporcional

#### Scenario: El total lo decide el servidor

- **WHEN** el servidor informa un total de preguntas distinto de 5
- **THEN** el contador y la barra reflejan ese total, sin valores fijados en el cliente

### Requirement: Cronómetro informativo de sesión

El sistema SHALL mostrar el tiempo transcurrido de la sesión de entrevista. Ese cronómetro es informativo: NO SHALL imponer un límite, interrumpir la sesión ni condicionar el envío de respuestas.

#### Scenario: El cronómetro avanza durante la entrevista

- **WHEN** el candidato tiene abierta una entrevista en curso
- **THEN** el tiempo mostrado avanza de forma ascendente mientras la pantalla está abierta

#### Scenario: El tiempo no bloquea la entrevista

- **WHEN** el cronómetro alcanza cualquier valor
- **THEN** el candidato sigue pudiendo responder y la entrevista continúa igual

#### Scenario: El candidato prefiere no ver el reloj

- **WHEN** el sistema se ejecuta con la preferencia de movimiento reducido activada
- **THEN** el cronómetro se sigue mostrando pero sin animaciones de parpadeo ni pulso

### Requirement: Límite de longitud visible en la respuesta

El sistema SHALL indicar al candidato cuántos caracteres lleva escritos en su respuesta.

#### Scenario: El candidato escribe su respuesta

- **WHEN** el candidato escribe en el campo de respuesta
- **THEN** el sistema muestra el conteo de caracteres actualizado
