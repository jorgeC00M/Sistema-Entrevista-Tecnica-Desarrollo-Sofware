## A. Funciones rotas (corregidas antes del resto)

- [x] A.1 `CampoRespuesta`: máximo de 2000 caracteres, igual que el backend.
- [x] A.2 `useFocusTrap`: devuelve el foco solo al pasar de activo a inactivo. Sin el `eslint-disable`.
- [x] A.3 `useEntrevista.cargar`: `AbortController`, `signal` en las dos peticiones y salida si se canceló tras cada `await`.
- [x] A.4 `ResponderView`: vuelve a pedir la entrevista con `entrevista_del_usuario`, con el test `test_responder_devuelve_el_conteo_al_dia`.
- [x] A.5 `_con_conteo`: agrega `"convocatoria"` al `select_related`.
- [x] A.6 `VistaPreviaEntrevista`: un solo temporizador vigente, que se limpia al desmontar.
- [x] A.7 Verificación:
  - backend: la suite completa y `makemigrations --check`;
  - frontend: `tsc`, `pnpm test`, `lint` (sin advertencias nuevas) y `build`.

## B. Código muerto y comentarios viejos

- [x] B.1 Quitar `URL` y `telefonos` de `integrations/documentos/ats.py`.
- [x] B.2 Crear la migración `evaluaciones` `RemoveIndex` del índice `creado_en` y quitar el `Meta.indexes` del modelo.
- [x] B.3 Corregir los docstrings y comentarios viejos en:
  - `evaluaciones/services.py`;
  - `catalogos/selectors.py`;
  - `settings/base.py`;
  - `entrevistas/views.py` (`AnalizarConvocatoriaView`);
  - `curriculums/services.py`.
- [x] B.4 Borrar `lib/puntajes.ts::obtenerNivel` y su comentario. Quitar `export` a los 12 símbolos que solo se usan en su archivo.
- [x] B.5 Agregar `ANTHROPIC_MODEL` e `IA_FAKE_LATENCIA_MS` a `backend/.env.example`.
- [x] B.6 Borrar `sh.exe.stackdump` de la raíz. Actualizar `README.md`: psycopg3, settings separados, pnpm y comandos.
- [x] B.7 Verificación completa.

## C. Duplicación

- [x] C.1 Crear el helper de fecha en `lib/fechas.ts`, con su test, y usarlo en `TablaDeEntrevistas`, `inicio/evolucion.ts` y `PerfilPage`.
- [x] C.2 Pasar a `Alerta` los bloques de error hechos a mano, solo donde el aspecto no cambia.
- [x] C.3 Mover `TIMEOUT_SEGUNDOS` y `MAX_REINTENTOS` a `integrations/ia/base.py` y usarlos en los 3 adaptadores.
- [x] C.4 Crear `apps/common/textos.py::hash_de_texto` y usarlo en `curriculums` y `convocatorias`, con un test de hashes conocidos.
- [x] C.5 Crear `ConflictoDeDominio` en `apps/common/exceptions.py` (respuesta 409 en el manejador):
  - que hereden de ella las excepciones de dominio de entrevistas;
  - quitar los `except` repetidos de `entrevistas/views.py`;
  - `HayEntrevistaEnCurso` conserva `entrevista_en_curso`.
- [x] C.6 Hacer que los `queryset` de `entrevistas/serializers.py` usen los selectores activos del catálogo.
- [x] C.7 Renombrar las tres constantes `MAXIMO_CARACTERES_*CONVOCATORIA*` sin cambiar sus valores.
- [x] C.8 Verificación completa, incluido `test_prompts_estables` sin diferencias.

## D. Carpetas y capas

- [x] D.1 Mover `features/entrevista/tiempo.ts` y su test a `lib/`, y actualizar los imports.
- [x] D.2 Mover `BurbujaPregunta` a `components/ui/`, y `CampoAuth` también si lo usa más de una feature.
- [x] D.3 Crear `apps/entrevistas/exceptions.py` y reexportarlo desde `services.py`.
- [x] D.4 Crear `usuarios/services.py::cambiar_contrasena` y reducir la vista a validar y llamar.
- [x] D.5 Crear los selectores y helpers de dominio:
  - `nombres_del_perfil` (desde `ConvocatoriaSerializer`);
  - `rubrica_publica` (desde `catalogos/views.py`);
  - `visibilidad_de_la_evaluacion` (desde `ResultadosView`).
- [x] D.6 Pasar `consistencia/__init__.py` a `consistencia/medicion.py`, y la parte de Django de `test_contrato_ia.py` a `apps/evaluaciones/tests/`.
- [x] D.7 Documentar en `useInicio` por qué importa de `resultados` y de `curriculum`.
- [x] D.8 Verificación completa.

## E. Escalabilidad

- [x] E.1 Router con `React.lazy` y `Suspense` + `Spinner`. El build debe mostrar varios chunks.
- [x] E.2 `usePeticion`:
  - peticiones en curso compartidas con contador de suscriptores;
  - `datos` en `null` al cambiar de clave;
  - recorte de las entradas vencidas;
  - la ref deja de escribirse durante el render;
  - tests de la lógica pura.
- [x] E.3 `CACHES` con `DatabaseCache` en `production.py` y `createcachetable` en `build.sh`.
- [x] E.4 `conn_health_checks=True`. (Los topes de subida no se tocan: Django ya usa 2,5 MB por defecto, y el límite de 2 MB del CV lo aplica `validar_archivo` con su propio mensaje.)
- [x] E.5 Verificación completa y prueba manual de navegar rápido entre pantallas.

## F. Divisiones grandes

- [x] F.1 Sacar `ejemplos_ats.py` y `modelos_ats.py` de `ats.py`, con reexportación. Suite completa.
- [x] F.2 Sacar `veredicto.py` y `cierre.py` de `entrevistas/services.py`, con reexportación. Suite completa.
- [x] F.3 En `useEntrevista`, sacar `useRelojDeEntrevista` y `chat.ts::reconstruirChat` (este con Vitest). Verificación del frontend.
- [x] F.4 Crear `useInicioDeEntrevista` para `SeleccionPuestoPage`. Verificación del frontend.

## G. CLAUDE.md

- [x] G.1 Guardar una copia del `CLAUDE.md` actual en el scratchpad.
- [x] G.2 Reescribirlo en unas 150 a 200 líneas con las reglas vigentes y sin historia. Sigue en `.gitignore`.

## Cierre (lo hace Jorge)

- [ ] Z.1 `python manage.py migrate` (índice de `evaluaciones`) y `python manage.py createcachetable`.
- [ ] Z.2 En Render, confirmar que `build.sh` ejecuta `createcachetable`, y actualizar el comando de inicio de gunicorn (pendiente de `reanudar-sin-repetir-y-errores-de-ia`).
- [ ] Z.3 Pruebas manuales:
  - una respuesta de 1500 caracteres;
  - el foco al cargar `/inicio`;
  - el menú en el celular;
  - navegar rápido entre pantallas;
  - una entrevista completa;
  - analizar un CV.
- [ ] Z.4 Mover `backups/*.sql` (datos personales) fuera de la carpeta del proyecto.
- [ ] Z.5 No hacer commit; lo hace Jorge.
