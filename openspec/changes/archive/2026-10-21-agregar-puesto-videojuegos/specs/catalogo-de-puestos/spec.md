## Purpose

Define qué puestos, tecnologías y áreas técnicas ofrece el sistema para practicar una entrevista técnica, y cómo se reparten las preguntas de cada puesto entre las áreas.

## ADDED Requirements

### Requirement: Puesto Desarrollador de Videojuegos
El sistema SHALL ofrecer el puesto activo «Desarrollador de Videojuegos» (código `videojuegos`), con la descripción «Crea juegos para PC, consola, móvil o web.», junto a los seis puestos existentes. El puesto SHALL ofrecerse en los tres niveles: Junior, Semi-Senior y Senior.

#### Scenario: El puesto aparece al elegir una nueva entrevista
- **WHEN** un usuario autenticado consulta el catálogo de puestos
- **THEN** la respuesta incluye siete puestos activos, entre ellos `videojuegos` con el nombre «Desarrollador de Videojuegos»

#### Scenario: Se inicia una entrevista del puesto
- **WHEN** el usuario inicia una entrevista con el puesto `videojuegos`, una tecnología de ese puesto y cualquier nivel
- **THEN** la entrevista se crea y recibe su primera pregunta

### Requirement: Tecnologías del puesto de videojuegos
El puesto `videojuegos` SHALL ofrecer exactamente estas 17 tecnologías activas, sin capas, agrupadas para su presentación en este orden:

- **Motores:** Unity (C#), Unreal Engine (C++), Unreal Engine (Blueprints), Godot (GDScript), Godot (C#).
- **Motores 2D y plataformas:** GameMaker (GML), Roblox Studio (Luau), Defold (Lua), Cocos Creator (TypeScript).
- **Web:** Phaser (JavaScript), Three.js, Babylon.js.
- **Frameworks de código:** MonoGame (C#), Pygame (Python), LÖVE (Lua), Bevy (Rust), SDL / SFML (C++).

Se elige una sola tecnología por entrevista.

#### Scenario: El desplegable muestra las tecnologías agrupadas
- **WHEN** el usuario elige el puesto `videojuegos`
- **THEN** el selector de tecnología ofrece las 17 tecnologías, bajo los cuatro grupos y en el orden indicado

#### Scenario: Se rechaza una tecnología de otro puesto
- **WHEN** el usuario inicia una entrevista de `videojuegos` con una tecnología de otro puesto, por ejemplo Django
- **THEN** el sistema responde 400 y no llama al proveedor de IA

#### Scenario: Se rechaza una segunda tecnología
- **WHEN** el usuario inicia una entrevista de `videojuegos` indicando una segunda tecnología
- **THEN** el sistema responde 400, porque el puesto no tiene capas

### Requirement: Área técnica Desarrollo de Videojuegos
El sistema SHALL tener el área técnica activa «Desarrollo de Videojuegos» (código `desarrollo_videojuegos`). Esta área SHALL publicarse en los catálogos y SHALL usarse para agrupar las estadísticas y la retroalimentación, como las demás.

#### Scenario: El área se publica
- **WHEN** se consulta el catálogo general
- **THEN** la lista de áreas incluye `desarrollo_videojuegos` con el nombre «Desarrollo de Videojuegos», y hay 11 áreas en total

### Requirement: Plan de preguntas del puesto de videojuegos
Las cinco preguntas de una entrevista de `videojuegos` SHALL registrarse, en orden, con estas áreas:

1. Fundamentos de Programación.
2. Desarrollo de Videojuegos.
3. Estructuras de Datos.
4. Desarrollo de Videojuegos.
5. Desarrollo de Videojuegos.

Los enfoques de las preguntas SHALL ser los mismos que en el resto de puestos.

#### Scenario: Cada pregunta queda con su área
- **WHEN** se completa una entrevista de `videojuegos`
- **THEN** las preguntas 1 a 5 quedan registradas con las áreas indicadas, en ese orden

#### Scenario: La selección muestra las áreas que cubre
- **WHEN** el usuario elige el puesto `videojuegos`
- **THEN** el resumen de la selección indica que cubre Fundamentos de Programación, Desarrollo de Videojuegos y Estructuras de Datos

### Requirement: Convocatorias y CV del sector de videojuegos
Al analizar una convocatoria, el sistema SHALL poder clasificarla en el puesto `videojuegos` si es una oferta de videojuegos. El análisis de CV SHALL reconocer como términos los motores y frameworks de la lista anterior, y el cargo «Desarrollador de Videojuegos» con sus variantes habituales en español e inglés: «Game Developer», «programador de videojuegos».

#### Scenario: Una convocatoria de Unity se clasifica como videojuegos
- **WHEN** el usuario analiza una convocatoria para «Desarrollador de videojuegos con Unity y C#»
- **THEN** el perfil detectado tiene el puesto `videojuegos` y la tecnología Unity (C#)

#### Scenario: El CV reconoce un motor y el cargo
- **WHEN** se analiza un CV que menciona Godot en su experiencia y una convocatoria que pide Godot
- **THEN** el mapa de evidencia marca Godot como `demostrado`, y el cargo «Game Developer» se reconoce como «Desarrollador de Videojuegos»
