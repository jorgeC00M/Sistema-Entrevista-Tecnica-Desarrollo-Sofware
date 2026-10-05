## Purpose

Permite a un egresado saber por qué su currículum no pasa los filtros de un ATS,
mostrándole qué datos puede extraer un parser de su documento y, cuando aporta una
convocatoria concreta, dónde evidencia cada requisito que esa convocatoria pide.

## ADDED Requirements

### Requirement: El diagnóstico no exige nada más que el currículum

El sistema SHALL analizar un currículum sin requerir ninguna otra entrada. La
convocatoria MUST ser opcional, y el sistema MUST NOT exigir al usuario elegir un
puesto, un área ni ninguna otra clasificación previa.

#### Scenario: Solo el currículum

- **WHEN** el usuario sube su currículum sin aportar una convocatoria
- **THEN** se entrega el diagnóstico de parseabilidad
- **AND** se entrega el inventario de términos técnicos legibles del currículum
- **AND** no se muestra ninguna sección de requisitos

#### Scenario: Currículum y convocatoria

- **WHEN** el usuario sube su currículum y aporta una convocatoria
- **THEN** se entrega el diagnóstico de parseabilidad
- **AND** en lugar del inventario se entrega dónde evidencia cada requisito pedido

### Requirement: El sistema reporta qué campos extraería un ATS

El sistema SHALL mostrar, campo por campo, qué datos pudo extraer del documento y
cuáles no. El sistema MUST NOT publicar una puntuación global de compatibilidad
con un ATS: los ATS reales no puntúan, parsean a campos que el reclutador busca, y
lo que deja fuera a un candidato es que sus datos no lleguen a esos campos.

#### Scenario: Se informa cada campo por separado

- **WHEN** se analiza un currículum legible
- **THEN** se informa para cada campo buscado si se detectó o no
- **AND** de los detectados se muestra el valor extraído

#### Scenario: La métrica publicada es la de campos extraídos

- **WHEN** el sistema informa el resultado de la parseabilidad
- **THEN** la métrica expresa cuántos campos se extrajeron sobre cuántos se intentaron
- **AND** no se publica ningún valor que represente una calificación del currículum

### Requirement: Un documento sin texto legible se reporta como el único hallazgo

Cuando no se puede extraer texto aprovechable, el sistema SHALL reportar esa única
causa y MUST NOT reportar las demás verificaciones. Aplicarlas sobre un texto
vacío produciría hallazgos falsos —que falta el correo, que no hay secciones— que
esconderían la causa real.

#### Scenario: Currículum escaneado como imagen

- **WHEN** el usuario sube un currículum sin capa de texto
- **THEN** se reporta que el ATS no puede leer nada del documento
- **AND** ese es el único hallazgo reportado
- **AND** ningún campo figura como detectado

#### Scenario: Sin texto no se compara con la convocatoria

- **WHEN** el usuario sube un currículum sin capa de texto junto a una convocatoria
- **THEN** no se reporta ninguna cobertura de requisitos
- **AND** se indica que primero hay que corregir la legibilidad del documento

### Requirement: Los hallazgos distinguen lo que corregir de lo que conservar

El sistema SHALL reportar tanto los problemas detectados como los aspectos
correctos del documento, diferenciados entre sí. Cada problema SHALL indicar qué
hacer para resolverlo, no solo que existe.

#### Scenario: Un currículum con problemas

- **WHEN** el análisis detecta problemas de parseo
- **THEN** cada problema se acompaña de la acción que lo corrige
- **AND** los problemas se presentan ordenados por gravedad

#### Scenario: Un currículum sin problemas

- **WHEN** el análisis no detecta ningún problema
- **THEN** se informan los aspectos correctos del documento
- **AND** la ausencia de problemas se comunica explícitamente

### Requirement: La convocatoria se puede pegar o subir como archivo

El sistema SHALL aceptar la convocatoria como texto pegado o como archivo en los
mismos formatos que acepta un currículum.

#### Scenario: Convocatoria pegada

- **WHEN** el usuario pega el texto de una convocatoria
- **THEN** el sistema la usa como referencia del análisis

#### Scenario: Convocatoria como archivo

- **WHEN** el usuario sube la convocatoria como archivo PDF o DOCX
- **THEN** el sistema extrae su texto y la usa como referencia

#### Scenario: Convocatoria sin requisitos reconocibles

- **WHEN** el texto aportado no contiene ningún término técnico identificable
- **THEN** el sistema lo informa en lugar de mostrar una cobertura vacía
- **AND** el diagnóstico de parseabilidad se entrega igual

### Requirement: Por cada requisito se informa dónde está evidenciado

Para cada requisito que la convocatoria pide, el sistema SHALL informar si está
**demostrado** en la experiencia del candidato, únicamente **declarado** en su
lista de habilidades, o **ausente** del currículum. El sistema MUST NOT reducir
esos tres estados a presente o ausente cuando las secciones del currículum se
hayan reconocido: una tecnología nombrada solo en una lista de habilidades es una
evidencia más débil que la misma tecnología dentro de un logro, y esa diferencia
es la que un reclutador valora.

#### Scenario: Un requisito demostrado en la experiencia

- **WHEN** la convocatoria pide una tecnología que el currículum menciona dentro de su experiencia
- **THEN** ese requisito se informa como demostrado

#### Scenario: Un requisito solo declarado

- **WHEN** la convocatoria pide una tecnología que el currículum menciona únicamente en su lista de habilidades
- **THEN** ese requisito se informa como solo declarado
- **AND** no se informa como demostrado

#### Scenario: Un requisito ausente

- **WHEN** la convocatoria pide una tecnología que el currículum no menciona
- **THEN** ese requisito se informa como ausente

#### Scenario: Secciones no reconocidas

- **WHEN** no se pudieron reconocer las secciones del currículum
- **THEN** los requisitos se informan solo como presentes o ausentes
- **AND** se indica que no se pudo precisar dónde están evidenciados

### Requirement: La cobertura solo afirma lo que la convocatoria dice literalmente

Los requisitos SHALL derivarse de términos que aparecen en el texto de la
convocatoria. El sistema MUST NOT reportar como requisito nada que la convocatoria
no mencione, ni comparar el currículum contra una lista propia de tecnologías
esperables para un tipo de puesto.

#### Scenario: Variantes de escritura del mismo término

- **WHEN** la convocatoria y el currículum nombran la misma tecnología de formas distintas
- **THEN** se reconocen como el mismo requisito

#### Scenario: Tecnologías que la convocatoria no pide

- **WHEN** el currículum evidencia tecnologías que la convocatoria no menciona
- **THEN** se informan por separado de los requisitos
- **AND** no cuentan ni a favor ni en contra de la cobertura

### Requirement: Los requisitos obligatorios se distinguen de los deseables

Cuando la convocatoria separa sus requisitos obligatorios de los deseables, el
sistema SHALL reportar la cobertura de cada grupo por separado. Un deseable que
falta MUST NOT presentarse con la misma gravedad que un obligatorio.

#### Scenario: La convocatoria separa los dos bloques

- **WHEN** la convocatoria distingue requisitos obligatorios de deseables
- **THEN** la cobertura se reporta por separado para cada grupo

#### Scenario: La convocatoria no los separa

- **WHEN** la convocatoria no distingue entre obligatorios y deseables
- **THEN** todos los requisitos se reportan en un solo grupo
- **AND** no se inventa una clasificación que el texto no sostiene

### Requirement: Sin convocatoria se informa qué términos son legibles

Cuando no hay convocatoria, el sistema SHALL informar qué términos técnicos puede
extraer del currículum, para que el usuario vea qué encontraría un reclutador al
buscar por tecnología.

#### Scenario: Un currículum con habilidades en texto

- **WHEN** el currículum lista sus tecnologías como texto
- **THEN** se informan los términos reconocidos

#### Scenario: Un currículum con habilidades en gráficos

- **WHEN** las tecnologías del currículum están dentro de imágenes o barras de nivel
- **THEN** el inventario resulta vacío o notoriamente incompleto
- **AND** eso respalda el hallazgo de que las habilidades no son legibles

### Requirement: El análisis de redacción se presenta separado del de ATS

El sistema SHALL informar cuántas viñetas del currículum describen un resultado
medible y cuáles no. Esta información SHALL presentarse diferenciada de los
hallazgos de parseabilidad, porque no afecta a lo que un ATS extrae: concierne a
la persona que lee el currículum después.

#### Scenario: Viñetas que describen responsabilidades

- **WHEN** una viñeta describe una responsabilidad sin resultado medible
- **THEN** se cuenta como viñeta sin resultado
- **AND** se muestra como ejemplo concreto al usuario

#### Scenario: Viñetas que describen resultados

- **WHEN** una viñeta incluye una cifra o un porcentaje como resultado
- **THEN** se cuenta como viñeta con resultado

#### Scenario: La separación es visible

- **WHEN** se presenta el resultado del análisis
- **THEN** el análisis de redacción no aparece mezclado con los hallazgos de parseabilidad

### Requirement: El análisis de un mismo currículum no se repite

El sistema SHALL reconocer cuándo ya analizó el mismo currículum contra la misma
convocatoria para el mismo usuario, y devolver el análisis existente en lugar de
repetirlo.

#### Scenario: Se vuelve a subir el mismo currículum

- **WHEN** el usuario sube un currículum cuyo texto ya analizó con la misma convocatoria
- **THEN** se devuelve el análisis ya guardado
- **AND** no se crea un segundo análisis

#### Scenario: El mismo currículum contra otra convocatoria

- **WHEN** el usuario sube el mismo currículum aportando una convocatoria distinta
- **THEN** se realiza un análisis nuevo

#### Scenario: El mismo contenido reexportado

- **WHEN** el usuario sube un archivo distinto cuyo texto extraído es idéntico al de un análisis previo
- **THEN** se devuelve el análisis ya guardado

### Requirement: El archivo subido no se conserva

El sistema MUST NOT almacenar el archivo que el usuario sube. SHALL conservar
únicamente el texto extraído y el resultado del análisis.

#### Scenario: Después de analizar

- **WHEN** termina el análisis de un currículum
- **THEN** el contenido binario del archivo no queda almacenado

#### Scenario: El texto no se publica de vuelta

- **WHEN** el cliente consulta un análisis
- **THEN** la respuesta no incluye el texto completo del currículum

### Requirement: Un currículum pertenece solo a quien lo subió

El sistema SHALL responder como inexistente cualquier petición de un análisis que
pertenezca a otro usuario. MUST NOT distinguirse un análisis ajeno de uno que no
existe.

#### Scenario: Se pide el análisis de otra persona

- **WHEN** un usuario pide un análisis que pertenece a otro
- **THEN** el sistema responde que no existe

#### Scenario: El historial propio

- **WHEN** un usuario consulta su historial de análisis
- **THEN** solo se listan los análisis que él subió

### Requirement: Un archivo que no se puede analizar se rechaza con su motivo

El sistema SHALL rechazar los archivos que no puede analizar indicando la causa.
Un formato que ningún ATS puede leer SHALL rechazarse antes de intentar procesarlo.

#### Scenario: Formato no soportado

- **WHEN** el usuario sube una imagen o un formato distinto de los aceptados
- **THEN** se rechaza indicando qué formatos se aceptan y por qué

#### Scenario: Archivo dañado

- **WHEN** el archivo no se puede abrir
- **THEN** se rechaza indicando que puede estar dañado o protegido

#### Scenario: Archivo excesivamente extenso

- **WHEN** el archivo supera el límite de páginas que el sistema procesa
- **THEN** se rechaza indicando el límite
