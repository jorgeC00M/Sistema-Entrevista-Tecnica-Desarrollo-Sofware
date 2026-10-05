## Why

Un análisis del módulo de currículums destapó tres cosas que se refuerzan entre
sí, todas verificadas sobre el código y no sobre impresiones.

**Hay endpoints muertos.** `obtenerHistorialDeCurriculums()`,
`CurriculumDetailView`, `CurriculumListaSerializer` y
`selectors.curriculum_del_usuario()` existen y el frontend **no llama a ninguno**.
Hay tres tests que los cubren, así que pasan en verde mientras nadie los usa — que
es la peor combinación: código sin usar con la apariencia de estar verificado.

**El usuario no puede ver si su CV mejoró.** El módulo existe para que corrija el
documento y vuelva a analizarlo, pero cada análisis se pierde al recargar la
página. No hay forma de comparar el de antes con el de después, que es justamente
el bucle que el módulo venía a cerrar.

Los dos hallazgos son el mismo problema visto de dos lados: la forma de no tener
código muerto es usarlo, y usarlo *es* el historial que al módulo le falta.

**La garantía de privacidad es por omisión, no por diseño.**
`apps/entrevistas/tests/test_privacidad.py` garantiza que el nombre, el correo y
el carnet del usuario nunca llegan al proveedor de IA. Pero `Curriculum.texto`
guarda el CV completo —nombre, teléfono, a veces dirección— y **nada impide** que
un cambio futuro lo envíe. Hoy no se envía solo porque no existe el código que lo
haría, y la fase siguiente del módulo (la reescritura sugerida por IA) es
exactamente ese código. Cerrar el hueco ahora cuesta poco; hacerlo después es
arreglar una fuga.

## What Changes

- **Pantalla de historial de análisis**, visible al entrar a `/mi-cv` mientras no
  haya un resultado en pantalla. Cada fila muestra fecha, archivo,
  `parseabilidad` y si el análisis llevaba convocatoria.
- **Pulsar un análisis previo lo carga** en la misma zona donde aparecería uno
  nuevo. Es lo que da uso real a `CurriculumDetailView`: sin esa acción el
  historial sería una lista decorativa y el endpoint seguiría muerto en la
  práctica.
- **Prueba de frontera con la capa de IA**: `apps/curriculums` no puede importar
  `integrations.ia`. Falla en el instante en que alguien crea el acoplamiento, que
  es exactamente cuando hay que detenerse a pensar.
- **Fuera el índice redundante** de `hash_texto`: el índice compuesto de la
  restricción de unicidad ya sirve la única consulta que se hace, así que ese solo
  cuesta mantener en cada escritura.

**La comparación entre análisis es visual, no calculada.** No se publica una
"mejora de 2 puntos": las filas pueden tener convocatorias distintas, y un delta
entre análisis no comparables sería un número sin significado — el mismo error que
el módulo ya evita al no publicar un puntaje de compatibilidad.

Nada es **BREAKING**: no cambia ningún contrato, solo se empieza a consumir lo que
ya estaba publicado.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `revision-de-cv`: gana requisitos sobre el historial de análisis —que el usuario
  pueda consultar sus análisis previos y reabrirlos— y sobre la frontera con la
  capa de IA: que el texto del currículum no pueda salir hacia un proveedor
  externo. El delta usa `ADDED` porque añade concerns sin alterar ninguno de los
  requisitos ya escritos.

## Impact

**Backend**
- `apps/curriculums/tests/test_frontera_con_ia.py` — nuevo.
- `apps/curriculums/models.py` — fuera `db_index=True` de `hash_texto`.
- Migración `0005` — reversible; es un `DROP INDEX`.

**Frontend**
- `features/curriculum/components/HistorialDeAnalisis.tsx` — nuevo.
- `features/curriculum/pages/CurriculumPage.tsx` — carga el historial al montar y
  lo muestra mientras no haya resultado.
- `api/curriculums.ts` — se añade `obtenerCurriculum(id)`, la pieza que falta para
  que el endpoint de detalle deje de estar muerto.

**Sin cambios**: la capa `integrations/documentos/`, las nueve verificaciones de
parseabilidad, el mapa de evidencia y el módulo de entrevistas. Los tres tests que
hoy cubren los endpoints muertos siguen valiendo tal cual; lo que cambia es que
ahora hay un cliente.

**Deliberadamente fuera de este cambio**: las pruebas automatizadas del frontend,
el despliegue en Render y Vercel, y la desalineación de `docs/arquitectura.md` y de
la landing —que no menciona el módulo de CV—. Son cambios distintos y mezclarlos
aquí los haría inseguibles.
