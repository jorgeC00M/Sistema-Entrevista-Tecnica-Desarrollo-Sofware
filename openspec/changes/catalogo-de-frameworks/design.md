## Context

`Tecnologia` pertenece a un puesto y tiene `capa` (de `seleccion-por-pasos`). `datos.py` es la fuente única; `cargar_catalogos` hace upsert y nunca borra, y cada cambio de datos va además en una migración que copia los valores literalmente (lo vigila `test_cargar_catalogos_coincide_con_la_migracion`). La IA solo recibe el nombre de la tecnología. Ver proposal.md.

## Goals / Non-Goals

**Goals:** ofrecer frameworks concretos, agruparlos por lenguaje sin añadir un paso, no perder el historial y no tocar la capa de IA.

**Non-Goals:** elegir primero el lenguaje y luego el framework (descartado con el usuario); una opción "Otra" de texto libre; tecnologías de nicho, que se cubren con la convocatoria.

## Decisions

### D1. `grupo` es texto libre de presentación, no un modelo
`Tecnologia.grupo = CharField(max_length=40, blank=True, default="")`.
- Agrupa solo para mostrar: no se valida, no se filtra por él y la IA no lo recibe.
- **Alternativa descartada:** una tabla `Lenguaje`. QA agrupa por tipo de prueba, no por lenguaje, y un modelo con FK sería sobreingeniería para un rótulo.

### D2. Dividir desactiva; precisar renombra
Las tecnologías que se dividen en varios frameworks se desactivan: "Python" de Backend pasa a Django, FastAPI y Flask, y una pregunta sobre "Python" no equivale a una sobre "Django". Las que solo ganan precisión se renombran en la misma fila: "Kotlin (Android)" pasa a "Kotlin (Jetpack Compose)", que es lo que ya se preguntaba. Es el mismo criterio que con los niveles en `0007`/`0009`.

Una consecuencia aceptada: la entrevista local que usaba "C# .NET" de Escritorio se muestra ahora como "C# (WPF / WinForms)".

### D3. Códigos nuevos con prefijo de puesto
Siguen el mismo esquema `<puesto>_<slug>` (`backend_django`, `full_stack_aspnet_core`, `qa_rest_assured`), todos de 30 caracteres o menos. Los existentes que siguen activos (`frontend_react`, `full_stack_react`, `movil_flutter`, `qa_cypress`…) conservan su código.

### D4. Migraciones
- `catalogos/0012_tecnologia_grupo` agrega el campo; es solo esquema.
- `catalogos/0013_frameworks` crea o actualiza las 53 activas con su `orden` y su `grupo`, desactiva las 9 retiradas y renombra las 5 que se precisan.
- La reversión borra las creadas (si alguna entrevista ya usa una, PROTECT lo impide, y es lo correcto), reactiva las retiradas y restaura nombre y orden de las renombradas o reordenadas, a partir de una foto literal del estado de `0011`.

### D5. Frontend: agrupación pura
`seleccion.ts::agruparPorGrupo(tecnologias)` devuelve `[grupo, tecnologias][]` en el orden del catálogo, y tiene su test en Vitest. `EleccionDeTecnologia` pinta, dentro de cada capa, un rótulo por grupo cuando lo hay. Sin grupos, se ve una sola fila, igual que hoy.

## Risks / Trade-offs

- [Full Stack muestra 13 botones] → separados en dos capas y por lenguaje, se leen como tres o cuatro bloques cortos.
- [Hay tests que dependían de `backend_python`] → pasan a `backend_django` (y "Django" en las aserciones de nombre). Los de la capa de IA usan su propio catálogo de prueba y no cambian.
- [El analista de convocatorias ve 53 opciones en su prompt] → son unos cientos de tokens más, aceptable. El anclaje sigue igual.
