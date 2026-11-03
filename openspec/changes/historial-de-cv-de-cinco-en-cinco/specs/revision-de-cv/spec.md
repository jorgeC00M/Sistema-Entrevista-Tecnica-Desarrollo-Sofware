## Purpose

Diagnosticar por qué un currículum queda fuera de la búsqueda de un reclutador que usa un ATS, midiendo el documento regla por regla y sin publicar nunca un puntaje.

## ADDED Requirements

### Requirement: El historial de análisis se pagina de a 5
La tabla «Historial de análisis» de «Revisar mi CV» SHALL mostrar como máximo 5 análisis por página. La paginación SHALL comportarse igual que en «Historial y progreso»:
- flechas ‹ › y hasta tres números de página;
- la página actual en `?pagina=`;
- el foco en la tabla al cambiar de página;
- oculta cuando hay una sola página.

#### Scenario: Seis análisis
- **WHEN** el usuario tiene 6 análisis
- **THEN** la tabla muestra los 5 más recientes y la paginación ofrece la página 2 con el sexto

#### Scenario: Cinco análisis
- **WHEN** el usuario tiene 5 análisis o menos
- **THEN** la tabla los muestra todos y no se muestra paginación

#### Scenario: Recargar en la página 2
- **WHEN** el usuario está en la página 2 y recarga `/mi-cv?pagina=2`
- **THEN** sigue viendo la página 2
