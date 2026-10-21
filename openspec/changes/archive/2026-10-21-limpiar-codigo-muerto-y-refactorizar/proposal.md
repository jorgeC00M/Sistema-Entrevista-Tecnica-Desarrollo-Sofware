## Why

Una auditoría completa del sistema (21-10-2026) encontró código sin consumidores en producción y lógica duplicada en backend y frontend. Hoy no rompe nada, pero confunde a quien lee el código, sobre todo en la defensa ("¿para qué sirve esto?"), y obliga a cambiar algunas cosas en dos sitios. Este cambio los elimina o consolida **sin alterar ningún comportamiento observable**. Los bugs que encontró la misma auditoría cambian comportamiento y van a un cambio aparte (`corregir-discrepancias-del-flujo`).

## What Changes

**Backend: eliminar**

- **B1.** Atributos que nadie lee en `integrations/documentos/ats.py`: `_Contexto.secciones`, `_Contexto.hoy`, `Analisis.paginas` y `Analisis.formato`. También `Analisis.parseabilidad`, que solo usan los tests y duplica `AnalisisATS.parseabilidad`.
- **B2.** `extractor.EXTENSIONES_SOPORTADAS`, que duplica `apps/common/archivos.EXTENSIONES_ACEPTADAS`. Queda una sola fuente.
- **B3.** `terminos._PATRONES`, que reimplementa `_compilar`.
- **B4.** La clave `tecnologias` de `GET /api/catalogos/` y `/publico/`, junto con `TecnologiaSerializer` y `catalogos.selectors.tecnologias_activas()`. Ninguna pantalla la consume: el frontend usa `/api/catalogos/puestos/`.
- **B5.** Los settings `IA_PROVEEDOR`, `ANTHROPIC_API_KEY` y `GEMINI_API_KEY` de `config/settings/base.py`. La factory y los adaptadores leen `os.environ`, no estos settings.
- **B6.** El `__str__` repetido en `Puesto`, `Tecnologia`, `Area` y `Nivel`: ya lo heredan de `ModeloDeCatalogo`.
- **B7.** El `.exclude(pk=...)` de `entrevistas.selectors.anterior_comparable`, que es inalcanzable por el filtro de fechas.

**Backend: refactorizar con la misma salida**

- **R1.** Un solo helper para la línea "tecnología" que comparten los prompts del entrevistador y del evaluador.
- **R2.** Un helper para los cuatro getters casi iguales de `ConfiguracionSerializer`.
- **R3.** Al cambiar la contraseña, la lista negra de tokens se hace con un `bulk_create(ignore_conflicts=True)` en lugar de N llamadas a `get_or_create`.
- **R4.** `ats.py` (813 líneas) se divide:
  - `integrations/documentos/contacto.py` con los detectores de correo, teléfono, URL y nombre;
  - `integrations/documentos/geometria.py` con la detección de columnas.

  `ats.py` sigue reexportando lo que hoy importan otros módulos.
- **R5.** `_Contexto` calcula una sola vez el nombre detectado.
- **R6.** Las marcas de enmascaramiento pasan a ser constantes de `anonimizar.py`, importadas por los parsers de IA en lugar de copiarse a mano.
- **R7.** Los modelos de catálogo heredan `ModeloDeCatalogo.Meta`, solo si no genera migración.

**Frontend: eliminar**

- **F1.** La prop `refResumen` de `ResumenDeConvocatoria`, `abrir` de `useCajonNavegacion` y los exports sin uso `CLASES_TARJETA` y `MAXIMO_CARACTERES`.
- **F2.** `estaCompleta` en `features/seleccion/seleccion.ts` y sus casos de test. Solo la usan los tests.
- **F3.** Los íconos `buscar`, `terminal` y `arbol` de `components/ui/trazosDeIconos.ts`, que nada referencia.
- **F4.** El `export` de 13 tipos y constantes que solo se usan dentro de su propio archivo.
- **F5.** El `aria-hidden` que se le pasa a `Icono`, que ya lo pone por sí mismo.
- El tipo `Catalogos.tecnologias`, que acompaña a B4.

**Frontend: refactorizar con el mismo render**

- **G1.** `mensajeDeError(err, porDefecto)` en `api/errores.ts`.
- **G2.** Una variante en línea de `Alerta` para el bloque de error repetido en los modales.
- **G3.** `lib/fechas.ts` para las fechas legibles.
- **G4.** Una sola definición de los criterios por defecto de la rúbrica.
- **G5.** Renombrar la función homónima `nombreDeTecnologias` de `RepetirConfiguracion` y corregir su JSDoc.
- **G6.** Un helper compartido `limpiarErrorDeCampo`.
- **G7.** La pastilla "Desde convocatoria" pasa a `EtiquetaMono`, solo si se ve idéntica.
- **G8.** `prefiereMovimientoReducido` pasa a `lib/`.
- **G9.** `Header.tsx` usa la prop `ref` de React 19 en lugar de `forwardRef`.

**Documentación**

- Se corrigen los docstrings que ya no describen el código:
  - `catalogos/models.py`, `catalogos/datos.py`;
  - `entrevistas/services.py::iniciar`;
  - `prompts/schemas.py` ("una veintena");
  - `RepetirConfiguracion.tsx`.
- CLAUDE.md se actualiza solo en las rutas y nombres que este cambio mueve: `contacto.py`, `geometria.py`, settings de IA y el catálogo sin `tecnologias`.

**Fuera de alcance**

- Corregir los bugs de la auditoría.
- Unificar `PanelDeConvocatoria` con `CampoConvocatoria`.
- Migrar `useEntrevista` a `usePeticion`.
- Fusionar las tres funciones de normalización de texto, que hoy difieren.
- Cualquier refactor dentro de `frontend/src/features/curriculum/`: la pantalla está cerrada desde `cv-cierre-final`. Allí solo se aplica F1/F5 y lo demás se anota en `openspec/changes/cv-cierre-final/pendientes.md`.

## Capabilities

### New Capabilities
<!-- Ninguna: es una refactorización pura. -->

### Modified Capabilities
<!-- Ninguna. El repositorio aún no tiene specs principales, y ningún requisito de comportamiento cambia. El cambio declara `skip_specs: true`. -->

## Impact

- **API:** `GET /api/catalogos/` y `/api/catalogos/publico/` dejan de incluir `tecnologias`. Es el único cambio observable, y no tiene consumidores: la landing y la selección usan otros campos. El resto de los contratos HTTP no cambia.
- **Backend:**
  - `apps/catalogos/{views,serializers,selectors,models}.py`;
  - `apps/entrevistas/{selectors,serializers}.py`;
  - `apps/usuarios/views.py`;
  - `config/settings/base.py`;
  - `integrations/documentos/{ats,extractor,terminos,anonimizar}.py`, más los nuevos `contacto.py` y `geometria.py`;
  - `integrations/ia/prompts/{entrevistador,evaluador,revisor_cv,analista_convocatoria}.py`;
  - los tests que leían `Analisis.parseabilidad` o la clave `tecnologias`.
- **Frontend:**
  - `api/errores.ts`, `components/ui/*`, `components/layout/*`;
  - `features/{seleccion,entrevista,resultados,historial,retroalimentacion,perfil,auth}/*`;
  - los nuevos `lib/fechas.ts` y `lib/movimiento.ts`;
  - `types/*`.
- **Migraciones:** ninguna. `makemigrations --check` debe seguir limpio.
- **Dependencias:** ninguna nueva.
