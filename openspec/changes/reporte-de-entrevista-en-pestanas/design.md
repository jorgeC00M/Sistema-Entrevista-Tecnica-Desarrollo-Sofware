## Context

`ResultadosPage` hoy pinta en una sola columna:
- un encabezado (sesión, título, estado y duración);
- `ResumenFinal`, con la nota en `ChipPuntaje`, las barras de los 3 criterios, la diferencia con la entrevista anterior, «Prioridad para la próxima» y el criterio más débil;
- un `PanelCualitativo` por pregunta, con la pregunta, la respuesta, `DesgloseDeNota`, los puntos clave y fortalezas / debilidades / sugerencias;
- «Practicar de nuevo este puesto» y «Ver historial».

Los datos salen de `GET /resultados/`. Su `resumen` (`selectors.resumen_de()`) se arma sin IA, y lo fija un test con un espía.

`services.responder()` sigue este orden:
1. guarda la respuesta;
2. `calificar()`, fuera de la transacción;
3. dentro de `transaction.atomic()`, `guardar()` y, en la última pregunta, `_finalizar()`.

El cliente llama a `responder` con el timeout por defecto de 45 s. Sin `siguiente_pregunta`, navega a `/resultados`.

Lo que decidió Jorge:
- el veredicto lo escribe la IA en una llamada final **dentro del último «Enviar»**, con reglas de respaldo;
- se mantienen los 3 criterios, con nombres más claros en pantalla;
- «Retroalimentación» queda fuera.

## Goals / Non-Goals

**Goals:**
- un reporte por pestañas que se lea de arriba abajo;
- un veredicto en palabras que nunca ponga en riesgo el cierre de la entrevista ni la nota;
- borrar los componentes que dejan de usarse.

**Non-Goals:**
- cambiar la rúbrica, los pesos, la fórmula, el evaluador o sus prompts;
- tocar «Historial y progreso» o «Retroalimentación»;
- agregar criterios («Uso de ejemplos»);
- poner la pestaña en la URL.

## Decisions

### Veredicto (backend)

- **Rol separado del evaluador.** `integrations/ia/prompts/veredicto.py` define:
  - `EntradaDeVeredicto(contexto, respuestas: tuple[RespuestaEvaluada, ...], parcial: bool)`, donde `RespuestaEvaluada` lleva `numero`, `area`, `puntuacion`, `niveles`, `fortalezas` y `debilidades`;
  - `sistema()`, `usuario(entrada)` y `ESQUEMA` con `{veredicto: str}`;
  - `parsear_veredicto(datos) -> str`.

  El evaluador no cambia, así que sigue siendo una función pura de (contexto, área, pregunta, respuesta). **No se envía el texto de las respuestas**: el redactor resume lo que ya se evaluó y no puede volver a calificar.
- **Guardas del parser.** El texto se descarta (`RespuestaIAInvalida`) si:
  - queda vacío tras `strip`;
  - pasa de 600 caracteres;
  - contiene `%`, `/100`, «sobre 100» o un número seguido de «puntos»;
  - coincide con `_CONCLUYE_APTITUD`.

  Esa expresión pasa de `revisor_cv.py` a `prompts/guardas.py`, y los dos módulos la importan: es la misma promesa («no juzgamos aptitud») en dos pantallas. Los marcadores de máscara no aplican, porque aquí no hay datos personales.
- **Contrato.** `Protocol RedactorDeVeredicto` en `base.py`, con `redactar_veredicto(entrada) -> str`:
  - `ProveedorIAporJSON` lo implementa con `_pedir_json`, y así Gemini, Claude y los compatibles con OpenAI lo heredan;
  - `FakeProveedorIA` devuelve un texto determinista y neutro;
  - `ProveedorEnCadena` lo intenta con los eslabones que lo implementan.

  `factory.get_redactor_de_veredicto()` no filtra por `apto_para_datos_personales`: las evaluaciones no son datos personales, igual que la convocatoria enmascarada. Como en `RevisorDeCV`, no es un método abstracto de `ProveedorIA`, para que los dobles de prueba de la entrevista no tengan que implementarlo.
- **Dónde se llama.** Al final de `responder()`, **después** del `with transaction.atomic()` y solo si la entrevista quedó `FINALIZADA`, se llama `redactar_veredicto(entrevista, proveedor)`:
  - usa el mismo proveedor (la cadena) de la petición;
  - un `ErrorProveedorIA` se guarda como `{"estado": "no_disponible", "version": 1}` y no se propaga.

  Al quedar fuera de la transacción, un fallo nunca deshace la evaluación ni el cierre. Y como ya pasó `_finalizar()`, un reintento del cliente no vuelve a evaluar nada: la entrevista ya no tiene intercambio pendiente.
- **Persistencia.** `Entrevista.veredicto_ia = JSONField(null=True, blank=True)`, migración `0009_veredicto_ia`: un `ADD COLUMN` reversible, sin backfill (una migración nunca llama a la IA). Su forma es `{"estado": "ok" | "no_disponible", "texto": str, "version": 1}`. `None` significa que nunca se pidió.
- **Endpoint de respaldo.** `POST /api/entrevistas/<id>/veredicto/` → `services.pedir_veredicto(usuario, pk)`:
  - 404 si es ajena (`entrevista_del_usuario`);
  - 409 si está `EN_PROGRESO`;
  - devuelve el guardado si es `ok`; si no, lo redacta y lo guarda.

  Lleva el throttle `veredicto` y corre fuera de cualquier transacción. Cubre el «Reintentar», las abandonadas (ni `abandonar()` ni `marcar_abandonadas()` llaman a la IA: la segunda cierra en lote) y las entrevistas anteriores a este cambio.
- **Publicación.** `ResultadosView` agrega la clave `veredicto`: `null` mientras la entrevista está `EN_PROGRESO` (igual que `resumen`) y si no, `entrevista.veredicto_ia`. La clave existe siempre, así que la forma de la respuesta no cambia con el estado.
- **Prompt fijado.** El sistema y el usuario del caso fijo se copian a `tests/fixtures/prompts/` y los compara `test_prompts_estables.py`.

### Último «Enviar» (frontend)

- `responder()` en `api/entrevistas.ts` pasa a `timeoutMs: 90_000`, porque son dos llamadas seguidas a la IA.
- En la última pregunta, el chat dice «Evaluando tu última respuesta y escribiendo tu veredicto…».
- Si el cliente corta igual, el servidor ya finalizó: al recargar, `useEntrevista` navega a resultados, como hoy.

### Reporte (frontend)

- **Página.** `ResultadosPage` muestra:
  - el encabezado: «Ver historial» como `Link`, `EtiquetaMono` con la sesión y puesto · tecnología · nivel, `Badge` de estado y duración;
  - `Pestanas` («Resumen», «Plan de mejora», «Transcripción»), `repartir` en el celular, sobre un `role="tabpanel"`. La pestaña vive en el estado, con «Resumen» al entrar.

  Los paneles inactivos no se montan, salvo el hook del veredicto, que vive en la página.
- **Componentes nuevos** en `features/resultados/components/`:
  - `PuntuacionGlobal`: nota, banda, parcial y diferencia;
  - `VeredictoDeLaIA`: los estados ok, pidiendo, no disponible y reglas;
  - `DesgloseDeLaEvaluacion`: las barras;
  - `FortalezasYDebilidades`;
  - `PlanDeMejora`, con los tres bloques;
  - `PreguntaDeLaTranscripcion`, un `<details>`/`<summary>` nativo, con burbujas IA / Tú y «Análisis IA», que reutiliza `DesgloseDeNota` y `ListaRetroalimentacion`.

  `ResumenFinal` y `PanelCualitativo` se eliminan. Su contenido se reparte sin perder nada: la prioridad pasa a «Temas a repasar» y los puntos clave al análisis.
- **Disposición.** Desde 1024 px, la puntuación y el veredicto van en la fila `lg:grid-cols-[1fr_2fr] gap-6`, el mismo tercio que la dona del CV, y fortalezas | debilidades en `lg:grid-cols-2`. Los tres bloques del plan van en `lg:grid-cols-3`. Por debajo de 1024 px, todo se apila en el orden del DOM.
- **Reglas puras.** `features/resultados/reporte.ts`, con test en Vitest:
  - `fortalezasYDebilidades(intercambios)`: la primera oración (`primeraFrase`) de cada texto, sin repetir el mismo punto;
  - `temasARepasar(intercambios)`;
  - `consejoDeComunicacion(criterio)`, con un texto fijo por código;
  - `practicaRecomendada(entrevista, banda, niveles)`, que da el nivel siguiente en el orden del catálogo solo con «Sólido»;
  - `veredictoPorReglas(resumen)`.
- **Nombres de criterio.** `rubricaPorDefecto.ts` exporta `ORDEN_DE_CRITERIOS` y `NOMBRE_EN_PANTALLA` por código (reemplazan a `CRITERIOS_POR_DEFECTO`, que repetía el nombre del servidor): «Conocimiento técnico (corrección)», «Profundidad (completitud)», «Claridad». El reporte lo usa en lugar de `rubrica.criterios[].nombre`, que no cambia porque llega del prompt del evaluador.
- **Hook.** `useVeredicto(id, inicial)`:
  - con `inicial === null` y la entrevista no en progreso, llama a `pedirVeredicto` una vez;
  - con `no_disponible`, solo expone `reintentar`.

  Anuncia los cambios en una región `sr-only` `aria-live`.
- **Íconos.** Con `Icono`, nunca emojis: `fortaleza`, `mejora` y los que ya existen en `trazosDeIconos.ts`, sin agregar trazos si no hace falta.

## Risks / Trade-offs

- **[El último «Enviar» tarda el doble, de 10 a 40 s]** → Decisión de Jorge. Se mitiga con el texto de espera, el timeout de 90 s y la navegación a resultados al recargar.
- **[Una llamada más por entrevista, de 9 a 10]** → Se guarda una sola vez y nunca se repite al reabrir.
- **[El veredicto podría contradecir las notas]** → Recibe solo las evaluaciones y su parser descarta notas, porcentajes y aptitud. La nota está siempre al lado, calculada.
- **[El perfil de tesis no menciona un redactor]** → Se anota para actualizar el documento, como pasó con Senior y Videojuegos.
- **[Las entrevistas anteriores piden su veredicto al abrirse]** → Es una sola llamada por entrevista, la primera vez.

## Migration Plan

`0009_veredicto_ia` es reversible y sin backfill. Para revertir el frontend se vuelve a los componentes anteriores; el endpoint y la clave `veredicto` se pueden quedar sin efecto.
