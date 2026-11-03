## ADDED Requirements

### Requirement: La introducción del ATS no ocupa el resultado
Mientras se ve un análisis (incluido el de un CV ilegible), o mientras se está cargando, la pantalla «Revisar mi CV» MUST NOT mostrar ninguna explicación de qué es un ATS: el veredicto y el espejo ya lo dicen. En la entrada tampoco hay explicación (ver `cv-sin-titulo-repetido`): solo el subtítulo del encabezado.

#### Scenario: Resultado de un análisis
- **WHEN** el usuario analiza su CV, o abre un análisis de su historial, y se muestra `/mi-cv/:id`
- **THEN** lo primero que ve es la barra de contexto y las pestañas, sin introducción del ATS

#### Scenario: Carga de un análisis por URL
- **WHEN** el usuario recarga `/mi-cv/:id` y el análisis aún se está cargando
- **THEN** no aparece ninguna introducción que luego desaparezca al terminar la carga

#### Scenario: Análisis no encontrado
- **WHEN** el usuario abre `/mi-cv/:id` con un id que no existe o no es suyo
- **THEN** se muestra la entrada con el aviso «No encontramos ese análisis»
