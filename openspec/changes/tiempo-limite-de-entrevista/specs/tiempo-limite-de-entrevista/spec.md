## Purpose

Define cuánto dura una entrevista simulada, en qué estados termina, qué se califica y qué ve el usuario del tiempo y del resultado, como en una entrevista técnica real.

## ADDED Requirements

### Requirement: Límite total de 30 minutos desde el inicio
Cada entrevista SHALL tener un límite de 30 minutos, contado desde que se crea, es decir, desde que el usuario confirma «Comenzar». El límite es total, no de inactividad: responder MUST NOT extenderlo. El tiempo MUST seguir corriendo aunque el usuario cierre el navegador o la pestaña. Mientras no venza, el usuario SHALL poder retomar la entrevista en la pregunta pendiente.

#### Scenario: Retomar antes del límite
- **WHEN** el usuario cierra el navegador a los 10 minutos y vuelve a los 20
- **THEN** la entrevista sigue en progreso, en la pregunta pendiente, y le quedan 10 minutos

#### Scenario: Responder no reinicia el plazo
- **WHEN** el usuario responde una pregunta cada 8 minutos
- **THEN** la entrevista vence a los 30 minutos del inicio, aunque haya respondido hace menos de 30

### Requirement: Estados en que termina una entrevista
Una entrevista SHALL terminar en uno de tres estados:
- **Finalizada**: respondió todas las preguntas antes del límite;
- **Tiempo agotado**: venció el límite con al menos una respuesta y sin responder todas;
- **Abandonada**: el usuario la abandonó a propósito, o venció el límite sin ninguna respuesta.

Una entrevista terminada en cualquiera de los tres MUST NOT poder continuarse. Al cerrarse por vencimiento, su fecha de fin SHALL ser el instante del límite. Las entrevistas abandonadas antes de este cambio MUST conservar su estado.

#### Scenario: Vence sin respuestas
- **WHEN** pasan 30 minutos desde el inicio y el usuario no respondió ninguna pregunta
- **THEN** la entrevista queda «Abandonada», con fecha de fin igual al límite

#### Scenario: Vence a medias
- **WHEN** pasan 30 minutos desde el inicio y el usuario respondió 3 de 5
- **THEN** la entrevista queda «Tiempo agotado», con fecha de fin igual al límite

#### Scenario: Abandono manual
- **WHEN** el usuario confirma «Abandonar» con 2 respuestas
- **THEN** la entrevista queda «Abandonada» y no puede retomarse

### Requirement: El servidor hace cumplir el límite en cada acceso
El servidor SHALL aplicar el vencimiento cada vez que se lista el historial o se consulta, responde o pide los resultados de una entrevista en curso, sin depender de que el usuario pase por el historial. Una respuesta nueva recibida después del límite MUST rechazarse con 409 y un mensaje que diga que se acabó el tiempo, sin guardarse. Una respuesta recibida antes del límite SHALL contar: su evaluación se completa aunque termine después del límite, y un reintento de esa misma respuesta, ya guardada, SHALL aceptarse. Tras evaluar una respuesta guardada a tiempo, si el límite ya venció, la entrevista SHALL cerrarse en vez de generar otra pregunta.

#### Scenario: Pestaña abierta tras el límite
- **WHEN** el usuario deja la pestaña abierta, vuelve a los 40 minutos y envía una respuesta
- **THEN** recibe 409 «Se acabó el tiempo de esta entrevista», la respuesta no se guarda y la entrevista queda cerrada

#### Scenario: Enlace directo tras el límite
- **WHEN** el usuario abre `/entrevista/<id>` de una entrevista vencida sin haber pasado por el historial
- **THEN** el servidor la informa ya cerrada y la pantalla lleva a su reporte

#### Scenario: Evaluación lenta al borde del límite
- **WHEN** el usuario envía su respuesta a los 29:50 y la evaluación termina a los 30:20
- **THEN** la respuesta cuenta y está evaluada

#### Scenario: Reintento de una respuesta guardada a tiempo
- **WHEN** la evaluación de una respuesta enviada a los 29:00 falló y el usuario la reintenta a los 31:00
- **THEN** la evaluación se completa y la entrevista se cierra sin generar otra pregunta

### Requirement: Solo una entrevista finalizada tiene nota
Solo una entrevista «Finalizada» SHALL tener nota. Para «Tiempo agotado» y «Abandonada», la API MUST NOT publicar puntuación de la entrevista ni de cada pregunta, niveles de la rúbrica, resumen, comparación ni veredicto, y la interfaz MUST NOT mostrar nota, banda, desglose, veredicto ni plan de mejora. El historial MUST NOT publicar una nota parcial. Las entrevistas no finalizadas MUST NOT entrar en la evolución ni servir de referencia para comparar.

#### Scenario: Historial
- **WHEN** el usuario ve su historial con una entrevista «Tiempo agotado»
- **THEN** su columna de nota muestra «—»

#### Scenario: Pedir el veredicto de una no finalizada
- **WHEN** se pide el veredicto de una entrevista «Abandonada» o «Tiempo agotado»
- **THEN** el servidor responde 409 y no llama a la IA

#### Scenario: Resultados por la API
- **WHEN** se piden los resultados de una entrevista «Tiempo agotado»
- **THEN** el resumen y el veredicto son nulos, y ninguna pregunta trae puntuación ni niveles

### Requirement: Reporte de una entrevista no finalizada
El reporte de una entrevista «Tiempo agotado» o «Abandonada» SHALL mostrar:
- el encabezado con el puesto, la tecnología, el nivel y el estado;
- la frase «Respondiste k de N. Sin nota: la entrevista no se completó.»;
- la acción «Volver a intentarlo», que abre «Simular entrevista» con el puesto y el nivel preseleccionados, sin iniciar nada;
- la transcripción: por cada pregunta respondida, sus fortalezas, debilidades y sugerencias, sin puntaje ni operación; las no respondidas dicen «Sin responder».

#### Scenario: Ver una entrevista a medias
- **WHEN** el usuario abre el reporte de una entrevista «Tiempo agotado» con 3 de 5 respuestas
- **THEN** ve «Respondiste 3 de 5…», la retroalimentación de las 3 sin «Puntaje», y las otras 2 como «Sin responder»

#### Scenario: Volver a intentarlo
- **WHEN** pulsa «Volver a intentarlo»
- **THEN** llega a «Simular entrevista» con ese puesto y nivel ya elegidos

### Requirement: Cuenta regresiva visible
Durante la entrevista, el chat SHALL mostrar siempre el tiempo restante en minutos y segundos, calculado con la hora del servidor para que un reloj del dispositivo desajustado no lo altere. Al quedar 5 minutos y al quedar 1 minuto, SHALL cambiar de aspecto y anunciarlo a los lectores de pantalla, una vez por umbral. En 0, el campo de respuesta SHALL bloquearse y la pantalla SHALL pasar al reporte. El texto bajo la cabecera SHALL decir que hay 30 minutos para todas las preguntas y que la nota solo aparece si se termina. El modal de abandonar SHALL decir que la entrevista no tendrá nota.

#### Scenario: Aviso de 5 minutos
- **WHEN** quedan 5 minutos
- **THEN** el reloj cambia a su aspecto de aviso y un lector de pantalla anuncia «Quedan 5 minutos»

#### Scenario: Recargar la página
- **WHEN** el usuario recarga con 12 minutos restantes
- **THEN** el reloj muestra unos 12 minutos, no 30

#### Scenario: Se agota con el chat abierto
- **WHEN** el reloj llega a 0
- **THEN** el campo se bloquea y el usuario pasa al reporte de su entrevista, ya cerrada

### Requirement: «Continuar» dice cuánto queda
Mientras haya una entrevista en curso, el botón «Continuar» del sidebar SHALL mostrar «Continuar · m min», con los minutos restantes. (Decía «Continuar · n/total · m min»; `una-entrevista-en-curso` quitó «n/total», porque se congelaba y no ayuda a decidir si volver.) Con el sidebar plegado, SHALL decirlo en su tooltip. Una entrevista vencida MUST NOT ofrecerse para continuar.

#### Scenario: Sidebar con una entrevista a medias
- **WHEN** el usuario tiene una entrevista en curso con 18 minutos restantes
- **THEN** el sidebar muestra «Continuar · 18 min»

#### Scenario: Entrevista ya vencida
- **WHEN** la única entrevista en curso ya superó su límite
- **THEN** el sidebar no muestra «Continuar»
