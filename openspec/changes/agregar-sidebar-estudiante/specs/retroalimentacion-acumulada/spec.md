## Purpose

Reúne en una sola vista lo que las evaluaciones dijeron del estudiante a lo largo de todas sus entrevistas, para que pueda ver qué carencia se le repite en lugar de tener que recordarla saltando de un resultado a otro.

## ADDED Requirements

### Requirement: El desempeño se reparte por área y por banda

El sistema SHALL informar, para cada área en la que el estudiante haya respondido, cuántas de sus respuestas cayeron en cada banda de la rúbrica.

#### Scenario: Estudiante con respuestas evaluadas

- **WHEN** el estudiante consulta su retroalimentación acumulada
- **THEN** obtiene una entrada por cada área en la que tenga respuestas evaluadas
- **AND** cada entrada indica cuántas respuestas cayeron en cada banda de la rúbrica
- **AND** cada entrada indica su puntuación media en esa área

#### Scenario: Áreas sin practicar no aparecen

- **WHEN** el estudiante nunca respondió una pregunta de un área
- **THEN** esa área no aparece en el reparto

### Requirement: Las observaciones se listan con su contexto

El sistema SHALL devolver las debilidades y sugerencias registradas, cada una acompañada de la información que permite situarla.

#### Scenario: Cada observación se puede situar

- **WHEN** el estudiante consulta sus observaciones
- **THEN** cada una indica el área, la pregunta que la originó, la puntuación obtenida y la fecha
- **AND** muestra la debilidad detectada y la sugerencia de mejora

#### Scenario: Orden y volumen acotados

- **WHEN** el estudiante tiene muchas respuestas evaluadas
- **THEN** las observaciones se presentan de la más reciente a la más antigua
- **AND** el número devuelto está acotado, de modo que la respuesta no crece sin límite con el historial

### Requirement: Cuenta toda respuesta evaluada, no solo las de entrevistas terminadas

La retroalimentación SHALL incluir las respuestas evaluadas de entrevistas abandonadas o en curso, además de las finalizadas.

Es una diferencia deliberada con las métricas de progreso: una media solo es comparable entre entrevistas completas, pero una carencia detectada en una entrevista que se dejó a medias sigue siendo una carencia real.

#### Scenario: Entrevista abandonada a medias

- **WHEN** el estudiante abandonó una entrevista tras responder algunas preguntas
- **AND** consulta su retroalimentación acumulada
- **THEN** las observaciones de esas respuestas aparecen igualmente

#### Scenario: Pregunta todavía sin responder

- **WHEN** una entrevista en curso tiene una pregunta pendiente de respuesta
- **THEN** esa pregunta no genera ninguna observación

### Requirement: Solo se ve la retroalimentación propia

El sistema SHALL devolver únicamente las observaciones del usuario autenticado.

#### Scenario: Aislamiento entre usuarios

- **WHEN** existen evaluaciones de otros usuarios
- **AND** el estudiante consulta su retroalimentación
- **THEN** solo obtiene observaciones originadas en sus propias entrevistas

#### Scenario: Petición sin sesión

- **WHEN** se solicita la retroalimentación sin estar autenticado
- **THEN** la respuesta es no autorizada

### Requirement: El estado sin datos se explica

El sistema SHALL distinguir entre no tener retroalimentación y no poder mostrarla.

#### Scenario: Estudiante que aún no respondió nada

- **WHEN** un estudiante sin ninguna respuesta evaluada consulta su retroalimentación
- **THEN** se le indica que aparecerá cuando complete su primera entrevista
- **AND** se le ofrece iniciar una

#### Scenario: La consulta falla

- **WHEN** la petición no se puede completar
- **THEN** se muestra un mensaje de error en lugar de una vista vacía
