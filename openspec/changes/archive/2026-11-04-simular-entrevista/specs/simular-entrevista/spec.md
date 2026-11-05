## ADDED Requirements

### Requirement: La pantalla se llama «Simular entrevista»
La pantalla donde el usuario configura y empieza una entrevista SHALL llamarse «Simular entrevista»: así lo dicen el botón principal del sidebar, su tooltip con el sidebar plegado y el título del encabezado. La interfaz MUST NOT mostrar «Nueva entrevista» en ningún lugar.

#### Scenario: Sidebar desplegado
- **WHEN** el usuario ve el sidebar en escritorio
- **THEN** el botón principal dice «Simular entrevista»

#### Scenario: Sidebar plegado
- **WHEN** el sidebar está plegado o es el riel de tablet y el usuario pasa el cursor o el foco por el botón principal
- **THEN** el tooltip y el nombre accesible dicen «Simular entrevista»

#### Scenario: Encabezado
- **WHEN** el usuario está en la pantalla
- **THEN** el encabezado muestra «Simular entrevista» con su subtítulo de siempre

### Requirement: La pantalla vive en `/simular-entrevista`
La pantalla SHALL servirse en `/simular-entrevista` y SHALL aceptar `?puesto=` y `?nivel=` igual que antes. La ruta `/nueva-entrevista` MUST NOT existir: no se registra ni redirige, y cae en la ruta comodín como cualquier ruta desconocida. Todo enlace interno a la pantalla SHALL apuntar a `/simular-entrevista`.

#### Scenario: Entrar con sesión
- **WHEN** un usuario con sesión abre `/`
- **THEN** llega a `/simular-entrevista`

#### Scenario: Practicar desde el reporte
- **WHEN** el usuario pulsa «Practicar» en el Plan de mejora
- **THEN** llega a `/simular-entrevista?puesto=<codigo>&nivel=<codigo>` con esos campos preseleccionados

#### Scenario: Practicar desde el CV
- **WHEN** el usuario pulsa «Practicar la entrevista» en el análisis de su CV
- **THEN** llega a `/simular-entrevista?puesto=<codigo>`, o a `/simular-entrevista` si no hay puesto sugerido

#### Scenario: Historial vacío
- **WHEN** un usuario sin entrevistas pulsa «Empieza la primera»
- **THEN** llega a `/simular-entrevista`

#### Scenario: Marcador antiguo
- **WHEN** un usuario con sesión abre `/nueva-entrevista`
- **THEN** la ruta comodín lo lleva a `/`, y de ahí a `/simular-entrevista`, sin el puesto ni el nivel del enlace antiguo
