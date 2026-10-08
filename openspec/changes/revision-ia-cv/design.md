## Context

Motivación en `proposal.md`; comportamiento en `specs/revision-de-cv/spec.md`.
Se apoya en `reglas-ats-ampliadas` (`secciones.encabezado()`,
`texto_en_encabezado`, requisitos de experiencia y cargo en la brecha).

Piezas existentes que se reutilizan:

- `ProveedorIA` (ABC) y `ProveedorIAporJSON` con `_pedir_json(sistema, entrada,
  esquema)`: Gemini y Claude ya saben pedir JSON con esquema.
- `FakeProveedorIA` hereda de `ProveedorIA` directamente, determinista y sin red.
- `factory.get_proveedor()` con `_REGISTRO`, por defecto `fake`.
- La taxonomía `ErrorTransitorio` / `ErrorPermanente` / `RespuestaIAInvalida`.
- `ats.py` ya detecta correo, teléfono, URL y nombre (`_CORREO`, `_TELEFONO`,
  `_URL`, `_detectar_nombre`, `_detectar_telefono`).
- `secciones.segmentar()` ya descarta el bloque de encabezado.
- `apps/entrevistas/tests/test_privacidad.py` ya tiene el patrón de proveedor
  espía.
- `tests/test_frontera_con_ia.py` prohíbe hoy cualquier import de la IA desde
  `apps/curriculums` y documenta que debe reescribirse cuando llegue esta fase.

## Goals / Non-Goals

**Goals:**
- Una sola llamada por análisis, con las cuatro tareas en un esquema.
- Que sea mecánicamente imposible que una sugerencia no anclada a la entrada
  llegue al usuario.
- Que un único módulo de la app toque la IA, y que eso se pruebe.

**Non-Goals:**
- Que la IA extraiga requisitos de la convocatoria (introduciría afirmaciones no
  literales en el mapa de evidencia).
- Generar cartas de presentación o CV completos.
- Usar las preguntas probables dentro de la entrevista simulada.

## Decisions

### D1. Minimización antes que enmascarado

Viajan solo: las viñetas sin resultado, los requisitos de la brecha con su
estado, los bloques de `segmentar()` (nunca `encabezado()` ni
`texto_en_encabezado`) recortados a un tope de caracteres, y la convocatoria
recortada (texto público de la empresa, no PII). Sobre los bloques se aplica
además `anonimizar.enmascarar()`.

*Por qué los dos*: el enmascarado puede fallar (un nombre poco común, un
teléfono con formato raro); la minimización cubre lo que no se puede detectar,
como la dirección. Sin secciones reconocidas no hay forma de separar el
encabezado y **no se llama** al proveedor: enviar el texto completo enmascarado
sería apostar a que el enmascarado nunca falla.

### D2. `RevisorDeCV` como `Protocol`, no como método abstracto

`base.py` define `RevisorDeCV` (`Protocol`, `runtime_checkable`) con
`revisar_cv(entrada) -> RevisionDeCV`. `ProveedorIAporJSON` lo implementa con
`_pedir_json`; `FakeProveedorIA` con una respuesta determinista anclada a la
entrada. `factory.get_revisor_de_cv()` obtiene el proveedor y comprueba el
protocolo, lanzando `ProveedorNoDisponible` si no lo cumple.

*Alternativa descartada*: añadir `revisar_cv` como abstracto en `ProveedorIA`.
Obligaría a implementarlo en los dobles de `test_privacidad.py` y
`test_errores.py`, que no tienen nada que ver con CV (segregación de
interfaces).

### D3. Una llamada, cuatro tareas, un esquema

`prompts/revisor_cv.py` define `EntradaDeRevision`, `RevisionDeCV`,
`sistema()`, `usuario()`, `ESQUEMA_REVISION` y `parsear_revision()`, igual que
`entrevistador.py` y `evaluador.py`. Una sola llamada porque las cuatro tareas
leen el mismo contexto: cuatro llamadas cuadruplicarían coste y latencia y
cuadruplicarían también la superficie de fallo.

### D4. Parser anclado

`parsear_revision(datos, entrada)` descarta, sin error:
- viñeta reescrita cuyo `original` no está en `entrada.vinetas`;
- sugerencia cuyo `termino` no está en `entrada.requisitos`;
- corrección cuyo `original` no aparece literal en el texto enviado;
- pregunta cuyo `motivo` no aparece en el texto enviado;
- `puesto_sugerido` que no sea un valor del enum `Puesto` → `None`.

Topes: 5 preguntas, 10 correcciones. Solo si la respuesta no tiene la forma del
esquema se lanza `RespuestaIAInvalida`. Descartar elementos sueltos es lo
esperado; el resto de la revisión sigue siendo útil.

### D5. Prompt contra la invención

El sistema prohíbe: inventar experiencia, cifras o tecnologías; redactar un
requisito ausente como si se tuviera; cambiar el significado de una viñeta. Exige
`[cifra]` como marcador cuando falte un número. Para un requisito ausente pide
cómo aprenderlo o mencionarlo con honestidad ("en formación", proyecto
personal).

### D6. Orquestación fuera de la transacción

`services.analizar()`:
1. Extrae, analiza y guarda dentro de `transaction.atomic()` (como hoy).
2. **Después, fuera**, `revision.preparar_entrada()` → `None` (estado
   `omitida` con motivo) o la entrada; `revision.revisar()` llama al proveedor.
3. Guarda `revision_ia` con un `update` de una sola columna.

Mismo principio que `entrevistas.services.responder()`: un proveedor lento no
debe mantener una fila bloqueada. Los errores de la taxonomía se capturan
**aquí** y dan `no_disponible`, a diferencia de las entrevistas, donde suben al
manejador: aquí la IA es complementaria y el diagnóstico ya está guardado.

En caché: `revision_ia` `null` (análisis anteriores a la migración) o
`no_disponible` → se reintenta solo el paso 2–3.

### D7. `apps/curriculums/revision.py` es la frontera

Único módulo de la app que importa `integrations.ia`. `services.py` lo llama sin
saber de proveedores. El test de frontera se reescribe:
- estático: solo `revision.py` puede importar `integrations.ia`;
- espía: un proveedor registrado en la fábrica guarda cada texto recibido y el
  test comprueba que no contiene el nombre, correo, teléfono ni las líneas del
  encabezado del fixture;
- omisión: con títulos no reconocidos o CV escaneado, el espía no recibe
  ninguna llamada.

### D8. Forma persistida

`AnalisisATS.revision_ia = JSONField(null=True)`:

```
{ "estado": "ok" | "no_disponible" | "omitida",
  "motivo": str,
  "vinetas":      [{ "original", "sugerida" }],
  "requisitos":   [{ "termino", "sugerencia" }],
  "preguntas":    [{ "pregunta", "motivo" }],
  "puesto_sugerido": str | null,
  "correcciones": [{ "original", "sugerido", "tipo" }] }
```

JSON y no tablas, por el mismo motivo que el resto de `AnalisisATS`: es un
resultado, no una entidad que se consulte por partes.

### D9. Frontend por composición

- `SugerenciaIA.tsx`: contenedor con `EtiquetaMono` "Sugerencia de IA"; único
  estilo para las cuatro partes.
- `VinetasDeLogro.tsx` y `BrechaDeRequisitos.tsx` reciben un mapa opcional
  (original → sugerida, término → sugerencia) y lo pintan bajo cada fila. Sin
  revisión, se ven igual que hoy.
- `PreguntasProbables.tsx` y `RevisionDeRedaccion.tsx`, nuevos.
- `AvisoDeRevision.tsx`: una línea para `no_disponible` / `omitida`. No es una
  `Alerta`: el diagnóstico sí llegó.
- `PreguntasProbables` absorbe el bloque "Practicar la entrevista" de
  `CurriculumPage.tsx`, que se elimina. Sin revisión, se muestra el mismo enlace
  sin puesto (respaldo).
- `SeleccionPuestoPage.tsx`: `useSearchParams` como valor inicial de `puesto`;
  `manejarInicio` y el panel usan `puestoElegido` (el objeto encontrado en el
  catálogo) en vez del string, así un código inválido nunca se envía.

## Risks / Trade-offs

- [El enmascarado no detecta un nombre o teléfono raro] → la minimización evita
  enviar el encabezado, donde viven casi siempre; el test espía fija los casos
  conocidos.
- [La IA aún podría sugerir algo poco honesto dentro de una viñeta válida] → el
  prompt lo prohíbe y la sección está rotulada como sugerencia; el usuario
  decide. No se puede garantizar mecánicamente.
- [Coste de API] → una llamada por análisis nuevo, cero en caché, topes de
  entrada y salida; `fake` por defecto.
- [Latencia del POST] → la llamada se suma al tiempo de respuesta. Se acepta
  (el análisis ya es de segundos) frente a introducir tareas en segundo plano,
  que Render free no sostiene sin un worker.
- [Gemini 503 ya observado] → `no_disponible` y reintento al resubir.

## Migration Plan

1. `0007_analisisats_revision_ia`: `AddField` nulable, reversible.
2. Los análisis existentes tienen `revision_ia = null` y se completan al volver
   a subir el CV.
3. Rollback: revertir la migración; el frontend trata la ausencia del campo
   igual que `null`.
