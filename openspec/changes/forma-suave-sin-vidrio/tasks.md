## 1. Tokens y utilidades

- [x] 1.1 En `styles/tokens.css`:
  - agregar `--radius-superficie: 24px`, `--radius-campo: 14px`, `--shadow-superficie` y `--shadow-accion`;
  - cambiar `--radius-burbuja` a 24px y `--color-vidrio-card` a `#ffffff`;
  - actualizar el comentario de la regla de forma y el del sistema vidrio.
- [x] 1.2 En `styles/utilidades.css`, que `@utility campo` use `var(--radius-campo)`.

## 2. Componentes base

- [x] 2.1 `components/ui/estilosDeBoton.ts`:
  - la transición pasa a color, sombra y transform, con `active:scale-97` y su versión para `motion-reduce`;
  - `md` = `h-11 px-6` y `lg` = `h-12 px-7`;
  - `primario` lleva `shadow-accion`;
  - actualizar su comentario.
- [x] 2.2 `components/ui/Tarjeta.tsx`: `rounded-superficie bg-vidrio-card shadow-superficie`, sin borde ni blur, con su JSDoc actualizado.
- [x] 2.3 `components/ui/BurbujaPregunta.tsx`: la IA con `rounded-bl-sm` y `bg-white` sin blur; el usuario con `rounded-br-sm`.

## 3. Vidrio solo donde hay fondo

- [x] 3.1 `features/auth/components/TarjetaAuth.tsx`: sin blur, sin borde, `rounded-superficie shadow-superficie`.
- [x] 3.2 `features/landing/components/CarruselDeTarjetas.tsx`: sin blur ni borde, con `shadow-superficie`; conservar su estado activo.
- [x] 3.3 `features/landing/components/VistaPreviaEntrevista.tsx`: las burbujas con `rounded-bl-sm` / `rounded-br-sm`; se mantiene la caja de vidrio sobre el hero.
- [x] 3.4 Confirmar que el vidrio sigue en `Header.tsx`, `HeaderLanding.tsx` y el velo de los modales.

## 4. Limpieza

- [x] 4.1 Borrar `frontend/src/styles/temas.css` y su `@import` en `styles/index.css`.
- [x] 4.2 Buscar restos: `backdrop-blur` fuera de los sitios permitidos, y tokens que hayan quedado sin uso. Se quitaron `--radius-tarjeta` y `--shadow-tarjeta`, y la tarjeta de «Simular entrevista», escrita a mano con borde, pasó a `Tarjeta`.

## 5. Verificación

- [x] 5.1 `pnpm exec tsc --noEmit`, `pnpm test` (con `estilos.test.ts`), `pnpm run lint` y `pnpm run build`.
- [x] 5.2 Capturas en escritorio y celular de inicio, simular, chat, reporte, CV, historial y login:
  - forma de botones, tarjetas, campos y burbujas;
  - foco visible;
  - ninguna tarjeta queda sin separarse del fondo.
- [x] 5.3 `openspec validate forma-suave-sin-vidrio --strict`.

## 6. Cierre (lo hace Jorge)

- [ ] 6.1 Revisar las capturas.
- [ ] 6.2 Hacer el commit, que lo hace Jorge.
