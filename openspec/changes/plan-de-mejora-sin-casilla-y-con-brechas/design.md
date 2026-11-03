## Context

`plan-de-mejora-como-lista-de-arreglos` (aplicado y sin archivar) añadió:
- la casilla `components/ui/CasillaHecho`;
- el campo `AnalisisATS.arreglos_hechos`, con la migración `0008`, que el usuario **no aplicó**;
- `POST /api/curriculums/<id>/arreglos/`;
- un estado optimista en `ResultadoDelAnalisis`.

Las sugerencias de IA por requisito (`revision_ia.requisitos`, ancladas a términos `declarado`/`ausente` de la brecha) se muestran hoy solo en el `<details>` «Cómo cubrir lo que te falta» de `FrenteAlAviso`.

## Goals / Non-Goals

**Goals:**
- Que no quede rastro de la casilla en el código, la base ni la API.
- Llevar las sugerencias por requisito a la pestaña de acciones, sin duplicarlas.

**Non-Goals:**
- Tocar las reglas, la brecha, el prompt o el parser de la IA. La tarjeta solo lee lo que ya llega.
- Llevar a «Plan de Mejora» la experiencia, el cargo o los filtros. Siguen en «Match con la Oferta», porque son requisitos del puesto y no términos que se escriben en el CV.

## Decisions

- **Borrar la migración `0008` en vez de agregar una `0009` que quite la columna.** Nunca se aplicó, así que la historia de migraciones queda como si el campo no hubiera existido. *Alternativa:* `RemoveField` en `0009`, que solo hace falta si la base ya la tiene. Riesgo cubierto abajo.
- **`ChipDeRequisito` pasa a su propio archivo.** Lo usan `FrenteAlAviso` y `CubrirLaOferta`. Duplicarlo arriesgaría que los estados se pinten distinto en las dos pestañas.
- **`CubrirLaOferta` recibe `brecha` y el mapa `sugerencias`** que `ResultadoDelAnalisis` ya calcula para `FrenteAlAviso` (`sugerenciasDeRequisitos`). No hace falta un selector nuevo. Orden: `brecha.obligatorios.requisitos` y luego `brecha.deseables.requisitos`, filtrando `estado !== 'demostrado'`.
- **Pauta fija cuando falta la sugerencia.** La tarjeta sigue siendo útil sin la IA (pendiente, `no_disponible`, o un término sin sugerencia). La pauta depende solo del estado medido y por eso no lleva rótulo de IA. Para `ausente` dice «si no, no lo agregues», coherente con la regla del módulo de no inflar el CV. *Alternativa:* ocultar las filas sin sugerencia. Se descartó porque un requisito obligatorio ausente desaparecería del plan.
- **Etiqueta obligatoria/deseable solo con `brecha.separada`.** Si el aviso no separa los bloques, todo está en `obligatorios` y la etiqueta mentiría.
- **`ArreglosDeFormato` queda en dos columnas** (`sm:grid-cols-[1fr_minmax(0,16rem)]`, una en el celular). Conserva `id`, `tabIndex={-1}` y `scroll-mt-32` para `irA`.

## Risks / Trade-offs

- [La base local tiene la columna aunque el usuario cree que no] → `showmigrations curriculums` antes de borrar el archivo. Si `0008` figura como aplicada, se hace `migrate curriculums 0007` antes de borrarlo (o se cambia a una `0009` y se avisa).
- [Alguien abrió «Match con la Oferta» buscando las sugerencias] → la línea de búsqueda del reclutador y los chips siguen allí. «Ver el plan de mejora» del Resumen lleva a la pestaña nueva.

## Migration Plan

No hay datos que migrar. La reversión es volver a aplicar `plan-de-mejora-como-lista-de-arreglos`.
