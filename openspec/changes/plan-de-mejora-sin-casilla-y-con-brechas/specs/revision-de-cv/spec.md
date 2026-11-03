## Purpose

Diagnosticar por qué un currículum queda fuera de la búsqueda de un reclutador que usa un ATS, midiendo el documento regla por regla y sin publicar nunca un puntaje.

## ADDED Requirements

### Requirement: Los arreglos de formato no tienen casilla
Cada fila de «Arreglar el formato» SHALL mostrar la acción como título, el chip de su efecto, el detalle y, a la derecha, «AHORA» con el diagnóstico sobre «DESPUÉS» con el ejemplo cuando lo hay; en pantallas angostas las cajas SHALL bajar debajo del texto. La fila NO SHALL tener casilla «marcar como hecho» ni ningún control para marcarla, y el sistema NO SHALL guardar ni publicar qué arreglos se dieron por hechos. Cada fila SHALL seguir siendo el destino de su enlace desde «Formato» en el Resumen.

#### Scenario: Una corrección con ejemplo
- **WHEN** el usuario abre «Plan de Mejora» de un CV a dos columnas
- **THEN** la fila «Pásalo a una sola columna» muestra su chip, su detalle, «AHORA» y «DESPUÉS», sin casilla

#### Scenario: Enlace desde el Resumen
- **WHEN** el usuario activa un error de «Formato» en el Resumen
- **THEN** se abre «Plan de Mejora» y el foco va a la fila de esa corrección

#### Scenario: La API ya no ofrece marcar
- **WHEN** un cliente pide el detalle de un análisis
- **THEN** la respuesta no trae `arreglos_hechos` y no existe una ruta para marcar arreglos

### Requirement: Plan de Mejora dirigido incluye las palabras clave no detectadas
En un análisis con convocatoria y requisitos reconocidos, «Plan de Mejora» SHALL mostrar, debajo de «Arreglar el formato» y antes de las viñetas, la tarjeta «Palabras clave no detectadas» que define `vista-dirigida-resumen-match-y-plan`, con dos caminos por requisito ausente. Esa tarjeta reemplaza a «Cubrir lo que pide la oferta», que se agregó en este cambio y se quitó en aquel. En un análisis general, o sin requisitos reconocidos, la tarjeta NO SHALL mostrarse.

#### Scenario: Análisis general
- **WHEN** el análisis no tiene convocatoria
- **THEN** «Plan de Mejora» no muestra «Palabras clave no detectadas»

### Requirement: Match con la Oferta no repite cómo cubrir lo que falta
«Match con la Oferta» NO SHALL mostrar el plegable «Cómo cubrir lo que te falta»: las sugerencias por término viven solo en «Plan de Mejora». Las sugerencias de IA para la experiencia y el cargo SHALL seguir junto a su fila en «Match con la Oferta».

#### Scenario: Pestaña Match
- **WHEN** el usuario abre «Match con la Oferta» con requisitos sin demostrar
- **THEN** ve las palabras clave con sus estados, pero no el plegable «Cómo cubrir lo que te falta»
