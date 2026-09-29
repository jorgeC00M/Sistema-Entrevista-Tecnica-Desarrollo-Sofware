## 1. Backend: corrección, coste y seguridad

- [x] 1.1 Reescribir `marcar_abandonadas` (`apps/entrevistas/services.py:114-136`)
      como una sola sentencia con `annotate(Max("intercambios__respondido_en"))` +
      `Coalesce` + `.update()`; verificar con un test `assertNumQueries` sobre
      `GET /api/entrevistas/` que el número de consultas ya no depende de cuántas
      entrevistas en progreso tenga el usuario (crear 1 y 5, mismo conteo).
- [x] 1.2 Añadir `max_length` a `ResponderSerializer.respuesta`
      (`apps/entrevistas/serializers.py:25`) y a `GoogleLoginSerializer.id_token`
      (`apps/usuarios/serializers.py:42`); verificar con un test que una respuesta
      por encima del límite devuelve 400 y que el proveedor fake no se invoca.
- [x] 1.3 Configurar `ScopedRateThrottle` y `DEFAULT_THROTTLE_RATES` en
      `config/settings/base.py:139-147`, con scopes separados para responder,
      iniciar sesión y registrarse; asignar `throttle_scope` en `ResponderView` y en
      las vistas de auth; verificar con un test que al superar el cupo se responde
      429 y que por debajo del cupo el flujo es normal.
- [x] 1.4 Crear `ProveedorIAporJSON` en `integrations/ia/base.py` con
      `generar_pregunta`/`evaluar_respuesta` concretos y `_pedir_json` abstracto;
      reescribir `gemini.py` y `claude.py` para heredar de ella; verificar que los
      27 tests de `tests/integration/` siguen verdes sin tocarlos.
- [x] 1.5 Añadir timeout y captura de errores de red/timeout en el adaptador de
      Gemini, traducidos a `ErrorTransitorio` (hoy `gemini.py:61-77` solo captura
      `ServerError`/`ClientError`); verificar con un test que simula un fallo de red
      que la respuesta HTTP es 503 y no 500.
- [x] 1.6 Hacer que `ProveedorNoDisponible` (`integrations/ia/factory.py:26`) y los
      fallos por credencial ausente de ambos adaptadores hereden de
      `ErrorProveedorIA`; verificar con un test que pedir una entrevista sin
      credencial configurada devuelve 503 sin traza de error en el cuerpo.
- [x] 1.7 Estrechar el `except ValueError` de `apps/entrevistas/views.py:100` para
      que solo capture el conflicto de estado; verificar con un test que un área sin
      miembro en el enum ya no se reporta como 409 "ya no está en progreso".
- [x] 1.8 Normalizar el correo en el alta por Google (`apps/usuarios/views.py:100`);
      verificar con un test que iniciar sesión con `Jorge@…` cuando ya existe
      `jorge@…` reutiliza la misma cuenta en vez de crear otra.
- [x] 1.9 Añadir `Index(fields=["usuario","estado"])` a `Entrevista.Meta` e índice
      sobre `creado_en` en `Evaluacion.Meta`, generar la migración y verificar que
      `python manage.py migrate` aplica y revierte limpio.
- [x] 1.10 Activar `COERCE_DECIMAL_TO_STRING = False` en la configuración de DRF y
      verificar con un test que `/api/entrevistas/` devuelve `puntuacion_promedio`
      como número.

## 2. Backend: estructura

- [x] 2.1 Crear `apps/evaluaciones/selectors.py` y mover ahí
      `calcular_estadisticas` y `calcular_retroalimentacion`; dejar `services.py`
      solo con escrituras; verificar que los 8 tests de la app siguen verdes.
- [x] 2.2 Crear `apps/catalogos/selectors.py` con el filtrado por `activo` y dejar
      `views.py:25-26` sin ORM directa; verificar con los 8 tests de catálogos.
- [x] 2.3 Crear `apps/usuarios/services.py` con el alta/recuperación de cuenta por
      Google y dejar `views.py:100-105` sin escrituras de dominio; verificar con los
      6 tests de Google ya existentes.
- [x] 2.4 Sustituir las consultas inline de `apps/entrevistas/views.py:57` y
      `services.py:104-106` por los selectors existentes; verificar con la suite de
      la app.
- [x] 2.5 Borrar `apps/common/permissions.py`, la dataclass `Intercambio` de
      `integrations/ia/prompts/schemas.py:45-48`, `apps/common/pagination.py` y su
      registro en `base.py:145-146`, y los dos bloques `if __name__ == "__main__"`
      de los tests; verificar con `manage.py test` que nada los importaba.
- [x] 2.6 Mover `UsuarioTest` de `apps/entrevistas/tests/test_modelos.py:85-104` a
      `apps/usuarios/tests/`, eliminando el test que solapa con
      `test_usuarios.py:50`; verificar que el total de tests baja solo en ese
      duplicado.
- [x] 2.7 Añadir a `tests/conftest.py` una factory de usuario autenticado y adoptarla
      en los 8 archivos que hoy repiten el mismo `create_user` + `force_authenticate`;
      verificar que la suite completa sigue verde.

## 3. Backend: cerrar huecos de test

- [x] 3.1 Tests de `/api/estadisticas/retroalimentacion/`: caso con datos, caso sin
      evaluaciones, y que incluye evaluaciones de entrevistas abandonadas (es la
      diferencia deliberada con `calcular_estadisticas`).
- [x] 3.2 Tests de `rubricas.banda_de` en los límites (0/40/41/60/61/80/81/100) y del
      `ValueError` fuera de rango.
- [x] 3.3 Tests del mapeo de errores de los adaptadores reales: por cada código de
      estado relevante, que produce `ErrorTransitorio` o `ErrorPermanente` según
      corresponda (mockeando el SDK, sin llamadas de red).
- [x] 3.4 Test del rollback documentado en `services.py:61-64`: fallo al generar la
      pregunta N+1 después de guardar la evaluación deja el intercambio sin evaluar
      y permite reintentar sin duplicar.

## 4. Frontend: capa de datos

- [x] 4.1 Crear `src/hooks/usePeticion.ts` con `{datos, cargando, error, recargar}`,
      `cargando` en estado explícito, `AbortSignal` y caché corta por clave;
      verificar manualmente que un endpoint que responde 200 con cuerpo vacío deja
      de colgar el spinner.
- [x] 4.2 Migrar `useCatalogos.ts` y `useCatalogosPublicos.ts` a un único hook sobre
      `usePeticion` (hoy son el mismo archivo con otro nombre); verificar que la
      landing y `/nueva-entrevista` siguen mostrando áreas y niveles.
- [x] 4.3 Migrar `useRetroalimentacion.ts`, `ResultadosPage.tsx:22-39` y
      `HistorialPage.tsx:22-42` a `usePeticion`, extrayendo hooks propios para las
      dos páginas que hoy hacen fetching inline; verificar cada pantalla en el
      navegador.
- [x] 4.4 Migrar `useDestinosDisponibles.ts` a `usePeticion` y quitar la dependencia
      de `[pathname]`; verificar en la pestaña de red que navegar entre secciones ya
      no repite `GET /api/entrevistas/` y que entrar a `/historial` lo pide una sola
      vez.
- [x] 4.5 Añadir timeout con `AbortSignal` y deduplicación del refresh en
      `src/api/client.ts`; verificar que dos peticiones concurrentes con token
      caducado producen un solo `POST /token/refresh`.
- [x] 4.6 Añadir el canal `alPerderSesion` en `client.ts` y registrarlo desde
      `AuthProvider`; verificar que al fallar el refresh la aplicación vuelve a la
      landing en vez de quedarse en el dashboard mostrando errores.
- [x] 4.7 Crear un error boundary y montarlo en `App.tsx` y por ruta; verificar
      forzando un error de render que aparece el estado de error con acción de
      recuperación en vez de pantalla en blanco.

## 5. Frontend: reconciliar el sistema de diseño

- [x] 5.1 Borrar `components/ui/{Card,Input,Modal}.tsx` y `hooks/useFocusTrap.ts`;
      verificar con `tsc --noEmit` que nadie los importaba.
- [x] 5.2 Borrar las variantes y ramas que nunca se renderizan (`Boton`
      `primario`/`secundario`, `BotonIcono` `claro`, `Avatar` `claro`, `Spinner`
      `claro`, `Badge` `error`, `Alerta` `exito`/`info`, `EtiquetaMono` `oscuro`, la
      rama de `etiqueta` de `Textarea`); verificar con `tsc` y `build`.
- [x] 5.3 Cambiar `outline-iris-600` por `outline-vidrio-acento` en `Boton.tsx:73`;
      verificar que el anillo de foco es el mismo en un botón de la landing y uno del
      dashboard.
- [x] 5.4 Sustituir en `features/auth/*` los ~30 literales hexadecimales por los
      tokens `vidrio-*` equivalentes; verificar en pantalla que login y registro se
      ven idénticos a antes (es el único cambio con riesgo visual real).
- [x] 5.5 Fundir `features/auth/components/iconosAuth.tsx` en
      `components/ui/Icono.tsx` (el trazo de marca es idéntico) y actualizar sus
      consumidores; verificar visualmente los iconos de los campos de auth.
- [x] 5.6 Borrar de `styles/index.css` las familias `tinta-*` e `iris-*`, los tokens
      de texto sin uso (`headline-lg`, `body-lg`, `body-md`, `label-sans`,
      `code-block`), `--radius-superficie` y el `@import` de IBM Plex; pasar `body` a
      la paleta `vidrio`; verificar con un grep que no queda ninguna referencia y que
      el build no pierde estilos.
- [x] 5.7 Crear `components/ui/Tarjeta.tsx` con el patrón de vidrio y adoptarlo en
      los ~20 sitios que hoy repiten la cadena de clases (incluida la constante local
      de `QueRecibes.tsx:37`); verificar visualmente dashboard y landing.
- [x] 5.8 Limpiar los tipos muertos (`ElementoDeCatalogo.orden`,
      `Usuario.last_login`, `DatosDeRegistro.carnet`) y corregir
      `RespuestaIniciarEntrevista.pregunta` a `Pregunta | null`; ajustar
      `types/evaluacion.ts` y las dos pantallas que renderizan
      `puntuacion_promedio` cruda tras el cambio de la tarea 1.10; verificar con
      `tsc` y comprobando que la nota se lee `75` y no `75.00`.

## 6. Frontend: accesibilidad del flujo principal

- [x] 6.1 Dar nombre accesible al campo de respuesta (`Textarea.tsx` +
      `CampoRespuesta.tsx`); verificar con el inspector de accesibilidad del
      navegador que el campo se anuncia con su propósito.
- [x] 6.2 Añadir `aria-live` y auto-scroll al hilo de `ChatEntrevista.tsx`; verificar
      haciendo una entrevista completa que lo nuevo queda visible sin desplazarse a
      mano.
- [x] 6.3 Activar el plugin `jsx-a11y` en `.oxlintrc.json`, arreglar lo que señale
      del flujo de entrevista y anotar el resto; verificar que `pnpm run lint` queda
      en un estado conocido y documentado.

## 7. Versionado

- [x] 7.1 Quitar `docs/` y `openspec/` de `.gitignore` y añadirlos al índice con
      `git add`; verificar con `git status` que aparecen como nuevos y con
      `git check-ignore` que ya no están ignorados. El commit lo hace el usuario.

## 8. Verificación final

- [x] 8.1 `python manage.py test` — los 94 tests actuales más los nuevos, todos
      verdes.
- [x] 8.2 `pnpm exec tsc --noEmit`, `pnpm run lint` y `pnpm run build` sin errores.
- [x] 8.3 Grep de cierre: cero `tinta-`/`iris-` en `src/` y cero literales de la
      paleta `vidrio` fuera de `styles/index.css`.
- [ ] 8.4 Recorrido manual con `IA_PROVEEDOR=fake`: registro → login → entrevista
      completa → resultados → historial → retroalimentación → cerrar sesión,
      confirmando en la pestaña de red que no hay peticiones duplicadas.
