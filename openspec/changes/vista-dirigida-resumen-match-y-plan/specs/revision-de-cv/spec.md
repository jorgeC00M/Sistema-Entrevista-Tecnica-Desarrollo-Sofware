## Purpose

Diagnosticar por qué un currículum queda fuera de la búsqueda de un reclutador que usa un ATS, midiendo el documento regla por regla y sin publicar nunca un puntaje.

## ADDED Requirements

### Requirement: La barra del dirigido dice frente a qué oferta se compara
En un análisis con convocatoria, la barra del resultado SHALL mostrar, junto al nombre del archivo, «frente a <cargo>» cuando la convocatoria trae un cargo detectado, y «frente a la convocatoria» cuando no. NO SHALL mostrar una empresa ni ningún dato que el análisis no haya medido.

#### Scenario: Con cargo detectado
- **WHEN** la convocatoria pide «Desarrollador Backend» y el análisis lo detecta como cargo
- **THEN** la barra dice «frente a Desarrollador Backend»

#### Scenario: Sin cargo
- **WHEN** la convocatoria no tiene un cargo detectado
- **THEN** la barra dice «frente a la convocatoria»

### Requirement: El Resumen dirigido separa el formato de los requisitos
En el análisis dirigido, el Resumen SHALL mostrar:
- el banner del estado con la misma dona y el mismo estado que el análisis general;
- en el panel derecho, dos bloques lado a lado («Formato», igual que en el general, y «Requisitos de la oferta»), que en pantallas angostas SHALL apilarse;
- debajo, el espejo de lo que el ATS ve, a ancho completo;
- la práctica de la entrevista.

«Requisitos de la oferta» SHALL tener una fila por cada requisito ausente, obligatorios primero, con «No se detectó», el término en una etiqueta y «obligatorio» o «deseable» cuando el aviso los separa. Debajo SHALL llevar la nota «“No se detectó” indica que no está escrito en tu CV, no que no lo sepas.». Si no hay ausentes, dirá «Se detectaron todos los requisitos de la oferta».

La dona y el estado SHALL depender solo de los datos extraídos: los requisitos no detectados NO SHALL cambiarlos. El Resumen dirigido NO SHALL mostrar la tarjeta de tecnologías ni la franja de búsqueda del reclutador con «Ver el match».

#### Scenario: CV legible con requisitos sin detectar
- **WHEN** el CV tiene todos sus datos clave extraídos y el aviso pide Docker, que no aparece
- **THEN** el banner dice «Legible» y «Requisitos de la oferta» muestra «No se detectó [Docker] obligatorio» con su nota

#### Scenario: Sin franja ni tecnologías
- **WHEN** el usuario abre el Resumen de un análisis dirigido
- **THEN** no ve «Ver el match» ni «Tecnologías por las que te encontrarían»

### Requirement: Match con la Oferta en dos columnas
«Match con la Oferta» SHALL empezar con dos tarjetas lado a lado, que en pantallas angostas pasan a una sola columna:
- **«Coinciden»**, con el ícono de éxito: una fila por requisito que aparece en el CV, con el ícono de su estado (con evidencia, solo en la lista de habilidades, o presente sin secciones reconocidas), el término en una etiqueta, el tipo y una nota de dónde aparece;
- **«No detectados en tu CV»**, con el ícono de error: una fila por requisito ausente, con el término y el tipo, y al pie la nota «No detectado no significa que no lo domines: solo que no está escrito en tu CV.».

El título SHALL ser exactamente «No detectados en tu CV». En cada columna, los obligatorios SHALL ir antes que los deseables. El estado NUNCA SHALL comunicarse solo con el color.

#### Scenario: Orden y notas
- **WHEN** el aviso pide Django (obligatorio, demostrado), Git (deseable, solo en habilidades) y Docker (obligatorio, ausente)
- **THEN** «Coinciden» lista Django con «En tu experiencia o tus proyectos» y Git con «Solo en tu lista de habilidades…», y «No detectados en tu CV» lista Docker con su nota al pie

### Requirement: La lectura general resume sin juzgar la aptitud
Debajo de las dos columnas, a ancho completo, SHALL ir la tarjeta «Lectura general»:
- un párrafo generado por la IA que resume lo detectado en las dos columnas;
- la etiqueta visible «Generado por IA»;
- la nota al pie «Este texto solo resume lo detectado arriba. Puede contener errores y no evalúa si eres apto para el puesto.».

El sistema NO SHALL publicar una lectura que concluya si la persona es apta, idónea o calificada, que estime una probabilidad o que dé un porcentaje: esa lectura SHALL descartarse. Mientras se pide, la tarjeta SHALL decirlo. Si falló o se descartó, SHALL decir que la lectura no está disponible.

#### Scenario: Lectura válida
- **WHEN** la IA devuelve un párrafo que solo resume coincidencias y ausencias
- **THEN** la tarjeta lo muestra con «Generado por IA» y la nota al pie

#### Scenario: Lectura que juzga
- **WHEN** la IA devuelve «Eres apto para el puesto» o «Tienes un 80% de compatibilidad»
- **THEN** la lectura se descarta y la tarjeta dice que no está disponible

### Requirement: Match conserva los requisitos del puesto
Después de la lectura general, «Match con la Oferta» SHALL mostrar «Requisitos del puesto»: la experiencia exigida, el cargo y los filtros (título, idioma, ubicación), con su estado y su sugerencia de IA si la hay, y el aviso cuando no se reconocieron las secciones. NO SHALL mostrar la línea de búsqueda del reclutador ni «Tienes pero no te lo piden».

#### Scenario: Años de experiencia
- **WHEN** el aviso pide 3 años y el ATS calcula 1
- **THEN** «Requisitos del puesto» muestra la experiencia como no alcanzada

### Requirement: Plan de Mejora ofrece dos caminos por palabra no detectada
En el dirigido, «Plan de Mejora» SHALL mostrar «Arreglar el formato» (sin casilla) y, debajo, la tarjeta «Palabras clave no detectadas», con la frase «Dos caminos según tu caso. Agregar algo que no usaste se descubre en la entrevista técnica.».

La tarjeta SHALL tener una sección por cada requisito ausente, obligatorios primero, con el término en una etiqueta y su tipo. En los deseables SHALL aclarar que conviene priorizar primero los obligatorios. Cada sección SHALL tener dos cajas, lado a lado y apiladas en pantallas angostas:
- «Si ya lo usaste: muéstralo»: cómo escribirlo en un logro, con un ejemplo;
- «Si aún no: apréndelo»: cómo conseguir la experiencia (proyecto propio, curso, certificación).

Las dos cajas SHALL aparecer siempre: el sistema NUNCA SHALL ofrecer agregar una tecnología sin respaldo como única salida. El texto de la IA SHALL rotularse como sugerencia de IA. Sin él, cada caja SHALL mostrar una pauta fija sin rótulo de IA. Si no hay ausentes, la tarjeta SHALL decir «No hay palabras clave sin detectar». En el análisis general la tarjeta NO SHALL mostrarse.

#### Scenario: Con sugerencias de IA
- **WHEN** Docker es obligatorio y ausente, y la IA devolvió cómo mostrarlo, un ejemplo y cómo aprenderlo
- **THEN** la sección de Docker muestra las dos cajas con esos textos rotulados como sugerencia de IA

#### Scenario: Sin IA
- **WHEN** la revisión con IA está pendiente o falló
- **THEN** cada sección muestra las dos cajas con la pauta fija

#### Scenario: Deseable
- **WHEN** Redis es deseable y ausente
- **THEN** su sección aclara que conviene priorizar primero los obligatorios

### Requirement: Las revisiones anteriores se renuevan
La revisión con IA SHALL guardar su versión. Una revisión correcta de una versión anterior a la que trae la lectura y los dos caminos SHALL volver a pedirse al abrir el análisis, sin volver a subir el CV.

#### Scenario: Análisis viejo
- **WHEN** el usuario abre desde el historial un análisis dirigido cuya revisión es de la versión anterior
- **THEN** se pide de nuevo la revisión y, al llegar, aparecen la lectura y los dos caminos
