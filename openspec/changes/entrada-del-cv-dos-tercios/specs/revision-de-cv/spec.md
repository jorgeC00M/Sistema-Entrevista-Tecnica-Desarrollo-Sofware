## Purpose

Diagnosticar por qué un currículum queda fuera de la búsqueda de un reclutador que usa un ATS, midiendo el documento regla por regla y sin publicar nunca un puntaje.

## ADDED Requirements

### Requirement: La fila de la entrada es 2/3 – 1/3
Desde 1024 px, en las dos pestañas, «Tu CV» SHALL ocupar unos dos tercios de la fila y el panel lateral SHALL ocupar el tercio restante: «¿Qué revisamos?» en el análisis general y «Convocatoria» en el dirigido. La rejilla es `2fr 1fr`. Las dos tarjetas SHALL tener la misma altura, separadas por 24 px. Cambiar de pestaña NO SHALL cambiar el ancho de «Tu CV». Por debajo de 1024 px SHALL apilarse: «Tu CV» primero.

#### Scenario: Computadora
- **WHEN** el usuario abre `/mi-cv` en una pantalla de 1280 px
- **THEN** «Tu CV» ocupa unos 2/3 de la fila y «¿Qué revisamos?» 1/3, con la misma altura y 24 px entre ambas

#### Scenario: Cambiar a dirigido
- **WHEN** el usuario pasa a «Análisis dirigido»
- **THEN** «Convocatoria» ocupa el tercio derecho y «Tu CV» mantiene su ancho

### Requirement: «¿Qué revisamos?» tiene jerarquía tipográfica
El panel SHALL titularse «¿Qué revisamos?», con el mismo estilo de título que «Tu CV». Debajo SHALL tener tres bloques, cada uno con un subtítulo destacado y su detalle en texto secundario:
- «Tus datos»: los 8 campos que el ATS intenta extraer;
- «El formato»: columnas, tablas, imágenes, encabezados y pies;
- «Tus viñetas»: si muestran logros o solo tareas.

Los tamaños SHALL salir de los tokens existentes, sin agregar nuevos.

#### Scenario: Lectura
- **WHEN** el usuario mira el panel
- **THEN** distingue a primera vista el título, los tres subtítulos y su detalle
