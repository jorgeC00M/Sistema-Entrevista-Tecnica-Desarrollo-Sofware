## 1. Modelo y migración

- [x] 1.1 En `apps/entrevistas/models.py`, agregar `UniqueConstraint(fields=["usuario"], condition=Q(estado="en_progreso"), name="una_entrevista_en_curso_por_usuario")`, con un comentario del porqué.
- [x] 1.2 Crear la migración `0011`:
  - `RunPython` que cierra las `en_progreso` sobrantes por usuario: deja la más reciente y pasa las demás a `ABANDONADA` con `fecha_fin = now`; al revertir es noop, y la migración lo advierte;
  - después, `AddConstraint`;
  - si Postgres rechaza las dos operaciones juntas, partirla en `0011` y `0012`.

## 2. Servicio, serializer y vista

- [x] 2.1 Agregar la excepción `HayEntrevistaEnCurso(entrevista)` en `services.py`.
- [x] 2.2 `iniciar(..., abandonar_en_curso=False)`:
  - `cerrar_vencidas(usuario)` primero;
  - dentro del `atomic`, `select_for_update` de la en curso: sin la opción, lanza la excepción; con ella, la abandona (`update` condicionado, reutilizando `abandonar`);
  - el `create` va en un `atomic` anidado, y un `IntegrityError` del índice pasa a `HayEntrevistaEnCurso` con la que ganó;
  - reescribir el docstring.
- [x] 2.3 En `IniciarEntrevistaSerializer`, agregar `abandonar_en_curso = BooleanField(default=False)`.
- [x] 2.4 En `EntrevistaListCreateView.post`, pasar la opción. Con `HayEntrevistaEnCurso`, responder 409 `{detail, entrevista_en_curso}`.

## 3. Tests del backend

- [x] 3.1 Crear `test_una_en_curso.py`. Debe cubrir:
  - el 409 con la en curso en el cuerpo, sin crear nada y sin llamar a la IA (espía);
  - que una vencida no bloquee;
  - que `abandonar_en_curso` deje la anterior `ABANDONADA` y cree la nueva;
  - que, si la IA falla con `abandonar_en_curso`, la anterior quede en curso y no se cree nada;
  - que el índice impida dos `en_progreso` (`IntegrityError` directo en el ORM);
  - la función de limpieza de la migración (con dos o tres en curso, queda la más reciente).
- [x] 3.2 Ajustar los tests existentes que creaban varias `en_progreso` para el mismo usuario: cerrar las anteriores o usar otro usuario.
- [x] 3.3 Ejecutar `python manage.py makemigrations --check` y `python manage.py test` (suite completa, Postgres).

## 4. Frontend: caché y datos

- [x] 4.1 En `hooks/usePeticion.ts`:
  - registro de oyentes por clave;
  - cada instancia se suscribe en un efecto;
  - `invalidarCache(clave)` avisa; sin clave solo borra;
  - `recargar` usa `invalidarCache`;
  - actualizar el docstring.
- [x] 4.2 `api/entrevistas.ts` y `types/entrevista.ts`:
  - `iniciarEntrevista` acepta `abandonar_en_curso`;
  - el tipo `DatosIniciarEntrevista` lo agrega;
  - el 409 se lee con `ErrorAPI.datos.entrevista_en_curso`.
- [x] 4.3 `useEntrevistaEnCurso`:
  - quitar `obtenerEstado`, `numeroActual` y `totalPreguntas`;
  - usar `fecha_limite` y `ahora` de la fila;
  - devolver `{id, puestoDisplay, segundosRestantes}`;
  - reescribir el docstring.
- [x] 4.4 En `features/entrevista/tiempo.ts`, crear `etiquetaDeContinuar(segundos)` («Continuar · m min»), con su caso en `tiempo.test.ts`.

## 5. Frontend: sidebar

- [x] 5.1 `SidebarAccionPrincipal`:
  - la etiqueta «Continuar · m min»;
  - con `tramoDelReloj` en `aviso5` o `aviso1`, el tono ámbar (`progreso-*`);
  - el tooltip plegado, «Continuar entrevista — <puesto> · quedan m min».

## 6. Frontend: «Simular entrevista»

- [x] 6.1 `SeleccionPuestoPage`:
  - el aviso arriba con `Alerta` + `EnlaceDeAccion` «Continuarla» cuando hay una en curso;
  - el estado `conflicto`;
  - `iniciar(abandonar = false)`;
  - con un 409, llenar `conflicto` desde el cuerpo;
  - tras iniciar, `invalidarCache('historial')`.
- [x] 6.2 `ModalDeInicio`, con la prop `enCurso`:
  - el cuerpo con la en curso, los minutos y la consecuencia;
  - las acciones «Continuar la de <puesto>» (primario, foco inicial, navega) y «Abandonarla y empezar» (`peligro`);
  - X y Esc cierran sin acción;
  - reescribir el docstring.
- [x] 6.3 Comprobar el foco inicial de `Modal`. Si no cae en «Continuar…», usar `autoFocus` en ese botón.

## 7. Frontend: chat

- [x] 7.1 En `EntrevistaPage`, tras abandonar, llamar a `invalidarCache('historial')`.
- [x] 7.2 En `useEntrevista.alReporte`, también `invalidarCache('historial')`, que cubre finalizar, vencer y el 409.

## 8. Documentación y verificación

- [x] 8.1 Actualizar `CLAUDE.md`:
  - en el sidebar, «Continuar · m min», el ámbar y que se actualiza por `invalidarCache`;
  - en la sección del límite, una en curso por usuario (índice, 409, `abandonar_en_curso`);
  - en la pantalla de selección, el aviso y el modal de conflicto;
  - en `usePeticion`, los oyentes.
- [x] 8.2 `grep` en `frontend/src`: `estado-entrevista-`, y `numeroActual` / `totalPreguntas` en `components/layout`. No debe quedar ninguno.
- [x] 8.3 Ejecutar `pnpm exec tsc --noEmit`, `pnpm test` (con `estilos.test.ts`), `pnpm run lint` (deben quedar 5 advertencias) y `pnpm run build`.
- [x] 8.4 Ejecutar `openspec validate una-entrevista-en-curso --strict`.

## 9. Cierre (lo hace Jorge)

- [ ] 9.1 `python manage.py migrate` (aplica 0011, y 0012 si se partió).
- [ ] 9.2 Pruebas manuales:
  - empezar una entrevista → «Continuar» aparece sin recargar;
  - entrar a «Simular entrevista» → se ve el aviso;
  - «Iniciar» → el modal, con el foco en «Continuar la de…» y Enter va a la entrevista;
  - «Abandonarla y empezar» → la anterior queda Abandonada;
  - terminar o abandonar → «Continuar» desaparece;
  - con 5 minutos o menos → ámbar;
  - dos pestañas → la segunda recibe el modal de conflicto.
- [ ] 9.3 En la tesis, agregar la regla «una entrevista en curso a la vez».
- [ ] 9.4 No hacer commit; lo hace Jorge.
