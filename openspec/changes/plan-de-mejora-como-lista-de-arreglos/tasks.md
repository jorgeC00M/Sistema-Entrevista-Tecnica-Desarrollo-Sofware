## 1. Backend

- [x] 1.1 Agregar `AnalisisATS.arreglos_hechos = JSONField(default=list, blank=True)` con su migración `0008`. En `services.py`, reiniciarlo a `[]` donde se recalcula el diagnóstico, junto a `revision_ia`.
- [x] 1.2 Agregar `services.marcar_arreglo(usuario, pk, codigo, hecho)`:
  - 404 si el análisis es ajeno;
  - `ValidationError` (400) si el código no está entre las debilidades;
  - idempotente, guardando con `update_fields`.
- [x] 1.3 En el serializer, publicar `arreglos_hechos` filtrado a las debilidades actuales. Agregar la vista `POST /api/curriculums/<id>/arreglos/`, con `{codigo, hecho}`, que responde `{arreglos_hechos}`, y su URL.
- [x] 1.4 Tests:
  - marcar y desmarcar, sin duplicar;
  - código ajeno → 400;
  - otro usuario → 404;
  - sin sesión → 401;
  - el detalle publica `arreglos_hechos` filtrado;
  - un diagnóstico recalculado lo vacía.

  Verificar con `manage.py test apps.curriculums`.

## 2. Frontend: datos y componente base

- [x] 2.1 `types/curriculum.ts`: `AnalisisATS.arreglos_hechos?: string[]`. `api/curriculums.ts`: `marcarArreglo(id, codigo, hecho)`.
- [x] 2.2 `components/ui/CasillaHecho.tsx`:
  - botón de 44 px, `rounded-control`;
  - `aria-pressed` y `aria-label` recibido;
  - marcada, icono `fortaleza` sobre `bg-exito-fondo`;
  - foco con `foco-anillo`.

  Verificar con `estilos.test.ts`.

## 3. Frontend: la pestaña

- [x] 3.1 Mover `ChipDeSeveridad` a su propio archivo. Crear `ArreglosDeFormato.tsx`:
  - `Tarjeta` con el título y la frase;
  - una `ul` de filas (`debilidadesPorGravedad`);
  - cada fila en la grilla `[auto_1fr_minmax(0,16rem)]`, que baja a dos columnas en el celular: casilla, acción con chip y detalle, y AHORA (`titulo`) / DESPUÉS (`ejemplo`, solo si existe);
  - el `id`, `tabIndex` y `scroll-mt-32` de cada fila;
  - el vacío «No hay arreglos de formato pendientes» con `fortaleza`.
- [x] 3.2 En `ResultadoDelAnalisis.tsx`:
  - el estado optimista de las casillas, con su línea `aria-live` de error;
  - el panel `mejorar`: el aviso de la IA, `ArreglosDeFormato`, las viñetas y la redacción;
  - quitar la línea de conteo, `ConservaloAlCorregir` y `ListaDeHallazgos`.

  En `AvisoDeRevision.tsx`, quitar la rama «nada que sugerir».
- [x] 3.3 Código muerto: borrar `ConservaloAlCorregir.tsx`, `ListaDeHallazgos.tsx` (si nadie lo usa) y `correccionesMedidas` / `sugerenciasDeIA` con sus tests (si quedan sin uso). Verificar con un `grep` de cada uno y con tsc, tests y lint.

## 4. Specs, documentación y verificación

- [x] 4.1 Hacer que remitan a este cambio:
  - `estado-del-cv-por-datos-clave` («Plan de Mejora abre con lo que ya funciona»);
  - `pestanas-del-resultado-por-tipo` («Plan de Mejora conserva las correcciones», el conteo);
  - `correcciones-accionables-y-menos-pestanas` y `resumen-en-dos-columnas-y-ejemplos` (la forma de cada corrección);
  - `sin-preguntas-probables-en-el-resumen` (el aviso).

  Verificar con `openspec validate` de cada uno.
- [x] 4.2 En `CLAUDE.md`:
  - «Plan de Mejora» como lista de arreglos;
  - `arreglos_hechos`, el endpoint y la migración `0008`;
  - sin «Lo que ya funciona» ni el aviso vacío;
  - la lista de reaperturas.
- [x] 4.3 Verificación completa:
  - la suite del backend;
  - `pnpm exec tsc --noEmit`;
  - `pnpm test`;
  - `pnpm run lint`, que debe quedar en 5 advertencias;
  - `pnpm run build`;
  - `openspec validate plan-de-mejora-como-lista-de-arreglos`.

## 5. Cierre (lo hace el usuario)

- [ ] 5.1 Pruebas manuales (la casilla ya no existe, ver `plan-de-mejora-sin-casilla-y-con-brechas`):
  - marcar, desmarcar y recargar;
  - AHORA / DESPUÉS con ejemplo, y solo AHORA cuando no lo hay;
  - en el celular, las cajas bajan debajo del texto;
  - un CV sin errores muestra «No hay arreglos de formato pendientes»;
  - los enlaces de «Formato» del Resumen llevan a su fila;
  - no aparecen «Lo que ya funciona» ni «La IA no encontró nada…».
- [x] 5.2 ~~Aplicar la migración `0008`~~: ya no hace falta, la casilla y su migración se retiraron en `plan-de-mejora-sin-casilla-y-con-brechas`.
- [ ] 5.3 No hacer commit. El usuario lo hará tras revisar.
