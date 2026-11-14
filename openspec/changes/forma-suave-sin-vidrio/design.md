## Context

- **Botón:** `components/ui/estilosDeBoton.ts` (`clasesDeBoton`) es la única fuente de clases. Hoy: píldora `rounded-full`, `md` = `px-4 py-2.5` (unos 40 px de alto), sin sombra y con `transition-colors`.
- **Tarjeta:** `components/ui/Tarjeta.tsx::CLASES_TARJETA` = `rounded-vidrio border border-vidrio-borde bg-vidrio-card backdrop-blur-[18px]`. `--color-vidrio-card` vale `rgba(255,255,255,.78)`.
- **Paneles internos:** usan `rounded-vidrio` (12 px) directamente en unos 30 archivos (CV, selección, reporte), como `ArreglosDeFormato` o `PanelDeConvocatoria`.
- **Campo:** `@utility campo` en `styles/utilidades.css` usa `--radius-control` (8 px). Ese token también lo usan `BotonIcono`, `Tooltip` y `Paginacion`.
- **Burbujas:** en `BurbujaPregunta.tsx`, la de la IA es `rounded-burbuja rounded-tl-sm … bg-vidrio-field backdrop-blur-[18px]` y la del usuario `rounded-burbuja rounded-tr-sm bg-vidrio-acento`. La landing (`VistaPreviaEntrevista.tsx`) repite el patrón.
- **Fondos sobre los que se apoyan:**
  - **planos:** la app (`RutaProtegida`, `bg-vidrio-bg`), el acceso (`TarjetaAuth`) y el carrusel de la landing;
  - **con contenido detrás:** el hero (`--gradiente-hero`), las cabeceras fijas y el velo de los modales.
- **`styles/temas.css`:** vista previa de seis propuestas; sus selectores dependen de `rounded-tl-sm` / `rounded-tr-sm` y de las clases actuales.

## Goals / Non-Goals

**Goals:**
- botones, tarjetas, campos y burbujas con la forma aprobada;
- vidrio solo donde se ve;
- todo con tokens, de modo que `estilos.test.ts` siga en verde.

**Non-Goals:**
- colores, tipografía o modo oscuro;
- textos y disposición de las pantallas;
- elevación al pasar el cursor por las tarjetas, porque no hay tarjetas clicables enteras;
- cambiar `--radius-control` de los controles de icono.

## Decisions

### 1. Tokens nuevos en lugar de cambiar los existentes
Se agregan cuatro tokens:
- `--radius-superficie: 24px` (genera `rounded-superficie`);
- `--shadow-superficie: 0 18px 44px -22px rgba(28,47,94,.28)`;
- `--shadow-accion: 0 10px 22px -10px rgba(43,85,163,.55)`;
- `--radius-campo: 14px`.

**Por qué no subir `--radius-vidrio` a 24:** también lo usan los paneles internos, y una caja de 24 px dentro de otra de 24 px se ve inflada. La regla de radios concéntricos pide un interior menor. Por la misma razón, `--radius-control` se queda en 8 px para los controles de icono.

**Cambian dos valores existentes:**
- `--radius-burbuja` pasa de 16 a 24 px, porque solo lo usan las burbujas;
- `--color-vidrio-card` pasa a `#ffffff`: la tarjeta ya no es translúcida, y todo lo que use ese token pasa a ser opaco, que es lo buscado.

### 2. Botón
- La base cambia `transition-colors duration-150` por `transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out`, y suma `active:scale-97 motion-reduce:active:scale-100 motion-reduce:transition-colors`.
- **Por qué 0,97 y 150 ms:** es una respuesta táctil breve que no distrae.
- **Por qué `scale-97`:** es una clase de Tailwind v4, no un valor arbitrario.
- Los tamaños quedan así:
  - `md` = `h-11 gap-2 px-6 text-sm`, con alto fijo, para que el botón no crezca con el texto;
  - `lg` = `h-12 px-7`;
  - `sm` no cambia, porque se usa en tablas y en resúmenes compactos.
- `primario` suma `shadow-accion`. Las demás variantes no llevan sombra, para que la jerarquía la marque la principal.

### 3. Tarjeta
`CLASES_TARJETA = 'rounded-superficie bg-vidrio-card shadow-superficie'`. Se actualiza su JSDoc, que hoy habla de vidrio.

### 4. Campo
En `@utility campo`, `border-radius: var(--radius-campo)`. El resto de la utilidad no cambia.

### 5. Burbujas
- **IA:** `rounded-burbuja rounded-bl-sm border border-vidrio-borde bg-white text-vidrio-ink`. Mantiene el filete, porque va sobre el fondo del chat, que es casi blanco.
- **Usuario:** `rounded-burbuja rounded-br-sm bg-vidrio-acento text-white`.
- En `VistaPreviaEntrevista` va el mismo cambio de esquinas. Su caja de vidrio sobre el hero se mantiene.

### 6. Vidrio
- **Se quita `backdrop-blur`** de:
  - `Tarjeta`;
  - `BurbujaPregunta`;
  - `TarjetaAuth`, que además pasa a `rounded-superficie shadow-superficie` sin borde;
  - `CarruselDeTarjetas`, que pasa a la tarjeta sin borde con `shadow-superficie`, conservando su lógica de tarjeta activa.
- **Se mantiene** en:
  - `Header.tsx`;
  - `HeaderLanding.tsx` (por eso `--color-vidrio-reflejo` sigue en uso);
  - la caja de `VistaPreviaEntrevista`;
  - el velo de los modales.

### 7. `temas.css`
Se borra el archivo y su `@import` en `index.css`. Sus selectores quedarían rotos, y el código muerto no se conserva.

## Risks / Trade-offs

- **[Tarjetas que se separaban por su borde]** Por ejemplo, una tarjeta sobre otra tarjeta o sobre un fondo blanco. → Se revisan capturas de inicio, simular, chat, reporte, CV, historial y login, y se ajusta el caso que aparezca.
- **[La sombra amplia en listas largas se acumula visualmente]** → Su opacidad es baja (0,28) y su extensión negativa (−22 px), así que no invade la tarjeta vecina con el espacio actual (`gap-4` / `gap-6`).
- **[Botón `md` más alto]** → En filas compactas que usen `md` puede crecer el alto de la fila. Si molesta en algún sitio, ese sitio pasa a `sm`.

## Migration Plan

Solo CSS y clases del frontend. Se revierte deshaciendo los cambios de los archivos listados.
