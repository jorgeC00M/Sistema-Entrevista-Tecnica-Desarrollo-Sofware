## Purpose

Que "Nueva entrevista" aproveche el ancho del contenedor común en escritorio, igual que las demás pantallas del sidebar, sin cambiar cómo se elige ni cómo se inicia una entrevista.

## ADDED Requirements

### Requirement: La pantalla ocupa el contenedor completo en escritorio

Desde 1024 px de ancho, la pantalla "Nueva entrevista" SHALL ocupar todo el contenedor común (hasta 1280 px):
- el título a la izquierda y "Repetir última" a la derecha, en la misma fila;
- la tarjeta con las pestañas a todo el ancho.

La pantalla MUST NOT limitarse a un ancho menor que el del contenedor.

#### Scenario: Escritorio ancho
- **WHEN** el usuario abre "Nueva entrevista" con una ventana de 1440 px
- **THEN** la tarjeta llega hasta el borde derecho del contenedor, igual que en "Historial y progreso"

### Requirement: Campos en una fila en escritorio

En la pestaña "Personalizada", desde 1024 px, los campos SHALL mostrarse en una sola fila, en este orden:
- Puesto, Nivel y Tecnología, en un puesto sin capas;
- Puesto, Nivel, Tecnología de frontend y Tecnología de backend, en un puesto con capas.

Debajo, en una sola fila, MUST ir lo elegido (o lo que falta), con "Cubre: …" y la etiqueta "Desde convocatoria" cuando aplica, a la izquierda, e "Iniciar entrevista" a la derecha.

Entre 640 y 1023 px, Puesto y Nivel MUST compartir fila y la Tecnología ir debajo. Por debajo de 640 px, todo MUST apilarse. El orden de tabulación MUST seguir siendo Puesto, Nivel, Tecnología, y el foco tras aplicar una configuración MUST seguir yendo al primer campo vacío.

#### Scenario: Full Stack en escritorio
- **WHEN** el usuario elige "Desarrollador Full Stack" con la ventana a 1280 px
- **THEN** ve cuatro campos en una fila: Puesto, Nivel, Tecnología de frontend y Tecnología de backend

#### Scenario: Tablet
- **WHEN** el ancho es de 800 px
- **THEN** Puesto y Nivel comparten fila, la Tecnología queda debajo y el resumen va debajo de los campos

### Requirement: Convocatoria en dos columnas en escritorio

En la pestaña "Con convocatoria", desde 1024 px, SHALL haber dos columnas:
- a la izquierda, la entrada: la elección entre pegar texto y subir archivo, el campo y "Analizar convocatoria";
- a la derecha, lo detectado.

Antes del primer análisis, la columna derecha MUST mostrar un aviso que indique que ahí aparecerán el puesto, la tecnología y el nivel detectados. Por debajo de 1024 px, la pestaña MUST mostrarse en una columna, con lo detectado debajo de "Analizar convocatoria" y sin el aviso previo.

#### Scenario: Analizar en escritorio
- **WHEN** el usuario analiza una convocatoria con la ventana a 1280 px
- **THEN** lo detectado reemplaza el aviso en la columna derecha, sin que la entrada cambie de posición

#### Scenario: Móvil
- **WHEN** el ancho es de 375 px y no se ha analizado nada
- **THEN** no se ve el aviso previo, y tras analizar, lo detectado aparece debajo del botón
