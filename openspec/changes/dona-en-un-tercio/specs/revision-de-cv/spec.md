## ADDED Requirements

### Requirement: La dona ocupa un tercio del banner
En el Resumen de los dos tipos de análisis, desde 768 px, el panel de la dona SHALL ocupar un tercio del ancho del banner y los demás paneles SHALL ocupar los dos tercios restantes.

- **En el análisis general**, los dos tercios SHALL llevar el panel del estado con «Formato».
- **En el análisis dirigido**, los dos tercios SHALL llevar el estado arriba y, debajo, «Formato» y «Requisitos de la oferta». Esos dos van lado a lado desde 1024 px y apilados por debajo.

La dona y su leyenda SHALL quedar centradas en su panel. Por debajo de 768 px, los paneles SHALL apilarse en el orden de lectura: dona, estado, «Formato», «Requisitos de la oferta». La separación entre paneles no cambia.

#### Scenario: Análisis general en escritorio
- **WHEN** el usuario abre el Resumen de un análisis general a 1280 px
- **THEN** el panel de la dona ocupa el tercio izquierdo y el panel del estado con «Formato» los dos tercios derechos

#### Scenario: Análisis dirigido en escritorio
- **WHEN** el usuario abre el Resumen de un análisis dirigido a 1280 px
- **THEN** el panel de la dona ocupa el tercio izquierdo y, en los dos tercios derechos, el estado va arriba con «Formato» y «Requisitos de la oferta» lado a lado debajo

#### Scenario: Tablet
- **WHEN** el ancho es 800 px
- **THEN** la dona sigue en el tercio izquierdo y, en el dirigido, «Formato» y «Requisitos de la oferta» se apilan dentro de los dos tercios

#### Scenario: Celular
- **WHEN** el ancho es 375 px
- **THEN** los paneles se apilan en una columna, empezando por la dona, sin desplazamiento horizontal
