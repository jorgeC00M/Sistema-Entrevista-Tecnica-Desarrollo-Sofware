## Context

Hoy `ResultadosPage` pinta el encabezado en tres piezas:
- arriba, una `EtiquetaMono` («Sesión #37 · puesto · tecnología · nivel»);
- el `h1`;
- a la derecha, `Badge` + duración.

`PreguntaDeLaTranscripcion` reutiliza `DesgloseDeNota`: los niveles en una lista y un `<details>` «¿Cómo se calcula?» con descriptores y la operación sustituida (`operacion()`). Después muestra los puntos clave y las tres cajas `ListaRetroalimentacion`. `DesgloseDeLaEvaluacion` muestra las barras del nivel medio sin explicar la fórmula.

Lo que decidió Jorge:
- el encabezado va en una línea debajo del título;
- se quita el bloque de análisis de cada pregunta;
- la explicación pasa al Resumen, y cada pregunta conserva sus niveles en una línea discreta.

## Goals / Non-Goals

**Goals:** un encabezado más compacto, una transcripción que se lea como una conversación y una sola explicación del cálculo, sin perder que cada nota se pueda rehacer a mano.

**Non-Goals:** cambiar la rúbrica, la API, el backend, los puntos clave guardados o el Plan de mejora.

## Decisions

- **Encabezado.** `h1` y, debajo, un `<p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-vidrio-muted">` con:
  - puesto, tecnología y nivel unidos por «·» (sin el número de sesión, que Jorge pidió quitar al aplicar), donde la tecnología solo entra si existe (`[…].filter(Boolean).join(' · ')`, para no dejar un «·» vacío);
  - un «·»;
  - el `Badge` del estado y la duración en `font-mono-vidrio`.

  Se quita la `EtiquetaMono` de encima del título.
- **Línea de niveles en la transcripción.** Un `<p className="text-meta text-vidrio-muted">` con `NOMBRE_EN_PANTALLA[c] n/4` unidos por «·» y, al final, «→ 100 · (3 + 2 + 3) / 12 = 67» en `font-mono-vidrio`.
  - **Por qué la cuenta sigue ahí, en una línea:** el perfil de tesis (2.1.8) y la spec de `formula-de-puntuacion` prometen que cada nota se puede recalcular. Sin la cuenta, la nota de una pregunta dejaría de poder explicarse en pantalla. En una línea no ocupa más que la lista que se quita.
  - Va antes de las tres cajas y solo si `evaluacion.niveles` no es `null`.
- **Fórmula compartida.** Nuevo `features/resultados/formula.ts` con dos funciones, que sacan su lógica de `DesgloseDeNota.operacion()`:
  - `formulaGeneral(rubrica)`: con pesos iguales, «100 · (n₁ + n₂ + n₃) / 12»; con pesos distintos, explícitos;
  - `operacion(niveles, puntuacion, rubrica | null)`: la cuenta con los valores sustituidos, que sin catálogo usa `ORDEN_DE_CRITERIOS`, pesos 1 y `NIVEL_MAXIMO_POR_DEFECTO`.

  Lo prueba `formula.test.ts`. Así la transcripción muestra su cuenta aunque el catálogo no haya llegado.
- **«¿Cómo se calcula?» en el Resumen.** Un `<details>` en `DesgloseDeLaEvaluacion`, debajo de las barras y solo con `rubrica`. Lleva:
  - la fórmula general;
  - un `dl` por criterio (`NOMBRE_EN_PANTALLA`) con sus cinco descriptores, «0: …» a «4: …»;
  - la nota «La IA elige un nivel de 0 a 4 por criterio; la nota de cada respuesta es esta cuenta».
- **Código muerto.** `DesgloseDeNota.tsx` queda sin uso y se borra. Su `operacion()` se mueve a `formula.ts`. Los puntos clave dejan de mostrarse por pregunta, pero siguen en `temasARepasar` del Plan.

## Risks / Trade-offs

- **[El perfil de tesis lista «¿Cómo se calcula?» y los puntos clave por pregunta en la tabla del reporte]** → Jorge la actualiza: el cálculo se explica una vez en el Resumen, cada pregunta muestra sus niveles y su cuenta en una línea, y los puntos clave de las respuestas más bajas aparecen en el Plan de mejora.
- **[Los descriptores ya no se ven al lado de cada nivel]** → Están en el Resumen, a una pestaña. La cuenta por pregunta sigue en pantalla.

## Migration Plan

Solo cambia el frontend. Para revertir se recupera `DesgloseDeNota.tsx` del historial de git.
