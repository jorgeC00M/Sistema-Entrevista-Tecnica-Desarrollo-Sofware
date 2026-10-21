## 1. Capa de IA (enums y plan)

- [x] 1.1 En `integrations/ia/prompts/schemas.py`:
  - añade `AreaTecnica.DESARROLLO_VIDEOJUEGOS = "desarrollo_videojuegos"`, con etiqueta «Desarrollo de Videojuegos»;
  - añade `Puesto.VIDEOJUEGOS = "videojuegos"`, con etiqueta «Desarrollador de Videojuegos»;
  - añade a `PLAN_POR_PUESTO` la entrada de design D3 y actualiza el comentario sobre "Datos".

  Verifica que `python -c "from integrations.ia.prompts.schemas import *; print(areas_que_cubre(Puesto.VIDEOJUEGOS))"` imprime las tres áreas.
- [x] 1.2 Añade la fila `Puesto.VIDEOJUEGOS` a la tabla que fija `test_areas_del_plan_segun_el_diseno` en `tests/integration/test_contrato_ia.py`. Verifica que `python -m unittest tests.integration.test_contrato_ia` pasa.
- [x] 1.3 Añade `("videojuegos", ("videojuego", "game developer", "unity", "unreal", "godot"))` en `integrations/ia/fake.py::_PALABRAS_DE_PUESTO`, antes de `movil` (design D6). Verifica con un test en `tests/integration/` que el fake clasifica «Desarrollador de videojuegos con Unity» como `videojuegos` y «Desarrollador Flutter» como `movil`.

## 2. Catálogo y migración

- [x] 2.1 Añade a `apps/catalogos/datos.py` el `DatosPuesto` `videojuegos`, con las 17 tecnologías en el orden y con los grupos de design D2, usando `_tec(..., grupo=...)`. Verifica que `len(PUESTOS[-1].tecnologias) == 17`.
- [x] 2.2 Crea `apps/catalogos/migrations/0014_puesto_videojuegos.py`. Debe:
  - depender de `0013_frameworks`;
  - crear con `update_or_create` y valores literales el área (`orden` 11), el puesto (`orden` 7, ícono `mando`) y las 17 tecnologías;
  - ser reversible, borrando solo lo creado (design D1).

  Verifica tres cosas:
  - `python manage.py migrate` termina sin errores;
  - `python manage.py migrate catalogos 0013` revierte, en una base sin entrevistas del puesto;
  - `python manage.py migrate` vuelve a aplicarla.
- [x] 2.3 Actualiza los totales fijos:
  - `test_catalogos.py`: 7 puestos, 70 tecnologías activas, 11 áreas;
  - `test_puestos.py`: añade `"videojuegos": 17` y cambia las 10 áreas a 11.

  Añade a `test_puestos.py` un test que compruebe los cuatro grupos de videojuegos, en orden y con sus nombres. Verifica que `python manage.py test apps.catalogos` pasa, incluidos `test_cargar_catalogos_coincide_con_la_migracion` y los dos tests de sincronía con los enums.
- [x] 2.4 Añade a `apps/entrevistas/tests/` dos tests:
  - iniciar una entrevista de `videojuegos` con `videojuegos_godot` y nivel `junior` responde 201, y las preguntas 1 y 2 quedan con las áreas Fundamentos de Programación y Desarrollo de Videojuegos;
  - pasar `segunda_tecnologia` o una tecnología de Backend responde 400.

  Verifica que `python manage.py test apps.entrevistas` pasa.

## 3. Módulo de CV y convocatoria

- [x] 3.1 Añade a `integrations/documentos/terminos.py` los motores y frameworks, con las variantes de design D5, y los lenguajes que falten. Añade a `CARGOS` «Desarrollador de Videojuegos» con sus variantes. Añade casos a los tests de términos y brecha:
  - `encontrar("Experiencia con Godot y Unity")` devuelve `{"Godot", "Unity"}`;
  - `encontrar("I love clean code")` no devuelve «LÖVE»;
  - un CV con Godot en la experiencia, medido contra una convocatoria que pide Godot, da `demostrado`;
  - «Game Developer» se reconoce como el cargo.

  Verifica que `python -m unittest tests.integration.test_brecha tests.integration.test_ats` pasa.
- [x] 3.2 Sube `VERSION_DE_REGLAS` de 3 a 4 en `integrations/documentos/ats.py`, y actualiza la línea de CLAUDE.md ("It is 3 since…"). Verifica que `python manage.py test apps.curriculums` pasa, incluido el test de recálculo de un análisis con una versión anterior.

## 4. Frontend

- [x] 4.1 Añade el trazo `mando` (un mando de consola, 24×24, líneas de 2 px y el mismo estilo que los demás) a `components/ui/trazosDeIconos.ts`. Verifica que `pnpm exec tsc --noEmit`, `pnpm test` (incluido `estilos.test.ts`) y `pnpm run build` pasan.

## 5. Documentación y verificación

- [x] 5.1 Actualiza CLAUDE.md:
  - los seis puestos pasan a ser siete en la lista de "An interview is a puesto";
  - "53 active tecnologías" pasa a 70;
  - el número de tests de la suite completa.

  Añade una línea que recuerde que el perfil de tesis debe incluir el puesto, como se hizo con Senior. Verifica con `grep -n "videojuegos" CLAUDE.md`.
- [x] 5.2 Ejecuta la suite completa y los chequeos:
  - `python manage.py test` en verde;
  - `makemigrations --check --dry-run` sin cambios;
  - `tsc`, `pnpm test`, `lint` y `build` en verde.
- [ ] 5.3 Haz una prueba manual con `IA_PROVEEDOR=fake`:
  1. En Nueva entrevista aparece «Desarrollador de Videojuegos» con el ícono de mando.
  2. Al elegirlo, Tecnología muestra los cuatro grupos y el resumen dice "Cubre: Fundamentos de Programación, Desarrollo de Videojuegos, Estructuras de Datos".
  3. Inicia una entrevista con Godot (GDScript) y responde las 5 preguntas.
  4. Revisa que en Retroalimentación aparezca el área «Desarrollo de Videojuegos».
  5. En la pestaña Con convocatoria, pega un aviso de «Game Developer Unity» y comprueba que detecta el puesto.
- [x] 5.4 No hagas commit. El usuario lo hará cuando revise los cambios.

## Notas de la aplicación (21-10-2026)

- **2.2:** la migración se probó de ida, de vuelta y otra vez de ida sobre una SQLite temporal (7/70/11 → 6/53/10 → 7/70/11), no sobre la base de `DATABASE_URL`. No se sabía si esa base es solo de desarrollo, así que el usuario debe ejecutar `python manage.py migrate` cuando lo decida. La suite de Django la aplica sobre su propia base de pruebas.
- **2.3:** había un total fijo más de los previstos: `test_un_puesto_inactivo_no_se_ofrece` pasó de 5 a 6.
- **4.1:** el ícono es `device-gamepad-2` de Tabler (`@tabler/icons@3.19.0`), y no un trazo propio. Así lo exige la nota de `Icono.tsx`; design D4 quedó corregido.
- **3.1:** también se añadieron C++, Rust, Lua, Luau y GDScript, que no estaban en `TERMINOS`.
- **Totales:** 528 tests en el backend, antes 516 (12 nuevos), y 32 en el frontend.
