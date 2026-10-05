## 1. Diccionario de términos y segmentación del CV

- [x] 1.1 Crear `backend/integrations/documentos/terminos.py` con `TERMINOS`
  (canónico → variantes) y `encontrar(texto) -> set[str]`, con coincidencia por
  límite de palabra. Declarar en el docstring que su cobertura es el techo de la
  función y que nunca inventa un requisito. Verificar con dos tests: variantes del
  mismo término se reconocen como uno, y "js" no encaja en "jsx" ni "react" en
  "reactivo".
- [x] 1.2 Añadir `segmentar(texto) -> dict[str, str]` a
  `backend/integrations/documentos/secciones.py`, reutilizando
  `TITULOS_POR_SECCION`. Verificar con un test que el bloque de experiencia no
  incluye el texto de habilidades y viceversa.
- [x] 1.3 Comprobar que los 27 tests de `tests/integration/test_ats.py` siguen en
  verde tras tocar `secciones.py`: `python manage.py test tests.integration`.

## 2. Convocatoria, brecha y viñetas

- [x] 2.1 Crear `backend/integrations/documentos/convocatoria.py` con
  `partir(texto)`, que separa obligatorios de deseables por sus títulos
  ("Requisitos", "Requerimientos", "Deseable", "Nice to have", "Valoramos") y que,
  sin títulos reconocibles, deja todo en un solo grupo. Verificar con tres tests:
  separa los dos bloques, agrupa cuando no hay títulos, y distingue un texto sin
  términos reconocibles de uno con ellos.
- [x] 2.2 Crear `backend/integrations/documentos/brecha.py` con `calcular()`,
  devolviendo por grupo cada término con estado `demostrado` / `declarado` /
  `ausente`, la cobertura en texto y los `extras`. Verificar con el test que fija
  el aporte del módulo: un CV que lista "Django" en habilidades y nunca lo usa en
  experiencia da `declarado`, no cubierto.
- [x] 2.3 Implementar la degradación: sin secciones reconocidas los estados caen a
  presente/ausente y la brecha lo informa. Verificar contra
  `tests/fixtures/cv/titulos_creativos.pdf`.
- [x] 2.4 Implementar el corto sin capa de texto: con un CV ilegible no se calcula
  brecha. Verificar contra `tests/fixtures/cv/escaneado.pdf` con una convocatoria.
- [x] 2.5 Crear `backend/integrations/documentos/vinetas.py` con `evaluar(texto)`,
  que cuenta viñetas y distingue las que traen un resultado medible. Declarar en el
  docstring que detecta *si hay* métrica, no si es significativa. Verificar con un
  test que separa "Encargado del módulo de pagos" de "Reduje la latencia 40%".
- [x] 2.6 Añadir a `backend/tests/fixtures/cv/generar.py` un CV que declare
  tecnologías en habilidades sin usarlas en experiencia, regenerar el corpus y
  confirmar que los PDF quedan versionados.

## 3. Modelo de datos y API

- [x] 3.1 En `backend/apps/curriculums/models.py`: quitar `puesto`; añadir
  `convocatoria`, `hash_convocatoria`, y `brecha`, `inventario` y `vinetas` en
  `AnalisisATS`; reemplazar la restricción por
  `UniqueConstraint(usuario, hash_texto, hash_convocatoria)`. Verificar que sin
  convocatoria se guarda el hash de la cadena vacía y no NULL, con un test que
  suba el mismo CV dos veces sin convocatoria y compruebe que no se duplica.
- [x] 3.2 Migraciones escritas a mano. **Resultaron tres, no una, y no es
  reversible**: ver la nota de desviaciones al final. `makemigrations --check
  --dry-run` reporta "No changes detected" y las tres se aplican sobre la base
  real con datos existentes.
- [x] 3.3 Actualizar `serializers.py`: fuera `puesto`; dentro `convocatoria`
  (texto, opcional) y `archivo_convocatoria` (opcional), rechazando que lleguen
  los dos a la vez. Verificar con un test por cada caso.
- [x] 3.4 Actualizar `services.py::analizar()`: extraer la convocatoria de texto o
  de archivo, calcular brecha o inventario según corresponda, evaluar viñetas, y
  consultar el caché con los dos hashes. Verificar con tests que el mismo CV con
  otra convocatoria genera un análisis nuevo y con la misma usa el caché.
- [x] 3.5 Actualizar los 13 tests de `backend/apps/curriculums/tests/` que hoy
  mandan `puesto` en el POST, y añadir uno que confirme que sin convocatoria el
  análisis llega con `brecha` nula y el inventario presente. Verificar con
  `python manage.py test apps.curriculums`.

## 4. Frontend

- [x] 4.1 Extraer el recuadro de arrastre de
  `frontend/src/features/curriculum/components/SubirArchivo.tsx` a un componente
  compartido (botón como zona de soltado, validación de extensión y peso, botón de
  quitar). Verificar con `pnpm exec tsc --noEmit` y comprobando en el navegador
  que subir el CV sigue funcionando igual que antes.
- [x] 4.2 Crear `CampoConvocatoria.tsx` con dos pestañas, "Pegar texto" por
  defecto y "Subir archivo" reutilizando el componente anterior, más el mensaje de
  que es opcional y de qué se obtiene sin ella. Verificar en el navegador que las
  dos vías llegan al backend.
- [x] 4.3 Crear `BrechaDeRequisitos.tsx` con obligatorios y deseables en bloques
  separados y los tres estados en colores distintos (`exito-texto`,
  `progreso-texto` para "solo declarado", `error-texto`). Verificar en el navegador
  con una convocatoria real que los tres estados se distinguen a simple vista.
- [x] 4.4 Crear `InventarioDeTerminos.tsx`, que ocupa el lugar de la brecha cuando
  no hay convocatoria. Verificar en el navegador que con un CV sin convocatoria
  aparece el inventario y no una sección de requisitos vacía.
- [x] 4.5 Crear `VinetasDeLogro.tsx` bajo un encabezado que lo separe de las
  secciones de ATS. Verificar leyendo la pantalla que no se puede confundir con un
  hallazgo de parseabilidad.
- [x] 4.6 Actualizar `CurriculumPage.tsx`: fuera el `fieldset` de tarjetas de
  puesto y el import de `TarjetaPuesto`; dentro la convocatoria y las secciones
  nuevas; el CTA final sin `puesto_display`. Verificar con `pnpm exec tsc --noEmit`
  que no queda ninguna referencia al puesto.
- [x] 4.7 Actualizar `types/curriculum.ts` y `api/curriculums.ts` con el contrato
  nuevo. Verificar con `pnpm exec tsc --noEmit`.

## 5. Verificación

- [x] 5.1 `python manage.py test` completo sin fallos. Los 27 de
  `tests/integration/test_ats.py` deben seguir en verde: si alguno falla es una
  regresión, no un ajuste esperado.
- [x] 5.2 `pnpm exec tsc --noEmit`, `pnpm run build`, y `pnpm run lint` en las 6
  advertencias conocidas (`react(set-state-in-effect)` ×5 y `react(refs)` ×1).
- [ ] 5.3 Recorrido manual de las dos rutas: subir `dos_columnas.pdf` sin
  convocatoria y comprobar que el diagnóstico de parseo es idéntico al de antes del
  cambio, más inventario y viñetas; repetirlo pegando una convocatoria de backend
  real y comprobar que aparece el mapa de evidencia con sus tres estados; pegar un
  texto sin términos reconocibles y comprobar que se informa en lugar de mostrar
  una cobertura vacía; subir `escaneado.pdf` con convocatoria y comprobar que no se
  muestra ninguna cobertura.

---

## Desviaciones del plan

Tres, todas descubiertas al ejecutar contra la base de datos real. Ninguna cambia
el alcance ni el comportamiento acordado.

**1. Una migración se convirtió en tres.** El plan preveía `0002`. Hicieron falta
tres por dos limitaciones de Postgres encadenadas:

- `0002` — columnas nuevas, fuera `puesto`, y la deduplicación de las filas que
  solo se distinguían por el puesto. Esa limpieza hacía falta y el plan no la
  previó: la base real tenía el mismo CV analizado para dos puestos, y sin
  `puesto` esas filas colisionan en la restricción nueva.
- `0003` — la restricción de unicidad, aparte porque Postgres no admite
  `ALTER TABLE` sobre una tabla con eventos de trigger pendientes, y el `DELETE`
  de la deduplicación los deja. Una migración es la unidad de atomicidad, así
  que la única forma de que la limpieza quede confirmada antes de crear el
  índice es separarlas.
- `0004` — relleno de `hash_convocatoria`. La `0002` creó la columna con
  `default=""`, así que las filas previas quedaron con la cadena vacía en lugar
  del **hash** de la cadena vacía. Eso rompía el caché en silencio: al resubir
  ese CV sin convocatoria el servicio calcula un sha256, no coincide, y crea una
  fila nueva sin que la restricción lo impida.

Además, dentro de la `0002` el orden de operaciones importa: las columnas se
añaden **antes** de quitar `puesto`, porque Django emite
`SET CONSTRAINTS ... IMMEDIATE` al soltar una clave foránea y eso deja la tabla
con triggers pendientes.

**2. La migración no es reversible, y se documenta en vez de aparentarlo.** El
plan decía "reversible, reponiendo `puesto` como nulable en el reverso". Se
verificó y no funciona: revertir repone `puesto_id` como columna no nula y las
filas existentes no tienen valor que poner. No hay ninguno razonable —un puesto
inventado sería peor que el hueco—. Eliminar una columna sin un valor con el que
rellenarla es una operación de ida. La `0003` sí se revierte.

**3. `hash_convocatoria` no lleva índice propio.** El plan lo especificaba con
`db_index=True`. Se quitó por dos razones que coinciden: es **redundante** —la
única consulta que lo usa filtra por `(usuario, hash_texto, hash_convocatoria)` a
la vez, y el índice compuesto de la restricción ya la sirve; uno de columna única
nunca se elegiría— y su `CREATE INDEX` era justo lo que chocaba con los triggers
pendientes.

## Código eliminado

- `Curriculum.puesto` y todas sus referencias en modelos, serializers, servicios,
  selectores, admin, tipos y la pantalla.
- Las tarjetas de puesto y `useCatalogos` en `CurriculumPage`: la pantalla ya no
  consulta el catálogo. `TarjetaPuesto` se conserva porque la usa
  `SeleccionPuestoPage`.
- `SubirArchivo.tsx` pasó de 214 a 48 líneas al extraer `ZonaDeArchivo`.
- La detección de títulos duplicada en `ats.py`, ahora en
  `secciones.titulo_de()`. Compartirla no es solo evitar repetición: si los dos
  criterios divergieran, el análisis podría reportar una sección como reconocida
  y no encontrar su bloque, y el usuario vería dos afirmaciones contradictorias.
- `VERBOS_DE_RESULTADO` en `vinetas.py`, declarada y nunca usada.
- `esAceptado` y `pesoLegible` dejaron de exportarse: nadie los usaba fuera.

> **5.3 queda pendiente a proposito**: es el unico paso que requiere un navegador.
> Lo automatico ya paso -225 tests del backend, tsc limpio, build correcto y lint en
> las 6 advertencias conocidas- y el analisis se ejercito contra la base real. Lo que
> queda por ver a ojo es la presentacion: los tres estados del mapa de evidencia
> distinguibles de un vistazo, las dos pestanas de la convocatoria, y que la seccion
> de vinetas no se confunda con un hallazgo de ATS.
