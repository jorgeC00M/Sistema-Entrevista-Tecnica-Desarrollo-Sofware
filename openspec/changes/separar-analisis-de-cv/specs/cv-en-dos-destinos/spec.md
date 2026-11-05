## ADDED Requirements

### Requirement: Dos destinos en el menú
El grupo «Prepararte» del menú lateral SHALL tener dos destinos, en este orden: «Analizar CV» (`/mi-cv/analisis`) y «Comparar con oferta» (`/mi-cv/oferta`). El menú MUST NOT ofrecer «Revisar mi CV». Cada destino SHALL marcarse como actual en su entrada y en los resultados de su tipo, y nunca los dos a la vez.

#### Scenario: Menú desplegado
- **WHEN** el usuario abre el menú en escritorio
- **THEN** ve «PREPARARTE» con «Analizar CV» y «Comparar con oferta», y debajo «TU PROGRESO»

#### Scenario: Destino actual en un resultado
- **WHEN** el usuario está en `/mi-cv/oferta/<id>`
- **THEN** «Comparar con oferta» está marcado como actual y «Analizar CV» no

### Requirement: Rutas simétricas por tipo de análisis
`/mi-cv/analisis` y `/mi-cv/analisis/:id` SHALL ser el análisis solo del CV, y `/mi-cv/oferta` y `/mi-cv/oferta/:id` el análisis contra una convocatoria. La entrada MUST NOT ofrecer pestañas de tipo de análisis.

Las rutas `/mi-cv` y `/mi-cv/:id` MUST NOT existir: no se registran ni redirigen, y caen en la ruta comodín como cualquier ruta desconocida. Ningún enlace interno SHALL apuntar a ellas.

Un análisis abierto en la ruta del otro tipo SHALL redirigirse a la de su tipo sin dejar la ruta equivocada en el historial del navegador.

#### Scenario: Entrada de «Analizar CV»
- **WHEN** el usuario abre `/mi-cv/analisis`
- **THEN** ve «Tu CV» y «¿Qué revisamos?», sin pestañas ni campo de convocatoria, y al analizar no se envía convocatoria

#### Scenario: Entrada de «Comparar con oferta»
- **WHEN** el usuario abre `/mi-cv/oferta`
- **THEN** ve «Tu CV» y «Convocatoria», sin pestañas, y «Analizar CV» se habilita solo con el CV y la convocatoria

#### Scenario: Resultado según el tipo
- **WHEN** el usuario analiza con convocatoria
- **THEN** llega a `/mi-cv/oferta/<id>`, y sin convocatoria a `/mi-cv/analisis/<id>`

#### Scenario: Id en la ruta del otro tipo
- **WHEN** el usuario escribe `/mi-cv/analisis/<id>` y ese análisis tiene convocatoria
- **THEN** la dirección pasa a `/mi-cv/oferta/<id>` y «atrás» no vuelve a `/mi-cv/analisis/<id>`

#### Scenario: Enlace viejo
- **WHEN** un usuario con sesión abre `/mi-cv` o `/mi-cv/<id>`
- **THEN** la ruta comodín lo lleva a `/`, y de ahí a `/simular-entrevista`

### Requirement: Encabezado por destino
El encabezado y el `h1` oculto SHALL decir «Analizar CV» en `/mi-cv/analisis` y sus resultados, y «Comparar con oferta» en `/mi-cv/oferta` y sus resultados.

#### Scenario: Título en la comparación
- **WHEN** el usuario está en `/mi-cv/oferta` o en uno de sus resultados
- **THEN** el encabezado muestra «Comparar con oferta»

### Requirement: Historial por tipo
Cada entrada SHALL mostrar en «Historial de análisis» solo los análisis de su tipo, con la paginación de siempre. La tabla MUST NOT tener la columna «Tipo de análisis». El «Ver» de cada fila SHALL abrir la ruta de su tipo.

#### Scenario: Historial de «Analizar CV»
- **WHEN** el usuario tiene análisis de los dos tipos y abre `/mi-cv/analisis`
- **THEN** la tabla lista solo los análisis sin convocatoria, con Fecha, Archivo CV, Estado del CV, Campos leídos y Ver

#### Scenario: Sin análisis de ese tipo
- **WHEN** el usuario solo tiene análisis generales y abre `/mi-cv/oferta`
- **THEN** no se muestra el historial

### Requirement: Pasar de un destino al otro sin perder el CV
«Analizar otro» SHALL volver a la entrada del tipo del resultado, conservando el CV y la convocatoria elegidos. «Compara con una convocatoria» SHALL llevar a `/mi-cv/oferta` con el mismo CV elegido y el foco en la tarjeta «Convocatoria». Cambiar de destino desde el menú SHALL conservar también el CV elegido.

#### Scenario: Del general a la comparación
- **WHEN** el usuario pulsa «Compara con una convocatoria» en un resultado general
- **THEN** llega a «Comparar con oferta» con su CV ya elegido y el foco en la convocatoria
