## Purpose

Diagnosticar por qué un currículum queda fuera de la búsqueda de un reclutador
que usa un ATS y ayudar a corregirlo, separando lo que se mide del documento de
lo que una IA solo sugiere.

## ADDED Requirements

### Requirement: Las sugerencias de IA están separadas de lo medido

El sistema SHALL presentar las sugerencias generadas por IA rotuladas como
tales y separadas de los hallazgos medidos. Una sugerencia MUST NOT cambiar un
hallazgo, el estado de un requisito, la parseabilidad ni la cobertura. El
sistema MUST NOT publicar ningún puntaje.

#### Scenario: Sugerencia rotulada

- **WHEN** el análisis incluye sugerencias de IA
- **THEN** cada bloque de sugerencias se muestra con la etiqueta "Sugerencia de IA"

#### Scenario: La IA no reclasifica

- **WHEN** la IA devuelve una sugerencia para un requisito que el código marcó como ausente
- **THEN** el requisito sigue apareciendo como ausente

### Requirement: Se sugiere cómo reescribir las viñetas sin resultado

Para cada viñeta que el análisis identificó sin resultado medible, el sistema
SHALL ofrecer una redacción alternativa. La redacción MUST NOT inventar cifras:
cuando el original no trae ninguna, SHALL usar un marcador para que el usuario
la complete.

#### Scenario: Viñeta de tarea

- **WHEN** el CV tiene la viñeta "Encargado del mantenimiento de la base de datos"
- **THEN** se sugiere una redacción orientada a resultado con un marcador de cifra

#### Scenario: Viñeta no enviada

- **WHEN** la IA devuelve una reescritura para una viñeta que no estaba en la lista de viñetas sin resultado
- **THEN** esa reescritura se descarta

### Requirement: Se sugiere cómo cerrar la brecha con honestidad

Para cada requisito `declarado` o `ausente` de la convocatoria (incluidos
experiencia y cargo), el sistema SHALL sugerir cómo evidenciarlo si la persona
lo tiene, o cómo aprenderlo o presentarlo con honestidad si no. La sugerencia
MUST NOT redactar experiencia que el CV no contiene. Las sugerencias sobre
requisitos que no están en la brecha SHALL descartarse.

#### Scenario: Requisito declarado

- **WHEN** Django aparece solo en la lista de habilidades
- **THEN** se sugiere mencionarlo dentro de un logro de la experiencia

#### Scenario: Requisito inventado por la IA

- **WHEN** la IA devuelve una sugerencia para un término que la convocatoria no pide
- **THEN** esa sugerencia se descarta

### Requirement: Se anticipan preguntas probables de entrevista

El sistema SHALL proponer hasta 5 preguntas que un entrevistador haría a partir
de lo que el CV afirma y, si la hay, de la convocatoria. Cada pregunta SHALL
mostrar el fragmento del CV o de la convocatoria que la motiva; una pregunta cuyo
motivo no aparece en esos textos SHALL descartarse. El sistema SHALL ofrecer
practicar la entrevista, preseleccionando un puesto del catálogo cuando la IA
sugiera uno válido. Las preguntas MUST NOT alterar las preguntas de la
entrevista simulada.

#### Scenario: Preguntas con motivo

- **WHEN** el CV menciona "migré el módulo de pagos a microservicios"
- **THEN** se propone una pregunta sobre esa migración y se muestra ese fragmento como motivo

#### Scenario: Practicar con puesto sugerido

- **WHEN** la IA sugiere el puesto "backend" y el usuario pulsa "Practicar esta entrevista"
- **THEN** se abre la pantalla de nueva entrevista con Backend ya elegido

#### Scenario: Puesto no válido

- **WHEN** la IA sugiere un puesto que no existe en el catálogo
- **THEN** el enlace abre la pantalla de nueva entrevista sin puesto elegido

### Requirement: La pantalla de nueva entrevista acepta un puesto preseleccionado

La pantalla de nueva entrevista SHALL aceptar un puesto en la URL y elegirlo al
cargar si existe en el catálogo. Un código que no existe MUST ignorarse, sin
mostrar error y sin enviarse al servidor.

#### Scenario: Código válido

- **WHEN** se abre `/nueva-entrevista?puesto=frontend`
- **THEN** Frontend aparece elegido y el usuario solo debe elegir el nivel

#### Scenario: Código inválido

- **WHEN** se abre `/nueva-entrevista?puesto=inexistente`
- **THEN** no hay puesto elegido y no se puede comenzar hasta elegir uno

### Requirement: Se sugieren correcciones de ortografía y redacción

El sistema SHALL señalar hasta 10 correcciones de ortografía, de uso de primera
persona o de tiempos verbales mezclados, mostrando el fragmento original y su
corrección. Una corrección cuyo original no aparece literalmente en el texto
analizado SHALL descartarse.

#### Scenario: Errata

- **WHEN** el CV dice "desarollé una API"
- **THEN** se sugiere "desarrollé una API" indicando que es ortografía

#### Scenario: Corrección no localizable

- **WHEN** la IA devuelve una corrección cuyo original no está en el CV
- **THEN** esa corrección se descarta

### Requirement: Los datos personales no salen hacia el proveedor de IA

El sistema MUST NOT enviar al proveedor de IA el encabezado del CV, el texto de
su encabezado o pie de página, ni el documento completo. Del resto, MUST
sustituir correos, teléfonos, enlaces y el nombre detectado por marcadores antes
de enviarlo. Si no se reconocen las secciones del CV, o el documento no tiene
capa de texto, el sistema MUST NOT llamar al proveedor y SHALL indicar por qué
no hay sugerencias.

#### Scenario: Envío enmascarado

- **WHEN** se analiza un CV con nombre, correo y teléfono
- **THEN** ninguno de esos datos llega al proveedor de IA

#### Scenario: Secciones no reconocidas

- **WHEN** el CV usa títulos de sección que no se reconocen
- **THEN** no se llama al proveedor
- **AND** la sección de IA indica que corregir los títulos habilita las sugerencias

#### Scenario: CV escaneado

- **WHEN** el CV no tiene capa de texto
- **THEN** no se llama al proveedor

### Requirement: Un fallo de la IA no impide el diagnóstico

Si el proveedor de IA falla o responde de forma inválida, el sistema SHALL
entregar el análisis completo con el mismo resultado exitoso y SHALL indicar que
las sugerencias no están disponibles. Al volver a subir el mismo CV, SHALL
reintentar solo las sugerencias, sin repetir el análisis.

#### Scenario: Proveedor caído

- **WHEN** el proveedor de IA no responde durante un análisis
- **THEN** la respuesta es exitosa, trae el diagnóstico completo y la sección de IA indica que no está disponible

#### Scenario: Reintento

- **WHEN** el usuario vuelve a subir un CV cuyas sugerencias no estuvieron disponibles
- **THEN** se vuelve a pedir solo la parte de IA

#### Scenario: Caché con sugerencias

- **WHEN** el usuario vuelve a subir un CV cuyas sugerencias ya se obtuvieron
- **THEN** no se llama al proveedor
