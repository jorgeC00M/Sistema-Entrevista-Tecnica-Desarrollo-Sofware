## 1. Línea base

- [x] 1.1 Registra la línea base:
  - En `backend/`, ejecuta `python manage.py test` y anota el número de tests y que todos pasan (se esperan 512).
  - Ejecuta `python manage.py makemigrations --check --dry-run` y verifica que responde "No changes detected".
  - En `frontend/`, ejecuta `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm run lint` y `pnpm run build`, y verifica que los cuatro terminan sin errores.
- [x] 1.2 Crea `backend/tests/integration/test_prompts_estables.py` (design D1):
  - Captura los textos literales de `entrevistador` (preguntas iniciales y siguiente pregunta) y de `evaluador` (sistema y usuario) para dos contextos: "Django", y "React + Node.js" con requisitos.
  - Verifica que `python manage.py test tests.integration.test_prompts_estables` pasa con el código actual.

## 2. Backend: eliminar código muerto

- [x] 2.1 B1: en `integrations/documentos/ats.py`, elimina:
  - `_Contexto.secciones` y `_Contexto.hoy`, junto con su cálculo;
  - `Analisis.paginas` y `Analisis.formato`;
  - la propiedad `Analisis.parseabilidad`.

  Reescribe `tests/integration/test_ats.py:69,266,377` para que comparen `campos_detectados`/`campos_intentados`. Verifica que `grep -rn "contexto\.hoy\|contexto\.secciones\|\.paginas\b" backend/integrations/documentos/ats.py` no devuelve usos y que `python manage.py test tests.integration.test_ats` pasa.
- [x] 2.2 B2: elimina `extractor.EXTENSIONES_SOPORTADAS` y usa la única lista, `apps/common/archivos.EXTENSIONES_ACEPTADAS`.

  `integrations/` no puede importar de `apps/`. Si el extractor necesita la lista, muévela a `integrations/documentos/extractor.py` y haz que `archivos.py` la importe de ahí (la dependencia va de `apps` a `integrations`).

  Verifica que `grep -rn "EXTENSIONES_" backend --include=*.py --exclude-dir=.venv` muestra una sola definición y que `python manage.py test apps.curriculums tests.integration` pasa.
- [x] 2.3 B3: en `integrations/documentos/terminos.py`, construye `_PATRONES` con `_compilar` en lugar de la comprensión duplicada. Verifica que `python manage.py test tests.integration.test_terminos` pasa (o el módulo de tests de términos que exista).
- [x] 2.4 B4: quita la clave `"tecnologias"` de `CatalogosView`. Si no quedan usos, elimina también `TecnologiaSerializer` (`catalogos/serializers.py:23`) y `selectors.tecnologias_activas()` (`catalogos/selectors.py:23`).

  Ajusta `test_catalogos.py:143` para que cuente las 53 tecnologías activas sobre `/api/catalogos/puestos/`, y `:162` para que afirme que `tecnologias` no está en la respuesta (design D5).

  Verifica que `grep -rn "TecnologiaSerializer\b\|tecnologias_activas()" backend/apps` no devuelve usos y que `python manage.py test apps.catalogos` pasa.
- [x] 2.5 B5: comprueba que `grep -rn "IA_PROVEEDOR\|ANTHROPIC_API_KEY\|GEMINI_API_KEY" backend --include=*.py --exclude-dir=.venv` solo encuentra `os.environ` en `integrations/ia/` y `tests/runner.py`. Después elimina las tres asignaciones de `config/settings/base.py:200,208-209` y conserva el comentario de `TEST_RUNNER`. Verifica que la suite completa pasa.
- [x] 2.6 B6: elimina el `__str__` de `Puesto`, `Tecnologia`, `Area` y `Nivel` en `apps/catalogos/models.py`, que ya heredan el de `ModeloDeCatalogo`. Verifica que `str(Puesto.objects.first())` en `python manage.py shell` sigue devolviendo el nombre y que `python manage.py test apps.catalogos` pasa.
- [x] 2.7 B7: quita `.exclude(pk=entrevista.pk)` de `entrevistas/selectors.py::anterior_comparable`. Verifica que pasan los tests del resumen y la comparación en `apps.entrevistas`.
- [x] 2.8 Verifica todo el grupo: la suite backend completa en verde con el mismo número de tests (más los de la tarea 1.2) y `makemigrations --check` sin cambios.

## 3. Backend: refactorizar con la misma salida

- [x] 3.1 R1: extrae la línea de tecnología a un helper compartido en `integrations/ia/prompts/` (por ejemplo, `schemas.linea_de_tecnologia`) y úsalo en `entrevistador._linea_tecnologia` y en `evaluador.sistema`. Verifica que `test_prompts_estables` pasa sin tocarlo.
- [x] 3.2 R6 (design D3): crea `integrations/ia/prompts/marcadores.py` con `SIN_PUESTO` y `MARCADOR`, e impórtalos desde `revisor_cv.py` y `analista_convocatoria.py`.

  Añade un test que enmascare un texto con correo, teléfono, enlace y nombre usando `anonimizar.enmascarar` y compruebe que `MARCADOR` reconoce las cuatro marcas.

  Verifica que `python manage.py test tests.integration` pasa.
- [x] 3.3 R4 (design D2):
  - Crea `integrations/documentos/contacto.py`. Mueve allí `CORREO`, `_TELEFONO`, `URL`, `telefonos`, `detectar_telefono` y `detectar_nombre`.
  - Crea `integrations/documentos/geometria.py` y mueve allí `_hay_dos_columnas` con sus constantes.
  - En `ats.py`, importa ambos módulos para que los imports existentes sigan resolviendo.
  - Haz que `anonimizar.py` y `apps/curriculums/revision.py` importen de `contacto`.

  Verifica que pasan `python manage.py test apps.curriculums.tests.test_frontera_con_ia tests.integration` y la suite completa.
- [x] 3.4 R5: añade a `_Contexto` el nombre detectado, calculado una sola vez, y reemplaza las llamadas repetidas a `detectar_nombre` dentro de las reglas. Verifica que `test_ats` pasa y que `grep -n "detectar_nombre(" backend/integrations/documentos/ats.py` muestra una sola llamada.
- [x] 3.5 R2: en `entrevistas/serializers.py::ConfiguracionSerializer`, reemplaza los cuatro getters casi iguales por un helper privado. El JSON no debe cambiar. Verifica que pasan los tests de `ultima-configuracion` en `apps.entrevistas`.
- [x] 3.6 R3: en `usuarios/views.py::CambiarContrasenaView`, cambia el bucle de `get_or_create(BlacklistedToken)` por un `BlacklistedToken.objects.bulk_create([...], ignore_conflicts=True)` dentro de la misma transacción. Verifica que pasan los tests de cambio de contraseña en `apps.usuarios`, incluido el que comprueba que los refresh anteriores quedan rechazados.
- [x] 3.7 R7: haz que `Meta` herede de `ModeloDeCatalogo.Meta` en los modelos de catálogo que repiten `ordering`. Ejecuta `makemigrations --check --dry-run`: si propone una migración, revierte esta tarea y anótalo en la tarea 6.3.
- [x] 3.8 Verifica todo el grupo: suite backend completa en verde, `makemigrations --check` limpio y `test_prompts_estables` intacto.

## 4. Frontend: eliminar código muerto

- [x] 4.1 F1:
  - quita la prop `refResumen` de `features/seleccion/components/ResumenDeConvocatoria.tsx`;
  - quita `abrir` del retorno de `components/layout/useCajonNavegacion.ts`;
  - quita el `export` de `CLASES_TARJETA` (`Tarjeta.tsx`) y de `MAXIMO_CARACTERES` (`CampoConvocatoria.tsx`), o la constante entera si deja de usarse.

  Verifica que `pnpm exec tsc --noEmit` pasa.
- [x] 4.2 F2: elimina `estaCompleta` de `features/seleccion/seleccion.ts` y sus dos casos de `seleccion.test.ts`. Verifica que `grep -rn estaCompleta frontend/src` no devuelve nada y que `pnpm test` pasa.
- [x] 4.3 F3: elimina `buscar`, `terminal` y `arbol` de `components/ui/trazosDeIconos.ts`. Antes, confirma con grep que no aparecen en `frontend/src` ni como valor `icono=` en `backend/apps/catalogos/datos.py` ni en sus migraciones. Verifica que `tsc` y el build pasan.
- [x] 4.4 F4: quita la palabra `export` de los símbolos que solo se usan en su propio archivo:
  - `ErroresDeFormulario` (`api/errores.ts`);
  - `GrupoDeDestinos` (`destinos.ts`);
  - `TonoDeEtiqueta` (`EtiquetaMono.tsx`);
  - `OpcionesDeCampo` (`CampoSelect.tsx`);
  - `EstadoDePeticion` (`usePeticion.ts`);
  - `NIVEL_POR_BANDA` (`lib/puntajes.ts`);
  - `ErrorConDetalle` (`types/api.ts`);
  - `ElementoDeCatalogo`, `Tecnologia` y `CriterioDeRubrica` (`types/catalogos.ts`);
  - `CampoDelEspejo` y `EstadoDeRevision` (`types/curriculum.ts`);
  - `ConteoPorBanda` (`types/evaluacion.ts`).

  Si un símbolo sí se importa en otro sitio, déjalo como está. Verifica que `tsc` y `lint` pasan.
- [x] 4.5 Acompañando a B4, elimina `tecnologias` del tipo `Catalogos` en `types/catalogos.ts`. Verifica que `tsc` pasa.
- [x] 4.6 F5: quita el `aria-hidden` que se pasa a `<Icono>`. Antes, confirma en `components/ui/Icono.tsx` que lo emite por sí mismo. Verifica que `tsc` pasa y que en el navegador el `<svg>` sigue con `aria-hidden="true"`.
- [x] 4.7 Verifica todo el grupo: `tsc --noEmit`, `pnpm test`, `pnpm run lint` y `pnpm run build` en verde.

## 5. Frontend: refactorizar con el mismo render

- [x] 5.1 G1: añade `mensajeDeError(err: unknown, porDefecto: string): string` en `api/errores.ts` y reemplaza los 7 sitios de `err instanceof ErrorAPI ? err.message : '…'`, conservando cada texto por defecto. Verifica que `grep -rn "instanceof ErrorAPI ?" frontend/src` devuelve 0 y que `tsc` pasa.
- [x] 5.2 G2: añade a `components/ui/Alerta` una variante en línea con las clases exactas del bloque `<p role="alert" className="rounded-control bg-error-fondo …">`. Úsala en `ModalDeInicio`, `PanelDeConvocatoria` y `ModalCambiarContrasena`. Verifica que las clases resultantes son idénticas y que `estilos.test.ts` pasa.
- [x] 5.3 ~~G3~~ **Descartada por el usuario (21-10-2026).** G3: crea `lib/fechas.ts` con las funciones de fecha de `PerfilPage`, `ListaEntrevistas` y `ListaObservaciones`, copiando literalmente las opciones de `toLocale*` de cada una (design D6). Verifica que `tsc` pasa y, a mano, que las fechas de Perfil, Historial y Retroalimentación se ven igual.
- [x] 5.4 G4: mueve los criterios por defecto de la rúbrica de `ResumenFinal.tsx:17-21` y `DesgloseDeNota.tsx:4-9` a una sola constante, en `lib/puntajes.ts` o en el módulo de resultados. Verifica que `tsc` pasa y, a mano, que el resultado de una entrevista con `IA_PROVEEDOR=fake` se ve igual.
- [x] 5.5 G5: renombra el `nombreDeTecnologias` de `RepetirConfiguracion.tsx` a un nombre que diga lo que hace, por ejemplo `tecnologiasDeLaConfiguracion`, y mueve el JSDoc de las líneas 17-22 a la función que describe. Verifica que `tsc` pasa.
- [x] 5.6 G6: extrae `limpiarErrorDeCampo` de `RegistroPage.tsx` a `api/errores.ts`. No toques `CurriculumPage`, que va en la tarea 6.2. Verifica que `tsc` pasa y, a mano, que en Registro el error de un campo desaparece al escribir en él.
- [x] 5.7 G7: compara las clases de la pastilla "Desde convocatoria" en `ModalDeInicio.tsx:47` y `ResumenDeEntrevista.tsx:61` con las de `EtiquetaMono tono="marca"`. Si coinciden, reemplázala. Si no, déjala y anótalo en la tarea 6.3. Verifica que `estilos.test.ts` pasa.
- [x] 5.8 G8: mueve `prefiereMovimientoReducido` de los hooks de la landing a `lib/movimiento.ts` y úsalo en `SeleccionPuestoPage.desplazarSuave`. Verifica que `tsc` pasa y que la landing y "Nueva entrevista" siguen respetando `prefers-reduced-motion`.
- [x] 5.9 G9: en `components/layout/Header.tsx`, reemplaza `forwardRef` por la prop `ref` de React 19, como en `Boton.tsx`. Verifica que `tsc` pasa y que en móvil el foco vuelve al botón ☰ al cerrar el cajón.
- [x] 5.10 Verifica todo el grupo: `tsc`, `pnpm test`, `lint` y `build` en verde.

## 6. Documentación

- [x] 6.1 Corrige los docstrings obsoletos:
  - `catalogos/models.py:9,15-16,34`: el enum `Tecnologia` ya no existe, la tecnología es obligatoria y el ícono se resuelve en `trazosDeIconos.ts`;
  - `catalogos/datos.py:14`: también `trazosDeIconos.ts`;
  - `entrevistas/services.py::iniciar`: la tecnología no es opcional;
  - `prompts/schemas.py:113`: la cantidad real de tecnologías es 53.

  Verifica con `git diff --stat` que solo cambian comentarios y docstrings en esos archivos.
- [x] 6.2 Crea `openspec/changes/cv-cierre-final/pendientes.md`, o añade a él si ya existe, los refactors P3 de `features/curriculum/` que este cambio no toca:
  - la `fechaLegible` duplicada;
  - `limpiarErrorDeCampo` en `CurriculumPage`;
  - `CurriculumPage` sin `usePeticion`;
  - la unificación de `CampoConvocatoria` con `PanelDeConvocatoria`.

  Verifica que el archivo existe y los lista.
- [x] 6.3 Actualiza CLAUDE.md solo en lo que este cambio mueve o elimina:
  - los detectores ahora están en `integrations/documentos/contacto.py` y la geometría en `geometria.py`;
  - `/api/catalogos/` ya no publica `tecnologias`;
  - la selección del proveedor se lee de `os.environ`.

  Anota también las tareas que se revirtieron (R7 o G7, si aplica). Verifica que `grep -n "contacto.py" CLAUDE.md` lo encuentra.

## 7. Verificación final

- [x] 7.1 Repite la tarea 1.1 completa y verifica:
  - que la suite backend pasa con el número de la línea base más los tests nuevos de las tareas 1.2 y 3.2;
  - que `makemigrations --check` sigue limpio;
  - que los cuatro comandos del frontend pasan.
- [ ] 7.2 Haz una prueba manual con `IA_PROVEEDOR=fake`, backend y frontend levantados:
  1. Registro y login.
  2. Nueva entrevista, pestaña Personalizada: elige Full Stack con dos capas y luego Backend.
  3. Usa "Repetir última".
  4. Usa la pestaña Con convocatoria pegando texto.
  5. Inicia la entrevista y responde 5 preguntas.
  6. Revisa resultados ("¿Cómo se calcula?", "Practicar de nuevo"), historial y gráfico, y retroalimentación.
  7. Analiza un CV con convocatoria y sin ella.
  8. Cambia la contraseña.
  9. Pliega y despliega el sidebar en los tres anchos.

  Verifica que no aparece ningún error en la consola del navegador ni ninguna diferencia visual respecto a la línea base.

## Notas de la aplicación (21-10-2026)

- **5.3 (G3), descartada por el usuario.** Fuera de `features/curriculum/` hay tres formatos de fecha distintos (fecha y hora en Historial, fecha larga en Perfil, fecha corta en Retroalimentación), y cada uno se usa una sola vez. Llevarlos a `lib/fechas.ts` no elimina ninguna duplicación. La duplicada de verdad (`fechaLegible`) está en la pantalla de CV cerrada y quedó anotada en `cv-cierre-final/pendientes.md`.
- **5.7 (G7) se conserva tal cual.** `EtiquetaMono` usa mono, mayúsculas, `rounded-chip` y `text-label-mono`. La pastilla "Desde convocatoria" usa `rounded-full` y `text-meta`, así que reemplazarla cambiaría lo que se ve.
- **3.4 (R5).** `detectar_nombre(` aparece dos veces en `ats.py`: una en `analizar()`, que lo guarda en `_Contexto.nombre`, y otra en `_contacto_en()`, que mide cada zona oculta y por eso tiene que detectarlo en cada texto. Antes se calculaba tres veces sobre el cuerpo.
- **4.2 (F2).** Solo se quitaron las aserciones de `estaCompleta`. Los dos casos de test siguen, porque también prueban `campoFaltante`.
- **3.7 (R7) aplicada.** `makemigrations --check` no generó migración, y `ordering`, `verbose_name` y `constraints` se mantienen.
- La línea base del lint tenía 5 avisos, no 4; el resultado final también tiene 5.
