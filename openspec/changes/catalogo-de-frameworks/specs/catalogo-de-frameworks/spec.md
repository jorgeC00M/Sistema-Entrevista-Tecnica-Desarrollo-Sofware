## Purpose

Definir qué tecnologías puede elegir el candidato para cada puesto —frameworks concretos, como piden las ofertas de trabajo— y cómo se agrupan en pantalla, sin perder las tecnologías de entrevistas ya hechas.

## ADDED Requirements

### Requirement: Frameworks por puesto

El catálogo SHALL ofrecer, como tecnologías activas: 7 en Frontend, 10 en Backend, 13 en Full Stack (6 de frontend y 7 de backend), 6 en Móvil, 7 en Escritorio y 10 en QA, con los nombres de la propuesta. Una tecnología MUST seguir perteneciendo a un solo puesto.

#### Scenario: Backend ofrece frameworks
- **WHEN** se consultan las tecnologías de Backend
- **THEN** incluyen Django, FastAPI, Flask, Express, NestJS, Spring Boot, Laravel, ASP.NET Core, Go y Ruby on Rails, y no incluyen "Python" ni "Java" como opciones sueltas

#### Scenario: Full Stack amplía sus capas
- **WHEN** se consultan las tecnologías de Full Stack
- **THEN** la capa frontend tiene React, Next.js, Angular, Vue, Nuxt y Svelte, y la capa backend tiene Express, NestJS, Django, FastAPI, Spring Boot, Laravel y ASP.NET Core

### Requirement: Grupos para mostrar

Cada tecnología SHALL tener un `grupo`, que puede estar vacío y es el texto con que se agrupa en pantalla: el lenguaje en Backend y Full Stack, y el tipo de prueba en QA. El paso de tecnología MUST mostrar las opciones bajo su grupo, en el orden del catálogo, y la elección MUST seguir siendo de un solo clic.

#### Scenario: Backend agrupado por lenguaje
- **WHEN** el usuario elige Backend
- **THEN** ve "Python" con Django, FastAPI y Flask, y "Node.js" con Express y NestJS, cada framework como un botón

#### Scenario: Puesto sin grupos
- **WHEN** el usuario elige Frontend
- **THEN** ve sus 7 tecnologías en una sola fila, sin títulos de grupo

### Requirement: Retirar sin perder historial

Una tecnología que se divide en varios frameworks SHALL desactivarse, no borrarse. Las entrevistas que la usaban MUST conservar su nombre, y ya no MUST ofrecerse para iniciar una entrevista nueva. Una tecnología que solo gana un nombre más preciso MUST renombrarse en la misma fila.

#### Scenario: Entrevista con una tecnología retirada
- **WHEN** se consulta una entrevista de Backend iniciada con "Python"
- **THEN** sigue mostrando "Python", y "Repetir última" pide elegir la tecnología de nuevo

#### Scenario: Iniciar con una tecnología retirada
- **WHEN** se intenta iniciar Backend con `backend_python`
- **THEN** la respuesta es 400

### Requirement: La API expone el grupo

`GET /api/catalogos/puestos/` SHALL incluir `grupo` en cada tecnología.

#### Scenario: Consultar el catálogo
- **WHEN** se consulta el catálogo de puestos
- **THEN** cada tecnología trae `codigo`, `nombre`, `capa` y `grupo`
