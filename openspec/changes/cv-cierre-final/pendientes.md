# Pendientes P2/P3 de la pantalla de CV

La pantalla está cerrada desde `cv-cierre-final`: solo se reabre por un defecto P0/P1. Lo que se encuentre después y sea pulido va aquí y no abre un cambio nuevo.

## Refactors detectados en la auditoría del 21-10-2026 (`limpiar-codigo-muerto-y-refactorizar`)

Ese cambio no los aplicó para no tocar la pantalla. Ninguno cambia lo que ve el usuario.

- ~~**`fechaLegible` duplicada** en `ResultadoDelAnalisis.tsx` y `HistorialDeAnalisis.tsx`.~~ Resuelto en `diferenciar-revision-y-comparacion-de-cv`: vive en `lib/fechas.ts`.
- **`limpiarErrorDeCampo` en `CurriculumPage.tsx`** reimplementa `sinErrorDeCampo` de `api/errores.ts`, que ya usa `RegistroPage`.
- **`CurriculumPage` carga el análisis con un efecto escrito a mano** (patrón `cancelado`), en vez de `usePeticion`.
- **Dos entradas de convocatoria con reglas distintas.**
  - `CampoConvocatoria` usa `ControlSegmentado`, un `<textarea>` propio con `id` fijo y un máximo de 20 000 caracteres, y vacía la otra vía.
  - `PanelDeConvocatoria`, en Nueva entrevista, usa tarjetas, `Textarea`, un máximo de 5 000 caracteres y conserva las dos vías.

  Unificarlas cambia límites y comportamiento, así que necesita su propia decisión.

## Defectos de esa misma auditoría que sí tocan esta pantalla

Van al cambio `corregir-discrepancias-del-flujo`, porque al menos uno es P1.

- ~~**P1.**~~ Resuelto en `diferenciar-revision-y-comparacion-de-cv` (`SECCIONES_CON_ESTADO_COMPARTIDO` en `LimiteDeError.tsx`). Cada navegación vuelve a montar la página, por la `key={pathname}` de `LimiteDeErrorDeRuta`. Por eso "Analizar otro" pierde el archivo y la convocatoria, y tras analizar se vuelve a pedir el análisis al servidor.
- **P2.** `/mi-cv/abc` se queda cargando para siempre: `Number('abc')` es `NaN`, y `NaN === NaN` es falso.
- ~~**P3.**~~ Resuelto en `diferenciar-revision-y-comparacion-de-cv`: solo `ZonaDeArchivo` lo dice, y en MB. El límite del archivo aparece como "2048 KB" en `ZonaDeArchivo` y como "2 MB" en `EntradaDelAnalisis`.

## Resuelto por `diferenciar-revision-y-comparacion-de-cv`

- ~~Mostrar el texto del CV junto a lo que lee el ATS: «Así ve tu CV el ATS».~~ Descartado en `correcciones-accionables-y-menos-pestanas` por decisión del usuario: su lista repetía Mejorar. Lo que el ATS no lee se explica en el detalle de cada corrección.
