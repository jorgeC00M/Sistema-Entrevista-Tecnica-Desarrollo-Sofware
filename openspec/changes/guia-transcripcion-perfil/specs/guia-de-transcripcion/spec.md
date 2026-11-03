## Purpose

Que Jorge pueda trasladar al Word oficial cada cambio hecho en la copia Markdown de los capítulos I a III sin comparar los dos archivos, y que sepa cómo armar cada imagen y cada tabla.

## ADDED Requirements

### Requirement: Una entrada por cada cambio del documento
La guía SHALL contener una entrada por cada cambio de la copia Markdown de los capítulos I a III y de sus índices, en el orden del documento. No SHALL incluir cambios que no estén en esa copia.

Cada entrada SHALL indicar:
- su número;
- la ubicación (sección y punto exacto);
- la acción (REEMPLAZAR, AGREGAR, ELIMINAR o CORREGIR);
- el inicio del texto anterior cuando exista;
- el texto nuevo completo;
- el motivo en una línea.

#### Scenario: Cambio en el Alcance
- **WHEN** Jorge busca cómo transcribir la viñeta del Alcance sobre los niveles
- **THEN** encuentra una entrada que dice en qué viñeta va, qué texto reemplaza y el texto nuevo completo

#### Scenario: Nada sin entrada
- **WHEN** se recorre la diferencia entre la copia original y la corregida, bloque por bloque
- **THEN** cada bloque tiene su entrada en la guía

### Requirement: Cada imagen dice qué mostrar y de dónde sale
Cada entrada de imagen SHALL indicar:
- qué elementos debe contener;
- su referente u origen;
- su pie de figura exacto, con su número.

El referente SHALL ser uno de estos tres:
- **Diagrama:** el archivo de origen y cómo exportarlo.
- **Captura:** la pantalla del sistema, en qué estado tomarla y con qué datos de prueba.
- **Logotipo:** el sitio oficial de donde se descarga.

#### Scenario: Captura de un formulario
- **WHEN** Jorge llega a la Figura 12, el formulario de Nueva entrevista en la pestaña Personalizada
- **THEN** la guía le dice qué ruta abrir, qué campos dejar elegidos antes de capturar y qué pie poner

#### Scenario: Diagrama
- **WHEN** Jorge llega a la Figura 7, el diagrama de secuencia
- **THEN** la guía nombra el archivo de `docs/diagramas/`, explica cómo exportarlo y resume lo que el diagrama debe mostrar

### Requirement: Cada tabla dice para qué sirve
Cada entrada de tabla SHALL incluir:
- una explicación breve de su propósito, que pueda usarse como párrafo introductorio;
- sus columnas;
- su contenido completo;
- su pie exacto.

#### Scenario: Tabla de la rúbrica
- **WHEN** Jorge llega a la Tabla 3
- **THEN** encuentra una explicación de 1 o 2 líneas, las 4 columnas, las 5 filas (niveles 0 a 4) y el pie «Tabla 3. Rúbrica analítica de evaluación de respuestas (Elaboración Propia)»

### Requirement: La guía se abre y se copia sin herramientas extra
La guía SHALL entregarse como un documento de Word que se abre con doble clic, y además como un Markdown con el mismo contenido.

En el documento de Word:
- las tablas SHALL ser tablas de Word que conserven filas y columnas al copiarlas al documento oficial;
- el texto para copiar SHALL ir separado de las instrucciones;
- cada entrada SHALL ser un encabezado visible en el panel de navegación.

#### Scenario: Copiar una tabla
- **WHEN** Jorge copia la Tabla 7 de la guía y la pega en su documento oficial
- **THEN** obtiene una tabla de Word con sus 4 columnas y 11 filas, sin símbolos `|`

#### Scenario: Retomar el trabajo
- **WHEN** Jorge abre la guía otro día
- **THEN** el panel de navegación le muestra las entradas por capítulo y puede ir directo a la siguiente que le falta

### Requirement: Lo pendiente queda listado
La guía SHALL terminar con tres listas:
- cada marca `[VERIFICAR]` y `[CONFIRMAR]`, con su ubicación y la fuente que hay que consultar;
- las secciones nuevas que deben agregarse a la tabla de contenido;
- los pasos para actualizar los índices en Word.

#### Scenario: Marcas pendientes
- **WHEN** Jorge termina de transcribir
- **THEN** la lista final le muestra cada dato que aún debe confirmar y dónde está
