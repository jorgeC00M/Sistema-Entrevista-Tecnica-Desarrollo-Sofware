## Why

La landing cumple su función, pero se arma casi entera con patrones que hoy
delatan una interfaz generada por IA: hero centrado sobre un degradado azul con
cuadrícula y resplandor, títulos de sección numerados "01/02/03", filas de tres
tarjetas iguales con icono en un cuadrado, y una franja de cifras animadas.
Además, una auditoría con la lista de `redesign-existing-projects` y un cálculo
de contraste real encontró problemas objetivos: el texto secundario no cumple
WCAG AA (2,62:1 frente al 4,5:1 exigido), que `PRODUCT.md` pone como mínimo
obligatorio; la escala tipográfica está hecha de valores sueltos, y el título de
la página sigue diciendo "Entrevistas Técnicas" en lugar de Antesala.

El usuario pidió un diagnóstico antes de reescribir. Este cambio lo deja escrito
(en `design.md`) y planifica las mejoras para aplicarlas después, por fases y
sin rehacer la landing.

## What Changes

- **Diagnóstico completo** (`design.md`): 14 hallazgos "slop" o de calidad,
  cada uno con su archivo, por qué es genérico y la propuesta concreta.
- **Paleta refinada sin cambiar la identidad**: se mantiene la Tinta de
  Evaluador como única tinta; se corrige el gris secundario (`#8a93a8` →
  `#5f6984` para texto), se da más cuerpo a las superficies de vidrio y se cierra
  el degradado del hero en un tono que conserve el contraste del texto pequeño.
- **Escala tipográfica formal**: tokens para display, títulos de sección, cuerpo
  y meta en lugar de 15 tamaños arbitrarios; tracking negativo en titulares;
  cargar el peso 600 de JetBrains Mono, que hoy se sintetiza.
- **Jerarquía y composición**: hero asimétrico con la vista previa del producto
  como protagonista; las filas de tres tarjetas iguales pasan a composiciones
  con un elemento principal; se quitan la numeración "01/02/03", la cuadrícula y
  el resplandor genéricos.
- **Metadatos**: título y descripción con el nombre Antesala, etiquetas Open
  Graph y limpieza de un comentario desactualizado en `index.html`.
- **BREAKING (visual)**: cambia el aspecto de la landing; el contenido y los
  textos verificados en `actualizar-landing-funcionalidades` se conservan.

## Capabilities

### New Capabilities
- `landing-publica`: se añaden requisitos de contraste, escala tipográfica y
  composición no genérica (la capacidad está descrita en cambios anteriores aún
  sin archivar).

### Modified Capabilities

## Impact

- **Frontend**: `src/styles/index.css` (tokens), `index.html`,
  `features/landing/` (secciones y componentes).
- **DESIGN.md** y `.impeccable/design.json`: se actualizan los tokens que
  cambian (gris secundario, superficies, escala tipográfica) para que Impeccable
  y las taste skills sigan la misma fuente.
- El cambio de `vidrio-muted` también mejora el contraste en la aplicación
  autenticada, que usa el mismo token.
- Sin backend, sin dependencias nuevas (las fuentes ya se cargan de Google
  Fonts; solo se añade un peso).
