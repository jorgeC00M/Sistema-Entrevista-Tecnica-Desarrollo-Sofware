## Context

Tres exploraciones de solo lectura (backend, frontend y repositorio/configuración), con verificación posterior, dejaron este diagnóstico:

- **Sin código muerto grave en producción.** Hay restos de funcionalidades retiradas: reexportaciones en `documentos/ats.py:29-30`, el índice `creado_en` de `Evaluacion`, `lib/puntajes.ts::obtenerNivel`, 12 `export` usados solo dentro de su archivo y 6 docstrings que hablan de la retroalimentación acumulada o del archivo de convocatoria.
- **Duplicación:**
  - el formato de fecha, en 3 lugares;
  - `TIMEOUT_SEGUNDOS`, en los 3 adaptadores de IA;
  - el hash de texto, en `curriculums/models.py` y `entrevistas/convocatorias.py`;
  - 5 bloques `except → 409` en `entrevistas/views.py`;
  - `filter(activo=True)` repetido en `entrevistas/serializers.py`;
  - tres `MAXIMO_CARACTERES_*CONVOCATORIA*` con valores distintos (20 000, 5000 y 3000).
- **Capas:**
  - el cambio de contraseña y sus tokens viven en la vista;
  - `ConvocatoriaSerializer.get_perfil` consulta el catálogo;
  - `catalogos/views.py::_rubrica` arma datos de dominio;
  - `ResultadosView` decide la visibilidad por estado;
  - `features/entrevista/tiempo.ts` lo importan inicio y seleccion, y `BurbujaPregunta` lo importa resultados;
  - las excepciones de `entrevistas/services.py` están dispersas (una se usa antes de definirse);
  - `evaluaciones/consistencia/__init__.py` tiene 115 líneas de lógica;
  - `tests/integration/test_contrato_ia.py` importa `apps.*`.
- **Escala:**
  - sin `CACHES`, así que los *throttles* van en memoria por proceso;
  - `router/index.tsx` importa las 11 páginas de entrada;
  - `usePeticion` no comparte las peticiones en curso (el `historial` se pide dos veces), deja ver los datos de la clave anterior, no limpia la caché y escribe una ref durante el render;
  - `conn_max_age=600` sin `conn_health_checks`.
- **Tamaño:** `ats.py` 812 líneas, `entrevistas/services.py` 443, `SeleccionPuestoPage.tsx` 376 y `useEntrevista.ts` 324.
- **`CLAUDE.md`:** 410 líneas y 112 KB, con mucha historia. Está en `.gitignore`.

## Goals / Non-Goals

**Goals:**
- que no quede código muerto ni comentarios falsos;
- una sola fuente para cada lógica repetida;
- respetar las capas (vistas → services/selectors; features → lib/ui compartidos);
- *throttles* correctos con varios procesos;
- carga bajo demanda;
- archivos con una responsabilidad clara;
- un `CLAUDE.md` útil y corto.

**Non-Goals:**
- cambiar la API o lo que el usuario ve, salvo lo corregido en A;
- cambiar los prompts (`test_prompts_estables` debe seguir en verde);
- paginar en el servidor;
- archivar los cambios de OpenSpec pendientes;
- agregar Redis o colas.

## Decisions

### A. Funciones rotas (ya aplicadas)
1. **`CampoRespuesta`** acepta 2000 caracteres, el mismo `MAXIMO_CARACTERES_RESPUESTA` del backend.
2. **`useFocusTrap`** guarda en una ref el valor anterior de `activo` y devuelve el foco solo en la transición `true → false`. Sale el `eslint-disable`.
3. **`useEntrevista.cargar`** usa un `AbortController`: pasa `signal` a las dos peticiones y sale si se canceló tras cada `await`.
4. **`ResponderView`** vuelve a pedir la entrevista con `selectors.entrevista_del_usuario` (`refresh_from_db` no recalcula anotaciones). Lo cubre `test_responder_devuelve_el_conteo_al_dia`.
5. **`_con_conteo`** agrega `"convocatoria"` al `select_related`.
6. **`VistaPreviaEntrevista`** guarda solo el temporizador vigente (la cadena tiene uno pendiente a la vez) y lo limpia al desmontar.

### B. Limpieza
- **Backend:**
  - se borran `URL` y `telefonos` de `ats.py` (nadie los importa desde ahí);
  - migración `evaluaciones/000X_quitar_indice_creado_en` (`RemoveIndex`, reversible);
  - se corrigen los docstrings señalados.
- **Frontend:**
  - se borra `obtenerNivel` y se quita `export` a los 12 símbolos usados solo en su archivo;
  - los campos de `types/` que reflejan la API se quedan, porque documentan el contrato.
- **`.env.example`:** se agregan `ANTHROPIC_MODEL` e `IA_FAKE_LATENCIA_MS`.
- **Raíz:**
  - se borra `sh.exe.stackdump`;
  - `backups/*.sql` (datos personales) no se toca: se avisa a Jorge para que lo mueva fuera del proyecto;
  - se actualiza `README.md` (psycopg3, settings separados, pnpm).

### C. Una sola fuente
- **Fechas:** `lib/fechas.ts::fechaCorta` (o el nombre que encaje con las funciones que ya existen), con su test, que reemplaza las 3 copias.
- **Avisos de error:** los bloques de error hechos a mano pasan a `Alerta`, solo donde el aspecto no cambia.
- **IA:** `integrations/ia/base.py` exporta `TIMEOUT_SEGUNDOS` y `MAX_REINTENTOS`, que importan los 3 adaptadores.
- **Hash:** `apps/common/textos.py::hash_de_texto`, con la misma normalización que `curriculums/models.py`. Lo usan los dos modelos, y un test fija que los hashes de ejemplo no cambian (la caché depende de ellos).
- **Conflictos 409:**
  - nueva clase `apps/common/exceptions.py::ConflictoDeDominio(ValueError)`;
  - el manejador central la traduce a `409 {"detail": str(exc)}`;
  - heredan de ella `TiempoAgotado`, `SinIntercambioPendiente`, `EntrevistaNoEnCurso`, `EntrevistaNoFinalizada` y la del abandono, y las vistas dejan de capturarlas;
  - `HayEntrevistaEnCurso` también hereda, pero su vista la sigue capturando para agregar `entrevista_en_curso`;
  - los tests existentes fijan los códigos.
- **Catálogo activo:** los `queryset` de `entrevistas/serializers.py` usan los selectores activos de `catalogos/selectors.py`.
- **Constantes:** se renombran sin cambiar los valores: `MAXIMO_CARACTERES_CONVOCATORIA_CV` (20 000), `MAXIMO_CARACTERES_CONVOCATORIA_ENTREVISTA` (5000) y `MAXIMO_CARACTERES_CONVOCATORIA_PARA_LA_IA` (3000).

### D. Carpetas y capas
- **A compartidos:** `features/entrevista/tiempo.ts` y su test pasan a `lib/tiempo.ts`, y `BurbujaPregunta` pasa a `components/ui/`. `CampoAuth` va a `components/ui/` solo si `perfil` lo sigue usando.
- **Imports de `inicio`:** los que van a `resultados` y `curriculum` se quedan. El Inicio es un tablero que resume otras pantallas, así que es su dependencia natural, y se documenta en `useInicio`.
- **Excepciones:** `apps/entrevistas/exceptions.py` reúne las excepciones de dominio, y `services.py` las reexporta (vistas y tests usan `services.X`).
- **Usuarios:** `usuarios/services.py::cambiar_contrasena(usuario, nueva)` hace la transacción, el `set_password` y la lista negra, y devuelve el par nuevo. La vista solo valida y llama.
- **Consultas y lógica de dominio fuera de vistas y serializers:**
  - las de `get_perfil` pasan a `entrevistas/selectors.py::nombres_del_perfil`;
  - `_rubrica` pasa a `evaluaciones/rubricas.py::rubrica_publica()`;
  - la visibilidad por estado pasa a `selectors.visibilidad_de_la_evaluacion(entrevista)`.
- **Reubicaciones:**
  - `consistencia/__init__.py` pasa a `consistencia/medicion.py`, y el comando importa de ahí;
  - la parte de `test_contrato_ia.py` que usa `apps.evaluaciones` pasa a `apps/evaluaciones/tests/`.

### E. Escala
- **Rutas:** `React.lazy` en cada página y un `Suspense` con `Spinner` en `router/index.tsx`.
- **`usePeticion`:**
  - un mapa de módulo `enCurso: Map<clave, Promise>` hace que dos instancias de la misma clave compartan una sola petición;
  - el abort de una instancia no cancela la compartida mientras otra la use (contador de suscriptores);
  - al cambiar `clave`, `datos` vuelve a `null`;
  - las entradas vencidas se borran al escribir;
  - `pedirRef.current = pedir` pasa a un `useLayoutEffect`;
  - la lógica pura que se pueda separar (vigencia, recorte) va con Vitest.
- **Throttle:**
  - `production.py` define `CACHES = {"default": DatabaseCache, LOCATION "cache_entradas"}`;
  - `build.sh` ejecuta `python manage.py createcachetable` después de `migrate`;
  - en local se mantiene `LocMem`.
- **Base de datos:** `conn_health_checks=True` en el `dj_database_url.config` de `base.py`.
- **Subidas:** no se tocan. Django ya usa 2,5 MB por defecto en `DATA_UPLOAD_MAX_MEMORY_SIZE` y `FILE_UPLOAD_MAX_MEMORY_SIZE`, y el primero no limita archivos. El tope de 2 MB del CV lo aplica `validar_archivo` con su propio mensaje (corregido al aplicar).

### F. Divisiones (conservan las rutas públicas)
- **`ats.py`:**
  - los `EJEMPLO_*` pasan a `integrations/documentos/ejemplos_ats.py`;
  - los dataclasses `Hallazgo`, `Campo` y `Analisis` pasan a `modelos_ats.py`;
  - `ats.py` los importa y reexporta, y conserva el registro `_VERIFICACIONES` y las reglas;
  - la regla del módulo de CV (una función por regla y un registro ordenado) no cambia.
- **`entrevistas/services.py`:**
  - el veredicto (`redactar_veredicto`, `_entrada_de_veredicto` y la versión) pasa a `apps/entrevistas/veredicto.py`;
  - `cerrar_vencidas`, `cerrar_si_vencio` y `_cerrar_por_tiempo` pasan a `apps/entrevistas/cierre.py`;
  - `services.py` conserva `iniciar`, `responder`, `abandonar` y `_evaluar_y_continuar`, porque los tests parchean `services.calificar` y `services.get_proveedor`, y reexporta lo movido.
- **`useEntrevista.ts`:**
  - `useRelojDeEntrevista(ancla)` se queda con el conteo, `vencido` y la resincronización por visibilidad;
  - `features/entrevista/chat.ts::reconstruirChat(intercambios, pendiente)` es la lógica pura de reconstrucción, con Vitest (incluye el caso de una pendiente con respuesta guardada);
  - el hook orquesta.
- **`SeleccionPuestoPage.tsx`:** `hooks/useInicioDeEntrevista.ts` se queda con `confirmando`, `conflicto`, `iniciando`, `error`, `errorIA`, `abrirInicio` e `iniciar(abandonar)`, y la página pinta.

### G. `CLAUDE.md`
- Se guarda una copia en el scratchpad.
- Se reescribe en unas 150 a 200 líneas, con:
  - comandos;
  - arquitectura y capas;
  - los contratos que no se pueden romper: IA (roles, rúbrica, la nota la calcula el código), idempotencia, una evaluación por respuesta, límite de 30 minutos, una entrevista en curso, frontera de datos personales del CV, sin puntaje ATS, ni el archivo ni el texto completo a la IA;
  - convenciones de UI (tokens, componentes base, `estilos.test.ts`, modales);
  - guardas de tests.
- Sin historia de cambios.
- Sigue en `.gitignore`.

## Risks / Trade-offs

- **[Mover módulos rompe imports o parches de tests]** → Se reexporta desde la ruta vieja cuando hay tests que parchean ahí, y se buscan con grep los imports viejos. Cada fase cierra con la suite completa.
- **[El hash de texto cambia sin querer y la caché de CV deja de servir]** → Un test con hashes conocidos.
- **[`DatabaseCache` necesita su tabla]** → `createcachetable` en `build.sh`. Si falta, el *throttle* falla de forma visible en el primer despliegue.
- **[Compartir peticiones en `usePeticion` introduce errores sutiles de abort]** → Contador de suscriptores, tests de la lógica pura y prueba manual de navegar rápido entre pantallas.
- **[Fase F a semanas de la defensa]** → Va al final, por partes, con la suite completa entre cada una. Si algo se complica, se puede posponer sin afectar a A-E.
- **[Un `CLAUDE.md` más corto pierde detalles útiles]** → La historia sigue en los cambios de OpenSpec, y queda la copia en el scratchpad.

## Migration Plan

1. Migración `evaluaciones/000X` (`RemoveIndex`, reversible).
2. `createcachetable` (desde `build.sh` en Render, o a mano en local si se usa `production`).
3. Para revertir: volver la migración y restaurar los archivos desde git. La API no cambia.
