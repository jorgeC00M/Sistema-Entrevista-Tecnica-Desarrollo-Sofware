## Context

Hoy el catálogo es así (ver CLAUDE.md, "Catálogos are DB tables"):

- `apps/catalogos/datos.py` es la fuente única de puestos, tecnologías y niveles.
- Cada cambio del catálogo va también en una migración de datos con los valores copiados literalmente.
- `test_cargar_catalogos_coincide_con_la_migracion` falla si la migración y `datos.py` divergen.
- Las áreas no están en `datos.py`: se crean solo en migraciones (`0002`, `0004`, `0007`).

El código de cada puesto y de cada área es el puente con la capa de IA:

- `Puesto` y `AreaTecnica` en `integrations/ia/prompts/schemas.py`;
- dos tests de sincronía exigen que coincidan los códigos y los nombres visibles;
- `PLAN_POR_PUESTO` fija el área de cada pregunta, y `test_areas_del_plan_segun_el_diseno` fija la tabla completa.

El frontend ya arma desde el catálogo el formulario, los grupos (`<optgroup>` por `Tecnologia.grupo`), el resumen ("Cubre: …") y la convocatoria. Lo único que no sale de la API es el trazo del ícono.

## Goals / Non-Goals

**Goals:**

- Que el puesto aparezca y se pueda practicar sin tocar componentes del frontend.
- Que una base ya desplegada lo reciba con `migrate`, sin ejecutar `cargar_catalogos` a mano.
- Que la reversión de la migración sea segura.

**Non-Goals:**

- Cambiar los cinco enfoques o la rúbrica.
- Un plan de preguntas con temas propios de videojuegos (matemática 3D, física) como enfoques nuevos. El enfoque "Profundidad en la tecnología" ya los cubre dentro del área nueva.
- Los colores del gráfico de progreso.

## Decisions

**D1. Una sola migración de datos, `0014_puesto_videojuegos`.**

- Crea el área, el puesto y sus 17 tecnologías con `update_or_create` por código, con los valores literales.
- Revertir borra solo lo que creó. Si alguna entrevista ya usa ese puesto, el `PROTECT` hace fallar la reversión, que es lo correcto (mismo criterio que `0013`).

Alternativa descartada: depender de `cargar_catalogos`. El comando no crea áreas, y un despliegue en Render solo ejecuta `migrate`.

**D2. Orden y códigos.**

- **Puesto:** código `videojuegos`, `orden` 7 (después de QA), ícono `mando`.
- **Tecnologías:** prefijo `videojuegos_`, con `orden` del 1 al 17 en el orden aprobado. `grupo` es uno de «Motores», «Motores 2D y plataformas», «Web» o «Frameworks de código».

  | Código | Nombre |
  |---|---|
  | `videojuegos_unity` | Unity (C#) |
  | `videojuegos_unreal_cpp` | Unreal Engine (C++) |
  | `videojuegos_unreal_blueprints` | Unreal Engine (Blueprints) |
  | `videojuegos_godot` | Godot (GDScript) |
  | `videojuegos_godot_csharp` | Godot (C#) |
  | `videojuegos_gamemaker` | GameMaker (GML) |
  | `videojuegos_roblox` | Roblox Studio (Luau) |
  | `videojuegos_defold` | Defold (Lua) |
  | `videojuegos_cocos` | Cocos Creator (TypeScript) |
  | `videojuegos_phaser` | Phaser (JavaScript) |
  | `videojuegos_threejs` | Three.js |
  | `videojuegos_babylon` | Babylon.js |
  | `videojuegos_monogame` | MonoGame (C#) |
  | `videojuegos_pygame` | Pygame (Python) |
  | `videojuegos_love` | LÖVE (Lua) |
  | `videojuegos_bevy` | Bevy (Rust) |
  | `videojuegos_sdl_sfml` | SDL / SFML (C++) |

- **Área:** código `desarrollo_videojuegos`, `orden` 11, descripción «Bucle de juego, motores, física, rendimiento y escenas.»

**D3. El plan reusa `_plan()`.**

`Puesto.VIDEOJUEGOS: _plan(_A.DESARROLLO_VIDEOJUEGOS, _A.ESTRUCTURAS_DE_DATOS, _A.DESARROLLO_VIDEOJUEGOS, _A.DESARROLLO_VIDEOJUEGOS)`.

"Datos" es Estructuras de Datos porque en un juego el estado vive en memoria (entidades, escenas, colas de eventos), igual que en Móvil y Escritorio. El comentario de `PLAN_POR_PUESTO` que lo explica se actualiza.

**D4. El ícono es el trazo `device-gamepad-2` de Tabler Icons (MIT).**

Se copió del paquete publicado (`@tabler/icons@3.19.0`), como los demás de `trazosDeIconos.ts`. La nota de origen en `Icono.tsx` exige trazos reales de Tabler y no aproximaciones a mano; así lo decidí al aplicar el cambio, y corrige lo que este punto decía antes. Si el nombre no existiera, `iconoDelCatalogo` caería al ícono genérico: el puesto funcionaría igual.

**D5. Términos del CV sin falsos positivos.**

En `terminos.py`, cada motor entra con variantes inequívocas:

- «LÖVE» solo como `love2d` y `love 2d`: la normalización quita la diéresis y `love` coincidiría con prosa en inglés.
- «Unreal Engine» como `unreal engine` y `unreal`.
- «Three.js» como `three.js` y `threejs`.
- «Babylon.js» como `babylon.js` y `babylonjs`.
- «SDL» y «SFML» como términos separados.
- No se añade `blueprints`, que también es una palabra común.

Los lenguajes que falten (GDScript, Lua, Rust, C++) se añaden solo si no existen ya.

En `CARGOS` entra «Desarrollador de Videojuegos» con estas variantes:

- `desarrollador de videojuegos`
- `programador de videojuegos`
- `game developer`
- `game programmer`
- `desarrollador de juegos`

Como cambia lo que producen el análisis y la brecha, `VERSION_DE_REGLAS` pasa de 3 a 4, que es lo que exige CLAUDE.md.

**D6. Clasificación sin red (`fake.py`).**

`_PALABRAS_DE_PUESTO` gana `("videojuegos", ("videojuego", "game developer", "unity", "unreal", "godot"))` y va **antes** de `movil`. Un aviso de "juegos móviles con Unity" es de videojuegos, no de móvil, y la lista va de lo más específico a lo más general.

## Risks / Trade-offs

- **[Tests con totales fijos]** → Se actualizan a 7 puestos, 70 tecnologías y 11 áreas, más la entrada `videojuegos: 17` en `test_cuantas_tecnologias_ofrece_cada_puesto`. Estos números son los que confirman que la migración y `datos.py` coinciden.
- **[Subir `VERSION_DE_REGLAS` recalcula análisis guardados]** → Es el comportamiento documentado. La revisión de IA de esos análisis se vuelve a pedir, cuando el usuario abre el análisis.
- **[El perfil de tesis no menciona videojuegos]** → Se anota como tarea del autor, igual que con Senior. No bloquea la implementación.
- **[El color del gráfico repetido]** → Videojuegos usará el color de acento por defecto, como Móvil, Escritorio y QA. Queda para `corregir-discrepancias-del-flujo`.

## Migration Plan

1. Desplegar el backend. `migrate` aplica `0014`.
2. Desplegar el frontend: solo añade el trazo del ícono, y sin él el puesto se ve con el ícono genérico.
3. **Rollback:** `migrate catalogos 0013`. Si ya hay entrevistas de videojuegos, la reversión falla por `PROTECT`. En ese caso, desactivar el puesto con `activo=False` desde el admin.
