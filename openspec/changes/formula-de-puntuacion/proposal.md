## Why

La nota 0–100 **no se puede quitar**:
- el título del perfil es "…para **evaluar el nivel de competencias**…";
- el modelo de datos (3.4.1) define `puntuacion` "del 0 al 100" y `puntuacion_promedio`;
- la definición de evaluación automatizada dice que la IA "asigna una puntuación basada en criterios técnicos predefinidos".

Quitarla dejaría sin cumplir el objetivo general y el modelo de datos aprobado.

Lo que sí hay que cambiar es **de dónde sale**. Hoy el modelo de lenguaje escribe directamente un entero de 0 a 100. Ante "¿por qué 74 y no 76?" no hay respuesta, porque ese número no lo produce ninguna fórmula. Tampoco se ha medido si es estable: la misma respuesta evaluada dos veces puede dar notas distintas, porque los adaptadores no fijan la temperatura.

La literatura sobre *LLM-as-a-judge* coincide en dos puntos:
- los modelos son más fiables con **pocos niveles discretos y descritos** que con una escala 0–100 (G-Eval y Prometheus usan 1–5; un estudio de 2026 encuentra la mayor concordancia humano–LLM en 0–5);
- una **rúbrica analítica**, con criterios por separado y niveles con descriptor, es el instrumento estándar para que una nota sea explicable (Brookhart, 2013; Jonsson & Svingby, 2007).

## What Changes

- **Rúbrica analítica de 3 criterios × 5 niveles (0–4)**, cada nivel con su descriptor:
  - Corrección técnica, Completitud y Claridad;
  - el modelo **solo elige un nivel por criterio** y no escribe ninguna nota.
- **Fórmula de la nota de una respuesta**, calculada por el código:

  `P = 100 · (w_cor·n_cor + w_com·n_com + w_cla·n_cla) / (4 · (w_cor + w_com + w_cla))`

  - Pesos iguales (`w = 1`), como ya declara la rúbrica, de modo que `P = 100 · (n_cor + n_com + n_cla) / 12`, redondeado.
  - Los pesos quedan como datos versionados (`VERSION_DE_RUBRICA`), no como texto del prompt.
- **Fórmula de la nota final de una entrevista** finalizada: `N = (1/5) · Σ P_q`, la media aritmética de las 5 preguntas, con igual peso porque cada una corresponde a un área del plan del puesto.
  - Una entrevista **abandonada** muestra su nota como **parcial** ("sobre k de 5"), nunca como si fuera completa.
- **Bandas sin cambios** (0–40, 41–60, 61–80, 81–100). Ahora se justifican con la suma de niveles `S`:

| Banda | Suma `S` | Nivel medio | Nota |
|---|---|---|---|
| Insuficiente | 0–4 | ≤ 1,33 | ≤ 33 |
| En desarrollo | 5–7 | 1,67–2,33 | 42–58 |
| Aceptable | 8–9 | 2,67–3 | 67–75 ("correcta pero incompleta o poco clara") |
| Sólido | 10–12 | ≥ 3,33 | ≥ 83 |
- **Trazabilidad:** cada evaluación guarda en `evaluacion_json` los tres niveles, los pesos y la versión de la rúbrica, de modo que cualquier nota se puede recalcular a mano.
- **Medición de consistencia (test–retest):** un comando de gestión evalúa *k* veces un conjunto fijo de respuestas de ejemplo y reporta:
  - la desviación estándar de `P`;
  - el porcentaje de veces que cae en la misma banda.

  Es la evidencia empírica para el capítulo de pruebas y para la defensa.
- Se publica la **fórmula en la interfaz**, en un "¿Cómo se calcula?" del reporte, con los niveles de esa respuesta sustituidos.

## Capabilities

### New Capabilities
- `calificacion-de-respuestas`: cómo se califica una respuesta (rúbrica analítica, niveles, fórmula, trazabilidad), cómo se obtiene la nota final de una entrevista y cómo se mide la consistencia del evaluador.

### Modified Capabilities
<!-- No hay specs archivadas en openspec/specs/. El cambio en curso `reporte-final-entrevista` pedía criterios de 0 a 100; se ajusta para consumir los niveles 0–4 de este cambio (ver design.md, D6). -->

## Impact

- **Capa de IA:**
  - `integrations/ia/prompts/evaluador.py`: rúbrica con descriptores por nivel y esquema con `niveles`.
  - `integrations/ia/prompts/schemas.py`: `Evaluacion` y `parsear_evaluacion`.
  - `integrations/ia/fake.py`.
- **Apps:**
  - `apps/evaluaciones/rubricas.py` pasa a ser la fuente de pesos, niveles y versión, y la fórmula.
  - `apps/evaluaciones/services.py::guardar`.
  - `apps/entrevistas/selectors.py::promedio_de_evaluaciones` (sin cambios de fórmula para las finalizadas).
  - Nuevo comando `apps/evaluaciones/management/commands/medir_consistencia.py`.
- **Frontend:** `features/resultados/` (desglose y "¿Cómo se calcula?"), con marca de nota parcial en las abandonadas.
- **Sin migración:** el modelo de datos del perfil no cambia, y las evaluaciones antiguas conservan su nota y se muestran sin desglose.
- **Depende de / coordina con** `reporte-final-entrevista`, que debe aplicarse **después** de este cambio.
