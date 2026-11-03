## ADDED Requirements

### Requirement: El Marco teórico se profundiza sin reemplazarse
El Capítulo II SHALL conservar sus secciones 2.1 a 2.5, sus ideas y su enfoque. Cada párrafo original SHALL seguir reconocible en la versión mejorada, ampliado o corregido, salvo que el diagnóstico aprobado lo haya marcado como repetición. Los conceptos nuevos SHALL entrar como subsecciones de las secciones existentes.

#### Scenario: Antes y después
- **WHEN** Jorge compara una sección original con su versión mejorada
- **THEN** encuentra sus ideas originales y el texto agregado, y se le muestran lado a lado antes de generar el Word

#### Scenario: Concepto faltante
- **WHEN** se agrega un concepto que el capítulo no tenía, por ejemplo qué es un LLM
- **THEN** entra como subsección numerada dentro de 2.1 y se desarrolla en este orden: concepto, funcionamiento, estado actual y relación con el problema

### Requirement: Cada cita es real, verificable y está en APA 7
Toda afirmación técnica importante SHALL llevar una cita en APA 7 dentro del texto. Al final de cada párrafo con cita SHALL ir una línea «Fuente:» con el DOI o la URL de cada obra citada en él.

Solo SHALL usarse fuentes encontradas y leídas en esta sesión, como mínimo el resumen y los datos clave. Ningún autor, título, año, DOI ni dato SHALL completarse de memoria. Lo que no se pueda verificar SHALL marcarse `[VERIFICAR]` o quedar fuera.

#### Scenario: Fuente no verificable
- **WHEN** no se encuentra en línea una obra que el texto original ya citaba
- **THEN** la cita se conserva con `[VERIFICAR]` y la obra aparece en la lista de verificación, sin inventar su DOI

#### Scenario: Dos autores con el mismo apellido y año
- **WHEN** se citan dos obras de 2023 cuyo primer autor se apellida Liu
- **THEN** la cita lleva las iniciales, como pide APA 7: (P. Liu et al., 2023) y (Y. Liu et al., 2023)

### Requirement: Las referencias coinciden con las citas
La lista de referencias SHALL contener exactamente las obras citadas en el capítulo, en formato APA 7 y en orden alfabético: ni una de más ni una de menos. Junto a ella SHALL entregarse una lista de verificación con cada fuente, su DOI o URL y la idea que se le atribuye.

#### Scenario: Obra citada sin referencia
- **WHEN** el texto cita una obra que no está en la lista
- **THEN** la verificación cruzada del paso 5 la detecta antes de generar el Word

### Requirement: No se mueve contenido entre capítulos
El cambio SHALL NOT trasladar texto del Capítulo II a otro capítulo ni de otro capítulo al II. El texto que pertenezca a otro capítulo SHALL quedar donde está y anotarse en la lista «Para revisar manualmente», con la sección, el motivo y el capítulo que le correspondería.

#### Scenario: Diseño del sistema dentro de la teoría
- **WHEN** una sección teórica describe cómo lo hace el sistema, por ejemplo la fórmula P = 100·(n₁+n₂+n₃)/12 o las funciones de la API de Claude
- **THEN** el texto se queda en esa sección y aparece en «Para revisar manualmente»

### Requirement: Tablas y figuras con numeración respetada
Las Tablas 3–5 y las Figuras 2–5 existentes SHALL conservar su número y su formato de pie, por ejemplo «Tabla N. Título (Elaboración Propia)». Las tablas nuevas SHALL usarse solo para comparar, clasificar o resumir.

Cada figura nueva que no se pueda insertar SHALL dejar en su lugar un párrafo corto que describa la imagen que hay que poner. Los números nuevos SHALL ser correlativos y quedar anotados para renumerar el resto del documento.

#### Scenario: Tabla nueva en 2.1
- **WHEN** se agrega una tabla que compara tipos de entrevista
- **THEN** recibe el número siguiente en el orden de aparición, y la lista de pendientes indica qué tablas posteriores, en este capítulo y en los demás, cambian de número

### Requirement: Entregable Word del Capítulo II
El resultado SHALL entregarse en `docs/capitulo-2-marco-teorico.docx`, con solo el Capítulo II. El orden del documento SHALL ser: el texto mejorado, la lista de referencias, la lista «Para revisar manualmente» y la lista de verificación de fuentes.

#### Scenario: Abrir el Word
- **WHEN** Jorge abre el archivo
- **THEN** encuentra el Capítulo II con sus títulos, tablas y pies, cada párrafo citado con su línea «Fuente:», y al final las tres listas
