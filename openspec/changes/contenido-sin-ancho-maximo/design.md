## Context

- **El contenedor:** `router/RutaProtegida.tsx:117-118` envuelve cada página en `<main className="px-4 py-6 sm:px-6 lg:px-8"><div className="max-w-7xl">`. Su comentario explica por qué no centra: antes cada página se centraba en su propio ancho y dejaba franjas vacías a ambos lados.
- **Anchos del sidebar:**
  - 256 px abierto y 72 px plegado, desde 1024 px;
  - 72 px fijo entre 768 y 1023 px;
  - cajón en celular.
- **Lo que ya se limita solo:**
  - `BurbujaPregunta` (`lg:max-w-prose`, de `chat-a-ancho-completo`);
  - los párrafos de introducción (`max-w-prose`).
- **Las rejillas de las páginas** usan fracciones (`lg:grid-cols-[2fr_1fr]`, `lg:grid-cols-3`), así que crecen de forma proporcional.

## Goals / Non-Goals

**Goals:**
- sin franja vacía a la derecha en ningún ancho ni estado del sidebar.

**Non-Goals:**
- centrar el contenido;
- cambiar los márgenes del `main`;
- rediseñar las rejillas para monitores ultra anchos.

## Decisions

### 1. Quitar `max-w-7xl` del contenedor
El `div` interno se queda solo para el ancho completo, sin límite. Se conserva porque el `main` lleva los márgenes y el `div` es el contenedor que heredan las páginas; quitarlo no aporta nada.

Se actualiza el comentario: el contenido ocupa todo el ancho que deja el sidebar, y lo que no debe estirarse se limita a sí mismo.

**Alternativas descartadas** (las elegidas por Jorge son las de arriba):
- **subir el límite a 1536 px:** la franja vuelve a aparecer desde 1920 px;
- **centrar:** contradice la alineación con el sidebar.

### 2. No se agregan límites nuevos por adelantado
Las rejillas proporcionales funcionan hasta 1920 px. Si una pantalla se ve mal en las capturas, se limita esa pantalla, no el contenedor.

## Risks / Trade-offs

- **[Tablas y rejillas muy anchas en monitores de 2560 px]** → Fuera del uso previsto, que son laptops de 1366 a 1920 px. Se revisa en 1920 px.
- **[Formularios que se estiran]** → «Simular entrevista» ya reparte sus campos en columnas. Los de Mi perfil se revisan en las capturas.

## Migration Plan

Solo una clase. Para revertir, se vuelve a poner `max-w-7xl`.
