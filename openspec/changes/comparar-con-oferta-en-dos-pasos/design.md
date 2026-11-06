## Context

- **`EntradaDelAnalisis.tsx`** (sobre `/mi-cv/analisis` y `/mi-cv/oferta`) pinta una fila `lg:grid-cols-[2fr_1fr]`:
  - a la izquierda, «Tu CV», con `ZonaDeArchivo`;
  - a la derecha, «¿Qué revisamos?» en el general, o «Convocatoria» con `CampoConvocatoria` en el dirigido.
- **`CampoConvocatoria.tsx`** tiene un `ControlSegmentado` «Pegar texto / Subir archivo», un textarea con contador (`MAXIMO_CARACTERES` = 20 000, igual que el backend) o una `ZonaDeArchivo`. Al cambiar de vía limpia la otra.
- **`ControlSegmentado`** solo lo importa `CampoConvocatoria`. `Pestanas.tsx` lo nombra en un comentario.
- **`CurriculumPage.tsx`** guarda `archivoConvocatoria` en su estado, lo envía en el dirigido y limpia su error de campo.
- **`api/curriculums.ts`** agrega `archivo_convocatoria` al `FormData` y traduce el nombre del error.
- **`hallazgos.ts::puedeAnalizar(tipo, archivo, convocatoria, archivoConvocatoria)`** devuelve `false` sin CV. En el dirigido exige texto no vacío o un archivo.
- **Backend:** `SubirCurriculumSerializer` acepta `archivo_convocatoria`, que es excluyente con `convocatoria`. Lo extrae con `apps/common/archivos.py::texto_de_convocatoria`, que también usa `entrevistas/serializers.py`.
- **Iconos:** `trazosDeIconos.ts` ya tiene `fortaleza`, un check.

## Goals / Non-Goals

**Goals:**
- dar al CV y a la convocatoria el mismo peso visual, con pasos numerados y su estado;
- una sola vía para la convocatoria, sin elegir nada antes;
- no dejar código muerto ni en el frontend ni en el backend.

**Non-Goals:**
- cambiar el análisis general, el resultado o el historial;
- cambiar «Simular entrevista › Con convocatoria», que sigue aceptando archivo;
- agregar un mínimo de caracteres a la convocatoria del CV, porque el backend no lo tiene.

## Decisions

### 1. La fila depende del tipo
- **En el dirigido:** `grid gap-6 lg:grid-cols-2`, con las dos `Tarjeta` estiradas a la misma altura (comportamiento por defecto del grid).
- **En el general:** sigue `lg:grid-cols-[2fr_1fr]`. Hay una sola acción y la tarjeta derecha solo informa; darle la mitad la pondría al mismo nivel que la acción. El CV sigue en el mismo sitio en los dos destinos (a la izquierda y arriba), aunque con otro ancho.
- El orden del DOM es el visual en todos los anchos; el grid no recoloca nada.

### 2. Encabezado de paso
Cada tarjeta del dirigido abre con una línea de rótulo y su título. El rótulo es «Paso 1» o «Paso 2» en `text-label-mono`, en mayúsculas y atenuado. Si el paso está listo, a la derecha va el icono `fortaleza` con el texto «Listo» en `text-exito-texto`. El título va debajo: «Sube tu CV» o «Pega la convocatoria», en `font-serif text-headline-md`, como los títulos de hoy.

- **Accesibilidad:**
  - el `h2` lleva el texto completo («Paso 1 · Sube tu CV»), con «Paso 1 ·» en un `span` visual;
  - el `aria-labelledby` de la sección apunta a ese `h2`;
  - «Listo» es texto real, no `aria-hidden`, para que un lector de pantalla lo lea junto al título;
  - cuando cambia el estado no se anuncia nada: el usuario ya lo causó.
- **Colores:** solo los tokens existentes, como pide `estilos.test.ts`.
- **Componente:** un pequeño `EncabezadoDePaso` dentro de `features/curriculum/components/`, porque se usa dos veces en el mismo archivo.

### 3. Lógica pura
En `hallazgos.ts`:
- `puedeAnalizar(tipo, archivo, convocatoria)` devuelve `archivo !== null && (tipo === 'general' || convocatoria.trim() !== '')`;
- `pasoListo` se reemplaza por dos expresiones triviales: `archivo !== null` y `convocatoria.trim() !== ''`. Sacarlas a una función que solo envuelve eso no agregaría nada, así que se dejan en línea en el componente, y `puedeAnalizar` conserva su test.

Esto **corrige el plan**: no se crea `pasoListo`.

### 4. `CampoConvocatoria` solo con texto
- **Quedan:** el textarea con su `label` `sr-only`, el placeholder actual, el contador y el error.
- **Se quitan:** `via`, `cambiarVia`, `ControlSegmentado`, `ZonaDeArchivo` y las props `archivo` y `onArchivo`.
- **Docstring:** se actualiza, explicando por qué solo texto: un aviso vive en una web y se copia.

### 5. Backend: un campo menos, sin romper a nadie
- **`SubirCurriculumSerializer`** se queda solo con `archivo` y `convocatoria`. DRF ignora los campos que no declara, así que un cliente viejo que envíe `archivo_convocatoria` no recibe un 400: recibe un análisis general. Es lo que fija el escenario de la spec, con un test.
- **Se elimina** `validate_archivo_convocatoria`, junto con la rama de `validate` y el error «pegada o como archivo».
- **`validate`** queda solo si sigue haciendo algo. Si no, se borra.
- **`texto_de_convocatoria`** no se toca.

### 6. Tests que se van
De `test_curriculums.py` se eliminan tres tests, porque prueban una vía que ya no existe:
- `test_la_convocatoria_como_archivo_tambien_vale`;
- `test_no_se_admiten_las_dos_vias_a_la_vez`;
- `test_una_convocatoria_escaneada_se_rechaza_con_su_motivo`.

Las fixtures en PDF que usaban se quedan, porque las usan otros tests.

## Risks / Trade-offs

- **[Alguien tenía el aviso solo en PDF]** → Puede abrirlo y copiar el texto. «Simular entrevista» sigue aceptando un archivo. Lo eligió el usuario.
- **[El CV cambia de ancho entre los dos destinos]** → Mantiene su posición, y en el celular se ven iguales. Se acepta a cambio de que la convocatoria tenga el mismo peso que el CV.
- **[Las deltas archivadas o por archivar que describen «Pegar / Subir archivo»]** → Son historia de propuestas y no se reescriben. Se actualiza `CLAUDE.md`.

## Migration Plan

Sin datos ni migraciones: `Curriculum.convocatoria` siempre se guardó como texto. Para revertir, se restauran el serializer, `CampoConvocatoria` y `ControlSegmentado` desde git.
