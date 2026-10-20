## Context

Ya existe:
- **`CurriculumPage`**: guarda el estado, `analizar()`, `abrir(id)` (`obtenerCurriculum`), `analizarOtro()` y `useRevisionDelCv`.
- **Ruta:** solo `/mi-cv` (`router/index.tsx:34`); `titulosDeRuta` resuelve "/mi-cv".
- **`ResultadoDelAnalisis`**: la pestaña "Mejorar" pinta el aviso, el `EspejoDelATS` completo, `ListaDeHallazgos`, las viñetas y la redacción. El rótulo usa `porMejorar()`, que suma también `revision_ia.correcciones`.
- **`ListaDeHallazgos`**: borde ámbar decorativo, título de 11 px en mono, icono ámbar para todas las severidades.
- **`EspejoDelATS`**: `dt`/`dd` dentro de un `div` interno (agrupación inválida).
- **`HistorialDeAnalisis`**: Fraunces 20 px y plural sobrante.
- **`EntradaDelAnalisis`**: título de 16 px sans.
- **`GET /api/curriculums/<id>/`**: ya existe y responde 404 a lo ajeno.

Ver proposal.md.

## Goals / Non-Goals

**Goals:** cerrar cada punto de la crítica 3 y dejar escrito cuándo la pantalla se da por terminada.

**Non-Goals:**
- Comparar análisis entre sí (diferencias entre versiones).
- Mostrar el texto del CV junto a la ficha.
- Aceptar convocatorias como imagen (necesitaría OCR, que hoy no existe).
- Cambiar el backend.

Estas tres ideas de las "preguntas para pensar" quedan como trabajo futuro explícito, fuera de esta pantalla terminada.

## Decisions

### D1. "Mejorar" sin espejo
`ResultadoDelAnalisis` quita `EspejoDelATS` de la pestaña `mejorar`. Desde ahora el espejo solo vive en el Resumen, y ahí recupera su párrafo explicativo: la prop `compacto` desaparece y `EspejoDelATS` siempre lo muestra.

Cada `li` de `ListaDeHallazgos` lleva `id={`hallazgo-${codigo}`}` y `tabIndex={-1}`. En el Resumen, cada corrección principal es un `Boton variante="texto"` que llama a `onIrA(codigo)`. La página cambia a `mejorar` y, en el siguiente frame, enfoca `#hallazgo-<codigo>` y lo desplaza con `scrollIntoView`.

### D2. Dos cifras en vez de una suma
`hallazgos.ts` cambia `porMejorar()` por:
- `correccionesMedidas(analisis)`: `debilidades.length + (vinetas?.sin_resultado.length ?? 0)`;
- `sugerenciasDeIA(analisis)`: `revision_ia?.correcciones.length ?? 0`.

Los tests se actualizan. La pestaña pasa a llamarse "Mejorar". Arriba del panel, una `EtiquetaMono` dice `n correcciones medidas` y, si las hay, ` · m sugerencias de IA`.

### D3. Ruta `/mi-cv/:id`
- **Router:** `<Route path="/mi-cv/:id" element={<CurriculumPage />} />` además de `/mi-cv`. En `titulosDeRuta`, el patrón `/mi-cv/:id` también se titula "Revisar mi CV".
- **Lectura del id:** `CurriculumPage` lee `useParams().id`. El resultado deja de ser estado propio y pasa a ser **función de la URL**: con un id, carga ese análisis con `usePeticion(`curriculum-${id}`, …)`, con `vigenciaMs: 0`, para no ver datos cacheados viejos tras reanalizar.
- **Guardar la revisión:** `useRevisionDelCv` fusiona en un estado local "revisión recibida por id", superpuesto al dato cargado, porque no puede mutar la caché.
- **Navegación:**

  | Acción | Destino |
  |---|---|
  | Analizar con éxito | `navigate(`/mi-cv/${id}`)` |
  | Abrir desde el historial | `navigate(`/mi-cv/${id}`)` |
  | "Analizar otro" | `navigate('/mi-cv')`; el archivo y la convocatoria siguen en el estado de la página, que no se desmonta |

- **404 o error al cargar:** `Alerta` "No encontramos ese análisis" y la entrada.
- **Estado de carga del historial:** sale gratis del `cargando` de `usePeticion` y se pinta como un `Spinner` corto en el lugar del resultado.

### D4. Robustez de la subida
- **Estado:** bajo el botón "Analizar mi CV", un `<p aria-live="polite">` con "Leyendo tu CV y aplicando las reglas del ATS…" mientras `analizando`.
- **Errores:** el error general se pasa a `EntradaDelAnalisis` (prop `errorGeneral`) y se pinta encima del botón con `role="alert"`. El `Alerta` de arriba de la página queda solo para el fallo al abrir un análisis.
- **Tiempo agotado o red:** si el error no es `ErrorAPI` (`DOMException` de aborto o `TypeError` de red), el mensaje es "No recibimos la respuesta a tiempo. Puede que el análisis ya esté en tus análisis anteriores." y se llama a `refrescarHistorial()`.
- **CV ilegible:** el botón dice "Subir otro archivo" y llama a `onSubirOtro`, que limpia `archivo` y navega a `/mi-cv`.

### D5. Jerarquía y color
- **`EntradaDelAnalisis`:** el `h2` "Tu currículum" pasa a `font-serif text-headline-md`.
- **`HistorialDeAnalisis`:** el `h2` pasa a `text-headline-sm` sans. El plural se arregla ("1 análisis" / "n análisis"; la palabra es invariable, así que se elimina el ternario) y la cifra lleva "campos" ("5/8 campos").
- **`ListaDeHallazgos`:**
  - sin `border-t-2` de color;
  - título `font-serif text-headline-md text-vidrio-ink`;
  - el icono toma el color de `SEVERIDADES`, que gana un campo `icono` con las clases de texto: `critica` en `text-error-texto`, `alta` en `text-progreso-texto`, `media` en `text-vidrio-muted`.
- **`CurriculumPage`:** se quita la `EtiquetaMono` "Antes de la entrevista".
- **`PreguntasProbables`:** usa `Tarjeta` en lugar de `rounded-vidrio bg-vidrio-field`.
- **`ResumenDelAnalisis`:** la cifra de viñetas sale del `meta` del espejo y pasa a la tarjeta "Lo primero que mejorar", porque las viñetas no son un filtro ATS.

### D6. Accesibilidad
- **`EspejoDelATS`:** cada fila es `<div>` hijo directo de `<dl>`, con `dt` y `dd` como hermanos directos. El apilado se hace con grid: `grid grid-cols-[1.25rem_1fr] sm:grid-cols-[1.25rem_7rem_1fr]` si la guarda no rechaza esa clase; si la rechaza, con `flex-wrap` y `basis-full` / `sm:basis-28` sobre el `dt`. El icono va en el `dt`.
- **Convocatoria sin requisitos:** se pinta como `AvisoDeRevision`, una línea con icono `info`, sin `role="alert"`.
- **`ZonaDeArchivo`:** el botón lleva `aria-describedby` con el id de una línea de ayuda ("PDF o DOCX, hasta 2 MB") y, si lo hay, el id del error.
- **Encabezado del resultado:** pasa a `<h2 …>{nombre}<span className="sr-only">. El ATS lee {parseabilidad} campos.</span></h2>`.
- **`CampoConvocatoria`:** la instrucción sobre los títulos de requisitos y deseables pasa a una línea `text-meta` visible bajo el textarea, ligada con `aria-describedby`.

### D7. Pestañas en móvil y menores
- **`Pestanas`:** gana la prop `repartir?: boolean`, que aplica `grid grid-cols-N sm:flex` (N = número de pestañas, por clase literal) y centra cada pestaña. `ResultadoDelAnalisis` la usa y la envuelve en `sticky top-16 z-10 bg-vidrio-bg`.
- **Rótulos:** "Requisitos" o "Tecnologías" se acorta a "Términos" solo por debajo de `sm`, para que quepa a 320 px. Se valida en la prueba manual.
- **`AvisoDeRevision`:** con estado `ok` pero sin preguntas, viñetas, requisitos ni correcciones, una línea "La IA no encontró nada que sugerir."
- **`ZonaDeArchivo`:** con un archivo elegido, la caja de arrastre se reduce a la fila del archivo con "Cambiar"; el texto "Arrastra" se muestra solo con `@media (hover: hover)`, mediante la variante `[@media(hover:hover)]:inline` y `hidden` por defecto.
- **`VinetasDeLogro`:** se añade un segundo ejemplo de proyecto o tesis ("Implementé el módulo de reportes de mi tesis; redujo de 2 h a 10 min la consolidación mensual").

### D8. Criterio de terminado
"Revisar mi CV" se da por **terminada** cuando se cumplen las tres condiciones:
1. todas las tareas de este cambio están hechas, con la prueba manual ejecutada;
2. una última `/impeccable critique` da **≥ 30/40 y ningún P0/P1**;
3. el detector sigue en 0 hallazgos.

Desde ahí, la pantalla solo se reabre por un P0/P1 reportado, nunca por P2/P3 de pulido. Cualquier P2/P3 que aparezca en esa crítica de verificación se apunta en `openspec/changes/cv-cierre-final/pendientes.md` como trabajo futuro y **no** abre un cambio nuevo.

## Risks / Trade-offs

- [La ruta convierte el resultado en dato de la URL y cambia el flujo de estado de la página] → es el punto más grande; la página conserva el archivo y la convocatoria porque `/mi-cv` y `/mi-cv/:id` usan el mismo componente y React Router no lo desmonta al cambiar el parámetro.
- [`sticky` sobre el contenido puede tapar el foco] → `top-16` deja libre la cabecera, y `scroll-margin-top` en `#hallazgo-*` evita que el foco quede debajo.
- [Grid con valores arbitrarios] → si `estilos.test.ts` lo rechaza, se usa la alternativa con `flex-wrap` descrita en D6.
- [Cerrar la pantalla con P2/P3 aún posibles] → es deliberado: el usuario pidió una solución final, y el pulido infinito no aporta a la tesis.

## Ajustes al implementar

- **D3, más simple:** el resultado no pasó a `usePeticion`. Sigue en el estado de la página y se **sincroniza con la URL**: un efecto carga con `obtenerCurriculum(id, signal)` solo si la URL pide un id que no está en memoria, y lo visible es `resultado` cuando su id coincide con el de la URL. Así `useRevisionDelCv` no cambia y no hay dos fuentes (caché y estado) que reconciliar.
- **Rótulos de pestaña en móvil:** en lugar de "Términos", el modo `repartir` usa `text-meta` (13 px) por debajo de `sm`. "Tecnologías" cabe en una cuarta parte de 320 px sin renombrar la sección.
- **Espejo:** la `dl` válida se resolvió con `flex-wrap` (`basis-full` en móvil, `sm:w-40` en escritorio), sin valores arbitrarios. Cada `dt` lleva un "detectado / no detectado" solo para lectores de pantalla.
- **`idDeHallazgo` vive en `hallazgos.ts`:** en `ListaDeHallazgos.tsx` rompía `only-export-components` (un aviso de lint nuevo).
- **"Analizar mi CV" deshabilitado** ahora dice por qué: "Elige tu CV para poder analizarlo".
- **La introducción** explica qué es un ATS y deja de decir "parsea".
- **En pantallas táctiles** la zona dice "Toca para elegir un archivo"; "Arrastra" solo aparece con puntero (`[@media(hover:hover)]`).
