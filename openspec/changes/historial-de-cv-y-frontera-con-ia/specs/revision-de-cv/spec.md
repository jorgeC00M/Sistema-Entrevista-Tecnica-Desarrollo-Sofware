## ADDED Requirements

### Requirement: El usuario puede consultar sus análisis anteriores

El sistema SHALL ofrecer al usuario la lista de los análisis de currículum que ha
realizado, ordenados del más reciente al más antiguo. Cada entrada SHALL indicar
cuándo se hizo, sobre qué archivo, el resultado de parseabilidad obtenido y si se
analizó contra una convocatoria.

El propósito de esta capacidad es que el usuario pueda comprobar si su currículum
mejoró después de corregirlo. Sin ella, cada análisis se pierde al recargar y el
ciclo de corregir y volver a medir queda incompleto.

#### Scenario: Hay análisis anteriores

- **WHEN** el usuario abre la pantalla de revisión y tiene análisis previos
- **THEN** se listan sus análisis con su fecha, archivo, parseabilidad y si llevaban convocatoria
- **AND** se presentan del más reciente al más antiguo

#### Scenario: No hay análisis anteriores

- **WHEN** el usuario abre la pantalla de revisión y no ha analizado nada todavía
- **THEN** no se muestra ninguna lista ni ningún aviso de lista vacía

#### Scenario: Un análisis nuevo se incorpora a la lista

- **WHEN** el usuario completa un análisis
- **THEN** ese análisis queda disponible en la lista de análisis anteriores

### Requirement: Un análisis anterior se puede volver a abrir

El sistema SHALL permitir al usuario abrir un análisis anterior y consultar su
resultado completo, presentado igual que un análisis recién hecho.

#### Scenario: Se abre un análisis anterior

- **WHEN** el usuario selecciona un análisis de su lista
- **THEN** se muestra el resultado completo de ese análisis
- **AND** se presenta con el mismo formato que un análisis recién realizado

#### Scenario: Se abre un análisis que se hizo contra una convocatoria

- **WHEN** el usuario abre un análisis anterior que tenía convocatoria
- **THEN** se muestran los requisitos de esa convocatoria con su evidencia
- **AND** no se muestra el inventario de términos en su lugar

### Requirement: La comparación entre análisis no se expresa como una mejora calculada

El sistema MUST NOT publicar una diferencia numérica entre dos análisis. Dos
análisis pueden haberse hecho contra convocatorias distintas, y una resta entre
resultados no comparables sería un número sin significado.

#### Scenario: Dos análisis del mismo currículum

- **WHEN** el usuario tiene dos análisis con resultados de parseabilidad distintos
- **THEN** cada uno muestra su propio resultado
- **AND** no se publica ninguna cifra que represente la diferencia entre ambos

### Requirement: El texto del currículum no sale hacia un proveedor externo

El currículum almacenado contiene datos personales de una persona real —nombre,
correo, teléfono y en ocasiones dirección—. El sistema MUST NOT enviar ese texto a
un proveedor de inteligencia artificial.

La restricción SHALL estar verificada de forma automática, no solo documentada:
hoy el texto no se envía porque no existe el código que lo haría, y eso es una
garantía por omisión que un cambio futuro puede romper sin que nadie lo note.

#### Scenario: Analizar un currículum no contacta a ningún proveedor

- **WHEN** el sistema analiza un currículum, con o sin convocatoria
- **THEN** no se invoca a ningún proveedor de inteligencia artificial

#### Scenario: Se introduce el acoplamiento

- **WHEN** alguien hace que el módulo de currículums dependa de la capa de inteligencia artificial
- **THEN** la verificación automática falla
- **AND** el fallo indica que el envío debe pasar antes por la anonimización de los datos personales
