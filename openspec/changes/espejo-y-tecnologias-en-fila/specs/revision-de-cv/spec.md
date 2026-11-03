## Purpose

Diagnosticar por qué un currículum queda fuera de la búsqueda de un reclutador que usa un ATS, midiendo el documento regla por regla y sin publicar nunca un puntaje.

## ADDED Requirements

### Requirement: Espejo y tecnologías comparten fila en el análisis general
En «Resumen y Formato», desde 1024 px, el espejo («Esto es lo que el ATS ve de tu CV») SHALL ocupar unos dos tercios de la fila y «Tecnologías por las que te encontrarían» el tercio derecho, con la rejilla `2fr 1fr`. Las dos tarjetas SHALL tener la misma altura (alineadas arriba y abajo) y estar separadas por 24 px. Por debajo de 1024 px SHALL apilarse, con el espejo primero.

En el «Resumen» del análisis dirigido, que no tiene Tecnologías, el espejo SHALL seguir a todo el ancho.

#### Scenario: Computadora
- **WHEN** el usuario abre «Resumen y Formato» en una pantalla de 1280 px
- **THEN** ve el espejo en unos 2/3 de la fila y Tecnologías en el 1/3 derecho, con la misma altura y 24 px entre ambos

#### Scenario: Dirigido
- **WHEN** el usuario abre el «Resumen» de un análisis dirigido
- **THEN** el espejo ocupa todo el ancho

#### Scenario: Celular
- **WHEN** el usuario abre «Resumen y Formato» en una pantalla de 390 px
- **THEN** ve el espejo y debajo Tecnologías

### Requirement: Tecnologías se ajusta a una columna estrecha
En el tercio derecho, el pie de Tecnologías («Compara con una convocatoria» y su botón) SHALL apilarse y quedar al fondo de la tarjeta, para que el contenido llene la altura de la fila sin desbordar.

#### Scenario: Pie al fondo
- **WHEN** el espejo es más alto que la lista de tecnologías
- **THEN** el pie de Tecnologías queda abajo, alineado con el borde inferior del espejo
