## Context

- Hoy el evaluador recibe la rúbrica en texto (`evaluador.py::RUBRICA`) y devuelve un entero `puntuacion` de 0 a 100 que `parsear_evaluacion()` solo valida por rango.
- `apps/evaluaciones/rubricas.py` define las `BANDAS` y reexporta `RUBRICA`.
- La nota final se calcula en `apps/entrevistas/selectors.py::promedio_de_evaluaciones()`: un `Avg` en SQL sobre las respuestas calificadas, que se guarda en `Entrevista.puntuacion_promedio` al finalizar.
- Ni `claude.py` ni `gemini.py` fijan la temperatura.
- `reporte-final-entrevista` (propuesto, sin aplicar) pedía criterios en 0–100. Este cambio lo reemplaza por niveles 0–4.

Motivación: ver proposal.md. Requisitos: ver `specs/calificacion-de-respuestas/spec.md`.

## Goals / Non-Goals

**Goals:**
- Que la IA haga solo lo que se le puede pedir con fiabilidad (clasificar en pocos niveles descritos) y que la aritmética sea código determinista.
- Que cada nota se pueda recalcular desde lo guardado y explicar en una línea.
- Tener una medida empírica de consistencia que citar en el capítulo de pruebas.

**Non-Goals:**
- Pesos distintos por nivel (Básico/Intermedio) o por área: la rúbrica del perfil dice "igual peso", y la exigencia por nivel ya la calibra el descriptor ("para el nivel indicado").
- Ponderar las preguntas por dificultad: el plan del puesto da una pregunta por área, y ninguna área vale más que otra en el perfil.
- Puntuación ponderada por probabilidades de tokens, como en G-Eval: Claude no expone *logprobs*, así que no sería portable entre proveedores.
- Promediar varias evaluaciones por respuesta (*self-consistency*) en producción: triplica el costo y el presupuesto es cero. Se mide la consistencia; no se compra.
- Validez frente a evaluadores humanos (correlación con docentes): se deja como trabajo de validación del documento, fuera del código.

## Decisions

### D1. Niveles 0–4 en lugar de 0–100

El modelo elige un nivel discreto por criterio, y cada nivel tiene un descriptor. La justificación para la defensa:
- **Instrumento:** una rúbrica analítica, con criterios separados y niveles descritos, es el instrumento estándar para que una calificación sea transparente y confiable entre evaluadores (Brookhart, 2013; Jonsson & Svingby, 2007).
- **Evidencia sobre LLM evaluadores:**
  - G-Eval (Liu et al., EMNLP 2023) y Prometheus (Kim et al., ICLR 2024) puntúan en escalas de 1 a 5 con rúbrica;
  - Prometheus alcanza una correlación de Pearson de 0,897 con evaluadores humanos cuando recibe una rúbrica detallada;
  - un estudio de 2026 (arXiv 2601.03444) encuentra la mayor concordancia humano–LLM en la escala 0–5, y la peor en 0–10.

  Una escala de 0 a 100 escrita libremente por el modelo pide una precisión que no tiene.

Se usa 0–4 (cinco niveles) en lugar de 1–5 para que el nivel 0 signifique "ausente o incorrecto" y la fórmula dé exactamente 0 y 100 en los extremos.

Descriptores (iguales en estructura para los tres criterios; se redacta uno por criterio):

| Nivel | Corrección técnica |
|---|---|
| 0 | Incorrecta, vacía o fuera de tema |
| 1 | Contiene errores conceptuales importantes |
| 2 | Idea central correcta con errores menores |
| 3 | Correcta, sin errores relevantes |
| 4 | Correcta y precisa, con terminología adecuada |

Completitud va de "no cubre lo esperado" (0) a "cubre todo lo esperado para el nivel" (4). Claridad va de "incomprensible" (0) a "ordenada, con razonamiento explícito" (4).

### D2. La fórmula vive en `rubricas.py`, versionada

`rubricas.py` pasa a contener:
- `NIVEL_MAXIMO = 4`;
- `PESOS = {"correccion": 1, "completitud": 1, "claridad": 1}`;
- `VERSION_DE_RUBRICA = 2`;
- `puntuacion_de(niveles) -> int`.

La capa de IA no puede importar de `apps/`, porque la dependencia es apps → integrations. Por eso:
- el parser de la capa de IA solo valida y devuelve `Niveles`;
- `apps/evaluaciones/services.py::guardar()` calcula `puntuacion_de()`, guarda `puntuacion` en su columna y escribe en `evaluacion_json` `{niveles, pesos, version_rubrica, ...}`.

Así, el número sale del mismo módulo que ya define las bandas.

- *Alternativa:* calcular la nota en `parsear_evaluacion`. Se descarta porque los pesos son una decisión de evaluación (dominio de la app), no del contrato con el proveedor.
- *Consecuencia:* `Evaluacion` (dataclass de IA) deja de tener `puntuacion`. Hoy la usan `responder()` y `temas_evaluados()`, que leen `TemaEvaluado.puntuacion` desde la base de datos, no desde la dataclass. Hay que revisar los usos directos de `resultado.puntuacion` en `services.py`.

### D3. Redondeo

`round(100 * S / 12)`, donde `S` es la suma de niveles, de 0 a 12. Los valores posibles son 13: 0, 8, 17, 25, 33, 42, 50, 58, 67, 75, 83, 92 y 100.

`100·S/12` termina en ,5 solo si `S·100 mod 12 = 6`, lo que no ocurre con enteros de 0 a 12 (los decimales son siempre ,0, ,33 o ,67). Por tanto, el redondeo bancario de Python no introduce ambigüedad. La nota final, que es una media, se guarda con 2 decimales, como hoy, y se muestra redondeada en la interfaz.

### D4. Nota final: media simple y abandonadas marcadas como parciales

`promedio_de_evaluaciones()` no cambia: la media simple sobre las respuestas calificadas ya es la fórmula. Ya se pondera por respuesta en las estadísticas, como documenta CLAUDE.md.

Lo nuevo es exponer `preguntas_calificadas` y `preguntas_previstas` (`PREGUNTAS_POR_ENTREVISTA`) en `EntrevistaSerializer`. La interfaz marca la nota como "parcial" cuando el estado es `ABANDONADA`.

- *Alternativa:* contar las preguntas sin responder como 0. Se descarta porque castiga un abandono como si fuera un error técnico y mezcla dos cosas distintas. Además, `calcular_retroalimentacion` ya trata las abandonadas como evidencia parcial válida.

### D5. Consistencia medida, no supuesta

El comando `python manage.py medir_consistencia --repeticiones K [--proveedor X]`:
- lee un conjunto fijo de casos `(contexto, área, pregunta, respuesta)` de `apps/evaluaciones/consistencia/casos.json` (unos 8 casos: dos por banda, en varias áreas);
- llama a `proveedor.evaluar_respuesta` K veces por caso;
- aplica `puntuacion_de`;
- imprime por caso la media, la desviación estándar y el porcentaje en la banda modal, y un resumen global.

No toca el ORM de entrevistas. Con `fake`, la desviación es 0, que es lo que verifica el test. Con `gemini` y K = 3 son 24 llamadas, dentro de la cuota gratuita.

La temperatura **no** se fuerza a 0. Los modelos de razonamiento recientes recomiendan la temperatura por defecto, y fijarla no garantiza determinismo. Medir la variabilidad real es más honesto que suponerla nula. Si el resultado muestra que la banda cambia con frecuencia, ese es un hallazgo para reportar, no algo que ocultar.

### D6. Coordinación con `reporte-final-entrevista`

Ese cambio queda **después** de este. Su requisito "La puntuación se deriva de criterios visibles" y sus tareas 1.1 y 1.2 se reescriben para consumir los niveles 0–4 de aquí, en lugar de criterios 0–100. Sus barras por criterio muestran el nivel medio sobre 4. Lo que es propio de ese cambio se mantiene: puntos clave, resumen, comparación y "practicar de nuevo".

## Risks / Trade-offs

- [Granularidad: solo 13 notas posibles por respuesta] → Es intencional: la precisión mostrada coincide con la medida. La nota final, al promediar 5 respuestas, sigue siendo fina.
- [Cambio de escala entre evaluaciones antiguas y nuevas en el historial] → Se usan las mismas bandas y el mismo rango 0–100, así que las estadísticas siguen siendo comparables. `version_rubrica` permite separarlas si un análisis lo requiere.
- [El modelo podría inflar niveles para "alentar"] → Los descriptores son observables ("contiene errores conceptuales"), no valorativos. El medidor de consistencia y la revisión manual de los casos de ejemplo detectan derivas.
- [Los tests que construyen `Evaluacion` con `puntuacion`] → Hay una tarea explícita para migrarlos a niveles. `FakeProveedorIA` devuelve los niveles 3/3/3, que dan 75: la misma nota que hoy, para no mover los tests de estadísticas.

## Migration Plan

Sin migración de esquema. Se despliega primero el backend: las evaluaciones nuevas traen niveles y las antiguas no. Los campos nuevos del serializer son opcionales en el frontend. Para revertir basta con volver al commit anterior: las evaluaciones creadas con la rúbrica v2 conservan su columna `puntuacion` válida, y el JSON extra se ignora.
