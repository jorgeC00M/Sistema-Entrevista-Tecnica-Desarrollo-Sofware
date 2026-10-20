## Why

El estilo del frontend se fue desviando pantalla a pantalla, y no hay un lugar claro desde donde controlarlo. La auditoría encontró lo siguiente:

- **Botones:**
  - 18 `<button>` estilizados a mano en lugar de usar `Boton`;
  - 4 enlaces que copian la apariencia de un botón;
  - 4 casos de `<button>` dentro de `<a>`, que es HTML inválido;
  - 4 formas de borde distintas;
  - tres tamaños de botón primario (el de la app, el del login y el de la landing).
- **Foco:** el anillo de foco está copiado a mano 17 veces, en 5 variantes, y unos 9 controles no tienen foco visible.
- **Campos:** hay 4 tratamientos de campo de formulario.
- **Overlays:** el modal y el cajón móvil usan velos distintos y el modal no tiene animación.
- **Valores fuera de los tokens:** sombras, radios y tamaños de texto escritos a mano (`shadow-[…]`, `rounded-[22px]`, `text-[1.05rem]`), concentrados en el login y la landing.

El usuario quiere controlar el estilo desde CSS y que los componentes reutilizables se vean igual en todas partes.

## What Changes

- **Archivos CSS con responsabilidad clara:** `styles/tokens.css`, `base.css`, `utilidades.css` y `overlays.css`, importados desde `styles/index.css`. Se agregan tokens de sombra, velo, radio de tarjeta y tamaños de texto, y utilidades `@utility` para el anillo de foco y la base de los campos.
- **El modal y el cajón móvil** pasan a estilizarse en `overlays.css`:
  - el modal con su `::backdrop` y una animación de entrada que respeta `prefers-reduced-motion` (sin salida animada: el modal se desmonta al cerrarse);
  - los dos con un único velo.
- **BREAKING (componentes):**
  - `Boton` pasa a tener las variantes `primario`, `secundario`, `contorno`, `texto`, `peligro` y `fantasma`, y los tamaños `sm`, `md` y `lg`;
  - su forma es siempre píldora y desaparece el prop `forma`;
  - `vidrio` y `vidrio-secundario` desaparecen; como solo había 15 usos, se migraron todos en el mismo paso, sin alias temporales.
- **Regla única de forma**, aprobada por el usuario: las **acciones** van en píldora; los **controles** (botones de icono, campos, tarjetas) a 8 px.
- **Componentes nuevos o ampliados:**
  - `clasesDeBoton()`, para que un enlace se vea como botón sin anidar `<button>` en `<a>`;
  - `BotonIcono` con tamaños y tonos;
  - `Chip` para las pastillas de sugerencia;
  - la utilidad `campo` aplicada a `Textarea`, `CampoSelect`, `CampoAuth` y `CampoConvocatoria`.
- **Migración de toda la app, incluidos login y landing** (aprobado por el usuario):
  - los botones y enlaces a mano pasan a los componentes base;
  - los valores escritos a mano pasan a tokens;
  - todos los controles quedan con foco visible.
- **Guarda automática:** un test de Vitest falla si vuelven a aparecer `<button>` fuera de `components/ui`, sombras, radios o tamaños de texto escritos a mano, o colores crudos de la paleta. Las excepciones justificadas (colores del gráfico, marca de Google) van en una lista explícita.
- **`CLAUDE.md`:** gana una sección "Sistema de estilos".

## Capabilities

### New Capabilities
- `sistema-de-estilos`: dónde y cómo se define el estilo del frontend (tokens, capas CSS, componentes base, regla de forma y foco) y cómo se impide que vuelva a desviarse.

### Modified Capabilities
Ninguna en `openspec/specs/` (está vacío).

## Impact

- **Frontend:**
  - `src/styles/` (pasa de 1 a 5 archivos);
  - `components/ui/` (`Boton`, `BotonIcono`, `Modal`, `Textarea`, `ControlSegmentado` y `Pestanas`, más `estilosDeBoton.ts` y `Chip.tsx`);
  - unas 30 vistas en `features/` (auth, landing, curriculum, seleccion, entrevista, resultados) y `components/layout/`.
- **Visual:**
  - cambios leves en login y registro (el tamaño del botón y las sombras pasan a tokens);
  - el modal se anima al abrir;
  - el velo del cajón móvil se iguala con el del modal.
- **Backend:** sin cambios.
