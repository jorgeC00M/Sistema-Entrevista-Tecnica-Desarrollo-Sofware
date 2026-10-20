## Why

En escritorio, cada pantalla autenticada se centra en su propio ancho máximo, entre 672 y 1024 px. Por eso el título y el panel quedan "solo en medio", con franjas vacías a los lados.

En tablet (768–1023 px) no hay sidebar: el menú solo se abre con ☰. Hay además desbordamientos conocidos en móvil:
- el chat de la entrevista usa `100vh` y el campo de respuesta queda tapado por la barra del navegador;
- las filas del historial no se parten con nombres de puesto largos;
- los botones finales del reporte se aprietan.

## What Changes

- **Contenedor único:** todas las pantallas del shell autenticado usan un contenedor de hasta 1280 px, alineado a la izquierda junto al sidebar, en lugar del ancho propio y centrado de cada página.
- **Ancho según el contenido.** En escritorio el contenido se reparte en columnas:
  - Perfil: los datos en 2 columnas.
  - CV: la entrada (convocatoria / CV) en 2 columnas.
  - Retroalimentación: el reparto por bandas y las observaciones lado a lado.

  Los formularios, el chat y los textos largos mantienen un ancho de lectura cómodo, alineados a la izquierda.
- **Sidebar en tres tamaños:**
  - móvil (<768 px): cajón, como hoy;
  - tablet (768–1023 px): barra fija de iconos (72 px), siempre plegada, con el nombre en un tooltip;
  - escritorio (≥1024 px): completo y plegable, como hoy.

  El botón ☰ solo existe en móvil.
- **Sin desbordamientos:**
  - el chat usa la altura dinámica del viewport;
  - las filas con texto variable se parten o recortan;
  - los botones de acción se apilan en móvil;
  - no hay scroll horizontal entre 320 y 1440 px.
- **Ninguna función se pierde** en ningún tamaño.
- **Código muerto:** se quitan los `mx-auto max-w-*` de cada página.

## Capabilities

### New Capabilities
- `pantallas-responsivas`: el shell autenticado y sus pantallas se adaptan a móvil, tablet y escritorio sin desbordar y sin perder funciones.

### Modified Capabilities
- Ninguna con spec archivado.

## Impact

- **Frontend:**
  - `router/RutaProtegida.tsx`, `components/layout/Header.tsx` y `components/layout/Sidebar/*`;
  - un nuevo hook `hooks/useMediaQuery.ts`;
  - las páginas de `features/{perfil,seleccion,curriculum,historial,retroalimentacion,resultados,entrevista}`;
  - componentes con texto variable (`ListaEntrevistas`, `HistorialDeAnalisis`, `ZonaDeArchivo`) y `ModalDeConfirmacion`.
- **Documentación:** `CLAUDE.md`, en el shell autenticado.
- **Sin cambios:** backend, API, landing y login/registro.
