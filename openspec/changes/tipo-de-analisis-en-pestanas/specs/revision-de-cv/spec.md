## Purpose

Diagnosticar por qué un currículum queda fuera de la búsqueda de un reclutador que usa un ATS, midiendo el documento regla por regla y sin publicar nunca un puntaje.

## ADDED Requirements

### Requirement: El tipo de análisis se elige con dos pestañas
La entrada de «Revisar mi CV» SHALL ofrecer el tipo de análisis como dos pestañas, «Análisis general» y «Análisis dirigido», con el mismo componente y patrón que «Nueva entrevista». El patrón es ARIA *tabs*:
- solo la pestaña elegida está en el orden de Tab;
- las flechas, Inicio y Fin cambian de pestaña;
- la activación es automática.

Al entrar a `/mi-cv` SHALL estar elegida «Análisis general». En pantallas de menos de 640 px, las dos pestañas SHALL repartirse el ancho en partes iguales.

#### Scenario: Entrada
- **WHEN** el usuario abre `/mi-cv`
- **THEN** ve las pestañas «Análisis general» y «Análisis dirigido», con la primera elegida

#### Scenario: Teclado
- **WHEN** el foco está en «Análisis general» y el usuario pulsa la flecha derecha
- **THEN** queda elegida «Análisis dirigido» y su panel se muestra

### Requirement: El panel de cada pestaña
El panel de la pestaña elegida SHALL empezar directamente con «Tu CV» (sin una pregunta encima: la quitó `entrada-del-cv-que-revisamos`), que desde 1024 px ocupa la parte izquierda en las dos pestañas (2/3, ver `entrada-del-cv-dos-tercios`). Solo en el dirigido, «Convocatoria» SHALL ocupar la parte derecha (1/3), con la misma altura; en el general ese lugar es de «¿Qué revisamos?» (`entrada-del-cv-que-revisamos`). Después SHALL venir «Analizar CV».

Cambiar de pestaña NO SHALL perder el CV elegido ni el texto o archivo de la convocatoria. En el general, la convocatoria NO SHALL enviarse.

#### Scenario: Dirigido
- **WHEN** el usuario elige «Análisis dirigido»
- **THEN** el panel muestra «Tu CV» a la izquierda y «Convocatoria» a la derecha

#### Scenario: Volver a general
- **WHEN** el usuario pegó una convocatoria y vuelve a «Análisis general»
- **THEN** el CV sigue elegido, la convocatoria no se muestra y, al volver a «dirigido», el texto pegado sigue ahí

### Requirement: El historial queda fuera de las pestañas
El «Historial de análisis» SHALL mostrarse debajo de las pestañas y de su panel, igual en las dos pestañas y con todos los análisis, generales y dirigidos.

#### Scenario: Mismo historial
- **WHEN** el usuario cambia de pestaña
- **THEN** el historial no cambia
