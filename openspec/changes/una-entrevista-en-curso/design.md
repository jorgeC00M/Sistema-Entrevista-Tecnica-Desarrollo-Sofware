## Context

- **`services.iniciar()`** crea la `Entrevista` y pide el calentamiento a la IA dentro de un `transaction.atomic()`. No comprueba si ya hay otra en curso.
- **`cerrar_vencidas` / `cerrar_si_vencio`** (`tiempo-limite-de-entrevista`) cierran por tiempo. `abandonar()` es un `update` condicionado a `EN_PROGRESO`.
- **`EntrevistaListCreateView.post`** valida con `IniciarEntrevistaSerializer` y llama a `iniciar`. Hoy no hay ningún 409 en el alta.
- **`useEntrevistaEnCurso`** está montado una sola vez, en `RutaProtegida` vía `useSidebar`.
  - Pide `historial` y, si hay una en curso, `estado-entrevista-<id>` para «n/total».
  - `usePeticion` guarda el dato en el estado de cada instancia. `invalidarCache(clave)` solo borra la caché del módulo: las instancias montadas no se enteran.
- **`ModalDeInicio`** es un `ModalDeConfirmacion` con Cancelar y «Comenzar». `SeleccionPuestoPage.iniciar()` llama a `iniciarEntrevista` y, si falla, muestra el error en el modal.

## Goals / Non-Goals

**Goals:**
- nunca dos entrevistas en curso;
- nunca perder una sin decidirlo;
- poder abandonar y empezar en un paso;
- un sidebar fiel sin recargar la página.

**Non-Goals:**
- pausar una entrevista;
- permitir varias en curso de puestos distintos;
- notificaciones en tiempo real entre pestañas (una pestaña vieja se corrige con el 409 o al navegar);
- el Inicio (`inicio-con-resumen`, todavía no creado).

## Decisions

### El índice manda, el servicio explica
`Entrevista.Meta.constraints` agrega `UniqueConstraint(fields=["usuario"], condition=Q(estado="en_progreso"), name="una_entrevista_en_curso_por_usuario")`, un índice parcial de Postgres. Es la misma idea que `UniqueConstraint(entrevista, numero)` en la idempotencia: la base de datos garantiza la regla, el código solo da el buen mensaje.

`services.iniciar(..., abandonar_en_curso=False)` sigue este orden:
1. `cerrar_vencidas(usuario)`, fuera de la transacción.
2. Dentro del `atomic()` que ya existe, `select_for_update()` de la `en_progreso` del usuario, si la hay:
   - sin la opción, lanza `HayEntrevistaEnCurso(entrevista)`;
   - con la opción, hace el `update` condicionado de `abandonar()` (reutilizado: `abandonar()` pasa a aceptar que se lo llame dentro de una transacción, sin cambiar su contrato).
3. `create` y el calentamiento, como hoy. Si la IA falla, se deshace todo, abandono incluido.
4. Un `IntegrityError` del índice en el `create`, por dos pestañas a la vez, se captura y se relanza como `HayEntrevistaEnCurso` con la que ganó.

*Alternativa descartada:* solo la comprobación en el servicio. No resiste dos pedidos simultáneos.

### El 409 lleva la entrevista
La vista responde `409 {"detail": "Ya tienes una entrevista en curso.", "entrevista_en_curso": EntrevistaSerializer(...)}`, con `fecha_limite` y `ahora`. Así el frontend arma el modal de conflicto con datos del servidor aunque su caché esté vieja. `abandonar_en_curso` es un `BooleanField(default=False)` en `IniciarEntrevistaSerializer`.

### Migración con limpieza previa
La `0011` hace dos cosas, en este orden:
1. Una `RunPython`: por usuario con más de una `en_progreso`, deja la más reciente (`-fecha_inicio`, `-pk`) y pasa las demás a `ABANDONADA` con `fecha_fin = now`. Al revertir es noop, y lo dice.
2. `AddConstraint`.

Si en Postgres el `AddConstraint` choca con los eventos pendientes de la `RunPython` en la misma transacción (el caso que documenta `CLAUDE.md` para `curriculums`), se parte en `0011_cerrar_sobrantes` y `0012_una_en_curso`.

### Caché que avisa
`hooks/usePeticion.ts` agrega un registro de oyentes a nivel de módulo, `Map<clave, Set<() => void>>`:
- cada instancia montada se suscribe a su clave en un efecto;
- `invalidarCache(clave)` borra la entrada y llama a los oyentes de esa clave, que suben `intento` y vuelven a pedir;
- `invalidarCache()` sin clave (logout) solo borra, sin disparar peticiones mientras se cierra la sesión;
- `recargar` pasa a ser `invalidarCache(clave)`, para no duplicar.

**Quién invalida `'historial'`:**
- `SeleccionPuestoPage` tras iniciar;
- `EntrevistaPage` tras abandonar;
- `useEntrevista.alReporte`, que cubre finalizar, vencer y el 409.

Son tres eventos: la lista no se vuelve a pedir en cada navegación.

### Sidebar sin «n/total»
`useEntrevistaEnCurso` deja de pedir `obtenerEstado`:
- `fecha_limite` y `ahora` vienen en la fila del historial;
- devuelve `{id, puestoDisplay, segundosRestantes}`;
- se va la clave `estado-entrevista-<id>`.

`SidebarAccionPrincipal` arma su etiqueta con una función pura en `features/entrevista/tiempo.ts`, `etiquetaDeContinuar(segundos)`, que devuelve «Continuar · m min», y `tramoDelReloj` decide el tono:
- `normal`: el acento de siempre;
- `aviso5` y `aviso1`: `bg-progreso-fondo text-progreso-texto`, el ámbar del reloj del chat.

En el tooltip plegado: «Continuar entrevista — <puesto> · quedan m min».

### «Simular entrevista» y el modal
**`SeleccionPuestoPage`:**
- usa `useEntrevistaEnCurso()` y comparte la caché con el sidebar;
- muestra arriba un `Alerta` informativo con «Tienes una entrevista en curso: <puesto> · quedan m min» y `EnlaceDeAccion` «Continuarla» (ícono `play`, `aria-label` con el puesto);
- guarda `conflicto: EntrevistaEnCurso | null`, que se llena desde el hook al abrir el modal o desde el cuerpo de un 409;
- `iniciar(abandonar = false)`.

**`ModalDeInicio`**, con la prop `enCurso`:
- usa `Modal` directo, porque `ModalDeConfirmacion` solo tiene Cancelar y Confirmar;
- el cuerpo dice la entrevista en curso, los minutos y la consecuencia;
- las acciones son «Continuar la de <puesto>» (primario, foco inicial, navega a `/entrevista/<id>`) y «Abandonarla y empezar» (`peligro`, `cargando` mientras corre);
- X y Esc cierran sin hacer nada;
- sin `enCurso`, es el modal de siempre.

Para el foco inicial, se usa lo que ya hace `Modal` con su primer enfocable, o un `autoFocus` en ese botón si `Modal` no lo garantiza. Se comprueba al aplicar.

### Al aplicar
- **Las migraciones quedaron separadas desde el principio** (`0011_cerrar_en_curso_sobrantes`, `0012_una_entrevista_en_curso`). El test de la limpieza confirmó el riesgo: crear el índice en la misma transacción que filas recién escritas da «no se puede hacer CREATE INDEX … eventos de trigger pendientes».
- **El proveedor de IA se resuelve después de la comprobación.** Así un 409 ni siquiera lo construye. Lo detectó el test con un espía sobre `get_proveedor`.
- **El aviso no es `Alerta`,** porque `Alerta` es solo para errores (`role="alert"`). Es `AvisoDeEntrevistaEnCurso`, con `role="status"` y el ámbar de «en progreso».
- **El foco inicial va por la prop nueva `Modal.focoAlAbrir`.** `showModal()` enfoca la X, y `autoFocus` de React se aplica antes de `showModal()`, que lo pisa.
- **El sidebar también se invalida al abrir una entrevista que ya se cerró** (vencida al abrirla desde un sidebar viejo). Es un cuarto punto, en la carga de `useEntrevista`.
- **Los oyentes de `usePeticion` no tienen test propio:** el proyecto no tiene tests de componentes ni de hooks con DOM. Sí lo tienen la etiqueta (`etiquetaDeContinuar`) y todo el backend.

## Risks / Trade-offs

- **[Una pestaña vieja no ve la entrevista nueva]** → El 409 la corrige en el momento de iniciar, y el sidebar se actualiza al navegar por los tres eventos. No hay tiempo real, y está bien: el servidor siempre manda.
- **[`IntegrityError` dentro del `atomic`]** → Rompe la transacción. Se envuelve el `create` en un `atomic()` anidado (savepoint) para poder capturarlo y leer la que ganó.
- **[Tests existentes que crean varias `en_progreso` para un usuario]** → Fallarían por el índice. Se cierran las anteriores o se usan usuarios distintos.
- **[Abandonar es destructivo]** → Hay una sola acción explícita, en estilo de peligro, con la consecuencia escrita, y el foco empieza en la opción segura.

## Migration Plan

1. `migrate` aplica la limpieza y luego el índice.
2. Para revertir: `migrate entrevistas 0010` quita el índice. Las entrevistas que la limpieza cerró no se reabren, y la migración lo advierte.
