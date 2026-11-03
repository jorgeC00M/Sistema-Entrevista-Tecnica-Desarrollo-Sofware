## Context

`ResultadoDelAnalisis`, en el panel `mejorar`, pinta en este orden:
- `aviso` (`AvisoDeRevision`);
- `ConservaloAlCorregir` («Lo que ya funciona»);
- una línea `EtiquetaMono` con `correccionesMedidas` y `sugerenciasDeIA`;
- `ListaDeHallazgos` («Qué corregir para el ATS»: acción, `ChipDeSeveridad`, «Encontramos: titulo», detalle, «Así: ejemplo», y cada fila con `id={idDeHallazgo}`, `tabIndex=-1` y `scroll-mt-32`);
- `VinetasDeLogro` y `RevisionDeRedaccion`.

`AvisoDeRevision` dice «La IA no encontró nada que sugerir» cuando la revisión llega vacía. `AnalisisATS` guarda `revision_ia` como JSON y la reinicia al recalcular el diagnóstico (`services.py`, `update_or_create`). Las vistas de `curriculums` filtran por usuario con `get_object_or_404`.

## Goals / Non-Goals

**Goals:**
- Una lista de arreglos accionable, con casillas guardadas, sin puntajes.
- Lo que cada fila afirma sale de la medición: acción, severidad, detalle, diagnóstico y ejemplo.

**Non-Goals:**
- Guardar o mostrar fragmentos del CV original.
- Recalcular el análisis al marcar.
- Cambiar la medición o la IA.

## Decisions

**D1. «AHORA» = `Hallazgo.titulo`, «DESPUÉS» = `Hallazgo.ejemplo`.**
- El CV no se guarda, por diseño de privacidad, así que no hay un «cómo está» literal.
- El diagnóstico sí está medido.
- El ejemplo es texto fijo de `ats.py`, con datos de ejemplo de Cochabamba, y ya está validado por `EjemploTest`.
- Sin ejemplo (imágenes, páginas, texto oculto, CV ilegible), solo se muestra AHORA.

**D2. El centro: `accionDe(h)`, `ChipDeSeveridad` y `detalle`.**
- El detalle es el «cómo hacerlo» que el usuario pidió: ya está escrito en lenguaje llano, con qué pasa y cómo se arregla.
- No se trunca. Una línea cortada se perdería justo la instrucción.

**D3. La casilla es un componente base, `components/ui/CasillaHecho.tsx`.**
- `estilos.test.ts` prohíbe un `<button>` fuera de `components/ui/`.
- Es un botón de 44 × 44 px, `rounded-control`, con borde y `aria-pressed={hecho}` y `aria-label` recibido de fuera. Marcado, muestra el icono `fortaleza` sobre `bg-exito-fondo`.
- No es un `<input type="checkbox">`, porque se pidió un botón real con `aria-pressed`, que el lector anuncia como «botón de alternancia».

**D4. `ArreglosDeFormato` reemplaza a `ListaDeHallazgos`.**
- Es una `Tarjeta` con su título y su frase, y una `ul` con una fila por debilidad (`debilidadesPorGravedad`).
- Cada fila es una grilla `sm:grid-cols-[auto_1fr_minmax(0,16rem)]`: casilla, centro y cajas. Por debajo de 640 px es `grid-cols-[auto_1fr]` y las cajas ocupan la segunda columna, debajo del texto.
- Conserva el `id`, el `tabIndex=-1` y el `scroll-mt-32` de cada fila, así `irA` (de los enlaces de «Formato» del Resumen) sigue enfocándola.
- `ChipDeSeveridad` se mueve a un archivo propio para sobrevivir a `ListaDeHallazgos`, que se borra si queda sin uso.

**D5. Persistencia: `AnalisisATS.arreglos_hechos`.**
- Es un JSONField con una lista de códigos (`default=list`) y una migración `0008` `AddField`, reversible y sin backfill.
- `services.marcar_arreglo(usuario, pk, codigo, hecho)`:
  - toma el análisis con `get_object_or_404` filtrado por `curriculum__usuario`;
  - valida que el código esté entre `hallazgos["debilidades"]` (si no, 400);
  - agrega o quita sin duplicar, y guarda solo ese campo (`update_fields`).
- La vista es `POST /api/curriculums/<id>/arreglos/` con `{codigo: str, hecho: bool}` y responde `{arreglos_hechos: [...]}`.
- El serializer publica `arreglos_hechos` filtrado a las debilidades actuales.
- Al recalcular el diagnóstico, se reinicia a `[]` junto a `revision_ia`.
- **Por qué el backend:** lo eligió el usuario, y así las marcas se ven desde cualquier dispositivo. Un CV corregido y vuelto a subir es otro análisis, con sus casillas vacías, y eso es lo correcto: es otra medición.

**D6. Estado optimista en el frontend.**
- `ResultadoDelAnalisis` guarda un `Set` inicializado desde `analisis.arreglos_hechos`.
- Al pulsar, cambia el estado y llama a `marcarArreglo`. Si falla, revierte y lo anuncia en una línea `aria-live` («No se pudo guardar el arreglo; vuelve a intentarlo»).
- No recarga el análisis.

**D7. Lo que se quita.**
- El conteo `EtiquetaMono`: `correccionesMedidas` y `sugerenciasDeIA` se borran, con sus tests, si quedan sin uso.
- `ConservaloAlCorregir.tsx`. Las fortalezas siguen medidas y en el API; ya no se muestran.
- La rama «nada que sugerir» de `AvisoDeRevision`.

## Risks / Trade-offs

- **[Trade-off]** Sin «Lo que ya funciona», el usuario ya no ve sus fortalezas en la pantalla. Lo decidió el usuario. La medición y el API las conservan.
- **[Riesgo]** Marcar como hecho no verifica nada: es una ayuda personal. → **Mitigación:** la pantalla no la convierte en un avance ni en un puntaje, y la verificación real es volver a subir el CV.
