## Purpose

Diagnosticar por qué un currículum queda fuera de la búsqueda de un reclutador que usa un ATS, midiendo el documento regla por regla y sin publicar nunca un puntaje.

## ADDED Requirements

### Requirement: Cada dato de la ficha tiene uno de tres estados medidos
Cada uno de los 8 datos de la ficha SHALL quedar en uno de tres estados: extraído, incompleto o no extraído. Un dato SHALL marcarse incompleto solo cuando se extrajo y un hallazgo ya medido lo afecta:
- **Experiencia,** si las fechas mezclan formatos;
- **Experiencia, Educación y Habilidades,** si el CV está maquetado a dos columnas.

«Habilidades dentro de gráficos» NO marca un dato incompleto: ese hallazgo solo existe cuando las habilidades no se extrajeron, así que el dato ya es «no extraído».

Un dato incompleto SHALL llevar una nota que diga por qué. NO SHALL agregarse ninguna detección nueva para decidirlo. Un cambio en esta regla SHALL subir la versión de reglas, para que los análisis guardados se recalculen al volver a subir el CV. Los análisis anteriores, que no traen el estado incompleto, SHALL publicarse con sus datos como extraídos o no extraídos.

#### Scenario: Dos columnas
- **WHEN** un CV a dos columnas tiene detectadas la experiencia, la educación y las habilidades
- **THEN** esos tres datos quedan incompletos, cada uno con su nota

#### Scenario: Análisis viejo
- **WHEN** se abre un análisis guardado con la versión de reglas anterior
- **THEN** sus datos se muestran como extraídos o no extraídos, sin error

### Requirement: El estado del CV se deriva de los datos clave
Los datos clave SHALL ser el contacto (Nombre, Correo y Teléfono), la Experiencia y las Habilidades. El estado del CV SHALL calcularlo una función, con la misma regla en el backend y en el frontend:
- **Pérdidas importantes:** al menos un dato clave no se extrajo.
- **Legible con pérdidas:** se extrajeron todos los datos clave, pero al menos un dato quedó incompleto o falta un dato que no es clave.
- **Legible:** los 8 datos se extrajeron completos.

El estado NO SHALL escribirse a mano ni mostrarse como número o porcentaje. El historial («Estado del CV») y el Resumen SHALL mostrar el mismo estado para el mismo análisis.

#### Scenario: Sin correo
- **WHEN** el análisis no extrae el correo
- **THEN** el estado es «Pérdidas importantes»

#### Scenario: Solo falta la ubicación
- **WHEN** se extraen todos los datos clave completos y falta la ubicación
- **THEN** el estado es «Legible con pérdidas»

#### Scenario: CV escaneado
- **WHEN** el PDF no tiene capa de texto
- **THEN** el estado es «Pérdidas importantes» y el historial dice lo mismo

### Requirement: El banner muestra los datos en una dona de tres estados
El banner del Resumen SHALL tener, a la izquierda, una dona con los datos extraídos (color de éxito), incompletos (color de progreso) y no extraídos (color de error). En el centro SHALL ir el total («8 datos revisados»), NUNCA una fracción. Debajo SHALL ir una leyenda en texto con la cantidad de cada estado, y para el lector de pantalla una frase con el total y las tres cantidades.

#### Scenario: CV a dos columnas
- **WHEN** el análisis tiene 5 datos extraídos, 3 incompletos y ninguno sin extraer
- **THEN** la dona muestra esos tres tramos y la leyenda dice «5 extraídos», «3 incompletos» y «0 no extraídos»

### Requirement: El banner explica el estado y lleva a corregir
A la derecha de la dona, el banner SHALL mostrar:
- la etiqueta del estado con su icono;
- el título;
- la regla que activó el estado;
- un bloque «Formato» con las correcciones más graves, cada una con el icono de su severidad y su diagnóstico, y como enlace que abre esa corrección en «Plan de Mejora»;
- debajo, «Ver el plan de mejora».

Sin errores, «Formato» SHALL decir que no hay errores que le impidan leer el CV.

#### Scenario: Ir a una corrección
- **WHEN** el usuario pulsa un error del bloque «Formato»
- **THEN** se abre «Plan de Mejora» con el foco en esa corrección

### Requirement: El Resumen es una sola columna
El Resumen, tanto «Resumen y Formato» como el «Resumen» del dirigido, SHALL mostrarse en una sola columna a ancho completo, en este orden:
1. la línea de match (solo en el dirigido);
2. el banner;
3. el espejo del ATS, que muestra también el estado incompleto con su nota;
4. «Tecnologías por las que te encontrarían» (solo en el general; desde 1024 px, a la derecha del espejo en 1/3 de la fila, ver `espejo-y-tecnologias-en-fila`);
5. la práctica de la entrevista.

El Resumen NO SHALL mostrar «Lo que debes hacer» ni «Consérvalo al corregir».

#### Scenario: Resumen general
- **WHEN** el usuario abre «Resumen y Formato»
- **THEN** ve el banner, el espejo con las tecnologías a su lado y la práctica, sin «Lo que debes hacer» ni «Consérvalo al corregir»

### Requirement: Plan de Mejora abre con los arreglos de formato
La pestaña «Plan de Mejora» SHALL empezar con la tarjeta «Arreglar el formato», cuya forma define `plan-de-mejora-como-lista-de-arreglos`. «Lo que ya funciona» NO SHALL mostrarse.

#### Scenario: Plan de Mejora
- **WHEN** el usuario abre «Plan de Mejora»
- **THEN** lo primero es «Arreglar el formato»
