## Context

- **`apps/entrevistas/services.py`**
  - `MINUTOS_PARA_ABANDONO = 30` mide inactividad.
  - `marcar_abandonadas(usuario)` pasa a `ABANDONADA` las entrevistas cuya última respuesta, o su `fecha_inicio`, tiene más de 30 minutos. Lo hace en una sola sentencia y **sin escribir `fecha_fin`**.
  - Solo la llama el GET del historial (`views.py:53`).
  - `abandonar()` es un `update` condicionado a `EN_PROGRESO` (409 `EntrevistaNoEnCurso`).
  - `responder()` guarda la respuesta, la evalúa fuera de la transacción y luego, dentro de ella, guarda la evaluación y genera la siguiente pregunta o finaliza. Es idempotente ante reintentos.
- **`ResponderView`** devuelve 409 si el estado no es `EN_PROGRESO`. **`ResultadosView`** usa `con_evaluacion=not en_progreso`, así que una abandonada publica sus notas, su `resumen` y su `veredicto`.
- **`EntrevistaSerializer.puntuacion_parcial`** publica la media de una abandonada. `selectors._con_conteo` anota `preguntas_calificadas` y `promedio_calificado`. `EntradaDeVeredicto.parcial` cambia el texto del prompt del redactor.
- **`fecha_inicio`** es `auto_now_add`. `services.iniciar()` crea la fila antes de pedir el calentamiento a la IA, así que el reloj arranca al pulsar «Comenzar».
- **Frontend**
  - `components/ui/Cronometro.tsx` es un cronómetro **ascendente**, informativo. Cuenta desde que se monta el componente, no desde `fecha_inicio`, y solo lo usa `EntrevistaPage`.
  - `useEntrevista` redirige al reporte si el estado no es `en_progreso`.
  - `useEntrevistaEnCurso` busca la `en_progreso` en el historial cacheado y pide su estado.
  - `PuntuacionGlobal` tiene la rama «Nota parcial».
  - `TablaDeEntrevistas` pinta «N · parcial».

## Goals / Non-Goals

**Goals:**
- un límite total de 30 minutos que el servidor hace cumplir en cada acceso;
- tres estados de cierre;
- nota solo para las finalizadas;
- retroalimentación sin puntajes para el resto;
- una cuenta regresiva honesta.

**Non-Goals:**
- un límite por pregunta;
- pausar el reloj;
- un planificador o tarea programada (el plan gratuito no tiene uno fiable);
- reclasificar las abandonadas viejas;
- cambiar la rúbrica, el evaluador o el plan de 5 preguntas;
- el Inicio (`inicio-con-resumen`, todavía no creado), que podrá leer `fecha_limite` cuando exista.

## Decisions

### Límite total, derivado, no guardado
`MINUTOS_DE_ENTREVISTA = 30` reemplaza a `MINUTOS_PARA_ABANDONO` en `services.py`. `Entrevista.fecha_limite` es una propiedad: `fecha_inicio + timedelta(minutes=MINUTOS_DE_ENTREVISTA)`. No hace falta una columna:
- una entrevista cerrada ya no depende del valor;
- una en curso usa el valor vigente.

*Alternativa descartada:* guardar `fecha_limite`. Agrega una columna y un backfill sin ganar nada mientras la duración sea fija.

### Estado nuevo `TIEMPO_AGOTADO`
Se declara `Estado.TIEMPO_AGOTADO = "tiempo_agotado", "Tiempo agotado"`. Cabe en `max_length=20`. La migración `0010` solo altera `choices`: no cambia la base de datos y es reversible.

Para decidir entre `ABANDONADA` y `TIEMPO_AGOTADO` se cuentan las **respuestas** (`respuesta != ''`), no las evaluaciones. Una respuesta guardada a tiempo, cuya evaluación falló, sigue siendo una respuesta.

### Cierre por vencimiento: una regla, dos formas
- **`cerrar_vencidas(usuario)`** reemplaza a `marcar_abandonadas`:
  - filtra `EN_PROGRESO` con `fecha_inicio < ahora - 30 min` y anota `Count` de las respuestas no vacías;
  - hace dos `update` por subconsulta de claves, uno a `ABANDONADA` (0 respuestas) y otro a `TIEMPO_AGOTADO` (≥ 1);
  - el costo es constante, como antes;
  - `fecha_fin` se escribe como `F("fecha_inicio") + timedelta(...)`, que es el instante del límite y no el de la consulta.
- **`cerrar_si_vencio(entrevista) -> bool`** aplica la misma regla a una sola entrevista:
  - usa un `update` condicionado a `EN_PROGRESO`, como `abandonar()`, para no pisar una `FINALIZADA` concurrente;
  - termina con `refresh_from_db()`.
- **Dónde se llama:**
  - `cerrar_vencidas` en el GET del historial;
  - `cerrar_si_vencio` en `EntrevistaDetailView`, `ResultadosView` y `ResponderView`, antes de mirar el estado.

### Responder al borde del límite
Lo que importa es **cuándo llegó la respuesta**, no cuándo terminó la IA.

En `ResponderView`, si el intercambio pendiente **no tiene respuesta guardada** y ya venció:
- `cerrar_si_vencio` y 409 «Se acabó el tiempo de esta entrevista.»;
- el texto no se guarda.

Si ya **tiene** respuesta guardada, porque es el reintento de un envío hecho a tiempo, se evalúa igual. Dentro de `responder()`, tras guardar la evaluación:
- si es la última pregunta, se llama a `_finalizar` como siempre;
- si no, y el límite ya venció, se cierra como `TIEMPO_AGOTADO` en vez de generar la siguiente. Eso evita pagar una pregunta que nadie podrá responder.

La comprobación vive en `services` (lanza una excepción `TiempoAgotado`) para que la vista solo la traduzca a 409.

### Solo `FINALIZADA` tiene nota, y se oculta en la API
**`IntercambioSerializer`** cambia `con_evaluacion: bool` por el contexto `evaluacion`, con tres valores:
- `"completa"`: `FINALIZADA`;
- `"sin_nota"`: `TIEMPO_AGOTADO` y `ABANDONADA`. Devuelve solo `fortalezas`, `debilidades` y `sugerencias`, sin `puntuacion`, `niveles` ni `puntos_clave`;
- `None`: `EN_PROGRESO`.

Por defecto es `"completa"`, para que los usos que hoy no pasan contexto no cambien.

**Otros cambios en la API:**
- `ResultadosView` devuelve `resumen` y `veredicto` solo para `FINALIZADA`;
- `pedir_veredicto` lanza `EntrevistaNoFinalizada` (409) fuera de `FINALIZADA`, que reemplaza a `EntrevistaEnCurso`;
- `redactar_veredicto` solo se llama tras `_finalizar`, como ya pasa;
- se quitan `EntrevistaSerializer.puntuacion_parcial` y la anotación `promedio_calificado`, si queda sin uso;
- `preguntas_calificadas` se mantiene, porque alimenta «Respondiste k de N», y se comenta de nuevo.

En `selectors`, `resumen_de` ya no ve abandonadas, así que se quita su rama «parcial». `anterior_comparable` ya filtraba `FINALIZADA`.

*Por qué en la API:* es la misma razón que ya documenta `CLAUDE.md`. Ocultarlo solo en la interfaz lo dejaría visible en la pestaña de red.

### El redactor deja de tener modo parcial
Se quitan `EntradaDeVeredicto.parcial`, su rama en `prompts/veredicto.py` y en `fake.py`, y el caso `parcial=True` de `test_prompts_estables.py`. Se regeneran las copias `.txt` y se revisa el diff: solo debe desaparecer el texto «no se terminó».

### Reloj: el servidor manda, el cliente cuenta
`EntrevistaSerializer` agrega `fecha_limite` y `ahora` (`timezone.now()` al serializar).

El cliente calcula el desfase una vez por carga, como `desfase = Date.now() - Date.parse(ahora)`, y cuenta `restante = fecha_limite - (Date.now() - desfase)`. Un reloj del dispositivo adelantado o atrasado no altera la cuenta.

**`features/entrevista/tiempo.ts`** (puro, con Vitest):
- `segundosRestantes(fechaLimite, ahoraServidor, ahoraCliente)`;
- `formatoReloj(s)` → `mm:ss`;
- `tramoDelReloj(s)`, que devuelve `normal`, `aviso5` (≤ 300), `aviso1` (≤ 60) o `vencido` (≤ 0);
- `minutosRestantes(s)`, redondeado hacia arriba, para el sidebar.

**Componentes:**
- `components/ui/Cronometro.tsx` se **elimina** (quedaría como código muerto) y se reemplaza por `features/entrevista/components/RelojDeEntrevista.tsx`:
  - es la misma píldora `bg-vidrio-ink`, con el icono `reloj`;
  - en `aviso5` y `aviso1` usa los tokens `progreso-*` y `error-*`;
  - un `sr-only aria-live="polite"` anuncia «Quedan 5 minutos» y «Queda 1 minuto», una sola vez por tramo.
- `useEntrevista` expone `fechaLimite` y el desfase. En 0 bloquea `CampoRespuesta` y vuelve a pedir `obtenerEstado`, cuya vista ya cierra la entrevista y redirige al reporte con `replace`.
- Un 409 al responder también lleva al reporte, en vez de mostrar «Reintentar».

**Textos:**
- bajo la cabecera, «Tienes 30 minutos para las N preguntas. Tu calificación aparece solo si terminas la entrevista.»;
- en el modal de abandonar, «…no tendrá nota y no podrás retomarla.»

### Sidebar
`useEntrevistaEnCurso` agrega `segundosRestantes`, calculado con los mismos `fecha_limite` y `ahora` del estado. Si ya venció, devuelve `null`. `SidebarAccionPrincipal` muestra «Continuar · n/total · m min»; con el sidebar plegado, eso va en el tooltip. Se refresca cada minuto con un intervalo propio, sin volver a pedir datos.

### Reporte y historial
- **`ResultadosPage`**: con estado distinto de `finalizada`, renderiza `ReporteSinNota`, un componente nuevo de la feature:
  - el encabezado de siempre, con el `Badge` del estado;
  - una `Tarjeta` con «Respondiste k de N. Sin nota: la entrevista no se completó.» y «Volver a intentarlo», hecho con `clasesDeBoton` sobre un `Link` a `/simular-entrevista?puesto=&nivel=`;
  - la lista de `PreguntaDeLaTranscripcion`.
- **Se quita** la rama «Esta entrevista no tiene respuestas calificadas.».
- **`PreguntaDeLaTranscripcion`**: si `evaluacion.puntuacion` no viene, omite «(Puntaje: X/100)» y la línea de la operación.
- **`PuntuacionGlobal`**: se quitan `parcial` y «Nota parcial».
- **`useVeredicto`**: solo se pide para `finalizada`.
- **`TablaDeEntrevistas`**: se quita el bloque de `puntuacion_parcial`; fuera de `finalizada`, la nota es «—».
- **`lib/estados.ts`, `Badge`**: `tiempo_agotado` toma el tono `progreso`; `abandonada` queda `neutro`.

### Al aplicar
- **Sin siguiente pregunta al cerrar.** Si una respuesta guardada a tiempo termina de evaluarse con el límite vencido, `ResponderView` devuelve `siguiente_pregunta: null` aunque exista la segunda de calentamiento sin responder. El chat va al reporte siempre que no haya siguiente.
- **«Respondiste k de N» cuenta respuestas en el cliente** (`respuesta !== ''`), no `preguntas_calificadas`. Así una respuesta cuya evaluación falló sigue contando, igual que en la regla del cierre. `preguntas_calificadas` queda para el desglose.
- **`tieneNota` vive en `features/resultados/reporte.ts`, no en `types/`,** porque ahí solo hay tipos.
- **`/resultados` de una entrevista en curso redirige al chat:** no tiene reporte.
- **`DESIGN.md` no nombra el reloj ni la cabecera del chat:** no hubo cambios.

## Risks / Trade-offs

- **[El usuario pierde la respuesta que estaba escribiendo cuando vence]**
  - El reloj avisa a los 5 minutos y a 1 minuto.
  - El 409 lo explica.
  - En una entrevista real pasa igual.
- **[La espera de la IA, de 2 a 15 s por respuesta, consume tiempo del candidato]**
  - En 5 preguntas suma menos de 1,5 minutos.
  - La regla «cuenta cuándo llegó» evita que la última evaluación lenta lo castigue.
- **[Las abandonadas viejas pierden la nota parcial que ya mostraban]**
  - Sus evaluaciones siguen en la base de datos y se ven como retroalimentación.
  - Es coherente con la regla nueva.
  - Se anota en la tesis.
- **[Cambio de contrato (`puntuacion_parcial`, `evaluacion` sin nota)]**
  - El único cliente es este frontend.
  - Se cambia en el mismo paso.
- **[Abrir el detalle ahora puede escribir (cerrar una vencida)]**
  - Es idempotente y condicionado al estado, igual que el GET del historial, que ya escribía.
- **[La tesis describe el abandono por inactividad y la nota parcial]**
  - Jorge actualiza las reglas de negocio y los estados.

## Migration Plan

- `0010` altera `choices` de `Entrevista.estado` y no requiere backfill.
- Para revertir: revertir el código y `migrate entrevistas 0009`. Si quedaran filas en `tiempo_agotado`, habría que pasarlas a `abandonada` a mano antes, cosa que se dice en la migración.
