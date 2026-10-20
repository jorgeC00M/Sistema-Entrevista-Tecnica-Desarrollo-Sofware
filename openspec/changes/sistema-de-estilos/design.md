## Context

El frontend usa Tailwind v4 (`@tailwindcss/vite`), y hoy todo el estilo global vive en un único `styles/index.css` de 189 líneas: el `@theme` (17 colores, 3 radios, 13 tamaños de texto, 3 fuentes, ninguna sombra), la base y una animación. Los componentes estilizan con clases.

La auditoría (ver proposal.md) muestra que la deriva no está en los colores (0 colores crudos de la paleta), sino en:
- botones hechos a mano;
- el foco copiado y a veces ausente;
- cuatro tratamientos de campo;
- overlays sin un estilo propio;
- valores arbitrarios en login y landing.

`Boton` ya existe, pero 14 de sus 15 usos pasan `forma="pildora"`, que su propio comentario llama "excepción".

## Goals / Non-Goals

**Goals:**
- Un lugar para cada decisión visual.
- Componentes base que hagan imposible desviarse sin esfuerzo.
- Foco visible en todo.
- Una guarda automática.

**Non-Goals:**
- Modo oscuro.
- Cambiar la paleta, las fuentes o la identidad visual (vidrio, serif en los títulos).
- Rediseñar pantallas.
- Agregar librerías de UI.

## Decisions

### D1. Tailwind se queda; se agrega CSS propio por capas
No se crea un `.css` por componente. Se reparten las responsabilidades en `src/styles/`:
- **`tokens.css`:** el `@theme` actual más los tokens nuevos:
  - `--shadow-tarjeta`, `--shadow-flotante` y `--shadow-modal` (desde los `shadow-[…]` de TarjetaAuth, Carrusel, HeaderLanding y VistaPrevia);
  - `--color-velo` (vidrio-ink al 50 %);
  - `--radius-tarjeta: 22px`, que absorbe `rounded-[22px]` y `rounded-2xl`;
  - tamaños de texto `--text-boton-lg` y `--text-auth-*`, que absorben los `text-[…rem]` del login;
  - `--gradiente-hero`.
- **`base.css`:** `html`, `body`, `::selection` (con el token), `.salto-al-contenido` y `prefers-reduced-motion`.
- **`utilidades.css`:**
  - `@utility foco-anillo` (`outline-2 outline-offset-2 outline-vidrio-acento` en `:focus-visible`);
  - `@utility foco-claro` (lo mismo con `outline-white`, para el sidebar y el hero oscuro);
  - `@utility campo` (borde `vidrio-borde`, fondo blanco, `rounded-control`, alto mínimo de 44 px, foco de borde más anillo, `disabled` y `aria-[invalid=true]`).
- **`overlays.css`:** `.modal` y `.velo`, ver D5.
- **`index.css`:** solo `@import "tailwindcss"` y los cuatro archivos.

**Por qué no un CSS por componente:** con Tailwind el estilo vive junto al componente y muere con él; los archivos sueltos acumulan reglas huérfanas y conflictos de especificidad. Lo que sí conviene sacar a CSS es lo que se repite (foco, campo) y lo que las clases expresan mal (`::backdrop`, `@starting-style`). Eso es lo que se hace.

### D2. `Boton`: variantes semánticas, forma única
- **Variantes:**
  - `primario` (acento);
  - `secundario` (blanco con borde);
  - `contorno` (transparente con borde, que toma el acento al pasar el cursor);
  - `texto` (sin caja, subrayado al pasar el cursor; para acciones en línea, como el "Volver a intentar" de la entrevista);
  - `peligro` (`error-texto`; para "Abandonar" o "Quitar");
  - `fantasma` (fondo oscuro del sidebar).
- **Tamaños:** `sm`, `md` y `lg` (`h-12 px-6 text-boton-lg`, para el envío del login y el CTA de la landing).
- **Forma:** píldora siempre y se elimina `forma`. La única excepción histórica, el `fantasma` de `SidebarPerfil`, pasa a `BotonIcono` o a un `Boton` píldora según su contenido.
- **Sin alias:** el plan preveía alias temporales `vidrio` / `vidrio-secundario`. Al implementar se vio que había solo 15 usos, así que se migraron todos en el mismo paso: el build nunca quedó roto y no hubo código de transición que retirar.

### D3. `clasesDeBoton()` para enlaces
`components/ui/estilosDeBoton.ts` exporta `clasesDeBoton({ variante, tamano })` y es la misma fuente que usa `Boton`. Va en un `.ts` aparte para no exportar funciones desde un `.tsx` (Fast Refresh). Los `Link` de ResultadosPage, PreguntasProbables, HeaderLanding, AccionesDeRegistro y SidebarAccionPrincipal pasan a `<Link className={clasesDeBoton(...)}>`. Así desaparecen los 4 `<button>` dentro de `<a>`.

### D4. `BotonIcono`, `Chip` y campos
- **`BotonIcono`:** props `etiqueta` (el `aria-label` obligatorio), `tamano` sm (32 px) / md (40 px) / lg (44 px) y `tono` `claro` / `oscuro`, con `rounded-control`. Absorbe:
  - el botón de cerrar del modal y el del menú en el header;
  - el de quitar archivo en `ZonaDeArchivo`;
  - las flechas del carrusel;
  - el de mostrar la contraseña en `CampoAuth`.
- **`Chip`:** un botón píldora pequeño con borde, que toma el acento al pasar el cursor, y una variante estática (`span`) para listar requisitos. Reemplaza "Probar con un ejemplo" y los requisitos del perfil.
- **Campos:** `Textarea`, `CampoSelect`, `CampoAuth` (su contenedor con `focus-within`) y `CampoConvocatoria` aplican la utilidad `campo`. `CampoConvocatoria` deja de duplicar `ControlSegmentado` y lo reutiliza.

### D5. Overlays en `overlays.css`
- **`.modal`** se aplica al `<dialog>`:
  - `::backdrop` con `var(--color-velo)` y `backdrop-filter: blur(2px)`;
  - entrada con `@starting-style { opacity: 0; scale: .98 }` y `transition: opacity .16s, scale .16s`;
  - **sin animación de salida:** `Modal` se monta solo mientras está abierto y quien lo usa lo desmonta al cerrar; animar la salida obligaría a retrasar el desmontaje, y con él el `focoAlCerrar`, que se evalúa al desmontar (decisión tomada al implementar);
  - con `prefers-reduced-motion: reduce`, `transition: none`.
- **`.velo`:** el velo del cajón móvil, con el mismo color y una transición de opacidad. El cajón gana un `translate` de entrada, también desactivado con movimiento reducido.
- **Por qué en CSS:** `::backdrop`, `@starting-style` y `allow-discrete` no tienen una buena expresión en clases utilitarias, y es justo el caso que el usuario señaló.

### D6. Guarda automática
`src/estilos.test.ts` (Vitest, sin DOM) lee con `fs` todos los `.tsx` de `src/` y busca:
- `<button` fuera de `components/ui/`;
- `shadow-[`, `rounded-[` y `text-[` seguido de un número con unidad;
- `bg-|text-|border-(slate|gray|zinc|indigo|blue|red|green|amber|emerald)-\d`.

`EXCEPCIONES` es un mapa `archivo → motivo`, que incluye `GraficoProgreso` (colores de categoría del gráfico) e `IconoGoogle` (colores de marca). La prueba informa cada violación como `archivo:línea`.

### D7. Orden de la migración
El orden mantiene el build en verde en cada paso:
1. Tokens, capas y utilidades (no rompe nada).
2. Componentes base con alias.
3. Migración por carpeta: auth, landing, curriculum, seleccion, entrevista y resultados, layout.
4. Quitar los alias y el prop `forma`.
5. La guarda (al final, cuando ya pasa).

## Risks / Trade-offs

- [Cambios visuales en login y landing] → son los únicos lugares con valores propios; los tokens reproducen los valores actuales donde son razonables (`--radius-tarjeta: 22px`, la sombra de la tarjeta de auth) para que el cambio sea mínimo.
- [`@starting-style` y `allow-discrete` no existen en navegadores antiguos] → sin soporte, el modal simplemente aparece sin animación; nada se rompe.
- [La guarda puede dar falsos positivos (por ejemplo, `text-[` en un comentario)] → busca dentro de cadenas de clase y admite excepciones con motivo.
- [Migración amplia (unas 30 vistas)] → por carpeta, con `tsc`, lint y build en verde entre carpetas, y una prueba visual al final que debe ejecutarse.
