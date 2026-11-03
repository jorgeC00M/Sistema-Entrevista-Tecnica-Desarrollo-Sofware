## Why

En «Revisar mi CV», el título y el párrafo de introducción se muestran igual antes y después de analizar. El párrafo dice: «Un ATS (el sistema con el que las empresas filtran postulaciones) no te rechaza con una nota…».

En la vista de resultado (`/mi-cv/:id`) ese párrafo sobra:
- Explica qué es un ATS. Eso solo hace falta antes de analizar, cuando el usuario decide si sube su CV.
- Dentro del resultado, lo mismo ya lo dicen el veredicto de legibilidad, el espejo del ATS y «Así ve tu CV el ATS».
- Ocupa unas tres líneas encima de la barra de contexto y de las pestañas (Resumen, Mejorar, Requisitos o Tecnologías, Entrevista). Eso empuja hacia abajo lo que el usuario vino a ver, sobre todo en laptop y en celular.
- La cabecera ya nombra la sección («Revisar mi CV»), así que el contexto no se pierde.

## What Changes

- El párrafo de introducción se muestra **solo en la entrada** (`/mi-cv`, o un id desconocido que vuelve a mostrar la entrada).
- En la vista de un análisis, y mientras ese análisis se carga, el párrafo no se muestra. Así no aparece y desaparece al recargar `/mi-cv/:id`.
- El título principal («Revisa tu CV contra los filtros ATS») **se mantiene en todas las vistas**. Es el único `h1` de la página: el nombre del archivo en la barra de contexto es un `h2`.

## Capabilities

### New Capabilities
<!-- Ninguna. -->

### Modified Capabilities
- `revision-de-cv`: la pantalla de resultado deja de repetir la introducción. Va como delta ADDED, igual que los cambios anteriores del módulo.

## Impact

- **Frontend:** solo `features/curriculum/pages/CurriculumPage.tsx`.
- **Sin cambios** en backend, API, tipos ni lógica pura. No hay tests de lógica nuevos.
- **Documentación:** una frase en `CLAUDE.md`, en la sección de la pantalla del CV.
- **Reabre la pantalla cerrada** después de `cv-cierre-final`, con la aprobación explícita del usuario. Es pulido P3, pero lo pidió el usuario.
