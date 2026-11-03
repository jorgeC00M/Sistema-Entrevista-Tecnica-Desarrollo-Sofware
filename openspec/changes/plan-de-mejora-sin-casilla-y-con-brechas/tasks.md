## 1. Backend: quitar la casilla

- [x] 1.1 Comprobar con `manage.py showmigrations curriculums` que `0008` no está aplicada; si lo está, ejecutar primero `migrate curriculums 0007`. Después:
  - borrar `migrations/0008_analisisats_arreglos_hechos.py` y `AnalisisATS.arreglos_hechos`;
  - en `services.py`, quitar `"arreglos_hechos": []` del `update_or_create` y `marcar_arreglo`, y también el import de `ValidationError` si queda sin uso.

  Verificar con `manage.py makemigrations --check --dry-run`, que no debe mostrar cambios.
- [x] 1.2 Quitar:
  - `MarcarArregloSerializer` y el campo `arreglos_hechos` del serializer;
  - `CurriculumArreglosView`;
  - la ruta `curriculums-arreglos`;
  - `ArreglosHechosTest`.

  Verificar con `manage.py test apps.curriculums` y con un `grep` de `arreglos_hechos|marcar_arreglo` en `backend/`, que no debe dar resultados.

## 2. Frontend: quitar la casilla

- [x] 2.1 Borrar `components/ui/CasillaHecho.tsx`. Quitar `marcarArreglo` en `api/curriculums.ts` y `arreglos_hechos` en `types/curriculum.ts`. En `ResultadoDelAnalisis.tsx`, quitar:
  - `hechos`, `errorDeArreglo` y `alternarArreglo`;
  - la línea `aria-live` de error;
  - el import de `marcarArreglo`.
- [x] 2.2 `ArreglosDeFormato.tsx` queda solo con `hallazgos`:
  - la grilla `sm:grid-cols-[1fr_minmax(0,16rem)]`;
  - las cajas en `sm:col-start-2` (una columna en el celular);
  - el título sin tachado;
  - el docstring actualizado;
  - se conservan `id`, `tabIndex` y `scroll-mt-32`.

  Verificar con `pnpm exec tsc --noEmit` y con un `grep` de `CasillaHecho|marcarArreglo|arreglos_hechos` en `frontend/src`, que no debe dar resultados.

## 3. Frontend: «Cubrir lo que pide la oferta»

- [x] 3.1 Mover `ChipDeRequisito` de `FrenteAlAviso.tsx` a `features/curriculum/components/ChipDeRequisito.tsx` e importarlo desde allí. En `FrenteAlAviso.tsx`, quitar `porCubrir` y el `<details>` «Cómo cubrir lo que te falta», y actualizar su docstring (experiencia y cargo conservan su sugerencia).
- [x] 3.2 Crear `features/curriculum/components/CubrirLaOferta.tsx` (`{ brecha, sugerencias }`):
  - `Tarjeta como="section"` con el h3 «Cubrir lo que pide la oferta» y la frase «Lo que el aviso pide y tu CV no demuestra: primero las obligatorias.»;
  - una `ul divide-y` con las obligatorias y luego las deseables, sin las `demostrado`;
  - cada fila con `ChipDeRequisito`, «Obligatoria»/«Deseable» (solo con `brecha.separada`) · `NOTA_DE_TECNOLOGIA[estado]`, y `SugerenciaIA` o la pauta fija:
    - `declarado`: «Menciónalo dentro de un logro de tu experiencia o un proyecto.»;
    - `ausente`: «Si lo usaste, escríbelo en tu experiencia o tus proyectos; si no, no lo agregues.»;
  - vacío: `fortaleza` con «Tu CV demuestra todo lo que pide la oferta».

  Verificar con `estilos.test.ts`.
- [x] 3.3 En `ResultadoDelAnalisis.tsx`, panel `mejorar`, este orden: aviso → `ArreglosDeFormato` → `CubrirLaOferta` (solo con `curriculum.con_convocatoria && analisis.brecha`, recibe `sugerenciasDeRequisitos`) → viñetas → redacción. Actualizar el docstring. Verificar con tsc y lint.

## 4. Specs, documentación y verificación

- [x] 4.1 Hacer que remitan a este cambio:
  - `plan-de-mejora-como-lista-de-arreglos`:
    - la fila sin casilla;
    - quitar el requisito «Las casillas se guardan por análisis y no puntúan»;
    - sus tareas 5.1 y 5.2 pasan a remitir aquí;
  - `correcciones-accionables-y-menos-pestanas`: la forma de la corrección y el plegable «Cómo cubrir lo que te falta», que ahora está en «Plan de Mejora»;
  - `pestanas-del-resultado-por-tipo`: la lista de lo que contiene «Match con la Oferta».

  Verificar con `openspec validate` de cada uno.
- [x] 4.2 En `CLAUDE.md`:
  - «Plan de Mejora» sin `CasillaHecho`, `arreglos_hechos`, endpoint ni `0008`, y con `CubrirLaOferta`;
  - `FrenteAlAviso` sin «Cómo cubrir lo que te falta»;
  - la lista de reaperturas.
- [x] 4.3 Verificación completa:
  - la suite del backend (584 tests, OK; se corrió junto con `vista-dirigida-resumen-match-y-plan`: 595 OK);
  - `pnpm exec tsc --noEmit`;
  - `pnpm test`;
  - `pnpm run lint`, que debe quedar en 5 advertencias;
  - `pnpm run build`;
  - `openspec validate plan-de-mejora-sin-casilla-y-con-brechas`.

## 5. Cierre (lo hace el usuario)

- [ ] 5.1 Pruebas manuales:
  - el general sin casilla ni «Cubrir…»;
  - el dirigido con «Cubrir…», primero las obligatorias, con la sugerencia de IA o la pauta fija mientras llega;
  - «Match con la Oferta» sin el plegable;
  - los enlaces de «Formato» llevan a su fila;
  - en el celular, las cajas bajan debajo del texto.
- [ ] 5.2 No hacer commit. El usuario lo hará tras revisar.
