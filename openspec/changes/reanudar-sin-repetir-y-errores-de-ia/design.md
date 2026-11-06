## Context

- **Producción:** `backend/build.sh` documenta como comando de inicio `gunicorn config.wsgi:application`. Por defecto eso es 1 *worker* `sync`: atiende una petición a la vez y la corta a los 30 s. `responder()` mantiene la petición abierta durante 2 llamadas a la IA, entre 10 y 40 s.
- **`services.responder()`** sigue este orden: guarda la respuesta → `calificar` (fuera de la transacción) → `atomic`: `guardar` la evaluación y generar la siguiente pregunta o finalizar.
  - `Evaluacion` es `OneToOne` con `Intercambio`, así que dos peticiones a la vez hacen que la segunda reviente con `IntegrityError` (500).
  - Ningún error de la IA queda registrado en el intercambio.
- **El detalle (`EntrevistaDetailView`)** devuelve `pregunta_pendiente = _pregunta_dict(selectors.intercambio_pendiente(...))`, que es el primer intercambio **sin evaluación**, tenga o no respuesta. `_pregunta_dict` solo publica número, texto y área.
- **`useEntrevista`:**
  - reconstruye el chat con los intercambios que tienen `respuesta !== ''` y les agrega la pendiente; si esta ya tiene respuesta, se pinta dos veces;
  - `reintentar` usa `ultimaRespuesta`, un estado en memoria que se pierde al recargar;
  - el reloj usa `desfaseDelReloj(ahora, Date.now())` y cuenta con `Date.now()`.
- **`usePeticion`** guarda en caché `{valor, momento}` durante 30 s. `useEntrevistaEnCurso` y `SeleccionPuestoPage` calculan el desfase con el `ahora` que viene en la caché y con `Date.now()` del momento en que la leen.
- **Errores de IA:** `apps/common/exceptions.py::manejador_de_excepciones` responde `{detail}` con 503 o 502. En el frontend, `mensajeDeError(err, porDefecto)` muestra ese `detail`.
  - En el chat, el error se pinta a mano en `EntrevistaPage` (`bg-error-fondo`…).
  - Existe `components/ui/Alerta.tsx`.
- **Proveedores:**
  - los SDK reintentan 2 veces con espera (`max_retries=2`), y `ProveedorEnCadena` pasa al siguiente proveedor ante cualquier `ErrorProveedorIA`;
  - un `RespuestaIAInvalida`, en cambio, no se reintenta en el mismo proveedor.

## Goals / Non-Goals

**Goals:**
- que una respuesta guardada nunca se vuelva a pedir y se evalúe una sola vez;
- que recargar solo **observe** y no reenvíe nada;
- un único formato para los errores de la IA, sin nombrar al proveedor;
- que el reloj no dependa de la hora del dispositivo, ni de la antigüedad de la caché, ni de que alguien cambie la hora del sistema;
- que la demo funcione con 2 o 3 usuarios a la vez, con una medición reproducible de cuánto aguanta.

**Non-Goals:**
- Redis, una cola de tareas, workers, SSE o un cortacircuitos (ver «Escalabilidad y trabajo futuro»);
- un reintento automático al iniciar entrevistas;
- cambiar los textos de la revisión del CV o del veredicto, que ya tienen su respaldo;
- mostrar al usuario qué proveedor falló.

## Decisions

### 1. Gunicorn con hilos
El comando de inicio es `gunicorn config.wsgi:application --workers 2 --threads 8 --timeout 120`.

- **Por qué hilos y no más procesos:** el trabajo es casi todo esperar a la red. Con 16 hilos y 2 procesos caben en los 512 MB del plan gratuito.
- **El timeout de 120 s** queda por encima de los 90 s que espera el cliente en `responder`.
- **Alternativa descartada:** `gevent`, que exige parchear Django y el SDK de la IA, para no ganar nada a esta escala.

Se documenta en `build.sh` y en `CLAUDE.md`. Jorge lo cambia en el panel de Render.

### 2. La marca de fallo vive en `Intercambio`
- **Campo:** `Intercambio.evaluacion_fallida_en = DateTimeField(null=True, blank=True)`, en la migración `0013`, como un `ADD COLUMN` reversible y sin relleno. Es una fecha y no un booleano porque dice *cuándo* falló, y la misma columna sirve para un registro futuro.
- **Cuándo se pone:** `responder()` envuelve `calificar` y el bloque `atomic` en `try / except ErrorProveedorIA`. Ante el error, hace `Intercambio.objects.filter(pk=…).update(evaluacion_fallida_en=now)`, fuera de la transacción deshecha, y vuelve a lanzar el error. Así el manejador sigue traduciéndolo a HTTP.
- **Cuándo se borra:** al empezar un reintento, se limpia antes de llamar a la IA. Si la petición vuelve a fallar, se vuelve a poner.
- **Lo que no la pone:** `TiempoAgotado` y `SinIntercambioPendiente` no son fallos de la IA.
- **Alternativa descartada:** solo la regla de 2 minutos, sin columna. Tras un fallo real, el usuario esperaría hasta 2 minutos para ver «Reintentar». La regla queda como respaldo para un servidor reiniciado, que no alcanza a marcar nada.

### 3. Una sola evaluación por respuesta
- **El bloqueo:** dentro del `atomic`, antes de `guardar`, se toma `Intercambio.objects.select_for_update().get(pk=intercambio.pk)`.
- **Si ya hay evaluación,** porque otra petición la guardó mientras esta esperaba a la IA, se devuelve la existente sin crear otra. Tampoco se genera la siguiente pregunta, porque la otra petición ya lo hizo o lo hará dentro de su transacción, que tiene el bloqueo.
- **El costo:** la llamada a la IA de la petición perdedora se paga igual. Evitarlo obligaría a bloquear la fila durante la llamada a la IA, que el diseño actual evita a propósito.
- **Lo que ve la vista:** `ResponderView` ya responde con `intercambio_pendiente` tras `refresh_from_db`, así que ambas peticiones devuelven la misma siguiente pregunta.

### 4. Lo que publica la pregunta pendiente
- `_pregunta_dict` suma `respuesta` (el texto o `""`), `respondido_en` (ISO o `null`) y `evaluacion_fallida` (bool) **solo en el detalle**: se le pasa `con_estado=True`.
- `iniciar` y `responder` siguen devolviendo la misma forma.
- **Por qué publicar el texto de la respuesta:** es del propio usuario, que ya lo ve en `/resultados/`. Así el chat puede pintarlo y reintentar sin depender de la memoria.

### 5. La decisión del chat es lógica pura
`features/entrevista/reanudar.ts` define:

```ts
export const ESPERA_MAXIMA_MS = 120_000
export const INTERVALO_DE_CONSULTA_MS = 3_000
export type Reanudacion = 'responder' | 'esperar' | 'fallo'
export function queHacerConLaPendiente(p: {respuesta: string; respondidoEn: string | null; fallida: boolean}, ahoraServidor: string): Reanudacion
```

La regla:
- sin respuesta → `responder`;
- con respuesta y marcada como fallida → `fallo`;
- `ahoraServidor − respondidoEn ≥ ESPERA_MAXIMA_MS` → `fallo`;
- en otro caso → `esperar`.

La comparación usa solo horas del servidor, así que no depende del dispositivo. Se prueba con Vitest.

**`useEntrevista`:**
- **Reconstruir:** filtra los anteriores por `respuesta !== ''` **sin contar la pendiente**. Si la pendiente tiene respuesta, pinta la pregunta y la respuesta y fija el estado `esperando` o `fallo`.
- **Esperar:** consulta `obtenerEstado` cada 3 s con `AbortController`, y aplica la misma función en cada vuelta.
  - si cambió el número de la pendiente, agrega la siguiente pregunta;
  - si la entrevista ya no está en curso, va a `alReporte`;
  - si un error de red interrumpe la consulta, sigue intentando hasta el plazo.
- **Reintentar:** `reintentar()` usa la respuesta guardada, tomada de la pendiente (`respuestaGuardada`), no `ultimaRespuesta` en memoria. Llama a `responder(id, respuestaGuardada)`, y el backend ignora el texto porque ya hay una respuesta guardada.
  - **Dónde vive el texto:** tras un fallo **sin** recargar, la respuesta también queda en el servidor, porque `responder` la guardó antes de llamar a la IA. Por eso `respuestaGuardada` se fija al enviar y se reemplaza al reconstruir. `ultimaRespuesta` desaparece.
- **Lo que se expone:** `esperandoEvaluacion` (bool), que `EntrevistaPage` usa para el aviso «Evaluando tu respuesta…» (`aria-live="polite"`), para bloquear el campo y para deshabilitar «Abandonar», junto con `enviando`.

**Lo que no cambia:**
- el error de envío sigue retirando la burbuja local cuando la respuesta **no** llegó a guardarse; si el servidor responde con un error de IA, la respuesta sí se guardó y la burbuja se queda;
- se distingue por el `codigo` de IA: sin código (red caída antes de llegar), se retira la burbuja y queda lo escrito para reenviar, como hasta ahora.

### 6. Un reintento ante un JSON inválido, en un solo lugar
En `ProveedorIAporJSON`, el paso común de pedir y parsear se extrae a `_pedir_y_parsear(sistema, entrada, esquema, parsear)`, que reintenta **una** vez si `parsear` lanza `RespuestaIAInvalida`. Las operaciones (`generar_*`, `evaluar_respuesta`, `revisar_cv`, `analizar_convocatoria`) pasan a usarlo, y el redactor también, si sigue el mismo patrón.

Los prompts no cambian: `test_prompts_estables` debe seguir en verde. El fake no se toca.

### 7. Códigos de error y un aviso único
- **Backend:** `manejador_de_excepciones` agrega `codigo` a cada rama de IA:
  - `ProveedorNoConfigurado` y `ErrorTransitorio` → `ia_ocupada`;
  - `ErrorPermanente` y `ErrorProveedorIA` genérico → `ia_rechazo`;
  - `RespuestaIAInvalida` → `ia_respuesta_invalida`.
  - Los documentos (400) no cambian.
- **Frontend:**
  - `lib/erroresDeIA.ts` exporta `TITULO_DE_ERROR_DE_IA` (código → título) y `errorDeIA(err): {codigo, titulo} | null`, que lee `ErrorAPI.datos.codigo`; se prueba con Vitest;
  - `components/ui/AlertaDeIA.tsx` recibe `titulo`, `detalle` (qué se conserva) y `accion` (`{texto, onClick}`), y reutiliza `Alerta`.
- **Uso:**
  - el chat, en el lugar del bloque de error pintado a mano;
  - `ModalDeInicio` (con el error que hoy pasa `SeleccionPuestoPage`);
  - `PanelDeConvocatoria`.
  - Un error sin código sigue el camino actual de `mensajeDeError`.

### 8. El reloj anclado y monotónico
En `tiempo.ts`:

```ts
export interface AnclaDelReloj { restanteMs: number; recibidoEn: number }  // recibidoEn = performance.now()
export function anclaDelReloj(fechaLimite: string, ahoraServidor: string, recibidoEn: number): AnclaDelReloj
export function segundosRestantes(ancla: AnclaDelReloj, ahoraMonotonico: number): number
```

- `desfaseDelReloj` desaparece: era código que quedaría muerto. `formatoReloj`, `tramoDelReloj`, `minutosRestantes` y `etiquetaDeContinuar` no cambian.
- **`usePeticion`:** guarda `recibidoEn: performance.now()` junto al valor en la caché y lo expone. `useEntrevistaEnCurso` y `SeleccionPuestoPage` arman el ancla con ese `recibidoEn`, no con el instante en que leen la caché.
- **`useEntrevista`:** arma el ancla con cada respuesta (detalle, `responder` y cada consulta mientras espera). En `visibilitychange → visible` vuelve a pedir `obtenerEstado` y reancla.
- **Por qué:** `performance.now()` puede no avanzar mientras la laptop está suspendida, y la resincronización corrige eso.

### 9. Prueba de carga
- **Archivos:** `backend/tests/carga/locustfile.py` y un `README.md` con los comandos y cómo leer el resultado.
- **Qué hace cada usuario:** se registra, inicia sesión, inicia una entrevista, responde las 5 preguntas con una pausa de 2 a 5 s y consulta el historial.
- **Configuración:** `config/settings/carga.py` hereda de `local` y sube los *throttles* (`evaluar`, registro e inicio de sesión), porque los usuarios simulados salen de una sola IP o superan los límites por hora. Ese archivo no se usa en producción.
- **`FakeProveedorIA`:** lee `IA_FAKE_LATENCIA_MS` (0 por defecto) y duerme ese tiempo en cada operación, para imitar la IA real sin gastar cuota. Los tests no lo definen, así que siguen siendo instantáneos.
- **Dependencias:** `locust` solo en `requirements/local.txt`.

## Escalabilidad y trabajo futuro (texto para la tesis)

**Capacidad estimada, con la configuración de este cambio.** El cálculo usa la ley de Little (L = λ·W):
- 100 personas entrevistándose a la vez, con 5 respuestas en 30 minutos, envían en promedio 1 respuesta cada 3 s;
- cada respuesta ocupa un hilo unos 25 s;
- por lo tanto, en promedio hay unos 8 hilos ocupados de 16.

En el servidor caben unos 100 usuarios **escalonados**. Hay dos límites reales:
1. **La cuota por minuto del proveedor de IA.** 100 usuarios generan unas 40 llamadas por minuto.
2. **El arranque simultáneo de un curso entero.** 100 inicios a la vez saturan los 16 hilos.

Con la configuración anterior (1 *worker* `sync`), el límite eran unos 5 a 10 usuarios, y las evaluaciones de más de 30 s se cortaban. Estas cifras son estimaciones; la prueba de carga (decisión 9) las mide.

| Escala | Qué se agrega | Por qué |
|---|---|---|
| Decenas (este cambio) | Gunicorn con hilos; marca de fallo; recargar solo observa | El trabajo es esperar a la red; se garantiza una sola evaluación |
| Cientos | Redis: caché y límite de tasa por proveedor | No superar la cuota de la IA y quitar lecturas repetidas |
| Miles | Cola de tareas (Celery o RQ) y workers; `responder` → 202; aviso por SSE; tarea programada que cierra las vencidas; cortacircuitos por proveedor | Ninguna petición espera a la IA; los workers escalan solos |
| Decenas de miles | Varias instancias web, PgBouncer, réplica de lectura y métricas | Conexiones a Postgres y observabilidad |

```
Navegador --POST--> Web (N, sin estado) --encola--> Redis --> Workers (M) --> IA
    ^                      |                                   |
    '---- SSE "lista" ---- PostgreSQL <--- guarda evaluación --'
```

**Por qué no ahora:**
- el alcance es académico, con decenas de usuarios;
- el presupuesto es cero: un worker de fondo y Redis cuestan en Render;
- cada servicio extra es un punto más de fallo en la demo.

**Lo que se reutiliza al migrar:**
- `services.responder()` pasa a ser el cuerpo de la tarea;
- la marca de fallo pasa a ser el estado de la tarea;
- la UI que «observa sin reenviar» ya es el cliente de un 202;
- las restricciones de la base de datos garantizan la idempotencia.

En resumen, migrar cambia *quién* ejecuta el trabajo, no la lógica ni la API.

## Risks / Trade-offs

- **[El hilo perdedor de una carrera paga una llamada a la IA]** → Es raro (doble clic o dos pestañas en el mismo segundo) y no daña los datos.
- **[`performance.now()` no avanza mientras la laptop está suspendida en algunos sistemas]** → Se resincroniza en `visibilitychange`, y el servidor decide igual.
- **[Consultar cada 3 s mientras se evalúa]** → Solo mientras alguien espera, con un GET liviano y sin *throttle* de evaluación. Son unas 10 consultas por respuesta.
- **[Un reintento ante un JSON inválido alarga el peor caso]** → Una llamada más, dentro del timeout de 120 s. Con la cadena configurada, el siguiente proveedor sigue disponible si el reintento también falla.
- **[16 hilos y conexiones a Postgres]** → Django abre una conexión por hilo activo (hasta 16), dentro del límite del Postgres gratuito.
- **[`config/settings/carga.py` sube los *throttles*]** → Solo se carga con `DJANGO_SETTINGS_MODULE` explícito y no existe en Render.

## Migration Plan

1. **`entrevistas/0013`**: `AddField`, reversible.
2. **El comando de inicio en Render**: si no se actualiza, todo funciona igual que hoy, solo que con menos capacidad.
3. **Para revertir:** volver la migración y el comando de inicio. El campo nuevo de la API es aditivo, así que un frontend anterior lo ignora.
