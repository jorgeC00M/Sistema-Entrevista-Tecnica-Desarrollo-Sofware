## Purpose

Diagnosticar por qué un currículum queda fuera de la búsqueda de un reclutador que usa un ATS, midiendo el documento regla por regla y sin publicar nunca un puntaje.

## ADDED Requirements

### Requirement: La pantalla del CV no repite su título bajo el encabezado
La pantalla «Revisar mi CV» NO SHALL mostrar un título visible ni un párrafo de introducción entre el encabezado fijo y su contenido, ni en la entrada ni en un análisis.

SHALL conservar un único título principal de página, «Revisar mi CV», accesible para lectores de pantalla y oculto a la vista. El encabezado fijo SHALL seguir mostrando la sección y su subtítulo, como en las demás pantallas.

#### Scenario: Entrada
- **WHEN** el usuario abre `/mi-cv`
- **THEN** lo primero bajo el encabezado es «Tipo de análisis», sin título ni párrafo encima

#### Scenario: Resultado
- **WHEN** el usuario abre `/mi-cv/:id`
- **THEN** lo primero bajo el encabezado es la barra de contexto del análisis

#### Scenario: Lector de pantalla
- **WHEN** un lector de pantalla recorre los títulos de `/mi-cv`
- **THEN** encuentra un único título principal, «Revisar mi CV»

### Requirement: La entrada no repite qué es un ATS
La entrada de «Revisar mi CV» NO SHALL mostrar una explicación de qué es un ATS, ni visible ni en un desplegable: el subtítulo del encabezado («Qué lee un ATS de tu currículum») es la única mención. El desplegable «¿Qué es un ATS?» se retiró por decisión del usuario en `tipo-de-analisis-en-combo`.

#### Scenario: Entrada
- **WHEN** el usuario abre `/mi-cv`
- **THEN** bajo el combo «Tipo de análisis» no hay explicación del ATS
