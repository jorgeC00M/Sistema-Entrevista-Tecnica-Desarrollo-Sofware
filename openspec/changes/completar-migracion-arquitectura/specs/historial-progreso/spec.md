## Purpose

Reúne en una sola vista el registro de las entrevistas que el usuario ha realizado y la evolución de su desempeño a lo largo del tiempo, que es lo que sostiene el objetivo de "mejorar el nivel de competencia" con datos y no con una impresión.

## ADDED Requirements

### Requirement: Historial y progreso se consultan en una sola vista

El sistema SHALL presentar el listado de entrevistas del usuario y su evolución de desempeño en una única sección de la aplicación.

#### Scenario: El usuario con entrevistas completadas ve ambas cosas

- **WHEN** un usuario con al menos una entrevista finalizada abre la sección de historial
- **THEN** ve el listado de sus entrevistas
- **AND** ve la evolución de su puntuación a lo largo del tiempo
- **AND** ve la comparativa de su promedio por área técnica

#### Scenario: La ruta de progreso separada ya no existe

- **WHEN** el usuario navega a la dirección que antes mostraba el progreso por separado
- **THEN** el sistema lo lleva a una ruta válida en lugar de mostrar una página inexistente

### Requirement: El historial solo muestra entrevistas propias

El sistema SHALL mostrar únicamente las entrevistas del usuario autenticado.

#### Scenario: Las entrevistas de otro usuario no aparecen

- **WHEN** existen entrevistas de otros usuarios en el sistema
- **AND** el usuario abre su historial
- **THEN** solo se listan las entrevistas que él mismo realizó

### Requirement: Cada entrevista enlaza según su estado

Cada entrada del listado SHALL llevar al lugar que corresponde a su estado, de modo que una entrevista a medias pueda retomarse.

#### Scenario: Entrevista en progreso

- **WHEN** el usuario elige una entrevista cuyo estado es "en progreso"
- **THEN** el sistema lo lleva a la conversación para continuar respondiendo

#### Scenario: Entrevista finalizada o abandonada

- **WHEN** el usuario elige una entrevista cuyo estado es "finalizada" o "abandonada"
- **THEN** el sistema lo lleva al panel de resultados de esa entrevista

#### Scenario: Cada entrada identifica su contexto

- **WHEN** se lista una entrevista
- **THEN** se muestran su área, su nivel, su fecha y su estado
- **AND** se muestra su puntuación promedio cuando la entrevista ya tiene una

### Requirement: El progreso se calcula solo sobre entrevistas finalizadas

Las métricas de evolución y de promedio por área SHALL considerar únicamente las entrevistas finalizadas.

#### Scenario: Una entrevista en curso no altera las métricas

- **WHEN** el usuario tiene una entrevista en progreso y ninguna finalizada
- **THEN** las métricas reportan cero entrevistas completadas
- **AND** no se muestra evolución ni comparativa por área

### Requirement: Estados sin datos suficientes se explican

El sistema SHALL explicar por qué no hay nada que mostrar en lugar de presentar una vista vacía.

#### Scenario: Usuario sin ninguna entrevista

- **WHEN** un usuario que nunca completó una entrevista abre la sección
- **THEN** se le indica que aún no tiene entrevistas
- **AND** se le ofrece iniciar la primera

#### Scenario: Una sola entrevista finalizada

- **WHEN** el usuario tiene exactamente una entrevista finalizada
- **THEN** se indica que hace falta más de una entrevista para dibujar una evolución
- **AND** se sigue mostrando el listado y la comparativa por área

#### Scenario: El historial no se puede cargar

- **WHEN** la petición de datos falla
- **THEN** se muestra un mensaje de error en lugar de un listado vacío
