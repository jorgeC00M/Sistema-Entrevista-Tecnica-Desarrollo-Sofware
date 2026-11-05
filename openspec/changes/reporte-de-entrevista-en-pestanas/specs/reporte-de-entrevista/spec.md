## ADDED Requirements

### Requirement: El reporte se ordena en tres pestañas
El reporte de una entrevista finalizada o abandonada SHALL tener un encabezado y tres pestañas: «Resumen», «Plan de mejora» y «Transcripción».

- **Encabezado:** SHALL mostrar el enlace «Ver historial», puesto · tecnología · nivel, el estado y la duración, en una línea bajo el título y sin el número de sesión (ver `encabezado-y-calculo-en-el-resumen`).
- **Pestañas:** SHALL seguir el patrón ARIA de pestañas del proyecto (`Pestanas`), con un solo panel visible.
- **Al entrar:** SHALL estar activa «Resumen».

En pantallas angostas, el contenido de cada pestaña SHALL apilarse sin desplazamiento horizontal.

#### Scenario: Abrir el reporte desde el historial
- **WHEN** el usuario pulsa «Ver» en una fila de «Historial y progreso»
- **THEN** ve el encabezado de esa entrevista y la pestaña «Resumen» activa

#### Scenario: Cambiar de pestaña con el teclado
- **WHEN** el foco está en «Resumen» y el usuario pulsa la flecha derecha
- **THEN** se activa «Plan de mejora» y se muestra su panel

### Requirement: Resumen con puntuación, veredicto, desglose y hallazgos
La pestaña «Resumen» SHALL mostrar, en este orden:

1. La **puntuación global** sobre 100 con su banda («75/100 · Aceptable»). En una entrevista abandonada SHALL decir «Nota parcial» y sobre cuántas preguntas se calculó. Si existe una entrevista anterior comparable, SHALL mostrar la diferencia con ella.
2. A su lado, el **«Veredicto de la IA»** (ver el requisito del veredicto).
3. El **«Desglose de la evaluación»**: una barra por cada uno de los **3 criterios de la rúbrica**, con su nivel medio sobre 4. Los nombres en pantalla SHALL ser:
   - «Conocimiento técnico (corrección)»;
   - «Profundidad (completitud)»;
   - «Claridad».

   El cambio de nombre MUST NOT alterar la rúbrica, sus pesos ni el texto que recibe el evaluador.
4. **«Fortalezas»** y **«Debilidades»** en dos columnas, con hasta 2 puntos cada una. Las fortalezas SHALL tomar el primer punto de las 2 respuestas mejor calificadas; las debilidades, el primero de las 2 peor calificadas. Los empates se resuelven por el número de pregunta menor.

El sistema MUST NOT mostrar pesos distintos ni criterios que la rúbrica no mide.

#### Scenario: Entrevista finalizada
- **WHEN** el usuario abre el Resumen de una entrevista finalizada con nota 75
- **THEN** ve «75/100 · Aceptable», el veredicto, tres barras con los nombres nuevos y dos columnas con 2 fortalezas y 2 debilidades

#### Scenario: Entrevista abandonada con una sola respuesta
- **WHEN** la entrevista se abandonó con una sola respuesta calificada
- **THEN** ve «Nota parcial», sobre 1 de 5 preguntas, y una fortaleza y una debilidad

### Requirement: El veredicto de la IA resume sin calificar
Al calificar la última respuesta, después de finalizar la entrevista y fuera de su transacción, el sistema SHALL pedir a la IA un párrafo de 2 a 3 líneas que resuma el desempeño. La IA SHALL recibir:
- el puesto, la tecnología y el nivel;
- por cada respuesta calificada, su área, su nota, sus niveles, sus fortalezas y sus debilidades.

MUST NOT recibir el texto de las respuestas. El veredicto se guarda una sola vez en la entrevista.

El sistema SHALL descartar el texto, y guardar que no está disponible, si:
- está vacío o supera su límite;
- contiene una nota, un porcentaje o una expresión sobre 100;
- concluye que la persona es apta, idónea o calificada, o estima una probabilidad.

Un fallo del proveedor MUST NOT impedir ni deshacer la finalización: la última respuesta sigue devolviendo éxito y la entrevista queda finalizada con su nota. El veredicto MUST NOT cambiar ninguna nota, nivel ni banda.

Mientras la entrevista esté en progreso, el veredicto MUST NOT publicarse.

#### Scenario: Último «Enviar» con la IA disponible
- **WHEN** el usuario responde la quinta pregunta y el proveedor responde
- **THEN** la entrevista queda finalizada y el reporte muestra el veredicto con el rótulo «Generado por IA»

#### Scenario: La IA falla al redactar
- **WHEN** el proveedor falla al redactar el veredicto
- **THEN** la respuesta del último «Enviar» es exitosa, la entrevista queda finalizada y el veredicto se guarda como no disponible

#### Scenario: El texto concluye aptitud
- **WHEN** el proveedor devuelve «Eres apto para el puesto de Backend»
- **THEN** el texto se descarta y no se muestra

#### Scenario: Volver a abrir el reporte
- **WHEN** el usuario abre el reporte de una entrevista que ya tiene un veredicto guardado
- **THEN** se muestra sin llamar a la IA

### Requirement: El veredicto tiene respaldo y se puede pedir aparte
El sistema SHALL ofrecer una operación para pedir el veredicto de una entrevista finalizada o abandonada del propio usuario. Responde:
- **404** si la entrevista es de otra persona;
- **409** si sigue en progreso;
- el veredicto guardado, sin llamar a la IA, si ya existe uno válido.

El reporte SHALL pedirlo automáticamente una vez si la entrevista no tiene veredicto: es el caso de las abandonadas y de las anteriores a este cambio.

Mientras se pide, el bloque SHALL decir «Escribiendo tu veredicto…». Si no está disponible, SHALL mostrar un párrafo armado por reglas a partir del resumen (la banda, el criterio más débil y el área prioritaria), **sin** el rótulo de IA, junto con «Reintentar».

#### Scenario: Entrevista abandonada
- **WHEN** el usuario abre el reporte de una entrevista abandonada sin veredicto
- **THEN** el reporte lo pide una vez y lo muestra al llegar

#### Scenario: Reintentar tras un fallo
- **WHEN** el veredicto no está disponible y el usuario pulsa «Reintentar»
- **THEN** se vuelve a pedir y, si llega, reemplaza al párrafo de reglas

### Requirement: Plan de mejora con tres tareas
La pestaña «Plan de mejora» SHALL titularse «Tareas para tu próxima entrevista» y mostrar tres bloques, cada uno con su ícono:

- **«Temas a repasar»:** las 2 respuestas con menor nota (los empates, por el número menor), cada una con su área y los puntos que debía cubrir una respuesta completa.
- **«Cómo mejorar tu comunicación»:** un consejo fijo según el criterio más débil de la entrevista.
- **«Práctica recomendada»:** el mismo puesto y nivel. Si la banda general es «Sólido» y hay un nivel superior, sugiere ese nivel. Incluye el acceso para practicar, que solo preselecciona puesto y nivel, nunca inicia la entrevista.

Todo SHALL calcularse con las evaluaciones guardadas, sin llamar a la IA.

#### Scenario: Banda sólida en Junior
- **WHEN** la entrevista Junior de Backend terminó con banda «Sólido»
- **THEN** la práctica recomendada sugiere Backend en el nivel Intermedio

#### Scenario: Criterio más débil claridad
- **WHEN** el criterio más débil es la claridad
- **THEN** el consejo de comunicación propone ordenar la respuesta en contexto, acción y resultado

### Requirement: Transcripción en acordeón
La pestaña «Transcripción» SHALL mostrar un acordeón por pregunta, que se puede abrir con el teclado, titulado «Pregunta N: [Tema] (Puntaje: X/100)». Al abrirlo SHALL mostrar en formato de chat:
- la pregunta de la IA;
- la respuesta del usuario;
- el «Análisis IA»: los niveles por criterio y su cuenta en una sola línea, las fortalezas, las debilidades y las sugerencias. El «¿Cómo se calcula?» va una sola vez en el Resumen y lo que debía cubrir una respuesta completa, en el Plan de mejora (ver `encabezado-y-calculo-en-el-resumen`).

En una entrevista abandonada, las preguntas sin responder SHALL aparecer como «Sin responder», sin puntaje.

#### Scenario: Abrir una pregunta
- **WHEN** el usuario abre «Pregunta 2: Django (Puntaje: 58/100)»
- **THEN** ve la pregunta, su respuesta y el análisis de esa respuesta
