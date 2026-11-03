## Purpose

Diagnosticar por qué un currículum queda fuera de la búsqueda de un reclutador que usa un ATS, midiendo el documento regla por regla y sin publicar nunca un puntaje.

## ADDED Requirements

### Requirement: La entrada muestra las dos rutas como tipos de análisis
La pantalla de entrada SHALL distinguir las dos rutas como dos tipos de análisis que el usuario elige: «Análisis general» (solo el CV) y «Análisis dirigido» (el CV frente a una convocatoria). La zona «Convocatoria» SHALL decir qué se obtiene al darla. Solo SHALL enviarse la convocatoria en el análisis dirigido, y de ella solo la vía que esté a la vista. La elección, el botón y el orden de la entrada los define `tipo-de-analisis-e-historial-en-tabla`.

#### Scenario: Solo el CV
- **WHEN** el usuario elige «Análisis general» y su CV
- **THEN** el análisis se hace sin convocatoria

#### Scenario: CV y convocatoria
- **WHEN** el usuario elige «Análisis dirigido», su CV y pega el texto de un aviso
- **THEN** el análisis incluye la convocatoria

### Requirement: Del resultado sin convocatoria se llega a comparar en un paso
El resultado de un análisis sin convocatoria SHALL ofrecer «Compara con una convocatoria». Esa acción SHALL:
- volver a la entrada;
- conservar el CV elegido;
- marcar «Análisis dirigido»;
- llevar el foco a la zona de la convocatoria.

#### Scenario: Atajo a la comparación
- **WHEN** el usuario pulsa «Compara con una convocatoria» en un resultado sin aviso
- **THEN** ve la entrada con su CV todavía elegido y el foco en el campo de la convocatoria

### Requirement: El resultado da un estado del CV en palabras
El Resumen SHALL mostrar el estado del CV en palabras, nunca con un número sobre 100. Sus niveles, su regla (por datos clave) y su forma los define `estado-del-cv-por-datos-clave`: «Pérdidas importantes», «Legible con pérdidas» y «Legible». SHALL distinguirse por ícono y texto, no solo por color.

#### Scenario: Correo en el encabezado
- **WHEN** el correo solo está en el encabezado de página
- **THEN** el correo no se extrae y el estado es «Pérdidas importantes»

### Requirement: Sin convocatoria, el Resumen dice por qué tecnologías encontrarían al candidato
En un análisis sin convocatoria, el Resumen SHALL mostrar «Tecnologías por las que te encontrarían», con los términos del inventario. Si el inventario está vacío, SHALL decir que no se encontraron tecnologías legibles y sugerir que pueden estar en barras o imágenes.

#### Scenario: Inventario vacío
- **WHEN** el CV tiene las habilidades en barras gráficas y el inventario sale vacío
- **THEN** la tarjeta dice que no se encontraron tecnologías legibles y menciona las barras o imágenes

### Requirement: Con convocatoria, «Match con la Oferta» muestra el match
En un análisis con convocatoria y requisitos reconocidos, el match SHALL vivir en la pestaña «Match con la Oferta», con la forma que define `vista-dirigida-resumen-match-y-plan` (la búsqueda del reclutador, «aparecerías / no aparecerías», se quitó en ese cambio):
1. **Las palabras clave del aviso como chips,** en «Coinciden» o en «No detectados en tu CV», con los obligatorios primero.
   - Cada chip SHALL mostrar su estado con ícono, color y texto: demostrado, solo en habilidades (declarado), no está (ausente), o presente cuando no hubo secciones.
2. **La experiencia, el cargo y los filtros** cuando el aviso los pide, en «Requisitos del puesto».

Si la convocatoria no tenía requisitos reconocibles, SHALL mostrarse el aviso existente en lugar del bloque.

#### Scenario: Faltan obligatorias
- **WHEN** el aviso pide Django, PostgreSQL y Docker como obligatorias y el CV no menciona Docker
- **THEN** Docker aparece como chip «no está» en «No detectados en tu CV»

#### Scenario: Alguna solo declarada
- **WHEN** Git está solo en la lista de habilidades
- **THEN** Git aparece en «Coinciden» con la nota de que solo está en tu lista de habilidades

#### Scenario: El color no es lo único
- **WHEN** un lector de pantalla recorre los chips
- **THEN** oye el término y su estado, por ejemplo «Docker, no está en tu CV»

### Requirement: Cada análisis nombra su tipo
La barra de contexto del resultado y cada fila del historial SHALL nombrar el tipo de análisis con el mismo texto:
- «Análisis general» sin convocatoria;
- «Análisis dirigido» con ella.

#### Scenario: Historial mixto
- **WHEN** el historial tiene un análisis con aviso y otro sin aviso
- **THEN** cada fila muestra su tipo con el mismo texto que verá en la barra del resultado
