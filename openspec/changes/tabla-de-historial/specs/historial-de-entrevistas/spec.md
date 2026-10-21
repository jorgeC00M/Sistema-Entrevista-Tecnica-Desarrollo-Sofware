## Purpose

Define cómo ve el usuario su historial de entrevistas en "Historial y progreso": qué columnas tiene la tabla, qué nota se muestra según el estado, cómo se pagina y cómo se adapta a pantallas pequeñas.

## ADDED Requirements

### Requirement: Tabla de entrevistas con columnas fijas
La sección "Tus entrevistas" SHALL mostrar las entrevistas del usuario en una tabla, de la más reciente a la más antigua, con estas columnas en este orden: Fecha, Puesto, Tecnología, Nivel, Puntuación, Estado y Acción.

El contenido de cada columna SHALL ser:
- **Fecha:** la fecha de inicio, en formato día/mes/año (`21/10/2026`).
- **Tecnología:** el nombre de la tecnología, unido con « + » si son dos capas, o «—» si la entrevista no tiene.
- **Acción:** «Continuar» si la entrevista está en curso, o «Ver resultados» en otro caso.

#### Scenario: Una entrevista finalizada
- **WHEN** el usuario tiene una entrevista finalizada de Backend, con Django, Junior y nota 75
- **THEN** su fila muestra la fecha, «Desarrollador Backend», «Django», «Junior», «75», el estado «Finalizada» y un enlace «Ver resultados» a sus resultados

#### Scenario: Una entrevista en curso se retoma
- **WHEN** el usuario tiene una entrevista en curso
- **THEN** su fila muestra «—» en Puntuación y un enlace «Continuar» que lleva al chat de esa entrevista

### Requirement: Nota parcial de una entrevista abandonada
En la columna Puntuación:
- Una entrevista abandonada con al menos una respuesta calificada SHALL mostrar su nota parcial, con la indicación «parcial».
- Una abandonada sin respuestas calificadas SHALL mostrar «—».

La nota parcial es la media simple de las respuestas calificadas, la misma que muestra su reporte.

#### Scenario: Abandonada con respuestas calificadas
- **WHEN** el usuario abandonó una entrevista con dos respuestas calificadas, de 50 y 42
- **THEN** su fila muestra «46 · parcial»

#### Scenario: Abandonada sin respuestas
- **WHEN** el usuario abandonó una entrevista antes de responder
- **THEN** su fila muestra «—» en Puntuación

### Requirement: El listado no publica notas de entrevistas en curso
El listado de entrevistas de la API SHALL incluir, por cada entrevista, el campo `puntuacion_parcial`. Ese campo SHALL tener la media de las respuestas calificadas solo cuando la entrevista está abandonada, y SHALL ser `null` en cualquier otro estado.

En particular, una entrevista en curso SHALL tener `puntuacion_parcial` en `null` aunque ya tenga respuestas calificadas: la nota no se publica hasta que la entrevista termina.

#### Scenario: Una entrevista en curso con respuestas calificadas
- **WHEN** el usuario tiene una entrevista en curso con dos respuestas ya evaluadas y pide su historial
- **THEN** esa entrevista llega con `puntuacion_promedio` y `puntuacion_parcial` en `null`

#### Scenario: Una entrevista abandonada
- **WHEN** el usuario pide su historial y tiene una entrevista abandonada con respuestas de 50 y 42
- **THEN** esa entrevista llega con `puntuacion_parcial` igual a 46

### Requirement: Paginación de 10 filas
La tabla SHALL mostrar como máximo 10 entrevistas por página.

Cuando haya más de 10, SHALL aparecer debajo de la tabla una paginación con:
- a la izquierda, el rango visible («Mostrando 11–20 de 47»);
- a la derecha, los botones «anterior» y «siguiente» y los números de página.

La paginación SHALL mostrar como máximo 3 números de página consecutivos, sin «…», y con la página actual en el centro siempre que se pueda. En los extremos, la ventana se ajusta: en la primera página se ven 1, 2 y 3; en la última, las tres últimas. Las demás páginas se alcanzan con «anterior» y «siguiente».

Con 10 entrevistas o menos, SHALL no mostrarse paginación.

#### Scenario: Pocas entrevistas
- **WHEN** el usuario tiene 7 entrevistas
- **THEN** la tabla muestra las 7 y no hay paginación

#### Scenario: Cambiar de página
- **WHEN** el usuario tiene 47 entrevistas y pulsa la página 2
- **THEN** la tabla muestra las entrevistas 11 a 20, el rango dice «Mostrando 11–20 de 47» y la página 2 queda marcada como actual

#### Scenario: Límites
- **WHEN** el usuario está en la primera página
- **THEN** el botón «anterior» está deshabilitado
- **WHEN** el usuario está en la última página
- **THEN** el botón «siguiente» está deshabilitado

#### Scenario: Muchas páginas
- **WHEN** hay 12 páginas y el usuario está en la 6
- **THEN** la paginación muestra solo los números 5, 6 y 7, con la 6 marcada como actual

#### Scenario: Ventana en los extremos
- **WHEN** hay 12 páginas y el usuario está en la 1
- **THEN** la paginación muestra 1, 2 y 3
- **WHEN** el usuario está en la 12
- **THEN** la paginación muestra 10, 11 y 12

#### Scenario: Dos páginas
- **WHEN** hay 2 páginas
- **THEN** la paginación muestra solo 1 y 2

### Requirement: La página se conserva en la dirección
La página actual SHALL reflejarse en la URL como `?pagina=N`. Así, recargar o volver desde unos resultados mantiene la misma página.

Un valor inválido o fuera de rango SHALL mostrar la página más cercana válida, sin error.

#### Scenario: Volver desde unos resultados
- **WHEN** el usuario está en la página 3, abre unos resultados y vuelve atrás
- **THEN** la tabla vuelve a mostrar la página 3

#### Scenario: Página inexistente
- **WHEN** el usuario entra a `?pagina=99` y solo hay 2 páginas
- **THEN** se muestra la página 2

### Requirement: Accesibilidad de la tabla y la paginación
La tabla SHALL usar encabezados de columna reales que los lectores de pantalla asocien a cada celda.

La paginación SHALL:
- ser una región de navegación con nombre («Paginación»);
- marcar la página actual como tal;
- dar a cada botón un nombre accesible («Página 2», «Página anterior»);
- anunciar el nuevo rango al cambiar de página.

Cambiar de página SHALL llevar el foco al inicio de la tabla.

#### Scenario: Navegar con teclado
- **WHEN** el usuario llega con Tab a la paginación y activa «Página siguiente»
- **THEN** se muestra la siguiente página, se anuncia el nuevo rango y el foco pasa al inicio de la tabla

### Requirement: Vista en pantallas pequeñas
Por debajo de 640 px, cada entrevista SHALL mostrarse como una tarjeta apilada con los mismos datos y la misma acción, sin scroll horizontal. Desde 640 px SHALL mostrarse la tabla. La paginación SHALL funcionar igual en ambas vistas.

#### Scenario: Teléfono
- **WHEN** el usuario abre el historial en una pantalla de 375 px
- **THEN** ve tarjetas apiladas con puesto, tecnología, nivel, fecha, puntuación, estado y acción, y la página no se desplaza de lado
