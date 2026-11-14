## Why

- **Elección de Jorge.** Tras comparar las seis propuestas del PDF (`propuestas-visuales-con-estructura`), quiere llevar al sistema actual la estructura de «Fresco», con sus colores y su tipografía:
  - botones píldora grandes con sombra;
  - tarjetas muy redondas, sin borde y con sombra amplia;
  - campos más redondeados.
- **El vidrio actual no se ve.** Las tarjetas son blancas al 78 % de opacidad con `backdrop-blur`, pero el fondo de la aplicación es plano (`#eef2f8`): no hay nada detrás que desenfocar. Además, el filete fino que exige ese efecto contradice la tarjeta «sin borde con sombra amplia».

## What Changes

- **Botones:**
  - las acciones siguen siendo píldora;
  - el tamaño `md` sube a 44 px de alto, que es el blanco táctil mínimo, con más relleno lateral;
  - el principal lleva una sombra tintada con el acento;
  - al presionarlos se hunden un poco (escala 0,97), salvo con `prefers-reduced-motion`.
- **Tarjetas:** radio de 24 px, fondo blanco sólido, sin borde y con una sombra amplia y suave. Los paneles internos conservan su radio de 12 px, así que el interior queda menos redondo que el exterior.
- **Campos:** radio de 14 px. El foco, la validación y el estado deshabilitado no cambian.
- **Burbujas del chat:** radio de 24 px. La esquina de la cola va abajo a la derecha en las del usuario y abajo a la izquierda en las de la IA. La de la IA pasa a ser blanca sólida.
- **Vidrio solo donde hay algo detrás:**
  - *se mantiene* en la vista previa sobre el hero de la landing, la cabecera de la landing, la cabecera fija de la app (el contenido pasa por debajo al desplazarse) y el velo de los modales;
  - *se quita* en las tarjetas, las burbujas, la tarjeta de acceso y el carrusel de la landing.
- **Se elimina `frontend/src/styles/temas.css`** (las seis propuestas de vista previa) junto con su import: la dirección ya está elegida y el PDF del Escritorio queda como registro.
- **Fuera de alcance:**
  - colores, tipografía, modo oscuro, textos y disposición de las pantallas;
  - la elevación al pasar el cursor por tarjetas clicables, porque hoy no hay ninguna tarjeta clicable entera.

## Capabilities

### New Capabilities
- `sistema-visual`: la forma de los componentes base (botón, tarjeta, campo y burbuja del chat) y cuándo se usa el efecto vidrio.

### Modified Capabilities
<!-- ninguna -->

## Impact

- **Frontend, solo estilo:**
  - `styles/tokens.css`: tokens nuevos de radio y sombra, y la tarjeta en blanco sólido;
  - `styles/utilidades.css`: la utilidad `campo`;
  - `styles/index.css`, y se borra `styles/temas.css`;
  - `components/ui/estilosDeBoton.ts`, `Tarjeta.tsx` y `BurbujaPregunta.tsx`;
  - `features/auth/components/TarjetaAuth.tsx`;
  - `features/landing/components/CarruselDeTarjetas.tsx` y `VistaPreviaEntrevista.tsx`.
- **Sin cambios** en el backend, la API, los datos ni la lógica.
- **Riesgo:** algunos sitios que heredan la tarjeta pueden haber dependido del borde para separarse, por ejemplo una tarjeta dentro de otra. Se revisan con capturas.
