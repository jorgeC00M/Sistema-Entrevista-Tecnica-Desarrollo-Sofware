## Context

`CurriculumPage.tsx` pinta siempre, arriba de todo, el `h1` «Revisa tu CV contra los filtros ATS» y un `<p>` explicativo. Debajo elige una de tres vistas:
- `cargandoAnalisis` → `Spinner` «Abriendo el análisis…»;
- `visible && analisis` → `ResultadoDelAnalisis`;
- en otro caso → la entrada (`EntradaDelAnalisis` e `HistorialDeAnalisis`), con el aviso «No encontramos ese análisis» si el id de la URL no existe.

`ResultadoDelAnalisis` abre con su propia barra de contexto, cuyo título es el nombre del archivo como `h2`.

## Goals / Non-Goals

**Goals:**
- Que el resultado empiece por lo que el usuario vino a ver.
- Que la entrada siga explicando qué es un ATS.

**Non-Goals:**
- Cambiar el texto del título o del párrafo.
- Rediseñar la barra de contexto o las pestañas.

## Decisions

**D1. El párrafo depende de la vista, no de la ruta.**
- La condición es la misma que ya decide qué se pinta: `const enResultado = cargandoAnalisis || Boolean(visible && analisis)`, y el `<p>` se muestra con `!enResultado`.
- Depender de la ruta (`idEnLaUrl !== null`) fallaría con un id desconocido: esa URL muestra la entrada y le quitaría la explicación justo ahí.
- Incluir `cargandoAnalisis` evita que el párrafo aparezca un instante y desaparezca al recargar `/mi-cv/:id`.

**D2. El `h1` se mantiene en todas las vistas.**
- Es el único `h1` de la página, y las demás pantallas siguen la regla de un `h1` por página.
- Usar el nombre del archivo como `h1` cambiaría el orden de encabezados de `ResultadoDelAnalisis`, que también se usa para el foco tras analizar (`ref={titulo}`). No vale la pena para ganar una línea.

**D3. Sin código muerto.** El párrafo sigue usándose en la entrada, así que no se extrae ni se borra nada.

## Risks / Trade-offs

- **Quien llega por un enlace compartido a `/mi-cv/:id` no lee la explicación.** Se acepta: el resultado se explica solo (veredicto, espejo, texto del ATS), y «Analizar otro» lleva a la entrada, donde el párrafo está.
