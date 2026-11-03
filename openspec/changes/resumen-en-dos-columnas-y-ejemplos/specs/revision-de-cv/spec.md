## ADDED Requirements

### Requirement: El Resumen es una sola columna
El Resumen SHALL mostrarse en una sola columna a ancho completo (por decisión del usuario, ver `estado-del-cv-por-datos-clave`) (línea de match en el dirigido, estado del CV, espejo, tecnologías en el general y práctica), sin «Lo que debes hacer» ni «Consérvalo al corregir». Las correcciones se alcanzan desde los errores del bloque «Formato» del estado.

#### Scenario: Resumen
- **WHEN** el usuario abre el Resumen
- **THEN** no hay columna lateral



### Requirement: Las fortalezas no se muestran en la pantalla
Las fortalezas SHALL seguir midiéndose y publicándose en el API, pero NO SHALL mostrarse en la pantalla: «Lo que ya funciona» se retiró de «Plan de Mejora» por decisión del usuario (ver `plan-de-mejora-como-lista-de-arreglos`).

#### Scenario: Plan de Mejora
- **WHEN** el usuario abre «Plan de Mejora»
- **THEN** no aparece «Lo que ya funciona»

### Requirement: Cada corrección muestra un ejemplo de cómo debe quedar
Una debilidad cuya corrección se pueda mostrar con texto SHALL publicar un **ejemplo**, fijo para su regla, que no copia datos del CV del usuario ni viene de la IA.

En «Plan de Mejora», el ejemplo SHALL aparecer en la caja «DESPUÉS» de su arreglo (ver `plan-de-mejora-como-lista-de-arreglos`) y MUST NOT llevar el rótulo de sugerencia de IA. Las fortalezas MUST NOT tener ejemplo.

**El ejemplo MUST pasar las reglas del propio módulo.** Por ejemplo:
- las fechas del ejemplo se leen con un solo formato;
- los títulos de sección del ejemplo se reconocen;
- el correo, el teléfono y la ubicación del ejemplo se detectan;
- el ejemplo de siglas no provoca la corrección de siglas.

Las debilidades sin ejemplo (por ejemplo, las imágenes o el texto oculto) SHALL omitir la caja «DESPUÉS».

#### Scenario: Fechas mezcladas
- **WHEN** el análisis encuentra formatos de fecha mezclados
- **THEN** la corrección «Usa un solo formato de fecha» muestra en «DESPUÉS» fechas escritas como «Mes Año» en un solo formato

#### Scenario: El ejemplo no contradice al módulo
- **WHEN** se analiza el ejemplo de una regla con los mismos detectores del módulo
- **THEN** esa regla no lo marca como error

#### Scenario: Análisis anterior a los ejemplos
- **WHEN** se abre desde el historial un análisis guardado con reglas de versión 6
- **THEN** sus correcciones se muestran sin la caja «DESPUÉS» y la pantalla no falla

#### Scenario: Volver a subir el CV
- **WHEN** se vuelve a subir un CV cuyo análisis guardado tiene reglas de versión 6
- **THEN** el análisis se recalcula y sus correcciones traen el ejemplo
