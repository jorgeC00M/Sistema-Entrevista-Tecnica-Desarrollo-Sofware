## 1. Paleta y contraste (fase 1)

- [x] 1.1 En `src/styles/index.css`: `vidrio-muted` → #5f6984, nuevo
  `vidrio-tenue` #8a93a8 para iconos y bordes decorativos, `vidrio-bg` → #eef2f8,
  `vidrio-card` → blanco al 78 %. Verificar con el cálculo de contraste que todos
  los pares de texto superan 4,5:1.
- [x] 1.2 Revisar los usos de `text-vidrio-muted` que son decorativos (iconos) y
  pasarlos a `vidrio-tenue`. Verificar con búsqueda que el texto sigue en
  `vidrio-muted`.
- [x] 1.3 Hero: degradado #132042 → #1c2f5e y textos pequeños a blanco al 75 %.
  Verificar el contraste del texto pequeño sobre la zona más clara.

## 2. Escala tipográfica (fase 2)

- [x] 2.1 Tokens `--text-display`, `--text-seccion`, `--text-tarjeta`,
  `--text-cuerpo`, `--text-meta` en `@theme` (con interlineado y tracking).
  Verificar con `tsc` y build.
- [x] 2.2 Reemplazar los tamaños arbitrarios de `features/landing` por los
  tokens. Verificar con búsqueda que no queda ningún `text-[...rem]`.
- [x] 2.3 `index.html`: cargar JetBrains Mono 500 y 600; `tabular-nums` en las
  cifras. Verificar en DevTools que no hay negrita sintetizada.
- [x] 2.4 Un solo ancho de lectura (`max-w-[62ch]`) para los párrafos.

## 3. Metadatos (fase 3)

- [x] 3.1 `index.html`: título y descripción con Antesala, etiquetas Open Graph
  (`og:title`, `og:description`, `og:type`) y quitar el comentario desactualizado
  sobre IBM Plex. Verificar el título en la pestaña.
- [x] 3.2 Marca visible: "Entrevistas Técnicas" → "Antesala" en
  `HeaderLanding`, `FooterLanding` y la marca del sidebar. Verificar con búsqueda
  que no queda el nombre viejo en la interfaz.

## 4. Composición (fase 4, sección por sección)

- [x] 4.1 Hero asimétrico (S1, S2): titular a la izquierda y vista previa
  protagonista a la derecha; sin cuadrícula ni resplandor; rastros como una
  línea en mono. Verificar en escritorio y móvil.
- [x] 4.2 Acciones (S3): "Ya tengo cuenta" como enlace de texto en
  `AccionesDeRegistro`.
- [x] 4.3 Encabezados (S4): quitar la numeración de `EncabezadoSeccion` y
  alinear a la izquierda.
- [x] 4.4 "Cómo funciona" (S5): pasos en lista con una vista principal, en lugar
  de tres tarjetas.
- [x] 4.5 "Qué recibes" (S9, S7): fragmento real de resultado en lugar del
  medidor de 85; tarjetas sin el icono en cuadrado.
- [x] 4.6 "Revisa tu CV" (S6): ejemplo de la ficha del ATS como pieza principal.
- [x] 4.7 Quitar `FranjaDatos` (S8) y su uso en `LandingPage`. Verificar con
  búsqueda que no quedan referencias.
- [x] 4.8 Cierre (S10): sobre fondo claro, sin manchas, con un solo botón.
- [x] 4.9 Radios (S11): tarjetas a 12 px y píldora solo en el botón principal y
  los chips.

## 5. Sistema de diseño y cierre

- [x] 5.1 Actualizar `DESIGN.md` y `.impeccable/design.json` con los tokens
  nuevos (gris secundario y tenue, fondo, vidrio, escala tipográfica y radios).
- [x] 5.2 `pnpm exec tsc --noEmit`, `pnpm run lint` (sin subir de 6) y
  `pnpm run build`.
- [x] 5.3 Con el sitio corriendo, `impeccable detect http://localhost:5173` (y
  `--viewport 390x844` para móvil) y revisión manual en escritorio y móvil.
