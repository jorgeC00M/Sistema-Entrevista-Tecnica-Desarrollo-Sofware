## Why

La pantalla de nueva entrevista ofrece 3 puestos, 2 niveles ("Básico"/"Intermedio") y un stack opcional con 3 combinaciones fijas (Python/Django, JavaScript/React, Java/Spring) que no dependen del puesto. El prototipo `nueva-entrevista.html` propone otra experiencia, más cercana a cómo se postula de verdad:
- 6 puestos, con buscador;
- cada puesto con sus propias tecnologías;
- la experiencia expresada en términos del candidato: "Sin experiencia" o "Menos de 2 años";
- todo en una sola página.

La revisión del código encontró que **la base ya existe**: `Puesto`, `Tecnologia` y `Nivel` ya son tablas y `Entrevista` ya tiene las tres claves foráneas. El cambio es de catálogo, de prompt y de interfaz, no de modelo de entrevista.

## What Changes

- **Catálogo:**
  - `Puesto` gana `icono` y `palabras_clave`.
  - `Tecnologia` gana `puesto` (FK, nullable solo para las tecnologías antiguas, que quedan inactivas).
  - Se cargan los 6 puestos del prototipo con sus tecnologías: Frontend, Backend, Full Stack, Móvil, Escritorio y QA Tester / Automatizador.
  - Una tecnología que aparece en dos puestos (C# .NET, Java, Python) es una fila distinta en cada uno.
- **Una sola fuente de datos** (`apps/catalogos/datos.py`) alimenta tanto la migración de datos (los tests y producción la necesitan) como el comando idempotente `cargar_catalogos`.
- **Niveles:** los niveles existentes se renombran en el mismo registro: `basico` pasa a `practicante` y `intermedio` a `junior`. Ninguna entrevista pierde su nivel, porque la FK apunta a la misma fila. No hay "Avanzado".
- **Endpoints nuevos:**
  - `GET /api/catalogos/puestos/`: puestos activos con sus tecnologías, palabras clave, icono, áreas que cubren y "lo más practicado" (calculado de las entrevistas reales, no escrito a mano).
  - `GET /api/entrevistas/ultima-configuracion/`: puesto, tecnología y nivel de la última entrevista del usuario, o 204 si no tiene.
- **`POST /api/entrevistas/`:** la tecnología pasa a ser **obligatoria** y debe pertenecer al puesto (400 si no).
- **Prompt del entrevistador:**
  - recibe puesto, tecnología (por nombre) y nivel;
  - cada pregunta tiene un **enfoque**: fundamentos, la tecnología elegida, datos (bases de datos o estructuras de datos según el puesto), profundidad en la tecnología y un caso práctico del puesto;
  - el **área** de cada pregunta se sigue guardando, porque es el eje de las estadísticas, la retroalimentación y el reporte.
- **Áreas:** el catálogo de áreas se conserva como catálogo de competencias. Se agregan `desarrollo_movil` y `desarrollo_escritorio`.
- **Frontend:**
  - la pantalla `/nueva-entrevista` se reemplaza por la del prototipo: "Tu última entrevista", buscador con ranking por relevancia, resaltado y atajos, "Lo más practicado", lista de puestos, tecnología y experiencia, y barra de resumen fija;
  - la opción de pegar la convocatoria queda visible pero deshabilitada ("Próximamente");
  - se eliminan `SelectorNivel`, `TarjetaPuesto`, `PanelDeSesion` y `lib/iconosPorPuesto.ts`, porque el icono pasa a venir de la API.
- **BREAKING (API interna):**
  - `tecnologia` es obligatoria al iniciar una entrevista;
  - los códigos de nivel cambian (`practicante`, `junior`);
  - el enum `Tecnologia` de la capa de IA desaparece.

## Capabilities

### New Capabilities
- `seleccion-de-entrevista`: qué puestos, tecnologías y niveles se ofrecen, cómo se busca y se elige, cómo se recuerda la última configuración y qué se valida al iniciar.
- `plan-de-preguntas`: cómo se reparten las 5 preguntas de una entrevista entre enfoques y áreas según el puesto y la tecnología.

### Modified Capabilities
<!-- No hay specs archivadas en openspec/specs/. -->

## Impact

- **Backend:**
  - `apps/catalogos/` (modelos, migraciones 0006–0008, `datos.py`, comando, serializer, vista y URL);
  - `apps/entrevistas/` (serializer de inicio, vista y selector de la última configuración, `_contexto`);
  - `integrations/ia/prompts/` (`schemas.py`: enums `Puesto`, `Nivel` y `AreaTecnica`, plan con enfoques; `entrevistador.py`; `evaluador.py`; `revisor_cv.py`, cuya lista de puestos crece sola);
  - `apps/evaluaciones/consistencia/casos.json`.
- **Frontend:**
  - `features/seleccion/` (página nueva y componentes nuevos);
  - `types/catalogos.ts`;
  - `api/catalogos.ts` y `api/entrevistas.ts`;
  - `features/landing/sections/PuestosDisponibles.tsx` (usa `puesto.icono`);
  - `components/ui/Icono.tsx` (iconos para móvil, escritorio y QA).
- **Datos:** 14 entrevistas existentes (13 básico, 1 intermedio; 3 backend, 11 full stack; 11 sin tecnología, 2 Java/Spring, 1 Python/Django) se conservan intactas, con sus áreas por pregunta.
- **Tesis:** el Alcance del perfil dice "nivel básico e intermedio". El documento debe registrar la equivalencia practicante = básico y junior = intermedio.
- **Tests:** unos 45 usos de `"basico"` y los tests de sincronía entre el catálogo y la capa de IA.
