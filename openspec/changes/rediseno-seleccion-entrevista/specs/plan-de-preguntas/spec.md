## Purpose

Definir cómo se reparten las 5 preguntas de una entrevista según el puesto y la tecnología elegidos, de modo que cubran fundamentos, la tecnología, los datos y un caso práctico, y que cada pregunta conserve un área para las estadísticas.

## ADDED Requirements

### Requirement: Cinco enfoques fijos por entrevista

Toda entrevista SHALL recorrer, en este orden:
1. fundamentos de programación;
2. la tecnología elegida;
3. datos: bases de datos para Backend, Full Stack y QA; estructuras de datos para Frontend, Móvil y Escritorio;
4. profundidad en la tecnología elegida;
5. un caso práctico propio del puesto.

El reparto MUST ser determinista: el mismo puesto produce siempre la misma secuencia de enfoques y áreas.

#### Scenario: Backend
- **WHEN** se inicia una entrevista de Backend
- **THEN** las áreas de las preguntas son Fundamentos de Programación, APIs y Servicios Web, Bases de Datos, APIs y Servicios Web y APIs y Servicios Web, con los enfoques en el orden indicado

#### Scenario: Móvil
- **WHEN** se inicia una entrevista de Desarrollador Móvil
- **THEN** la pregunta 3 es de Estructuras de Datos y las preguntas 2, 4 y 5 son del área Desarrollo Móvil

### Requirement: El prompt recibe puesto, tecnología y nivel

El entrevistador SHALL recibir el puesto, el nombre de la tecnología, el nivel (practicante o junior) y el enfoque y área de la pregunta. En los enfoques de tecnología y caso práctico, la pregunta MUST referirse a la tecnología elegida. El evaluador MUST recibir el mismo encuadre y seguir sin recibir el historial.

#### Scenario: Pregunta de tecnología
- **WHEN** se genera la pregunta 2 de una entrevista Frontend + Angular
- **THEN** el prompt nombra Angular y pide una pregunta sobre esa tecnología

#### Scenario: Entrevista antigua sin tecnología
- **WHEN** continúa una entrevista creada antes del cambio y sin tecnología
- **THEN** el prompt omite la línea de tecnología y la pregunta se genera igual

### Requirement: El área sigue guardándose por pregunta

Cada pregunta SHALL guardar su área, como hasta ahora. Las estadísticas, la retroalimentación acumulada y el reporte MUST seguir agrupando por área sin cambios. Las preguntas ya guardadas MUST conservar el área con la que se hicieron.

#### Scenario: Historial intacto
- **WHEN** se consultan las estadísticas por área después del cambio
- **THEN** las entrevistas anteriores aportan con las áreas con que se hicieron sus preguntas
