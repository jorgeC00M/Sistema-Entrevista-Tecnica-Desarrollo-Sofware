## Purpose

Dejar "Revisar mi CV" en su estado terminado. Lo que se ve debe ser fiel a lo que mide el sistema, el resultado no se debe perder y la pantalla debe funcionar igual con teclado, lector de pantalla y celular.

## ADDED Requirements

### Requirement: "Mejorar" muestra primero las correcciones

La pestaña "Mejorar" SHALL empezar por la lista de correcciones medidas. Después vienen, si existen, las viñetas de logro y la revisión de redacción. Lo que el ATS extrae del CV MUST mostrarse solo en el Resumen, una vez.

Cada corrección principal del Resumen MUST llevar a esa misma corrección dentro de "Mejorar".

#### Scenario: Ver todo
- **WHEN** el usuario pulsa "Ver todo en Mejorar"
- **THEN** lo primero que ve es la lista de correcciones, sin el espejo del ATS repetido

#### Scenario: Ir a una corrección
- **WHEN** el usuario pulsa la segunda corrección principal del Resumen
- **THEN** se abre "Mejorar" con el foco en esa corrección

### Requirement: Lo medido y lo sugerido se cuentan por separado

La pestaña SHALL llamarse "Mejorar", sin número. Dentro, una línea MUST indicar por separado:
- cuántas correcciones son medidas (hallazgos del ATS y viñetas sin resultado);
- cuántas son sugerencias de IA (correcciones de redacción), solo si las hay.

Ningún número de la pantalla MUST sumar lo medido con lo sugerido.

#### Scenario: Llegan las sugerencias
- **WHEN** llegan 3 correcciones de redacción de la IA
- **THEN** el rótulo de la pestaña no cambia, y dentro se lee "… correcciones medidas · 3 sugerencias de IA"

### Requirement: El análisis no se pierde y los errores aparecen donde se causan

- **URL propia:** cada resultado SHALL tener su dirección `/mi-cv/<id>`. Abrirla o recargarla MUST mostrar ese análisis; uno ajeno o inexistente MUST mostrar un aviso y la entrada para analizar.
- **Mientras se analiza:** MUST anunciarse un estado de progreso.
- **Error al analizar:** MUST aparecer junto al botón que lo causó.
- **Tiempo agotado o fallo de red:** el mensaje MUST decir que el análisis puede estar ya en el historial, y el historial MUST refrescarse.
- **Abrir desde el historial:** MUST mostrar un estado de carga.
- **CV sin texto legible:** la acción MUST ser "Subir otro archivo" y dejar la zona del CV vacía.

#### Scenario: Recargar un resultado
- **WHEN** el usuario recarga la página mientras ve un análisis
- **THEN** sigue viendo ese mismo análisis

#### Scenario: Tiempo agotado al subir
- **WHEN** la subida supera el tiempo de espera del cliente
- **THEN** junto al botón se lee que el análisis puede estar ya en sus análisis anteriores, y la lista se actualiza

### Requirement: Jerarquía y color según el sistema de diseño

- **Títulos:** los de las tarjetas principales SHALL compartir un mismo nivel visual, y las secciones secundarias MUST verse por debajo de ellas.
- **Color:** MUST NOT usarse para decorar. El color de cada corrección MUST corresponder a su severidad.
- **Página:** MUST NOT haber un rótulo encima del título principal.

#### Scenario: Una corrección grave
- **WHEN** una corrección impide la lectura
- **THEN** su icono y su rótulo usan el color de error, y no el ámbar de las demás

### Requirement: Accesibilidad completa del flujo

- **Espejo del ATS:** SHALL ser una lista de definición válida.
- **Avisos:** la falta de requisitos en la convocatoria MUST anunciarse sin interrumpir, porque no es un error.
- **Zona del CV:** MUST anunciar su formato, su tamaño máximo y su error.
- **Llegada del resultado:** MUST anunciar el archivo y cuántos campos lee el ATS.
- **Instrucciones de la convocatoria:** MUST quedar visibles al escribir, no solo como texto de ejemplo.

#### Scenario: Lector de pantalla al terminar
- **WHEN** termina el análisis
- **THEN** el lector anuncia el nombre del archivo y "el ATS lee 5 de 8 campos"

### Requirement: Pestañas utilizables en un celular

Por debajo de 640 px, las cuatro pestañas SHALL repartirse el ancho en columnas iguales, todas visibles. La fila de pestañas MUST quedar visible bajo la cabecera al desplazarse por un panel largo.

#### Scenario: 320 px
- **WHEN** el ancho es de 320 px
- **THEN** las cuatro pestañas se ven completas y sin desplazamiento horizontal
