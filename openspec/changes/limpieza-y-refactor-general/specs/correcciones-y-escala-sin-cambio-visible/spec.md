## Purpose

Fijar los comportamientos que la limpieza general corrige o garantiza, para que el refactor (que no debe cambiar nada visible) tenga contra qué verificarse.

## ADDED Requirements

### Requirement: El límite de la respuesta es el mismo en los dos lados
El campo de respuesta del chat SHALL aceptar el mismo máximo de caracteres que acepta el servidor (2000). MUST NOT cortar una respuesta que el servidor aceptaría.

#### Scenario: Respuesta larga
- **WHEN** el estudiante escribe una respuesta de 1500 caracteres
- **THEN** el campo la acepta completa y el servidor la evalúa

### Requirement: El foco no salta al cargar
Al cargar una página, el foco MUST NOT moverse por sí solo al botón del menú. Al cerrar el menú en el celular, el foco SHALL volver al botón que lo abrió.

#### Scenario: Cargar una página
- **WHEN** el usuario abre `/inicio`
- **THEN** el foco no está en el botón del menú

#### Scenario: Cerrar el menú
- **WHEN** el usuario abre el menú en el celular y lo cierra con Escape
- **THEN** el foco vuelve al botón del menú

### Requirement: El conteo al responder está al día
La respuesta de responder una pregunta SHALL informar la entrevista con su conteo de preguntas calificadas ya actualizado.

#### Scenario: Primera respuesta
- **WHEN** el estudiante responde la primera pregunta
- **THEN** la entrevista devuelta dice 1 pregunta calificada

### Requirement: Los límites de peticiones valen para todo el servidor
Los límites de peticiones (evaluar, iniciar, registro, etc.) SHALL contarse igual en todos los procesos del servidor y MUST NOT reiniciarse cuando un proceso se reinicia.

#### Scenario: Dos procesos
- **WHEN** el servidor corre con 2 procesos y un usuario agota su límite por hora de evaluar
- **THEN** su siguiente petición recibe 429, la atienda el proceso que la atienda

### Requirement: Las páginas se cargan bajo demanda sin cambio visible
Cada página SHALL descargarse cuando se visita por primera vez, mostrando el indicador de carga de siempre mientras llega. La navegación y el contenido MUST NOT cambiar.

#### Scenario: Primera visita a una página
- **WHEN** el usuario entra por primera vez a «Historial»
- **THEN** ve el indicador de carga un instante y luego la misma pantalla de siempre
