## 1. Backend: nota parcial en el listado

- [x] 1.1 En `apps/entrevistas/selectors.py::_con_conteo`, añade `promedio_calificado=Avg("intercambios__evaluacion__puntuacion")` junto a `preguntas_calificadas` (design D3). En `EntrevistaSerializer`, añade `puntuacion_parcial` (`SerializerMethodField`) que:
  - devuelve `round(promedio_calificado, 2)` solo cuando `estado == ABANDONADA` y hay al menos una respuesta calificada;
  - devuelve `None` en cualquier otro caso;
  - sin la anotación, lo calcula con una consulta.

  Añádelo a `Meta.fields`. Verifica con `python manage.py test apps.entrevistas` que la suite sigue en verde.
- [x] 1.2 Añade tests de API en `apps/entrevistas/tests/test_historial_tabla.py`:
  - una abandonada con respuestas de 50 y 42 devuelve `puntuacion_parcial == 46`, y esa misma nota coincide con `resumen.promedio` de su `/resultados/`;
  - una abandonada sin respuestas devuelve `null`;
  - una **en curso con dos evaluaciones** devuelve `puntuacion_parcial` y `puntuacion_promedio` en `null`;
  - una finalizada devuelve `puntuacion_parcial` en `null` y su `puntuacion_promedio`;
  - `GET /api/entrevistas/` con 3 entrevistas hace el mismo número de consultas que con 1 (`assertNumQueries`).

  Verifica con `python manage.py test apps.entrevistas.tests.test_historial_tabla`.

## 2. Frontend: lógica de paginación

- [x] 2.1 Crea `frontend/src/lib/paginacion.ts` con `paginasVisibles(actual, total)` y `recortar(pagina, total)` (design D2), y su test `lib/paginacion.test.ts`. Casos de `paginasVisibles`:

  | Páginas | Actual | Resultado |
  |---|---|---|
  | 1 | 1 | `[1]` |
  | 2 | 2 | `[1,2]` |
  | 3 | 2 | `[1,2,3]` |
  | 12 | 1 | `[1,2,3]` |
  | 12 | 6 | `[5,6,7]` |
  | 12 | 12 | `[10,11,12]` |
  | 12 | 11 | `[10,11,12]` |

  Además: `recortar(99, 2) === 2`, `recortar(0, 2) === 1`, y `recortar(NaN, 2) === 1`.

  Verifica con `pnpm test` que pasa.

## 3. Frontend: componentes reutilizables

- [x] 3.1 Crea `components/ui/Paginacion.tsx` según design D2:
  - `nav` con nombre;
  - rango con `aria-live`;
  - números en `rounded-control` con `foco-anillo` y la actual en acento con `aria-current="page"`;
  - ‹ y › con `BotonIcono` (`chevron-izquierda`/`chevron-derecha`) deshabilitados en los extremos;
  - nada si hay una página.

  Verifica que `pnpm exec tsc --noEmit` y `pnpm test` pasan, este último incluido `estilos.test.ts`, que exige `<button` solo en `components/ui/` y sin valores escritos a mano.
- [x] 3.2 Crea `components/ui/Tabla.tsx` genérica según design D2:
  - `<table>` desde `sm`, con `caption` sr-only y `th scope="col"`;
  - `<ul>` de tarjetas por debajo de `sm`;
  - `refInicio` enfocable.

  Verifica que `tsc` y `estilos.test.ts` pasan.

## 4. Frontend: el historial

- [x] 4.1 Añade `puntuacion_parcial: number | null` al tipo `Entrevista` en `types/entrevista.ts`, con su comentario. Verifica que `tsc` pasa.
- [x] 4.2 Crea `features/historial/components/TablaDeEntrevistas.tsx`:
  - las 7 columnas y la tarjeta móvil, con el contenido de design D4;
  - el corte de 10 por página;
  - `?pagina=` con `useSearchParams` y `recortar`;
  - foco y desplazamiento al cambiar de página (design D5).

  Reemplaza `ListaEntrevistas` en `HistorialPage.tsx` y elimina `ListaEntrevistas.tsx`. Verifica que `grep -rn ListaEntrevistas frontend/src` no devuelve nada, que `tsc`, `pnpm test`, `pnpm run lint` y `pnpm run build` pasan, y que el lint no tiene avisos nuevos (la base son 5).

## 5. Documentación y verificación

- [x] 5.1 En CLAUDE.md:
  - añade `Tabla` y `Paginacion` a la lista de componentes base de "Style system";
  - anota que `puntuacion_parcial` sigue la misma regla que la nota (nunca para `EN_PROGRESO`) en "The grade is not published until the interview ends";
  - actualiza el número de tests.

  Verifica con `grep -n "Paginacion\|puntuacion_parcial" CLAUDE.md`.
- [x] 5.2 Ejecuta la suite completa: `python manage.py test` en verde, `makemigrations --check` sin cambios, y `tsc`, `pnpm test`, `lint` y `build` en verde.
- [ ] 5.3 Haz una prueba manual con `IA_PROVEEDOR=fake`, sobre un usuario con más de 10 entrevistas de distintos estados (finalizada, abandonada con y sin respuestas, en curso):
  1. La tabla muestra 10 filas y la paginación aparece debajo a la derecha, con el rango a la izquierda.
  2. La página 2 cambia las filas, la URL dice `?pagina=2` y el foco vuelve a la tabla.
  3. Al abrir unos resultados y volver, sigue en la página 2.
  4. «46 · parcial» aparece en la abandonada.
  5. En curso muestra «—» y «Continuar».
  6. A 375 px se ven tarjetas, sin scroll horizontal.
  7. La paginación funciona solo con teclado.
- [x] 5.4 No hagas commit. El usuario lo hará tras revisar.

## Notas de la aplicación (21-10-2026)

- **Paginación de 3 números.** Al aplicar el cambio, el usuario pidió que la paginación muestre solo 3 números: una ventana consecutiva con la actual al centro, sin «…» ni primera o última fija. Se actualizaron el spec, el design (D2), el proposal y la tabla de la tarea 2.1 antes de implementar.
- **Ejemplo de nota parcial.** El ejemplo del spec pasó de «50 y 46 → 48» a «50 y 42 → 46», porque 46 no es una nota posible por respuesta (solo existen 13).
- **Totales:** 533 tests en el backend (antes 528; 5 nuevos) y 48 en el frontend (antes 32; 16 nuevos de `paginacion.test.ts`). El lint sigue con los mismos 5 avisos.
