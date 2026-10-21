## Why

La pantalla "Nueva entrevista" ofrece seis puestos (Frontend, Backend, Full Stack, Móvil, Escritorio y QA) y ninguno sirve a quien postula a desarrollo de videojuegos. Es un perfil con ofertas propias (Unity, Unreal, Godot) que hoy no puede practicar. El usuario aprobó el 21-10-2026 el nombre, las tecnologías, el área y la agrupación.

## What Changes

- **Puesto nuevo `videojuegos`:** «Desarrollador de Videojuegos», descripción «Crea juegos para PC, consola, móvil o web.» y un ícono nuevo de mando.
- **17 tecnologías activas**, agrupadas por tipo en el desplegable:
  - **Motores:** Unity (C#), Unreal Engine (C++), Unreal Engine (Blueprints), Godot (GDScript), Godot (C#).
  - **Motores 2D y plataformas:** GameMaker (GML), Roblox Studio (Luau), Defold (Lua), Cocos Creator (TypeScript).
  - **Web:** Phaser (JavaScript), Three.js, Babylon.js.
  - **Frameworks de código:** MonoGame (C#), Pygame (Python), LÖVE (Lua), Bevy (Rust), SDL / SFML (C++).
- **Área técnica nueva** «Desarrollo de Videojuegos». Las preguntas del puesto se registran así, igual que en Móvil y Escritorio:

  | Pregunta | Enfoque | Área |
  |---|---|---|
  | 1 | Fundamentos | Fundamentos de Programación |
  | 2 | Tecnología elegida | Desarrollo de Videojuegos |
  | 3 | Datos | Estructuras de Datos |
  | 4 | Profundidad | Desarrollo de Videojuegos |
  | 5 | Caso práctico | Desarrollo de Videojuegos |

- **Convocatorias:** una oferta de videojuegos se clasifica dentro del catálogo como cualquier otra, porque el analizador lee los puestos activos.
- **Módulo de CV:** el diccionario de términos y de cargos reconoce los motores y el cargo «Desarrollador de Videojuegos», para que el inventario y el mapa de evidencia no salgan vacíos con un CV o una convocatoria del sector. Como cambia lo que produce el análisis, sube `VERSION_DE_REGLAS` (3 → 4).
- **Catálogos publicados:** cambian los totales de lo que publica la API: 7 puestos, 70 tecnologías activas y 11 áreas.

Fuera de alcance:

- Los colores del gráfico de progreso por puesto, que ya repiten color entre Móvil, Escritorio y QA. Es un defecto conocido que va al cambio `corregir-discrepancias-del-flujo`.
- Actualizar el documento del perfil de tesis. Hay que hacerlo, pero es tarea del autor.

## Capabilities

### New Capabilities

- `catalogo-de-puestos`: qué puestos, tecnologías y áreas ofrece el sistema para practicar una entrevista. Este cambio añade el puesto de videojuegos y su plan de preguntas.

### Modified Capabilities
<!-- Ninguna: el repositorio todavía no tiene specs principales. -->

## Impact

- **Backend:**
  - `apps/catalogos/datos.py`;
  - una migración de datos nueva, `0014`, que crea el puesto, el área y las tecnologías y es reversible;
  - `integrations/ia/prompts/schemas.py`: los enums `Puesto` y `AreaTecnica`, y `PLAN_POR_PUESTO`;
  - `integrations/ia/fake.py`: palabras clave para clasificar avisos sin red;
  - `integrations/documentos/terminos.py` y `ats.py`: los términos, los cargos y `VERSION_DE_REGLAS`;
  - tests con totales fijos (`test_catalogos.py`, `test_puestos.py`, `test_contrato_ia.py`).
- **Frontend:** solo un trazo nuevo en `components/ui/trazosDeIconos.ts`. El formulario, el resumen y la convocatoria ya se arman a partir del catálogo.
- **Análisis de CV:** al subir `VERSION_DE_REGLAS`, un CV ya analizado se recalcula la próxima vez que se sube, y su revisión de IA se vuelve a pedir.
- **Tesis:** el perfil enumera los puestos y áreas que se practican, así que hay que agregar este puesto, igual que se hizo con Senior.
