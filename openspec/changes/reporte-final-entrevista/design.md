## Context

Hoy `evaluador.py` declara la rúbrica en texto: tres criterios de igual peso y cuatro bandas. Sin embargo, `ESQUEMA_EVALUACION` pide solo `puntuacion` más tres textos, y la IA aplica la rúbrica "de cabeza". `parsear_evaluacion()` valida el rango. `apps/evaluaciones/services.py::guardar()` copia los mismos cuatro campos en columnas y en `evaluacion_json`.

`ResultadosView` devuelve `{entrevista, intercambios}` y oculta las evaluaciones mientras la entrevista está `EN_PROGRESO`. En el frontend, `TarjetaResumen` pinta el promedio en `text-4xl`, lo que contradice la regla "no puntajes grandes" de DESIGN.md. `PanelCualitativo` pinta cada pregunta.

`SeleccionPuestoPage` ya lee `?puesto=`, que usa el módulo de CV.

Motivación: ver proposal.md. Requisitos: ver `specs/reporte-de-entrevista/spec.md`.

## Goals / Non-Goals

**Goals:**
- Convertir la nota en un plan para la próxima entrevista: qué criterio y qué área trabajar.
- Un reporte consolidado calculado en el servidor, testeable sin IA.
- Ni una sola llamada extra a la IA y ninguna migración.

**Non-Goals:**
- Pesos distintos por criterio o por nivel: el perfil y la rúbrica dicen "igual peso".
- Estadísticas por criterio en `/estadisticas/`: puede venir después, ya que los datos quedan guardados.
- Recalificar entrevistas antiguas.
- Un resumen redactado por IA, que sería otra llamada por cada vista y un texto no reproducible.
- Cambiar la regla de no publicar la nota durante la entrevista.

## Decisions

### D1. Los niveles vienen de `formula-de-puntuacion`

Este cambio se aplica **después** de `formula-de-puntuacion`, que ya define los niveles 0–4 por criterio, `rubricas.puntuacion_de()` y la trazabilidad en `evaluacion_json`. Aquí solo se añaden los puntos clave y el resumen. `Evaluacion` (dataclass) gana `puntos_clave: tuple[str, ...]`.

### D2. Los puntos clave son parte de la misma llamada

Se agrega `puntos_clave: array<string>` al esquema y al prompt: "lo que una respuesta completa debía cubrir para este nivel, sin repetir la respuesta del candidato". El parser recorta a 4 y rechaza menos de 2.

Sigue siendo una función pura de `(contexto, área, pregunta, respuesta)`, así que la propiedad documentada en CLAUDE.md se mantiene.

- *Alternativa:* una llamada aparte al terminar, para "la respuesta modelo". Se descarta porque duplicaría el costo y porque, al terminar, ya no se tiene el contexto de la pregunta en la misma llamada.

### D3. Persistir en `evaluacion_json`, no en columnas nuevas

`guardar()` escribe además `puntos_clave` dentro de `evaluacion_json`, que el perfil (3.4.1) define como "datos completos en formato JSON".

- *Por qué no columnas:* el modelo de datos del perfil tiene exactamente `puntuacion`, `fortalezas`, `debilidades`, `sugerencias` y `evaluacion_json`. Mantenerlo intacto evita explicar en la defensa una divergencia con el documento aprobado y evita una migración.
- *Costo asumido:* agregar niveles por criterio en SQL requiere `KeyTextTransform`/`Cast` sobre `jsonb`. Para el resumen de una sola entrevista (5 filas) se calcula en Python. Si más adelante se quiere estadística global por criterio, se promueve a columnas con una migración que haga backfill desde el JSON.

`EvaluacionSerializer` añade `puntos_clave` (lista, vacía si falta), leídos del JSON con un getter tolerante a evaluaciones antiguas.

### D4. El resumen es un selector puro y viaja en `/resultados/`

`apps/entrevistas/selectors.py::resumen_de(entrevista, intercambios)` devuelve un diccionario con:
- `banda` (de `rubricas.banda_de`);
- `promedio`;
- `criterios` (el nivel medio de cada uno, sobre 4, en las evaluaciones que tienen niveles, o `null` si ninguna los tiene);
- `criterio_mas_debil`;
- `prioridad` (`{numero, area, area_display, sugerencia}`);
- `comparacion` (`{entrevista_id, diferencia}` o `null`).

`anterior_comparable(entrevista)` filtra por el mismo usuario, puesto y nivel, `estado=FINALIZADA` y `fecha_fin < entrevista.fecha_inicio`, ordena por `-fecha_fin` y toma la primera. Usa `fecha_inicio` de la actual para que una entrevista abandonada a medias no se compare consigo misma ni con una posterior.

`ResultadosView` agrega `"resumen": resumen_de(...) if not en_progreso else None`. Así hay **una sola** condición de publicación para toda la respuesta, y la forma del JSON no cambia según el estado.

- *Alternativa:* un endpoint `/resumen/` aparte. Se descarta porque obligaría a duplicar la regla de no publicar y añadiría una petición más en conexiones lentas (PRODUCT.md).

Con empates, la prioridad es la de menor `numero`: es determinista y sigue el orden en que el candidato vivió la entrevista.

### D5. Interfaz: el resumen reemplaza al número grande

- `ResumenFinal` reemplaza a `TarjetaResumen`. Arriba va la banda en palabras ("Aceptable") con `ChipPuntaje` y el promedio en tamaño de cuerpo. Debajo, tres barras horizontales finas, una por criterio (nivel medio sobre 4), con la cifra en mono (`text-metric`): no son anillos ni números gigantes. Al lado va la "Prioridad para la próxima" (área + sugerencia) y la línea de comparación ("+8 respecto a tu entrevista anterior de este puesto"), solo si existe.
- `PanelCualitativo` (que ya muestra los niveles desde `formula-de-puntuacion`) añade una lista "Una respuesta completa cubría", con los puntos clave. Ambos se ocultan si la evaluación es antigua.
- La acción "Practicar de nuevo este puesto" enlaza a `/nueva-entrevista?puesto=<codigo>&nivel=<codigo>`. `SeleccionPuestoPage` aprende a leer `nivel` igual que ya lee `puesto`.

Las barras van en Tinta de Evaluador (`vidrio-acento`), sin color por banda: pintar cada criterio según su banda obligaría al cliente a recalcular los cortes 40/60/80 desde un número, y `lib/puntajes.ts` prohíbe justamente eso (los umbrales viven solo en el backend). No se introduce un color nuevo.

## Risks / Trade-offs

- [Respuestas del proveedor sin `puntos_clave` tras el cambio (modelo viejo, cache)] → `parsear_evaluacion` las rechaza como `RespuestaIAInvalida` (502), y el reintento idempotente de `responder()` ya cubre ese caso.
- [Los tests que construyen `Evaluacion` o JSON a mano rompen] → Tarea explícita para actualizar `FakeProveedorIA`, `test_contrato_ia`, `test_validacion` y los fixtures de `test_modelos`.
- [Mezcla de evaluaciones antiguas y nuevas en una misma entrevista] → Solo es posible si el despliegue ocurre a mitad de una entrevista. Los niveles medios por criterio se calculan solo sobre las que los tienen y se indica sobre cuántas ("sobre 3 de 5 respuestas").
- [Tokens de salida extra] → Unos 60–100 por evaluación. Es aceptable y no cambia el número de llamadas.

## Migration Plan

Sin migración de base de datos. Se despliega backend y frontend juntos. El frontend tolera `resumen` ausente o nulo y `criterios` o `puntos_clave` vacíos, así que un frontend nuevo contra un backend viejo no se rompe. Para revertir basta con volver al commit anterior: el JSON extra queda guardado y se ignora.

## Open Questions

- Si conviene mostrar el promedio por criterio también en `/estadisticas/`. Queda fuera de este cambio y no altera este diseño.
