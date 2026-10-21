## Context

El motivo está en proposal.md (Why). Hay cuatro restricciones que condicionan el cómo:

- **Las suites son la red de seguridad.** El backend tiene 512 tests de Django contra Postgres. El frontend tiene `tsc --noEmit`, Vitest (`seleccion.test.ts`, `estilos.test.ts`), oxlint y el build, sin tests de componentes. Para el frontend, "mismo render" se verifica revisando el diff y probando a mano.
- **`test_frontera_con_ia.py` vigila qué módulo importa la capa de IA.** Solo `apps/curriculums/revision.py` puede importar `integrations.ia`. Hoy `anonimizar.py` y `revision.py` importan sus detectores desde `integrations/documentos/ats.py`, y con ellos todo el reglamento.
- **`integrations/ia/` no depende de nada del proyecto.** Que `integrations/ia` importe de `integrations/documentos` sería un acoplamiento nuevo, aunque ninguno de los dos use Django.
- **La pantalla de CV está cerrada** (`cv-cierre-final`). Solo se reabre por un defecto P0/P1.

## Goals / Non-Goals

**Goals:**

- Que cada eliminación quede justificada por un grep sin usos en `backend/` (sin `.venv`) y `frontend/src/`, y que el diff lo muestre.
- Que los prompts que reciben los proveedores salgan idénticos byte a byte antes y después.
- Que no se genere ninguna migración.

**Non-Goals:**

- Mejorar el rendimiento más allá de no recalcular el nombre detectado. Evitar las 4 o 5 llamadas a `segmentar()` por análisis queda para otro cambio: tocar `fechas` y `brecha` no es trivial.
- Cambiar textos visibles, clases CSS resultantes o códigos HTTP.

## Decisions

**D1. Los prompts se protegen con un test de igualdad, no con revisión a ojo.**

Antes de R1 se añade `tests/integration/test_prompts_estables.py`. Construye `entrevistador.sistema/usuario` y `evaluador.sistema/usuario` para un contexto de una capa ("Django") y otro de dos ("React + Node.js"), y los compara con cadenas literales capturadas **antes** del refactor.

Alternativa descartada: confiar en los tests existentes. Esos tests validan el parseo, no el texto exacto, así que un espacio de más pasaría.

**D2. `ats.py` se divide, pero los imports viejos siguen funcionando.**

- `contacto.py` recibe `CORREO`, `_TELEFONO`, `URL`, `telefonos`, `detectar_telefono` y `detectar_nombre`.
- `geometria.py` recibe `_hay_dos_columnas` y sus constantes.
- `anonimizar.py` y `revision.py` pasan a importar de `contacto`, que es el objetivo: enmascarar ya no carga el reglamento.
- `ats.py` importa de los dos módulos nuevos, así que `from integrations.documentos.ats import detectar_nombre` sigue resolviendo y no rompe a nadie fuera del repo. Para hacerlo explícito, se lista en `__all__` o se importa con `as`.

Alternativa descartada: dejar `ats.py` entero. Con 813 líneas es lo más difícil de explicar en la defensa, y `anonimizar` depende de todo el reglamento para usar dos expresiones regulares.

**D3. Las marcas de enmascaramiento se comparten dentro de la capa de IA, no desde `documentos`.**

- `SIN_PUESTO` y `_MARCADOR` pasan a `integrations/ia/prompts/marcadores.py`, que importan `revisor_cv.py` y `analista_convocatoria.py`.
- La correspondencia con las constantes de `anonimizar.py` la fija un test en `tests/integration/`: enmascarar con cada marca y comprobar que `MARCADOR` la reconoce.

Alternativa descartada: importar `anonimizar` desde los prompts. Crearía la dependencia `ia → documentos`, que hoy no existe y que el diseño evita.

**D4. Las tres normalizaciones de texto no se fusionan.**

`terminos.normalizar`, `revisor_cv._comparable` y `analista_convocatoria.comparable` difieren en detalles (tildes, espacios, mayúsculas) de los que depende el anclaje. Fusionarlas cambiaría qué sugerencias de la IA sobreviven, y eso es cambiar comportamiento. Quedan anotadas para el cambio de bugs.

**D5. B4 se ajusta en los tests, no se reemplaza por otra clave.**

`test_catalogos.py:143` cuenta 53 tecnologías activas a través de la clave `tecnologias`. El conteo pasa a hacerse sobre `/api/catalogos/puestos/` (la suma de `tecnologias` por puesto), que es lo que de verdad consume el frontend.

`test_catalogos.py:162` (la clave en la respuesta pública) pasa a afirmar que `tecnologias` **no** está, para que reaparecer sea una decisión explícita.

**D6. Los refactors del frontend solo extraen.**

G1 a G9 mueven código idéntico a un único sitio; ninguno cambia clases, textos ni orden del DOM.

- G3 (fechas): las opciones de `toLocaleDateString` se copian literales de cada sitio. Si dos sitios usan opciones distintas, se crean dos funciones con nombre propio, no una con parámetros.
- G7: se descarta si `EtiquetaMono` no reproduce exactamente las clases actuales.

**D7. En `features/curriculum/` solo se aplican eliminaciones de símbolos.**

F1 (`MAXIMO_CARACTERES`) y F5 (`aria-hidden` sobre `Icono`) se aplican porque no alteran el DOM: `Icono` ya emite `aria-hidden`. Los refactors equivalentes dentro de esa carpeta se anotan en `openspec/changes/cv-cierre-final/pendientes.md` (`fechaLegible` duplicada, `limpiarErrorDeCampo`, `useEntrevista`/`CurriculumPage` sin `usePeticion`).

**D8. El orden reduce el riesgo.**

1. Primero las eliminaciones, que son triviales de revertir.
2. Después los refactors del backend.
3. Al final los del frontend.

Cada grupo cierra con su suite completa en verde antes de pasar al siguiente, para que un fallo apunte a un solo grupo.

## Risks / Trade-offs

- **[B4 rompe a un consumidor externo desconocido]** → No hay clientes fuera de este frontend: es un proyecto de grado sin API pública documentada. Además, D5 deja la ausencia de la clave fijada en un test.
- **[R4 rompe la detección del test de frontera]** → El test analiza imports con `ast` y un guardián de `sys.meta_path`. Tras mover los detectores, se ejecuta `apps.curriculums.tests.test_frontera_con_ia` en particular, y además la suite completa.
- **[B5: algún despliegue lee `settings.IA_PROVEEDOR` desde fuera del código]** → Render solo define variables de entorno, que la factory sigue leyendo. Se borra solo tras un grep vacío que incluya `tests/runner.py`.
- **[R7 genera una migración por cambiar `Meta`]** → Se ejecuta `makemigrations --check --dry-run`. Si propone algo, se revierte R7: es cosmético.
- **[El frontend no tiene tests de componentes]** → Los refactors G1 a G9 son extracciones mecánicas, verificadas con `tsc`, build y una ruta manual definida en tasks.md.
- **[Mezclar limpieza con arreglos de bugs]** → Está prohibido en este cambio. Si al aplicarlo aparece un bug, se anota en `corregir-discrepancias-del-flujo` y no se arregla aquí.

## Migration Plan

No hay datos ni esquema que migrar. Se despliega como cualquier commit, y el rollback es revertir el commit. Si se hace en varios commits (uno por grupo de tasks.md), cada uno revierte por separado.
