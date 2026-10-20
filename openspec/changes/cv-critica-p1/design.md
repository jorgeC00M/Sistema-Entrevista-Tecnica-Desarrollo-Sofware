## Context

**Lo que existe hoy** (cambio `cv-en-pasos-y-pestanas`):
- `ResultadoDelAnalisis` muestra la barra de contexto y 5 pestañas: Resumen, Qué corregir (espejo + debilidades + fortalezas), Requisitos/Tecnologías, Viñetas (`VinetasDeLogro` + `RevisionDeRedaccion`) y Para la entrevista.
- `ResumenDelAnalisis` muestra las cifras, `AvisoDeRevision` y las 3 debilidades por gravedad (`hallazgos.ts::debilidadesPorGravedad`), con un chip "Crítico" escrito a mano.
- `ListaDeHallazgos` define `POR_SEVERIDAD` con las etiquetas Crítico, Importante y Menor.
- `EspejoDelATS` muestra la ficha completa: título, texto según `ninguno`/`todos` y una `dl` de campos con `w-28` de etiqueta.
- `EntradaDelAnalisis` muestra "Tu currículum · PDF o DOCX" y `ZonaDeArchivo`.
- **CV escaneado:** el backend añade el hallazgo `codigo="sin_capa_de_texto"`, severidad `critica` (`integrations/documentos/ats.py`), y deja `inventario=[]`, `brecha=null` y `vinetas=null`.
- **Límite de tamaño:** `MAXIMO_BYTES = 2 MB` en `api/curriculums.ts`.

Ver proposal.md.

## Goals / Non-Goals

**Goals:**
- No culpar a la causa equivocada.
- Que el espejo sea lo primero que se ve.
- La privacidad a la vista.
- Las severidades por efecto, definidas en un solo sitio.

**Non-Goals:**
- Cambiar el backend o la API.
- El estado de espera, el tiempo límite y `text-headline-lg`, que quedan como P2 en otra pasada.
- Los textos internos de cada hallazgo (los da el backend).

## Decisions

### D1. Detectar el CV ilegible por el código del hallazgo, en el cliente
`hallazgos.ts` exporta `esIlegible(analisis)`, que devuelve `analisis.debilidades.some(h => h.codigo === 'sin_capa_de_texto')`.
- **Por qué el código del hallazgo:** es el contrato que ya emite el backend, sin añadir un campo. `campos_detectados === 0` no basta, porque un CV legible con encabezados raros también podría dar 0.
- **El código es una constante exportada** (`CODIGO_SIN_CAPA_DE_TEXTO`), con test que fija que `esIlegible` lo usa.
- **Qué se pinta:** si es ilegible, `ResultadoDelAnalisis` muestra la barra, `EspejoDelATS` y un panel de aviso con el título "Tu PDF es una imagen", el `detalle` del hallazgo (el texto que ya da el backend) y un `Boton` "Analizar de nuevo" que llama a `onAnalizarOtro`. No hay `Pestanas`.

### D2. Espejo compacto en el Resumen
`EspejoDelATS` recibe `compacto?: boolean`:
- sin el párrafo largo;
- filas más bajas;
- etiqueta y valor que se parten en dos líneas en móvil (`flex-col sm:flex-row`), en vez del `w-28` fijo.

`ResumenDelAnalisis` se organiza así:
- una rejilla `grid gap-6 lg:grid-cols-[3fr_2fr]` (o `lg:grid-cols-5` con `col-span-3` / `col-span-2`, sin valores arbitrarios si la guarda los rechaza), con el espejo compacto a la izquierda y "Lo primero que mejorar" (top 3 + "Ver todo en Qué mejorar") a la derecha;
- debajo, "Qué ya funciona": los títulos de las fortalezas en una línea con el icono `fortaleza`, si hay;
- las cifras actuales (parseabilidad, cobertura, viñetas) pasan a una línea de metadatos bajo el título del espejo, con `EtiquetaMono`, en vez de tres tarjetas;
- `AvisoDeRevision` queda arriba.

### D3. Cuatro pestañas
- **`corregir` pasa a "Qué mejorar (n)":** `EspejoDelATS` completo + `ListaDeHallazgos` debilidades + `VinetasDeLogro` (si hay) + `RevisionDeRedaccion` (si hay).
- **Fortalezas:** se quitan de esta pestaña. La `ListaDeHallazgos favorable` deja de usarse en el resultado; las fortalezas solo se ven en el Resumen, como línea.
  - Si `ListaDeHallazgos` ya no recibe `favorable` desde ningún sitio, se simplifica.
  - Se valora conservar en la pestaña el detalle de las fortalezas, que el Resumen solo titula. Decisión: se muestran en el Resumen con su detalle desplegable (`<details>`), para no perder información.
- **`n`** = debilidades + viñetas sin resultado + correcciones de redacción.
- **Se elimina el valor `vinetas`** del tipo de pestaña.

### D4. Severidades en un solo sitio
`hallazgos.ts` exporta `SEVERIDADES: Record<Severidad, { etiqueta: string; clases: string }>`:
- `critica`: "Impide la lectura", `bg-error-fondo text-error-texto`;
- `alta`: "Resta visibilidad", `bg-progreso-fondo text-progreso-texto`;
- `media`: "Detalle", `bg-vidrio-field text-vidrio-muted`;
- `info`: sin etiqueta.

`ListaDeHallazgos` y `ResumenDelAnalisis` lo importan y se borra el `POR_SEVERIDAD` local.

El chip se pinta como un `<span>` hermano del título con un prefijo `sr-only` (", efecto: "), para que el lector no lo lea pegado al título. El test fija las tres etiquetas.

### D5. Privacidad en la entrada
En `EntradaDelAnalisis`:
- la etiqueta pasa a "PDF o DOCX · máx. 2 MB", con el máximo calculado desde `MAXIMO_BYTES`, no escrito a mano;
- bajo `ZonaDeArchivo`, un `<p className="text-meta text-vidrio-muted">` con el icono `candado`: "No guardamos el archivo, solo el texto. A la IA llegan solo secciones de tu CV, con tu nombre, correo y teléfono tapados."

Es verdad comprobable en el backend: `revision.py` minimiza y `anonimizar.py` enmascara. Cumple el principio "decir solo lo que el sistema hace".

## Risks / Trade-offs

- [Cambiar "Crítico" por "Impide la lectura" puede sonar menos urgente] → el color de error se mantiene, y el texto dice exactamente por qué urge.
- [El Resumen se densifica con el espejo] → la variante compacta y la rejilla de dos columnas lo contienen; en móvil se apila.
- [Depender del código `sin_capa_de_texto`] → la constante y el test lo fijan; si el backend lo renombra, el test de la constante obliga a revisar.
- [Las fortalezas pasan de la pestaña al Resumen] → se conserva su detalle en un `<details>`.

## Ajustes al implementar

- **`ChipDeSeveridad` se exporta desde `ListaDeHallazgos.tsx`** y lo usan la lista y el Resumen: el chip con su prefijo `sr-only` se define una sola vez, igual que sus etiquetas.
- **`ListaDeHallazgos` pierde la prop `favorable`:** las fortalezas ya no se pintan con ella. Su título dentro de "Qué mejorar" pasa a "Qué corregir para el ATS", para distinguirlo de las viñetas y la redacción que vienen debajo.
- **La rejilla del Resumen es `lg:grid-cols-5`:** espejo en `col-span-3` y correcciones en `col-span-2`, sin valores arbitrarios.
- **`text-headline-lg` sigue en la barra de contexto**, como estaba: es el P2 de tipografía, fuera de este cambio.
