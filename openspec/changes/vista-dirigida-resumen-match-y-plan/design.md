## Context

El análisis dirigido usa `Brecha` (obligatorios, deseables, cada `Requisito` con `termino` y `estado`: `demostrado` / `declarado` / `presente` / `ausente`; `separada`; `cargo`; `experiencia`; `filtros`; `extras`). Las sugerencias de IA llegan aparte en `revision_ia`:
- `revision.py` envía al revisor solo los requisitos `declarado`/`ausente` (más el cargo y la experiencia);
- el parser `revisor_cv.parsear_revision` descarta lo que no esté anclado;
- el prompt del revisor **no** tiene copia fijada en `tests/fixtures/prompts/` (solo los de la entrevista).

Decisiones del usuario: ver `proposal.md` y el plan aprobado (sin casilla, «frente a» con el cargo o un texto genérico, se conservan los requisitos del puesto, IA para la lectura y los dos caminos).

## Goals / Non-Goals

**Goals:**
- Que cada pestaña del dirigido responda una sola pregunta.
- Que la IA resuma y aconseje sin juzgar la aptitud.

**Non-Goals:**
- Medir la empresa.
- Cambiar las reglas, la brecha o `VERSION_DE_REGLAS`.
- Tocar el análisis general.
- Agregar un filtro al espejo («Datos extraídos con el filtro» se lee como el espejo actual, que no tiene filtro).

## Decisions

- **Reparto de estados.** «Coinciden» = `demostrado` + `declarado` + `presente`; «No detectados» = `ausente`. Es lo que el usuario describió («con evidencia, o solo mencionado sin evidencia») y mantiene la regla de que `declarado` cuenta como cubierto. La nota de dónde aparece es fija y sale del estado (`requisitos.ts::NOTA_DE_DONDE`). No se le pide a la IA.
- **«Palabras clave no detectadas» solo trata `ausente`.** El `declarado` ya tiene su consejo en la nota de «Coinciden» («menciónalo en un logro»).
- **`requisitosPorEstado(brecha)` en `requisitos.ts`.** Es una función pura y testeada en Vitest, de la que leen el banner, las columnas y el plan. Así nunca discrepan en el orden ni en el reparto. El tipo es `null` cuando `!brecha.separada`, porque entonces todo está en `obligatorios` y la etiqueta mentiría.
- **El banner recibe un slot `requisitos?: ReactNode`** en vez de saber qué es una convocatoria. `VeredictoDeLegibilidad` sigue calculando el estado solo desde `campos`, y el slot no lo toca.
- **La IA, en la misma llamada de revisión.** Se agregan `lectura` y, por requisito ausente, `muestralo` / `ejemplo` / `aprendelo`, y la entrada recibe `demostrados` (solo términos del diccionario, sin datos personales) para que la lectura pueda resumir las dos columnas. *Alternativa:* una llamada aparte para la lectura. Se descartó porque duplica el costo, la latencia y el manejo de fallos.
- **El guardián de aptitud está en el parser, no solo en el prompt.** `_CONCLUYE_APTITUD` (regex: `apt[oa]s?`, `idóne`, `calificad`, `cualificad`, `probabilidad`, `%`, `deberías postular`, `encajas perfectamente`) descarta toda la lectura: un modelo puede ignorar el prompt, y lo que la pantalla promete («no evalúa si eres apto») lo tiene que garantizar el código.
- **`VERSION_DE_REVISION = 2`** guardada en `revision_ia.version`. `necesita_revision` es verdadero para `None`, para `no_disponible` y para `ok` con una versión menor. `useRevisionDelCv` aplica la misma condición. Es el mismo patrón que `VERSION_DE_REGLAS`.
- **Pautas fijas sin rótulo de IA** cuando falta el texto. Las dos cajas existen siempre, así el «apréndelo» no depende de que la IA responda.
- **`FrenteAlAviso` → `RequisitosDelPuesto`.** Lo que queda en ese archivo ya no es «todo frente al aviso». Se borran `BusquedaDelReclutador` y `busquedaDelReclutador`, porque ya nadie los usa.

## Risks / Trade-offs

- [La regex descarta una lectura legítima que diga, por ejemplo, «aptitudes»] → La regex usa límites de palabra (`\bapt[oa]s?\b`); hay un test con «aptitudes» que debe pasar.
- [Al abrir el historial, todas las revisiones viejas se piden de nuevo, lo que consume cuota] → Solo pasa una vez por análisis y al abrirlo, nunca en lote.
- [Sin cargo detectado, «frente a la convocatoria» dice poco] → Es honesto: no se inventa un puesto.

## Migration Plan

No hay migraciones. Las revisiones v1 se renuevan al abrirse. Para revertir, volver al cambio anterior; las revisiones v2 traen campos extra que el frontend viejo ignora.
