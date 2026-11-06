## 1. Servidor con hilos

- [x] 1.1 En `backend/build.sh`, documentar el comando de inicio `gunicorn config.wsgi:application --workers 2 --threads 8 --timeout 120`, con el porqué en el comentario.

## 2. Backend: marca de fallo y una sola evaluación

- [x] 2.1 Agregar `Intercambio.evaluacion_fallida_en` (`DateTimeField(null=True, blank=True)`) y crear la migración `entrevistas/0013`.
- [x] 2.2 En `services.responder()`:
  - limpiar la marca al empezar el reintento;
  - envolver `calificar` y el bloque `atomic` en `try / except ErrorProveedorIA`: marcar con `update` y volver a lanzar el error;
  - dentro del `atomic`, hacer `select_for_update` del intercambio; si ya está evaluado, devolver esa evaluación sin crear otra ni generar la siguiente pregunta;
  - actualizar el docstring.
- [x] 2.3 En `views.py`, hacer que `_pregunta_dict(..., con_estado=True)` sume `respuesta`, `respondido_en` y `evaluacion_fallida`, y usarlo solo en `EntrevistaDetailView`.
- [x] 2.4 Tests nuevos (`test_reanudar.py`):
  - la marca se pone ante `ErrorTransitorio` en la evaluación y en la generación de la siguiente pregunta, y se limpia con un reintento exitoso;
  - `TiempoAgotado` no la pone;
  - el detalle publica `respuesta`, `respondido_en` y `evaluacion_fallida`, e `iniciar` y `responder` no cambian su forma;
  - una evaluación guardada por «otra petición» entre `calificar` y `guardar` (simulada) deja una sola evaluación, una sola siguiente pregunta y un 200.

## 3. Backend: errores de IA

- [x] 3.1 En `integrations/ia/base.py`, extraer `_pedir_y_parsear`, que reintenta una vez ante `RespuestaIAInvalida`, y hacer que lo usen todas las operaciones de `ProveedorIAporJSON`.
- [x] 3.2 En `apps/common/exceptions.py`, agregar `codigo` (`ia_ocupada`, `ia_rechazo` o `ia_respuesta_invalida`) a cada rama de IA, sin nombrar al proveedor.
- [x] 3.3 Tests:
  - el `codigo` de cada tipo de error;
  - el mensaje no contiene el nombre del proveedor;
  - un JSON inválido seguido de uno válido da éxito;
  - dos inválidos seguidos dan `RespuestaIAInvalida`.
  - Las copias de los prompts (`test_prompts_estables`) deben seguir sin cambios.

## 4. Frontend: reloj anclado

- [x] 4.1 En `tiempo.ts`, agregar `AnclaDelReloj` y `anclaDelReloj`, cambiar `segundosRestantes(ancla, ahoraMonotonico)` y quitar `desfaseDelReloj`. Actualizar `tiempo.test.ts`.
- [x] 4.2 En `usePeticion`, guardar `recibidoEn: performance.now()` en la caché y exponerlo.
- [x] 4.3 Hacer que `useEntrevistaEnCurso` y `SeleccionPuestoPage` (`enCursoDelConflicto`) anclen con `recibidoEn`.
- [x] 4.4 En `useEntrevista`:
  - reanclar con cada respuesta del servidor;
  - resincronizar en `visibilitychange → visible`.

## 5. Frontend: reanudar sin repetir

- [x] 5.1 Tipos: `PreguntaPendiente` suma `respuesta`, `respondido_en` y `evaluacion_fallida` en el detalle (`types/entrevista.ts`, `api/entrevistas.ts`).
- [x] 5.2 Crear `features/entrevista/reanudar.ts` con `queHacerConLaPendiente`, `ESPERA_MAXIMA_MS` e `INTERVALO_DE_CONSULTA_MS`, y `reanudar.test.ts` con:
  - el caso sin respuesta;
  - la marca de fallo;
  - menos y más de 2 minutos;
  - el borde exacto.
- [x] 5.3 En `useEntrevista`:
  - reconstruir sin duplicar la pendiente;
  - el estado `esperandoEvaluacion`, con la consulta cada 3 s y su `AbortController`;
  - el estado de fallo;
  - `respuestaGuardada` en lugar de `ultimaRespuesta`;
  - ante un error de IA (con `codigo`), dejar la burbuja y pasar a fallo; sin código, retirarla como hasta ahora.
- [x] 5.4 En `EntrevistaPage`:
  - el aviso «Evaluando tu respuesta…» (`aria-live="polite"`);
  - bloquear el campo y deshabilitar «Abandonar» mientras espera;
  - el fallo con `AlertaDeIA` (boceto 2).

## 6. Frontend: aviso único de IA

- [x] 6.1 Crear `lib/erroresDeIA.ts` (`TITULO_DE_ERROR_DE_IA` y `errorDeIA`) y `erroresDeIA.test.ts`.
- [x] 6.2 Crear `components/ui/AlertaDeIA.tsx` sobre `Alerta`: título, detalle y acción opcional; solo tokens (`estilos.test.ts`).
- [x] 6.3 Usarlo en:
  - el chat («Tu respuesta está guardada; no la pierdes.» con [Reintentar]);
  - `ModalDeInicio` («No se creó la entrevista; puedes intentarlo de nuevo.»);
  - `PanelDeConvocatoria` («Tu texto sigue aquí.»).
  - Un error sin código sigue mostrándose como antes.
- [x] 6.4 Quitar el bloque de error pintado a mano en `EntrevistaPage` y cualquier import que quede muerto.

## 7. Prueba de carga

- [x] 7.1 Hacer que `FakeProveedorIA` lea `IA_FAKE_LATENCIA_MS` (0 por defecto) y duerma ese tiempo en cada operación, con un test de que vale 0 si no se define.
- [x] 7.2 Crear `config/settings/carga.py`, que hereda de `local` y sube los *throttles*.
- [x] 7.3 Crear `backend/tests/carga/locustfile.py` (registro, inicio, 5 respuestas e historial) y su `README.md` (cómo correrlo con 25, 50 y 100 usuarios, y cómo leer p50, p95 y errores). Agregar `locust` a `requirements/local.txt`.
- [x] 7.4 Comprobar que `python manage.py test` no descubre `tests/carga/` como tests de Django.

## 8. Documentación y verificación

- [x] 8.1 Actualizar `CLAUDE.md`:
  - el comando de inicio y su porqué;
  - la marca de fallo y la regla de recargar sin reenviar;
  - la garantía de una sola evaluación;
  - los códigos de error de IA y `AlertaDeIA`;
  - el reloj anclado;
  - la prueba de carga;
  - el número de tests.
- [x] 8.2 Backend: `python manage.py test`, `makemigrations --check` y `python -m tests.integration.test_prompts_estables` (sin diferencias).
- [x] 8.3 Frontend: `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm run lint` (5 advertencias) y `pnpm run build`.
- [x] 8.4 `openspec validate reanudar-sin-repetir-y-errores-de-ia --strict`.

## 9. Cierre (lo hace Jorge)

- [ ] 9.1 `python manage.py migrate` (0013).
- [ ] 9.2 En Render, cambiar el comando de inicio a `gunicorn config.wsgi:application --workers 2 --threads 8 --timeout 120`.
- [ ] 9.3 Pruebas manuales:
  - recargar durante la evaluación (sin pregunta repetida y con la siguiente apareciendo sola);
  - fallo de la IA con [Reintentar] tras recargar (con `FakeProveedorIA(fallar_en=…)` o sin clave);
  - 3 pestañas o usuarios respondiendo a la vez;
  - iniciar otra entrevista con una en curso;
  - el reloj con la hora del dispositivo mal puesta.
- [ ] 9.4 Correr Locust con 25, 50 y 100 usuarios (`IA_FAKE_LATENCIA_MS=12000`: dos llamadas por respuesta ≈ 25 s; ver `tests/carga/README.md`) y anotar los resultados.
- [ ] 9.5 Tesis: «Limitaciones y trabajo futuro», con el texto de escalabilidad de `design.md` y los resultados de Locust.
- [ ] 9.6 No hacer commit; lo hace Jorge.
