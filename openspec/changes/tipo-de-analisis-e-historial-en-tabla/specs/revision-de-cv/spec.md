## Purpose

Diagnosticar por qué un currículum queda fuera de la búsqueda de un reclutador que usa un ATS, midiendo el documento regla por regla y sin publicar nunca un puntaje.

## ADDED Requirements

### Requirement: El usuario elige el tipo de análisis
La entrada SHALL ofrecer dos opciones excluyentes bajo «Tipo de análisis»:
- «Análisis general», que revisa solo el CV;
- «Análisis dirigido», que lo compara con una convocatoria.

El control, la opción elegida al entrar y la disposición los define `tipo-de-analisis-en-combo`.

#### Scenario: Cambiar de tipo
- **WHEN** el usuario eligió «Análisis general» y pulsa «Análisis dirigido»
- **THEN** queda marcada «Análisis dirigido» y «Análisis general» deja de estarlo

### Requirement: La convocatoria solo se pide en el análisis dirigido
La zona «Convocatoria» (pegar texto o subir PDF/DOCX) SHALL mostrarse solo con «Análisis dirigido». Si el usuario vuelve a «Análisis general», el texto o archivo de la convocatoria SHALL conservarse para cuando vuelva a «Análisis dirigido», pero NO SHALL enviarse en el análisis.

#### Scenario: Elegir dirigido muestra la convocatoria
- **WHEN** el usuario elige «Análisis dirigido»
- **THEN** aparece la zona «Convocatoria» a la derecha de «Tu CV» (ver `tipo-de-analisis-en-combo`)

#### Scenario: Volver a general no envía el aviso
- **WHEN** el usuario pegó una convocatoria, vuelve a «Análisis general» y analiza
- **THEN** el análisis se hace sin convocatoria
- **AND** al volver a «Análisis dirigido» el texto pegado sigue ahí

### Requirement: «Analizar CV» solo se activa cuando el análisis está listo
El botón principal SHALL decir siempre «Analizar CV» y SHALL estar deshabilitado mientras falte algo:
- el CV;
- en el análisis dirigido, el texto o archivo de la convocatoria.

Junto al botón no hay un aviso de lo que falta: lo quitó `entrada-del-cv-que-revisamos`.

#### Scenario: General listo
- **WHEN** el usuario eligió «Análisis general» y subió su CV
- **THEN** «Analizar CV» se habilita

#### Scenario: Dirigido sin aviso
- **WHEN** el usuario eligió «Análisis dirigido» y subió su CV, pero no dio convocatoria
- **THEN** «Analizar CV» sigue deshabilitado

### Requirement: El orden de la entrada en el celular
Por debajo de 1024 px la entrada SHALL apilarse en este orden: tipo de análisis, CV, convocatoria y botón. La disposición desde 1024 px la define `tipo-de-analisis-en-combo`.

#### Scenario: Celular
- **WHEN** el usuario abre `/mi-cv` en una pantalla de 390 px
- **THEN** ve primero «Tipo de análisis», luego «Tu CV» y, si eligió dirigido, «Convocatoria»

### Requirement: El historial de análisis es una tabla
Debajo del botón, los análisis anteriores SHALL mostrarse en una tabla, del más reciente al más antiguo, con estas columnas:
- Fecha;
- Archivo CV;
- Tipo de análisis, con el mismo nombre que la barra de su resultado;
- Estado del CV;
- Campos leídos (como «5/8»);
- una acción «Ver» que abre ese análisis en `/mi-cv/<id>`.

La acción SHALL nombrar el archivo y la fecha para lectores de pantalla. La tabla SHALL paginarse con la página en la URL; cuántas filas por página lo define `historial-de-cv-de-cinco-en-cinco`. Por debajo de 640 px, cada fila SHALL verse como una tarjeta. Sin análisis, o mientras carga, no SHALL mostrarse nada.

#### Scenario: Abrir un análisis desde la tabla
- **WHEN** el usuario pulsa «Ver» en una fila
- **THEN** se abre el resultado completo de ese análisis en `/mi-cv/<id>`

### Requirement: El estado del CV en el historial es el del Resumen
La columna «Estado del CV» SHALL mostrar el mismo estado que el Resumen de ese análisis, con la regla por datos clave de `estado-del-cv-por-datos-clave`:
- «Pérdidas importantes» si falta algún dato clave;
- «Legible con pérdidas» si están los clave pero algún dato quedó incompleto o falta;
- «Legible» en otro caso.

Cada estado SHALL llevar icono y palabra, nunca solo color, y NUNCA un número ni un porcentaje. El API de la lista SHALL publicar ese estado (`veredicto`), calculado de los campos ya medidos y sin llamar a la IA. Un análisis sin medición SHALL publicarlo como nulo.

#### Scenario: CV escaneado
- **WHEN** el historial incluye un PDF sin capa de texto
- **THEN** su fila dice «Pérdidas importantes», igual que su Resumen
