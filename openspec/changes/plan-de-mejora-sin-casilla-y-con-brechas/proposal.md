## Why

La casilla «marcar como hecho» de cada arreglo en «Plan de Mejora» no le sirve al usuario: no verifica nada (la verificación real es volver a subir el CV) y suma un endpoint, un campo y una migración que nunca se aplicó. A la vez, en el análisis dirigido lo más accionable frente a la oferta —cómo cubrir cada requisito que el CV no demuestra— está escondido en un plegable dentro de «Match con la Oferta», lejos de la pestaña de acciones.

## What Changes

- **Se quita la casilla** de cada arreglo en «Arreglar el formato»: la fila queda con la acción, el chip de efecto, el detalle y las cajas «AHORA» / «DESPUÉS». **BREAKING (API interna, sin datos):** desaparecen `arreglos_hechos` del análisis publicado y `POST /api/curriculums/<id>/arreglos/`. La migración `0008` se borra porque no llegó a aplicarse.
- **Nueva tarjeta «Cubrir lo que pide la oferta»** en «Plan de Mejora», solo en el análisis dirigido, debajo de «Arreglar el formato»:
  - una fila por cada requisito del aviso que el CV no demuestra (`declarado` o `ausente`), primero los obligatorios y después los deseables, cada uno con su estado y su sugerencia de IA;
  - mientras la sugerencia no llega o si falta, una pauta fija según el estado, sin rótulo de IA;
  - vacía, «Tu CV demuestra todo lo que pide la oferta».
- **«Match con la Oferta» pierde el plegable «Cómo cubrir lo que te falta»**: lo mismo no se muestra dos veces. Experiencia y cargo conservan allí su sugerencia.
- Se elimina el código muerto (la casilla, su API, su estado y sus tests) y se refactoriza el chip de requisito para compartirlo.

## Capabilities

### New Capabilities
- `revision-de-cv`: no tiene spec principal todavía; la delta agrega los requisitos de «Plan de Mejora» sin casilla y de «Cubrir lo que pide la oferta».

### Modified Capabilities
<!-- Ninguna con spec principal: las deltas sin archivar que hablaban de la casilla y del plegable se ajustan para remitir a este cambio. -->

## Impact

- **Backend** (`apps/curriculums`):
  - `models.py` sin `arreglos_hechos`;
  - se borra `migrations/0008_analisisats_arreglos_hechos.py`;
  - en `services.py` se quitan `marcar_arreglo` y el reinicio del campo;
  - en `serializers.py` se quitan `MarcarArregloSerializer` y el campo;
  - se quitan la vista y la URL `curriculums-arreglos`;
  - se borra `ArreglosHechosTest`.
- **Frontend:**
  - se borra `components/ui/CasillaHecho.tsx`;
  - `ArreglosDeFormato.tsx` queda sin casilla;
  - nuevo `CubrirLaOferta.tsx`;
  - nuevo `ChipDeRequisito.tsx`, que sale de `FrenteAlAviso`;
  - `FrenteAlAviso.tsx` queda sin plegable;
  - en `ResultadoDelAnalisis.tsx` se quitan el estado optimista y la línea de error, y se agrega la tarjeta nueva;
  - en `api/curriculums.ts` y `types/curriculum.ts` se quitan `marcarArreglo` y `arreglos_hechos`.
- **Specs sin archivar que se ajustan:**
  - `plan-de-mejora-como-lista-de-arreglos`;
  - `correcciones-accionables-y-menos-pestanas`;
  - `pestanas-del-resultado-por-tipo`.
- **`CLAUDE.md`.**
- Sin cambios en las reglas medidas, `VERSION_DE_REGLAS`, los prompts ni la IA.
