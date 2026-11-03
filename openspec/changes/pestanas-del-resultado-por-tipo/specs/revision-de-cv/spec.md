## Purpose

Diagnosticar por qué un currículum queda fuera de la búsqueda de un reclutador que usa un ATS, midiendo el documento regla por regla y sin publicar nunca un puntaje.

## ADDED Requirements

### Requirement: Las pestañas del resultado dependen del tipo de análisis
El resultado de un CV legible SHALL mostrar sus pestañas según el tipo:
- **Análisis general:** «Resumen y Formato» y «Plan de Mejora».
- **Análisis dirigido:** «Resumen», «Match con la Oferta» y «Plan de Mejora».

Un análisis recién abierto SHALL empezar en la primera pestaña. En pantallas de menos de 640 px, las pestañas SHALL repartirse el ancho en partes iguales, y un nombre largo MAY partirse en dos líneas. Un CV ilegible NO SHALL tener pestañas.

#### Scenario: General
- **WHEN** el usuario abre un análisis general
- **THEN** ve las pestañas «Resumen y Formato» y «Plan de Mejora», con la primera elegida

#### Scenario: Dirigido
- **WHEN** el usuario abre un análisis dirigido
- **THEN** ve las pestañas «Resumen», «Match con la Oferta» y «Plan de Mejora», con la primera elegida

### Requirement: El Resumen del dirigido muestra los requisitos en el banner
En el análisis dirigido, el Resumen SHALL ser el que define `vista-dirigida-resumen-match-y-plan`: el banner del estado con «Formato» y «Requisitos de la oferta» lado a lado, el espejo a ancho completo y la práctica. NO SHALL abrir con la frase de búsqueda ni con «Ver el match» (se quitaron en ese cambio).

#### Scenario: Aviso sin requisitos reconocidos
- **WHEN** la convocatoria no tiene requisitos reconocidos
- **THEN** el banner del Resumen no muestra «Requisitos de la oferta» y «Match con la Oferta» explica que no se reconocieron requisitos

### Requirement: «Match con la Oferta» reúne todo lo del aviso
La pestaña «Match con la Oferta» SHALL contener, una sola vez y en este orden (ver `vista-dirigida-resumen-match-y-plan`):
- las columnas «Coinciden» y «No detectados en tu CV», con los obligatorios primero;
- la «Lectura general» de la IA;
- «Requisitos del puesto»: la experiencia, el cargo, los filtros y el aviso de evidencia sin secciones reconocidas, cuando aplique.

NO SHALL mostrar la frase de búsqueda ni «Tienes pero no te lo piden». Cómo cubrir cada término que no se detectó vive en «Plan de Mejora».

#### Scenario: Detalle del aviso
- **WHEN** el usuario abre «Match con la Oferta»
- **THEN** ve las dos columnas, la lectura general y los requisitos del puesto

### Requirement: «Plan de Mejora» conserva las correcciones
La pestaña «Plan de Mejora» SHALL contener las correcciones del ATS (como lista de arreglos, ver `plan-de-mejora-como-lista-de-arreglos`), las viñetas y la redacción, sin conteo ni puntaje. El estado del CV SHALL llevar a ella con «Ver el plan de mejora» y con cada error de «Formato» enlazado a su corrección.

#### Scenario: Ir a una corrección
- **WHEN** el usuario pulsa un error del bloque «Formato»
- **THEN** se abre «Plan de Mejora» con el foco en esa corrección
