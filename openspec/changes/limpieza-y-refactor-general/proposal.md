## Why

Una auditoría de todo el proyecto (backend, frontend, repositorio y configuración) encontró seis funciones rotas. Ya se corrigieron como fase A de este cambio. Encontró además código muerto y comentarios que describen funcionalidades retiradas, lógica duplicada, imports entre features que deberían ser compartidos, archivos de 300 a 800 líneas que mezclan responsabilidades, y dos límites de escala:
- los *throttles* viven en la memoria de cada proceso, así que con 2 workers se duplican;
- todo el frontend va en un solo paquete.

Conviene dejarlo ordenado antes de la defensa, sin cambiar lo que el usuario ve.

## What Changes

- **A. Funciones rotas (ya corregidas):**
  - el chat cortaba la respuesta en 1000 caracteres aunque el backend acepta 2000;
  - el foco saltaba al botón ☰ al cargar cada página;
  - la carga del chat seguía actuando tras cancelarse;
  - `responder` devolvía una pregunta calificada de menos;
  - una consulta extra por la convocatoria;
  - la vista previa de la landing acumulaba temporizadores sin vaciarlos.
- **B. Código muerto y comentarios viejos:**
  - reexportaciones sin uso, un índice que solo servía a la retroalimentación retirada, `obtenerNivel` y `export` innecesarios;
  - docstrings que describen funciones retiradas;
  - variables que faltan en `.env.example`, un archivo basura en la raíz y el README desactualizado.
- **C. Duplicación:**
  - el formato de fecha;
  - el timeout de la IA;
  - el hash de texto;
  - los 409 de dominio, que pasan a una sola excepción base;
  - el filtro de catálogo activo;
  - constantes con el mismo nombre y valores distintos, que se renombran.
- **D. Carpetas y capas:**
  - el reloj y la burbuja del chat pasan a carpetas compartidas;
  - las excepciones de entrevistas van a su propio módulo;
  - el cambio de contraseña pasa al servicio;
  - las consultas y la lógica que estaban en vistas y serializers pasan a selectors;
  - se reubican archivos mal puestos.
- **E. Escalabilidad:**
  - carga de páginas bajo demanda;
  - `usePeticion` comparte las peticiones en curso, no muestra datos de otra clave y recorta su caché;
  - *throttle* compartido entre procesos con `DatabaseCache`;
  - `conn_health_checks`.
- **F. Divisiones grandes:** `ats.py`, `entrevistas/services.py`, `useEntrevista.ts` y `SeleccionPuestoPage.tsx` se parten por responsabilidad, conservando las rutas de import públicas.
- **G. `CLAUDE.md`** se reescribe con las reglas vigentes. Sigue sin versionarse.

Nada es **BREAKING**: la API y las pantallas no cambian, salvo los arreglos de la fase A.

## Capabilities

### New Capabilities
- `correcciones-y-escala-sin-cambio-visible`: los comportamientos que este cambio fija:
  - el límite de la respuesta igual en los dos lados;
  - el foco que no salta al cargar;
  - el conteo correcto al responder;
  - los límites de peticiones compartidos entre procesos;
  - la carga de páginas bajo demanda sin cambio visible.

### Modified Capabilities
- (ninguna)

## Impact

- **Backend:**
  - `apps/entrevistas` (vistas, selectors, services, serializers y un `exceptions.py` nuevo);
  - `apps/common` (`exceptions.py` y un helper de texto);
  - `apps/usuarios` (services);
  - `apps/evaluaciones` (una migración `RemoveIndex`, `rubricas` y `consistencia`);
  - `apps/catalogos` y `apps/curriculums` (constantes y comentarios);
  - `integrations/ia` (constantes) e `integrations/documentos/ats.py` (se parte en módulos);
  - `config/settings/{base,production}.py` y `build.sh` (`createcachetable`).
- **Frontend:**
  - `router/index.tsx` (lazy), `hooks/usePeticion.ts` y `hooks/useFocusTrap.ts`;
  - `lib/` (tiempo, fechas) y `components/ui/` (`BurbujaPregunta`, `CampoAuth`);
  - `features/entrevista` (hooks y chat) y `features/seleccion` (hook de inicio);
  - `lib/puntajes.ts` y varios `export` innecesarios.
- **Despliegue:** `migrate` (índice) y `createcachetable` en Render.
- **Documentación:** `CLAUDE.md`, `README.md` y `.env.example`.
