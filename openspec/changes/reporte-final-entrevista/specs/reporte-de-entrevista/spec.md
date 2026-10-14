## Purpose

Entregar al terminar una entrevista simulada, sobre la calificación por niveles de `calificacion-de-respuestas`, un reporte consolidado que le diga al candidato qué priorizar para su próxima entrevista.

## ADDED Requirements

### Requirement: Cada respuesta indica qué esperaba una respuesta completa

El sistema SHALL guardar y mostrar, junto a cada respuesta calificada, entre 2 y 4 puntos clave que una respuesta completa debía cubrir para el puesto y nivel de la entrevista. Si el proveedor devuelve más de 4, el sistema SHALL quedarse con los 4 primeros. Si devuelve menos de 2 o ninguno, la evaluación MUST considerarse inválida.

#### Scenario: Puntos clave visibles en el reporte
- **WHEN** el candidato abre el reporte de una entrevista finalizada
- **THEN** cada pregunta muestra sus niveles por criterio, sus puntos clave esperados, las fortalezas, las debilidades y la sugerencia

#### Scenario: Demasiados puntos clave
- **WHEN** el evaluador devuelve 6 puntos clave
- **THEN** se guardan y muestran solo los 4 primeros

### Requirement: La calificación de una respuesta no depende del historial

La calificación de una respuesta SHALL depender solo del puesto, el nivel, la tecnología, el área, la pregunta y la respuesta. Añadir puntos clave MUST NOT introducir en el evaluador el historial de la entrevista.

#### Scenario: Misma respuesta, mismo contexto
- **WHEN** se evalúa la misma respuesta a la misma pregunta en dos momentos distintos de la entrevista
- **THEN** el evaluador recibe exactamente la misma entrada en ambos casos

### Requirement: Reporte final consolidado

Al consultar los resultados de una entrevista finalizada o abandonada, el sistema SHALL devolver un resumen consolidado calculado a partir de las evaluaciones guardadas, sin ninguna llamada adicional a la IA. El resumen contiene:
- la banda y el promedio general;
- el nivel medio de cada criterio, sobre 4;
- el criterio más débil;
- la prioridad para la próxima entrevista: el área de la respuesta con menor puntuación y la sugerencia de esa respuesta.

Si dos respuestas empatan en la menor puntuación, la prioridad SHALL ser la de la pregunta con menor número.

#### Scenario: Resumen de una entrevista finalizada
- **WHEN** el candidato consulta los resultados de una entrevista finalizada con cinco respuestas calificadas
- **THEN** el resumen incluye la banda general, el nivel medio de cada criterio, el criterio más débil y la prioridad con su área y su sugerencia

#### Scenario: Sin llamadas a la IA
- **WHEN** se consultan los resultados de una entrevista finalizada
- **THEN** el proveedor de IA no recibe ninguna llamada

#### Scenario: Empate en la prioridad
- **WHEN** las preguntas 2 y 4 tienen la misma puntuación, la más baja de la entrevista
- **THEN** la prioridad corresponde al área de la pregunta 2

### Requirement: El resumen no se publica durante la entrevista

Mientras una entrevista está en progreso, el resumen MUST NOT salir de la API. La respuesta conserva su forma, con el resumen en nulo, igual que ya ocurre con la evaluación de cada pregunta.

#### Scenario: Entrevista en progreso
- **WHEN** el candidato consulta los resultados de una entrevista que sigue en progreso
- **THEN** el resumen es nulo y ninguna pregunta trae su evaluación

### Requirement: Comparación con la entrevista anterior comparable

El resumen SHALL incluir la diferencia entre el promedio de esta entrevista y el de la entrevista finalizada inmediatamente anterior del mismo usuario, con el mismo puesto y el mismo nivel. Si no existe una anterior comparable, la comparación MUST ser nula, no cero. Solo se comparan entrevistas finalizadas.

#### Scenario: Hay una anterior comparable
- **WHEN** el candidato terminó antes una entrevista de Backend Básico con promedio 62 y ahora termina otra de Backend Básico con promedio 70
- **THEN** la comparación indica +8 respecto a esa entrevista

#### Scenario: Primera entrevista del puesto
- **WHEN** es la primera entrevista finalizada del candidato para ese puesto y nivel
- **THEN** la comparación es nula y la interfaz no muestra ninguna diferencia

#### Scenario: Otro nivel no cuenta
- **WHEN** la única entrevista anterior del puesto fue de nivel Intermedio y la actual es Básico
- **THEN** la comparación es nula

### Requirement: Las evaluaciones anteriores al cambio siguen mostrándose

Una evaluación guardada antes de este cambio, sin niveles ni puntos clave, SHALL mostrarse con su puntuación y sus textos, como hasta ahora. Esa evaluación MUST quedar fuera de los niveles medios por criterio, pero sigue contando en el promedio general. Las evaluaciones antiguas MUST NOT recalcularse ni enviarse de nuevo a la IA.

#### Scenario: Entrevista antigua
- **WHEN** el candidato abre el reporte de una entrevista calificada antes del cambio
- **THEN** ve la puntuación, las fortalezas, las debilidades y la sugerencia de cada pregunta, sin niveles ni puntos clave; el nivel medio de cada criterio y el criterio más débil son nulos

### Requirement: Practicar de nuevo el mismo puesto

El reporte SHALL ofrecer una acción para iniciar una nueva entrevista con el mismo puesto y nivel ya preseleccionados. El candidato MUST poder cambiarlos antes de empezar.

#### Scenario: Volver a practicar
- **WHEN** el candidato pulsa "Practicar de nuevo este puesto" en el reporte de una entrevista de Frontend Intermedio
- **THEN** llega a la pantalla de nueva entrevista con Frontend e Intermedio ya seleccionados, sin que la entrevista haya empezado
