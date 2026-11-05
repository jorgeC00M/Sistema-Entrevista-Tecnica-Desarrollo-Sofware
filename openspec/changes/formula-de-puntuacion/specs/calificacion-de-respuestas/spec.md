## Purpose

Calificar cada respuesta de una entrevista simulada con una rúbrica analítica y una fórmula explícita, de modo que toda nota de 0 a 100 se pueda reconstruir a mano a partir de niveles observables, y medir qué tan consistente es el evaluador.

## ADDED Requirements

### Requirement: Rúbrica analítica de tres criterios y cinco niveles

El sistema SHALL evaluar cada respuesta con tres criterios: corrección técnica, completitud y claridad. Cada criterio se califica con un nivel entero de 0 a 4, y cada nivel tiene un descriptor publicado. El evaluador de IA MUST devolver únicamente los niveles y los textos de retroalimentación, nunca una nota numérica. Una respuesta del evaluador con un nivel ausente, no entero o fuera de 0–4 MUST rechazarse como inválida.

#### Scenario: Niveles válidos
- **WHEN** el evaluador devuelve corrección 3, completitud 2 y claridad 3
- **THEN** la evaluación se acepta y se guardan los tres niveles

#### Scenario: Nivel fuera de rango
- **WHEN** el evaluador devuelve completitud 5
- **THEN** la evaluación se rechaza como respuesta inválida del proveedor y no se guarda ninguna calificación

#### Scenario: El evaluador intenta dar una nota
- **WHEN** la respuesta del evaluador trae, además de los niveles, un campo de puntuación
- **THEN** ese campo se ignora y la nota se calcula con la fórmula

### Requirement: Fórmula de la nota de una respuesta

La nota de una respuesta SHALL ser `P = 100 · Σ(w_c · n_c) / (4 · Σ w_c)`, redondeada al entero más cercano, donde `n_c` es el nivel del criterio `c` y `w_c` su peso. Con la rúbrica vigente los tres pesos MUST ser iguales a 1. La nota la calcula el sistema y MUST ser reproducible a partir de los niveles y pesos guardados.

#### Scenario: Cálculo con pesos iguales
- **WHEN** los niveles son 3, 2 y 3
- **THEN** la nota de la respuesta es 67 (100 · 8 / 12 = 66,67)

#### Scenario: Extremos
- **WHEN** los tres niveles son 4
- **THEN** la nota es 100; y si los tres son 0, la nota es 0

#### Scenario: Recalcular a mano
- **WHEN** se lee una evaluación guardada
- **THEN** sus niveles, pesos y versión de rúbrica están disponibles y aplicar la fórmula a ellos da exactamente su nota

### Requirement: Nota final de una entrevista

La nota final de una entrevista finalizada SHALL ser la media aritmética de las notas de sus preguntas, con igual peso por pregunta. Una entrevista abandonada MUST presentar su nota como parcial e indicar sobre cuántas de las preguntas previstas se calculó.

#### Scenario: Entrevista finalizada
- **WHEN** las cinco preguntas obtienen 67, 75, 50, 83 y 92
- **THEN** la nota final es 73,4 y se muestra como 73

#### Scenario: Entrevista abandonada
- **WHEN** una entrevista se abandona con dos preguntas calificadas, de 92 y 67
- **THEN** la nota se muestra como 80 (79,5 redondeado) "parcial, sobre 2 de 5 preguntas", y no como una nota completa

### Requirement: Bandas derivadas de la fórmula

El sistema SHALL clasificar cada nota en las bandas Insuficiente (0–40), En desarrollo (41–60), Aceptable (61–80) y Sólido (81–100). La interfaz MUST mostrar la banda junto a la nota.

#### Scenario: Banda de una respuesta
- **WHEN** una respuesta tiene niveles 3, 3 y 2
- **THEN** su nota es 67 y su banda es Aceptable

### Requirement: La fórmula se publica al candidato

El reporte de una entrevista terminada SHALL explicar cómo se calculó cada nota: cada pregunta muestra el nivel obtenido en cada criterio y la fórmula con esos valores sustituidos, y el Resumen explica una vez, en "¿Cómo se calcula?", la fórmula general y el descriptor de cada nivel (ver `encabezado-y-calculo-en-el-resumen`).

#### Scenario: Ver el cálculo
- **WHEN** el candidato abre en la Transcripción una pregunta con niveles 3, 2 y 3
- **THEN** ve los tres niveles y la operación "100 · (3 + 2 + 3) / 12 = 67", y en "¿Cómo se calcula?" del Resumen, qué significa cada nivel"

### Requirement: Evaluaciones anteriores conservan su nota

Una evaluación guardada antes de este cambio, sin niveles, SHALL conservar su nota original y mostrarse sin desglose ni fórmula. Las evaluaciones antiguas MUST NOT recalcularse ni reenviarse a la IA.

#### Scenario: Evaluación antigua
- **WHEN** el candidato abre el reporte de una entrevista calificada antes del cambio
- **THEN** ve la nota y los textos de cada pregunta, sin la línea de niveles ni su operación"

### Requirement: Medición de la consistencia del evaluador

El sistema SHALL ofrecer una herramienta de administración que evalúe k veces cada respuesta de un conjunto fijo de ejemplo con el proveedor configurado. Para cada respuesta, la herramienta SHALL reportar:
- la media y la desviación estándar de la nota;
- el porcentaje de repeticiones que caen en la banda más frecuente.

La herramienta MUST NOT guardar nada en las tablas de entrevistas ni de evaluaciones.

#### Scenario: Medición con el proveedor simulado
- **WHEN** se ejecuta la medición con el proveedor simulado y k = 3
- **THEN** cada respuesta reporta desviación estándar 0 y 100 % de coincidencia de banda, y no se crea ninguna fila en la base de datos

#### Scenario: Valor de k inválido
- **WHEN** se ejecuta la medición con k menor que 2
- **THEN** la herramienta termina con un error que explica que se necesitan al menos 2 repeticiones
