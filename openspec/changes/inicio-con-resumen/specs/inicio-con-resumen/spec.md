## Purpose

Da al estudiante un punto de partida al iniciar sesión: cuánto practicó, cómo le fue en su última entrevista finalizada, cómo está su CV y qué le conviene hacer ahora.

## ADDED Requirements

### Requirement: Inicio es la primera pantalla con sesión
La pantalla Inicio SHALL servirse en `/inicio`. Un usuario con sesión que abre `/` SHALL llegar a `/inicio`. En el sidebar, «Inicio» SHALL ser el primer destino y SHALL ir arriba de «Continuar» y de «Simular entrevista», marcado como actual en `/inicio`, en las tres anchuras (escritorio, riel de tablet y cajón de celular). El encabezado SHALL decir «Inicio», con el subtítulo «Tu resumen y lo que te conviene hacer ahora», y la página SHALL tener un `h1` «Hola, <nombre>».

#### Scenario: Entrar con sesión
- **WHEN** un usuario con sesión abre `/`
- **THEN** llega a `/inicio`, y «Inicio» aparece como sección actual en el sidebar

#### Scenario: Orden del sidebar
- **WHEN** el usuario tiene una entrevista en curso
- **THEN** el sidebar muestra, de arriba abajo: «Inicio», «Continuar · m min» y «Simular entrevista»

### Requirement: Cuatro cifras de práctica
El Inicio SHALL mostrar cuatro cifras, cada una con un rótulo, un número y, opcionalmente, un detalle:
- **«Entrevistas realizadas»**: cantidad de entrevistas finalizadas; si hay abandonadas o con el tiempo agotado, el detalle «+N sin terminar»;
- **«Preguntas respondidas»**: total de respuestas evaluadas de las entrevistas terminadas, en cualquier estado de cierre;
- **«Tiempo de práctica»**: suma de la duración de las entrevistas **finalizadas** solamente;
- **«Análisis de CV»**: cantidad de análisis, con el detalle «X generales · Y con oferta».

MUST NOT mostrar promedios generales ni porcentajes que mezclen puestos o niveles. Sin datos, las cifras SHALL mostrar 0.

#### Scenario: Usuario con entrevistas sin terminar
- **WHEN** el usuario tiene 5 finalizadas, 1 abandonada y 1 con el tiempo agotado
- **THEN** «Entrevistas realizadas» muestra 5 con el detalle «+2 sin terminar»

#### Scenario: Tiempo de una entrevista vencida
- **WHEN** una entrevista quedó con el tiempo agotado
- **THEN** su duración no se suma al «Tiempo de práctica»

#### Scenario: Usuario nuevo
- **WHEN** el usuario no tiene entrevistas ni análisis
- **THEN** las cuatro cifras muestran 0

### Requirement: Tu siguiente paso
El Inicio SHALL mostrar siempre una tarjeta «Tu siguiente paso», con una frase y una acción, y el caso SHALL ser el primero que se cumpla de esta lista:
1. Hay una entrevista en curso → «Tienes una entrevista de <puesto> en curso · quedan m min», con [Continuar] hacia esa entrevista; con aspecto de aviso desde 5 minutos.
2. Sin análisis de CV y sin entrevistas → «Empieza analizando tu CV», con [Analizar CV].
3. Sin entrevistas → «Simula tu primera entrevista», con [Simular entrevista], preseleccionando el puesto que sugiere el último CV si lo hay.
4. La última entrevista terminada quedó abandonada o con el tiempo agotado → «Tu última entrevista no se completó: inténtala de nuevo», con [Volver a intentarlo] y el mismo puesto y nivel preseleccionados.
5. La última finalizada fue «Sólido» y existe un nivel siguiente → «Sube a <nivel> en <puesto>», con [Practicar] y ese puesto y nivel preseleccionados.
6. En otro caso → «Repasa <área prioridad>, tu punto más bajo en <puesto> <nivel>», con [Practicar] y el mismo puesto y nivel.

Las acciones que llevan a «Simular entrevista» MUST solo preseleccionar campos, nunca iniciar una entrevista.

#### Scenario: Entrevista en curso
- **WHEN** el usuario tiene una entrevista de Backend en curso con 18 minutos restantes
- **THEN** ve «Tienes una entrevista de Backend en curso · quedan 18 min» y [Continuar] lo lleva a esa entrevista

#### Scenario: La última no se completó
- **WHEN** la última entrevista terminada del usuario quedó con el tiempo agotado y no hay ninguna en curso
- **THEN** ve «Tu última entrevista no se completó: inténtala de nuevo», y [Volver a intentarlo] abre «Simular entrevista» con su puesto y nivel

#### Scenario: Sube de nivel
- **WHEN** la última finalizada fue Backend Junior con banda «Sólido»
- **THEN** ve «Sube a Semi-Senior en Backend», y [Practicar] preselecciona Backend y Semi-Senior

### Requirement: Tu última entrevista y tu CV
«Tu última entrevista» SHALL mostrar la última entrevista **finalizada**:
- puesto, tecnología, nivel y fecha;
- su nota sobre 100 con su banda en palabras, y la prioridad (área más baja);
- un enlace [Ver reporte].

Sin entrevistas finalizadas, MUST NOT mostrarse.

«Tu CV» SHALL mostrar el último análisis de CV:
- nombre del archivo y tipo («general» o «con oferta»);
- estado del CV, con icono y texto;
- campos leídos;
- si la revisión guardada sugiere un puesto, «Tu CV apunta a <puesto>» con [Simular esa entrevista];
- un enlace a ese análisis.

Sin análisis, MUST NOT mostrarse. El Inicio MUST NOT pedir nada a la IA: solo muestra lo ya guardado.

#### Scenario: Última finalizada con una abandonada después
- **WHEN** el usuario finalizó una entrevista de Frontend y luego abandonó una de Backend
- **THEN** «Tu última entrevista» muestra la de Frontend, con su nota

#### Scenario: CV con puesto sugerido
- **WHEN** el último análisis tiene una revisión que sugiere Backend
- **THEN** «Tu CV» dice «Tu CV apunta a Desarrollador Backend» y [Simular esa entrevista] preselecciona Backend

### Requirement: La evolución vive en el Inicio
El Inicio SHALL mostrar «Tu evolución»: la leyenda por puesto y una tarjeta por nivel (los tres, en el orden del catálogo), con una línea por puesto, las mismas reglas de antes (solo finalizadas, eje por número de entrevista dentro del puesto, escala 0–100, detalle por punto con el cursor o el foco) y, en un nivel sin datos, «Aún sin entrevistas <Nivel> finalizadas». El Inicio MUST NOT tener filtros. El Historial MUST NOT mostrar más las gráficas.

#### Scenario: Ver la evolución
- **WHEN** el usuario abre el Inicio con entrevistas finalizadas de Junior
- **THEN** ve la tarjeta Junior con sus líneas y las de Semi-Senior y Senior con su mensaje vacío

### Requirement: El Historial se llama «Historial» y conserva la tabla
El destino y el encabezado del Historial SHALL llamarse «Historial». La pantalla SHALL conservar la tabla de entrevistas, el buscador y el filtro de nivel, con sus parámetros en la URL, y MUST NOT mostrar gráficas ni su leyenda.

#### Scenario: Abrir el Historial
- **WHEN** el usuario abre `/historial`
- **THEN** el encabezado dice «Historial» y ve la tabla con el buscador y el filtro de nivel, sin gráficas
