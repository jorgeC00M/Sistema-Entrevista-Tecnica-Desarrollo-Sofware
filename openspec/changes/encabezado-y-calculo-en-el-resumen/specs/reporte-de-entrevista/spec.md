## ADDED Requirements

### Requirement: Los datos de la sesión van en una línea bajo el título
El encabezado del reporte SHALL mostrar primero el título «Reporte de evaluación técnica». Debajo, en una sola línea, SHALL ir:
- el puesto, la tecnología (si la hay) y el nivel, separados por «·»;
- el estado de la entrevista y su duración.

Encima del título MUST NOT quedar ninguna otra etiqueta con esos datos, y el número de sesión MUST NOT mostrarse. En pantallas angostas, la línea SHALL poder partirse sin desplazamiento horizontal.

#### Scenario: Entrevista finalizada
- **WHEN** el usuario abre el reporte de la sesión 37, Backend con Java / Spring en Junior, finalizada en 0m 37s
- **THEN** bajo el título ve «Desarrollador Backend · Java / Spring · Junior · Finalizada 0m 37s», sin «Sesión #37»

#### Scenario: Sin tecnología
- **WHEN** la entrevista es anterior al catálogo por puesto y no tiene tecnología
- **THEN** la línea omite la tecnología, sin dejar un «·» vacío

### Requirement: La transcripción muestra los niveles en una línea
Cada pregunta abierta de la «Transcripción» SHALL mostrar la pregunta de la IA, la respuesta y, si se calificó con niveles, **una sola línea** con el nivel de cada criterio y la cuenta que da su nota, por ejemplo «Conocimiento técnico (corrección) 3/4 · Profundidad (completitud) 2/4 · Claridad 3/4 → 100 · (3 + 2 + 3) / 12 = 67». Después SHALL mostrar las fortalezas, las debilidades y las sugerencias.

La pregunta MUST NOT repetir el «¿Cómo se calcula?» ni «Una respuesta completa cubría». Una evaluación anterior a la rúbrica por niveles SHALL mostrarse sin esa línea.

#### Scenario: Pregunta con niveles
- **WHEN** el usuario abre una pregunta calificada con niveles 3, 2 y 3
- **THEN** ve la línea de niveles que termina en «= 67» y debajo las fortalezas, debilidades y sugerencias, sin un desplegable de cálculo

#### Scenario: Evaluación antigua
- **WHEN** la pregunta se calificó antes de la rúbrica por niveles
- **THEN** ve su nota en el título y sus textos, sin la línea de niveles

### Requirement: El cálculo se explica una vez en el Resumen
«Desglose de la evaluación», en la pestaña «Resumen», SHALL ofrecer un único «¿Cómo se calcula?» desplegable. Al abrirlo SHALL mostrar:
- la fórmula general de la nota de cada respuesta, con los pesos de la rúbrica (con pesos iguales, «100 · (n₁ + n₂ + n₃) / 12»);
- para cada criterio, lo que significa cada nivel de 0 a 4;
- que la IA elige los niveles y que la nota es esa cuenta.

Si la rúbrica del catálogo no llegó, el desglose SHALL mostrarse sin el «¿Cómo se calcula?».

#### Scenario: Abrir el cálculo
- **WHEN** el usuario abre «¿Cómo se calcula?» en el Resumen
- **THEN** ve «100 · (n₁ + n₂ + n₃) / 12» y los cinco niveles descritos de cada uno de los tres criterios
