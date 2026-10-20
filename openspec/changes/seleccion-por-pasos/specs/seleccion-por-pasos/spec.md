## Purpose

Permitir que el candidato configure su entrevista eligiendo, en tres pasos guiados y editables, el puesto al que postula, las tecnologías de ese puesto (dos en Full Stack: frontend y backend) y su nivel, sin tener que buscar ni escribir nada.

## ADDED Requirements

### Requirement: Tres pasos en orden

La pantalla "Nueva entrevista" SHALL presentar tres pasos numerados, en este orden: puesto, tecnología y nivel. Al entrar sin preselección, solo el paso 1 MUST estar abierto, y los pasos 2 y 3 MUST verse bloqueados, sin opciones elegibles. La pantalla MUST NOT mostrar un buscador ni una lista de "lo más practicado".

#### Scenario: Entrada a la pantalla
- **WHEN** un usuario abre "Nueva entrevista" sin parámetros
- **THEN** ve las 6 tarjetas de puesto, con icono, nombre y descripción, y los pasos 2 y 3 bloqueados

### Requirement: Avance automático y capas plegadas

Al completar un paso, el sistema SHALL plegarlo en una línea con lo elegido y un control para editarlo. Después MUST abrir el primer paso que siga incompleto. El foco del teclado MUST pasar al primer control del paso que se abre.

#### Scenario: Elegir puesto
- **WHEN** el usuario elige "Desarrollador Backend"
- **THEN** el paso 1 se pliega en "Puesto: Desarrollador Backend" con "Editar puesto", y se abre el paso 2 con las tecnologías de Backend

#### Scenario: Todo completo
- **WHEN** el usuario completa puesto, tecnología y nivel
- **THEN** los tres pasos quedan plegados y "Comenzar entrevista" queda habilitado

### Requirement: Editar un paso plegado

Editar un paso plegado SHALL reabrir únicamente ese paso y conservar los demás. Si se cambia el puesto, la tecnología elegida MUST descartarse, porque pertenece al puesto anterior, y el paso 2 MUST volver a quedar pendiente. El nivel MUST conservarse.

#### Scenario: Cambiar el nivel
- **WHEN** con todo completo, el usuario pulsa "Editar nivel" y elige "Senior"
- **THEN** solo cambia el nivel; puesto y tecnología siguen plegados igual

#### Scenario: Cambiar de puesto
- **WHEN** con Backend · Python · Junior completo, el usuario edita el puesto y elige Frontend
- **THEN** la tecnología se descarta, se abre el paso 2 con las tecnologías de Frontend y el nivel sigue siendo Junior

### Requirement: Tecnologías por capa

Si el puesto elegido tiene tecnologías con capa, el paso 2 SHALL mostrar un grupo por capa ("Frontend" y "Backend") y MUST exigir exactamente una tecnología de cada grupo para completarse. Si el puesto no tiene capas, el paso 2 MUST mostrar un solo grupo y exigir una tecnología. Qué puesto tiene capas lo MUST decidir el catálogo, no el código de la interfaz. El nombre mostrado de una elección por capas MUST ser "<frontend> + <backend>".

#### Scenario: Full Stack
- **WHEN** el usuario elige Full Stack
- **THEN** el paso 2 muestra "Frontend" (React, Angular, Vue) y "Backend" (Node.js, Python, Java, PHP), y solo se completa al elegir uno de cada grupo

#### Scenario: Full Stack a medias
- **WHEN** el usuario elige React pero ningún backend
- **THEN** el paso 2 sigue abierto y "Comenzar entrevista" sigue deshabilitado

#### Scenario: Resumen compuesto
- **WHEN** el usuario elige React y Node.js
- **THEN** la capa plegada y la barra de resumen muestran "React + Node.js"

### Requirement: El servidor valida la combinación

`POST /api/entrevistas/` SHALL aceptar `tecnologia` y, opcionalmente, `segunda_tecnologia`, ambas como códigos de tecnologías activas. MUST responder 400, sin llamar a la IA, en estos casos:
- alguna tecnología no pertenece al puesto;
- el puesto tiene capas y `tecnologia` no es de frontend o `segunda_tecnologia` no es de backend, o falta;
- el puesto no tiene capas y se envía `segunda_tecnologia`.

#### Scenario: Full Stack válido
- **WHEN** se inicia Full Stack con `tecnologia=full_stack_react` y `segunda_tecnologia=full_stack_node`
- **THEN** la respuesta es 201 y la entrevista muestra la tecnología "React + Node.js"

#### Scenario: Full Stack sin backend
- **WHEN** se inicia Full Stack solo con `tecnologia=full_stack_react`
- **THEN** la respuesta es 400 indicando que falta la tecnología de backend

#### Scenario: Capas invertidas
- **WHEN** se envía `tecnologia=full_stack_node` y `segunda_tecnologia=full_stack_react`
- **THEN** la respuesta es 400

#### Scenario: Segunda tecnología en un puesto sin capas
- **WHEN** se inicia Backend con `tecnologia=backend_python` y `segunda_tecnologia=backend_java`
- **THEN** la respuesta es 400

### Requirement: La entrevista usa el nombre compuesto

Cuando una entrevista tiene dos tecnologías, el entrevistador y el evaluador SHALL recibir como tecnología el nombre compuesto "<frontend> + <backend>". El historial y los resultados MUST mostrar ese mismo nombre. Las entrevistas que ya usaban una combinación fija MUST seguir mostrando su nombre original.

#### Scenario: Prompt de Full Stack
- **WHEN** se genera una pregunta de una entrevista Full Stack con React y Node.js
- **THEN** el prompt del entrevistador indica "React + Node.js" como tecnología elegida

#### Scenario: Entrevista antigua
- **WHEN** se consulta una entrevista iniciada antes de este cambio con "React + Python"
- **THEN** su tecnología sigue mostrándose como "React + Python"

### Requirement: Atajos que rellenan los pasos

"Repetir última", "Usar este perfil" (convocatoria) y la preselección por URL (`?puesto=`, `?nivel=`) SHALL rellenar los pasos correspondientes, plegarlos y abrir el primer paso incompleto. Una tecnología que ya no está activa MUST ignorarse, y el paso 2 MUST quedar pendiente. La última configuración y el perfil de la convocatoria MUST incluir la segunda tecnología cuando exista.

#### Scenario: Repetir una combinación antigua
- **WHEN** la última entrevista del usuario fue Full Stack "React + Node.js" con la combinación fija ya inactiva
- **THEN** al repetir quedan elegidos Full Stack y el nivel, y se abre el paso 2 para elegir frontend y backend

#### Scenario: Convocatoria Full Stack
- **WHEN** la convocatoria pide un Full Stack con React y Node.js
- **THEN** el perfil detectado trae ambas tecnologías y "Usar este perfil" deja los tres pasos completos

### Requirement: El perfil de convocatoria lista hasta dos tecnologías

El perfil detectado de una convocatoria SHALL expresar las tecnologías como una lista de hasta 2 códigos. Esa lista MUST contener a lo sumo una tecnología por capa, y todas del puesto detectado. Las que no cumplan MUST descartarse, nunca reemplazarse. Un perfil guardado con el formato anterior (una sola tecnología) MUST seguir leyéndose como una lista de un elemento.

#### Scenario: Tecnología de otro puesto
- **WHEN** la IA devuelve para Full Stack una tecnología de Backend
- **THEN** esa tecnología se descarta del perfil

#### Scenario: Perfil guardado antes del cambio
- **WHEN** se lee una convocatoria analizada con el formato anterior
- **THEN** su perfil expone `tecnologias` con la tecnología que tenía

### Requirement: Catálogo sin datos de búsqueda

`GET /api/catalogos/puestos/` SHALL devolver los puestos, sus tecnologías activas con su `capa`, los niveles, las áreas y el largo de la entrevista. MUST NOT devolver `palabras_clave` ni `mas_practicados`.

#### Scenario: Consultar el catálogo
- **WHEN** un usuario autenticado consulta `GET /api/catalogos/puestos/`
- **THEN** cada tecnología de Full Stack trae `capa` "frontend" o "backend", las demás traen `capa` vacía, y la respuesta no contiene `palabras_clave` ni `mas_practicados`
