## ADDED Requirements

### Requirement: Cada corrección dice qué hacer, qué se encontró y por qué
Cada debilidad medida SHALL publicar tres textos:
- una **acción** en imperativo, por ejemplo «Pásalo a una sola columna»;
- el **diagnóstico**, por ejemplo «Tu CV está maquetado a dos columnas»;
- un **detalle** en lenguaje llano, que explica qué le pasa al CV dentro del ATS y cómo corregirlo. El detalle MUST NOT usar jerga técnica como «parser».

En «Plan de Mejora», cada corrección SHALL mostrar la acción como título, con el chip de su efecto, el detalle y el diagnóstico; su forma («AHORA» con el diagnóstico y «DESPUÉS» con el ejemplo) la define `plan-de-mejora-como-lista-de-arreglos`, sin casilla desde `plan-de-mejora-sin-casilla-y-con-brechas`. Las fortalezas MUST NOT tener acción.

Un análisis guardado con reglas anteriores, que no trae acción, SHALL mostrar su diagnóstico como título.

#### Scenario: CV a dos columnas
- **WHEN** el análisis detecta un CV a dos columnas
- **THEN** «Plan de Mejora» muestra:
  - el título «Pásalo a una sola columna»;
  - «AHORA: Tu CV está maquetado a dos columnas»;
  - una explicación de que el ATS mezcla las columnas y de cómo pasarlo a una sola.

#### Scenario: Análisis anterior a las acciones
- **WHEN** se abre desde el historial un análisis guardado con reglas de versión 5
- **THEN** cada corrección muestra su diagnóstico como título y la pantalla no falla

#### Scenario: Volver a subir un CV analizado con reglas anteriores
- **WHEN** se vuelve a subir un CV cuyo análisis guardado tiene una versión de reglas anterior
- **THEN** el análisis se recalcula y sus correcciones traen acción

### Requirement: El resultado no tiene pestañas de Tecnologías, Requisitos ni Entrevista
El resultado de un CV legible NO SHALL tener pestañas de Tecnologías, Requisitos ni Entrevista. Qué pestañas tiene según el tipo de análisis lo define `pestanas-del-resultado-por-tipo`: «Resumen y Formato» y «Plan de Mejora» en el general; «Resumen», «Match con la Oferta» y «Plan de Mejora» en el dirigido.

#### Scenario: Sin convocatoria
- **WHEN** el usuario analiza solo su CV
- **THEN** las tecnologías legibles están en «Resumen y Formato»

#### Scenario: Con convocatoria
- **WHEN** el usuario analiza su CV con una convocatoria
- **THEN** el detalle de los requisitos está en «Match con la Oferta»

### Requirement: «Match con la Oferta» contiene el detalle de los requisitos
Con una convocatoria y requisitos reconocidos, el detalle de los requisitos SHALL estar en «Match con la Oferta», con la forma que define `vista-dirigida-resumen-match-y-plan` (la tarjeta «Frente a este aviso» se dividió allí en las dos columnas, la lectura general y «Requisitos del puesto»):
- cada requisito con su estado, de solo lectura: el estado se lee en el chip y no lleva a otra vista;
- un aviso cuando no se pudo precisar dónde se evidencia cada requisito;
- experiencia, cargo y filtros, cada uno una sola vez y con su sugerencia de IA si la hay.

Las sugerencias de la IA por término no detectado SHALL ir en «Plan de Mejora», en «Palabras clave no detectadas», rotuladas como sugerencia de IA y separadas de lo medido; «Match con la Oferta» NO SHALL repetirlas.

#### Scenario: Sugerencias de IA disponibles
- **WHEN** la revisión de IA trae los dos caminos para Docker, que no se detectó
- **THEN** «Palabras clave no detectadas», en «Plan de Mejora», muestra Docker con sus dos cajas rotuladas «Sugerencia de IA»

#### Scenario: Sin sugerencias todavía
- **WHEN** la revisión de IA aún no llegó
- **THEN** «Match con la Oferta» muestra lo medido completo y el aviso de la pestaña dice que las sugerencias se están pidiendo

### Requirement: La práctica de la entrevista cierra el Resumen
El Resumen SHALL terminar con el botón «Practicar la entrevista», siempre visible y con el puesto sugerido preseleccionado cuando lo hay. El desplegable «Preguntas que podrían hacerte» se retiró por decisión del usuario (ver `sin-preguntas-probables-en-el-resumen`): el Resumen NO SHALL mostrar preguntas probables.

#### Scenario: Con preguntas en la revisión
- **WHEN** la revisión de IA trae preguntas probables
- **THEN** el Resumen termina con el botón y no las muestra

### Requirement: El sistema no expone el texto extraído del CV
La API MUST NOT ofrecer un endpoint que devuelva el texto extraído de un currículum, y la pantalla MUST NOT mostrarlo. Lo que el ATS no lee se explica en el detalle de cada corrección.

#### Scenario: Ruta eliminada
- **WHEN** un cliente pide `GET /api/curriculums/<id>/texto/`
- **THEN** recibe 404
