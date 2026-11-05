## ADDED Requirements

### Requirement: El banner del Resumen se divide en paneles
En el Resumen de los dos tipos de análisis, la dona con su leyenda de datos extraídos, incompletos y no extraídos SHALL ir en un panel propio, a la izquierda.

- **En el análisis general**, a su derecha SHALL ir un solo panel con el estado (etiqueta, título y regla) y «Formato».
- **En el análisis dirigido**, a su derecha SHALL ir:
  - arriba, el panel del estado;
  - debajo, «Formato» y «Requisitos de la oferta» en dos paneles separados y lado a lado.

La separación entre paneles SHALL ser de 24 px desde 1024 px y menor por debajo. En pantallas angostas los paneles SHALL apilarse en el orden en que se leen: dona, estado, «Formato», «Requisitos de la oferta». Los paneles no cambian lo que se mide: la dona y el estado siguen saliendo solo de los datos extraídos.

#### Scenario: Análisis general en escritorio
- **WHEN** el usuario abre el Resumen de un análisis general a 1280 px
- **THEN** ve el panel de la dona y, a 24 px a su derecha, el panel con el estado y «Formato»

#### Scenario: Análisis dirigido en escritorio
- **WHEN** el usuario abre el Resumen de un análisis dirigido a 1280 px
- **THEN** ve el panel de la dona a la izquierda y, a la derecha, el estado arriba y, debajo, «Formato» y «Requisitos de la oferta» en paneles separados lado a lado

#### Scenario: Celular
- **WHEN** el ancho es menor que 640 px
- **THEN** los paneles se apilan en una columna sin desplazamiento horizontal

### Requirement: «No se detectó» se escribe una vez
«Requisitos de la oferta» SHALL mostrar «No se detectó:» una sola vez, como encabezado de la lista. Debajo SHALL ir una fila por requisito ausente, obligatorios primero, con el término en una etiqueta y su tipo cuando el aviso los separa, y al pie la nota «“No se detectó” indica que no está escrito en tu CV, no que no lo sepas.». Si no hay ausentes, SHALL decir «Se detectaron todos los requisitos de la oferta» y no mostrar el encabezado.

#### Scenario: Dos requisitos ausentes
- **WHEN** no se detectaron Docker (obligatorio) ni Redis (deseable)
- **THEN** el panel dice «No se detectó:» una vez, y debajo «[Docker] obligatorio» y «[Redis] deseable»

### Requirement: Cada arreglo reparte 2/3 y 1/3
En «Arreglar el formato», cada fila SHALL dar 2/3 del ancho a la acción y su detalle, y 1/3 a las cajas AHORA / DESPUÉS, con 24 px de separación desde 1024 px. Por debajo de 1024 px, las cajas SHALL ir debajo del texto, a todo el ancho de la fila. «Palabras clave no detectadas» NO SHALL cambiar.

#### Scenario: Escritorio
- **WHEN** el usuario abre «Plan de Mejora» a 1280 px
- **THEN** cada arreglo muestra el texto en los dos tercios izquierdos y AHORA / DESPUÉS en el tercio derecho

#### Scenario: Tablet
- **WHEN** el ancho es 800 px
- **THEN** AHORA / DESPUÉS van debajo del texto del arreglo
