## Purpose

Configurar una entrevista con un formulario reconocible —una etiqueta y un desplegable por campo— a mano o partiendo de una convocatoria pegada o subida dentro del mismo formulario.

## ADDED Requirements

### Requirement: Campos con etiqueta y desplegable

El formulario SHALL presentar los campos Puesto, Tecnología y Nivel. Cada uno MUST tener una etiqueta visible asociada a su desplegable nativo, y su primera opción, "Selecciona…", MUST no poder elegirse. Si el puesto elegido tiene tecnologías por capa, el campo Tecnología MUST mostrarse como dos campos: "Tecnología de frontend" y "Tecnología de backend". El nivel MUST mostrarse con su nombre y su grado ("Junior · Inicial").

#### Scenario: Entrada a la pantalla
- **WHEN** el usuario abre "Nueva entrevista" sin parámetros
- **THEN** ve los campos Puesto, Tecnología y Nivel con su etiqueta, Puesto en "Selecciona…" y Tecnología deshabilitado con la ayuda "Elige primero el puesto"

#### Scenario: Full Stack
- **WHEN** el usuario elige "Desarrollador Full Stack"
- **THEN** aparecen dos desplegables, "Tecnología de frontend" y "Tecnología de backend", y "Comenzar entrevista" sigue deshabilitado hasta elegir ambos

#### Scenario: Descripción del puesto
- **WHEN** el usuario elige un puesto
- **THEN** bajo el campo Puesto aparece la descripción de ese puesto

### Requirement: Tecnologías agrupadas

Dentro de un desplegable de tecnología, las opciones con `grupo` SHALL agruparse bajo ese rótulo, en el orden del catálogo. Las opciones sin grupo MUST aparecer sueltas.

#### Scenario: Backend
- **WHEN** el usuario abre el desplegable de tecnología de Backend
- **THEN** ve los grupos "Python" (Django, FastAPI, Flask) y "Node.js" (Express, NestJS), entre otros

### Requirement: Cambiar de puesto descarta la tecnología

Elegir otro puesto SHALL vaciar las tecnologías elegidas, porque pertenecen al puesto anterior, y MUST conservar el nivel.

#### Scenario: De Backend a Frontend
- **WHEN** con Backend, Django y Junior elegidos el usuario cambia el puesto a Frontend
- **THEN** la tecnología vuelve a "Selecciona…" y el nivel sigue siendo Junior

### Requirement: Dos modos en el mismo formulario

Arriba del formulario SHALL haber dos opciones de modo: "Elegir yo" y "Desde una convocatoria". En "Desde una convocatoria" el formulario MUST mostrar, antes de los campos, la entrada de la convocatoria (pegar texto de 30 a 5000 caracteres, o subir PDF/DOCX) y el botón "Analizar convocatoria". Los campos MUST seguir visibles y editables en ambos modos.

#### Scenario: Analizar rellena los campos
- **WHEN** en "Desde una convocatoria" el usuario pega un aviso de Full Stack con React y Express y pulsa "Analizar convocatoria"
- **THEN** los campos quedan en Full Stack, React, Express y el nivel detectado; se listan los requisitos que orientarán las preguntas, y la barra muestra "Desde convocatoria"

#### Scenario: Ajustar tras analizar
- **WHEN** después de analizar, el usuario cambia el nivel
- **THEN** el nivel cambia y la entrevista sigue usando los requisitos de la convocatoria

#### Scenario: Volver a "Elegir yo"
- **WHEN** después de analizar, el usuario pasa a "Elegir yo"
- **THEN** los campos conservan sus valores, desaparece "Desde convocatoria" y la entrevista se inicia sin convocatoria

#### Scenario: Aviso que no es de software
- **WHEN** el análisis no identifica un puesto de desarrollo
- **THEN** el formulario muestra el mensaje del servidor junto a la entrada y no modifica los campos

#### Scenario: Archivo ilegible o servicio no disponible
- **WHEN** el archivo es un PDF escaneado o la IA no está disponible
- **THEN** se muestra el mensaje correspondiente junto a la entrada y los campos no cambian

### Requirement: Atajos que rellenan el formulario

"Repetir última" (tras confirmar) y la preselección por URL (`?puesto=`, `?nivel=`) SHALL rellenar los campos. Los códigos inactivos o que no pertenecen al puesto MUST ignorarse y su campo MUST quedar en "Selecciona…". Tras aplicar un atajo, el foco MUST ir al primer campo vacío o, si no falta ninguno, a "Comenzar entrevista".

#### Scenario: Repetir una configuración antigua
- **WHEN** el usuario repite una entrevista Full Stack hecha con una combinación fija retirada
- **THEN** Puesto y Nivel quedan rellenos, Tecnología de frontend queda en "Selecciona…" y recibe el foco

### Requirement: Comenzar exige el formulario completo

"Comenzar entrevista" SHALL habilitarse solo cuando Puesto, cada tecnología requerida y Nivel tengan valor. Mientras falte algo, la barra MUST indicar el primer campo que falta.

#### Scenario: Falta el nivel
- **WHEN** puesto y tecnología están elegidos y el nivel no
- **THEN** la barra dice "Elige el nivel" y el botón está deshabilitado
