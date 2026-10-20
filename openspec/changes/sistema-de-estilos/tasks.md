## 1. Capas CSS

- [x] 1.1 Dividir `styles/index.css` en `tokens.css`, `base.css`, `utilidades.css` y `overlays.css`, dejando `index.css` solo con los `@import` (D1).
  - Agregar los tokens de sombra, `--color-velo`, `--radius-tarjeta`, los tamaños de texto del login y `--gradiente-hero`.
  - Usar el token en `::selection`.

  Se verifica con `pnpm run build` en verde y con que la app no cambie de aspecto, comparando el CSS generado: mismas variables y mismas reglas base.
- [x] 1.2 Agregar las utilidades `foco-anillo`, `foco-claro` y `campo` en `utilidades.css`, y `.modal` y `.velo` en `overlays.css`, con `prefers-reduced-motion` (D1, D5). Se verifica con `pnpm run build` en verde.

## 2. Componentes base

- [x] 2.1 `Boton` con variantes primario/secundario/contorno/texto/peligro/fantasma y tamaños sm/md/lg, siempre en píldora y con `foco-anillo`, más los alias temporales `vidrio` y `vidrio-secundario` (D2). Crear `estilosDeBoton.ts` con `clasesDeBoton()`, que `Boton` también usa (D3). Se verifica con `tsc` sin errores.
- [x] 2.2 `BotonIcono` con etiqueta obligatoria, tamaños sm/md/lg y tonos claro/oscuro (D4). Crear `Chip`, con versión de botón y versión estática. Se verifica con `tsc` sin errores.
- [x] 2.3 Componentes que se apoyan en los base:
  - `Modal` usa la clase `modal` y `BotonIcono` para cerrar;
  - `Textarea` y `CampoSelect` usan la utilidad `campo`;
  - `ControlSegmentado` y `Pestanas` usan `foco-anillo`.

  Se verifica con `tsc`, `pnpm run lint` y `pnpm run build`, todos en verde.

## 3. Migración por carpeta

En cada subtarea, se verifica con `tsc`, `pnpm run lint` (sin avisos nuevos) y `pnpm run build` en verde.

- [x] 3.1 **auth:**
  - `FormularioLogin` y `FormularioRegistro` usan un `Boton` primario de tamaño lg;
  - `CampoAuth` usa `campo` y `BotonIcono` para la contraseña;
  - `BotonGoogle` (su alternativa deshabilitada) y `TarjetaAuth` pasan a tokens (`shadow-tarjeta`, `radius-tarjeta`, `vidrio-linea`, los textos);
  - se quita el `font-sans` redundante.
- [x] 3.2 **landing:**
  - en `HeaderLanding`, los enlaces usan `clasesDeBoton` y `foco-anillo`, y las sombras pasan a tokens;
  - `AccionesDeRegistro` usa un `Link` con `clasesDeBoton` lg y deja de anidar un botón;
  - `CarruselDeTarjetas` usa `BotonIcono` para las flechas, puntos con foco y la sombra como token;
  - `Hero` usa `--gradiente-hero`;
  - `VistaPreviaEntrevista` pasa a tokens de radio y sombra.
- [x] 3.3 **curriculum:**
  - `ZonaDeArchivo` usa `BotonIcono` para quitar el archivo y foco en la zona;
  - `CampoConvocatoria` reutiliza `ControlSegmentado` y `campo`;
  - `HistorialDeAnalisis` usa `foco-anillo`;
  - `PreguntasProbables` usa un `Link` con `clasesDeBoton`.
- [x] 3.4 **seleccion, entrevista y resultados:**
  - `RepetirConfiguracion` usa `Boton` contorno;
  - `PanelDeConvocatoria` usa `Chip`;
  - `EntrevistaPage` usa `Boton` texto para "Volver a intentar" y `peligro` para "Abandonar", si corresponde;
  - `BurbujaPregunta` pasa a tokens;
  - `ResultadosPage` usa `Link` con `clasesDeBoton`, sin anidar.
- [x] 3.5 **layout:**
  - `Header` usa `BotonIcono` para el menú;
  - `SidebarAccionPrincipal` y `SidebarNavItem` usan `foco-claro`, y el primero, `clasesDeBoton`;
  - el `fantasma` de `SidebarPerfil` se resuelve;
  - el cajón de `RutaProtegida` usa `.velo` y una transición.
- [x] 3.6 Quitar los alias `vidrio` / `vidrio-secundario` y cualquier `forma=`; reemplazar los usos restantes. Se verifica con `grep -rE "forma=|variante=\"vidrio" frontend/src` vacío y `tsc` en verde.

## 4. Guarda y documentación

- [x] 4.1 Crear `src/estilos.test.ts` (D6) con la lista explícita de excepciones. Se verifica con `pnpm test` en verde y comprobando que falla al introducir a propósito un `<button className=…>` en un archivo de `features/` (y luego se revierte).
- [x] 4.2 En `CLAUDE.md`, agregar una sección "Sistema de estilos": las capas CSS y qué va en cada una, la regla de forma, los componentes base, `clasesDeBoton`, las utilidades y la guarda. Actualizar las menciones a `forma="pildora"`, `vidrio-secundario` y los estilos del modal. Se verifica con `grep` de "forma=" y "vidrio-secundario" en `CLAUDE.md`, que no debe dar resultados.
- [ ] 4.3 Prueba visual en el navegador, en escritorio y a 375 px, que cubra:
  - login, registro, landing, selección, entrevista (incluido el modal de abandonar), resultados, CV, historial y sidebar con el cajón móvil;
  - el foco con teclado en cada botón;
  - la animación del modal y su desactivación con movimiento reducido.

  Si no se puede ejecutar, queda **sin marcar**.
