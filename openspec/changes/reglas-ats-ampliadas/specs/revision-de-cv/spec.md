## Purpose

Diagnosticar por qué un currículum queda fuera de la búsqueda de un reclutador
que usa un ATS, midiendo el documento regla por regla y sin publicar nunca un
puntaje.

## ADDED Requirements

### Requirement: La antigüedad se informa como experiencia calculada

El sistema SHALL calcular la experiencia laboral a partir de los periodos con
fecha de inicio y fin de la sección de experiencia, y SHALL mostrarla en la
ficha del ATS en años y meses. Los periodos que se solapan MUST contarse una sola
vez. Los periodos de otras secciones (por ejemplo, educación) MUST NOT sumarse.
Cuando algún periodo solo indique años, el resultado SHALL marcarse como
aproximado.

#### Scenario: Dos empleos simultáneos

- **WHEN** el CV tiene "Ene 2020 – Dic 2021" y "Jun 2021 – Dic 2022" en experiencia
- **THEN** la antigüedad es de 3 años, no de 3 años y 6 meses

#### Scenario: Empleo en curso

- **WHEN** un periodo termina en "Actualidad"
- **THEN** se cuenta hasta la fecha del análisis

#### Scenario: Educación no suma

- **WHEN** la sección de educación contiene "2015 – 2019"
- **THEN** esos años no forman parte de la antigüedad

#### Scenario: Solo años

- **WHEN** un periodo de experiencia se escribe "2020 – 2022"
- **THEN** la antigüedad se muestra marcada como aproximada

#### Scenario: Sin periodos

- **WHEN** no hay ningún periodo con inicio y fin
- **THEN** el campo no se detecta y se informa que el ATS no puede calcular la experiencia

### Requirement: La convocatoria se compara en años de experiencia

Cuando la convocatoria exija un mínimo de años de experiencia, el mapa de
evidencia SHALL mostrar los años pedidos, la experiencia calculada y uno de tres
estados: `cumple`, `no_alcanza` o `no_calculable`. El sistema MUST NOT sugerir
modificar fechas o experiencia para alcanzar el mínimo. Si el cálculo puede estar
subestimado por fechas mezcladas o solo con año, SHALL decirlo.

#### Scenario: Experiencia suficiente

- **WHEN** la convocatoria pide "mínimo 2 años" y el CV evidencia 3 años
- **THEN** el requisito de experiencia aparece como `cumple`

#### Scenario: Experiencia insuficiente

- **WHEN** la convocatoria pide "3+ años" y el CV evidencia 1 año y 8 meses
- **THEN** el requisito aparece como `no_alcanza` con ambas cifras

#### Scenario: Número escrito con letras

- **WHEN** la convocatoria dice "al menos tres años de experiencia"
- **THEN** se reconoce un mínimo de 3 años

#### Scenario: No calculable

- **WHEN** la convocatoria pide años y el CV no tiene periodos legibles
- **THEN** el requisito aparece como `no_calculable`

#### Scenario: La convocatoria no pide años

- **WHEN** la convocatoria no menciona años de experiencia
- **THEN** el mapa de evidencia no muestra requisito de experiencia

### Requirement: El cargo de la convocatoria se busca en el CV

Cuando la convocatoria nombre un cargo reconocible (por ejemplo, "Desarrollador
Backend"), el mapa de evidencia SHALL indicar si el CV lo evidencia, con los
mismos estados que los demás requisitos. Si no nombra ninguno reconocible, el
requisito MUST NOT aparecer.

#### Scenario: Cargo presente

- **WHEN** la convocatoria busca un "Backend Developer" y el CV dice "Desarrollador Backend" en su experiencia
- **THEN** el cargo aparece como demostrado

#### Scenario: Cargo ausente

- **WHEN** la convocatoria busca un "Desarrollador Frontend" y el CV no lo menciona
- **THEN** el cargo aparece como ausente

### Requirement: La ficha incluye la ubicación

La ficha del ATS SHALL incluir el campo Ubicación, detectado cuando el
encabezado del CV nombra una ciudad, departamento o país reconocible, o la
modalidad remota. Si falta, SHALL informarse como debilidad de severidad media,
explicando que los reclutadores filtran por ubicación.

#### Scenario: Ciudad en el encabezado

- **WHEN** el encabezado incluye "Cochabamba, Bolivia"
- **THEN** el campo Ubicación se detecta con ese valor

#### Scenario: Sin ubicación

- **WHEN** el encabezado no nombra ningún lugar
- **THEN** el campo no se detecta y aparece la debilidad correspondiente

#### Scenario: La parseabilidad cuenta ocho campos

- **WHEN** se analiza un CV con todos los campos legibles
- **THEN** la parseabilidad es "8/8"

### Requirement: Se avisa cuando un término aparece solo como sigla o solo con su nombre largo

Para los términos con sigla y nombre largo que los reclutadores buscan de ambas
formas, el sistema SHALL avisar cuando el CV solo usa una. El aviso SHALL agrupar
todos los términos afectados en un único hallazgo informativo.

#### Scenario: Solo la sigla

- **WHEN** el CV dice "AWS" y nunca "Amazon Web Services"
- **THEN** un hallazgo sugiere escribir ambas formas e incluye AWS

#### Scenario: Ambas formas

- **WHEN** el CV dice "Amazon Web Services (AWS)"
- **THEN** no se avisa sobre ese término

### Requirement: Se informa del texto que el ATS no lee

El sistema SHALL detectar el texto ubicado en cuadros de texto y en el
encabezado o pie de página, que muchos ATS no extraen, y SHALL informarlo como
debilidad. Ese texto MUST NOT incluirse en la ficha del ATS. Si el correo o el
teléfono solo aparecen ahí, el hallazgo SHALL ser crítico, SHALL reemplazar al
aviso genérico de dato no detectado y la ficha SHALL explicar dónde estaba.

En PDF, el encabezado o pie solo SHALL detectarse cuando el documento tiene dos o
más páginas y el mismo texto se repite en la franja superior o inferior de cada
una; en un PDF de una página no se informa.

#### Scenario: Correo en el encabezado de un DOCX

- **WHEN** un DOCX tiene el correo solo en el encabezado de página
- **THEN** el campo Correo no se detecta, su nota dice que está en el encabezado
- **AND** aparece un único hallazgo crítico sobre ello

#### Scenario: Cuadro de texto en un DOCX

- **WHEN** un DOCX tiene su sección de habilidades dentro de un cuadro de texto
- **THEN** aparece una debilidad de severidad alta sobre texto en cuadros

#### Scenario: Pie repetido en un PDF de dos páginas

- **WHEN** un PDF de dos páginas repite la misma línea al pie de cada una
- **THEN** aparece una debilidad sobre texto en encabezado o pie

### Requirement: Se informa del texto oculto

En un PDF, el sistema SHALL detectar texto blanco o de tamaño menor a 4 puntos
y, si suma al menos 20 caracteres, SHALL informarlo como debilidad de severidad
alta. El texto blanco sobre un fondo de color MUST NOT contarse como oculto.

#### Scenario: Texto blanco sobre fondo blanco

- **WHEN** un PDF contiene una lista de tecnologías en letra blanca
- **THEN** aparece la debilidad de texto oculto

#### Scenario: Texto blanco sobre una banda de color

- **WHEN** un PDF tiene su nombre en blanco sobre una cabecera azul
- **THEN** no aparece la debilidad de texto oculto

### Requirement: Se avisa si el CV y la convocatoria están en idiomas distintos

Cuando ambos documentos tengan un idioma reconocible con claridad y sean
distintos, el sistema SHALL informarlo como debilidad, explicando que la
búsqueda por palabras clave falla fuera de los nombres de tecnologías. Si el
idioma de alguno es ambiguo, MUST NOT avisar.

#### Scenario: CV en español, convocatoria en inglés

- **WHEN** el CV está en español y la convocatoria en inglés
- **THEN** aparece la debilidad de idioma distinto

#### Scenario: Mismo idioma

- **WHEN** ambos están en español
- **THEN** no aparece la debilidad

### Requirement: Un análisis con reglas anteriores se recalcula

Cuando el usuario vuelva a subir un CV ya analizado contra la misma
convocatoria, y ese análisis se hizo con una versión de reglas anterior, el
sistema SHALL recalcularlo y reemplazar el resultado guardado, sin crear un
segundo registro. Si el análisis es de la versión vigente, SHALL devolverse sin
recalcular. Dos CV que difieren solo en el texto de cuadros o de encabezado/pie
MUST tratarse como documentos distintos.

#### Scenario: Análisis de una versión anterior

- **WHEN** se sube un CV cuyo análisis guardado es de una versión anterior de las reglas
- **THEN** la respuesta trae el análisis con las reglas vigentes
- **AND** el historial sigue teniendo una sola entrada para ese CV y convocatoria

#### Scenario: Análisis vigente

- **WHEN** se sube un CV ya analizado con las reglas vigentes
- **THEN** se devuelve el análisis guardado sin repetir el trabajo

#### Scenario: Solo cambia el encabezado

- **WHEN** se suben dos DOCX idénticos salvo por el texto del encabezado
- **THEN** cada uno tiene su propio análisis
