## 1. Contenedor

- [x] 1.1 `router/RutaProtegida.tsx`: quitar `max-w-7xl` del contenedor de la página y actualizar su comentario (sin límite, pegado al sidebar; lo que no debe estirarse se limita a sí mismo). Sin clases, el `div` que envolvía la página ya no hacía nada, así que se quitó: las páginas quedan directamente en el `main`.
- [x] 1.2 Buscar comentarios o textos que todavía digan «1280 px» o `max-w-7xl` como el ancho del contenido y actualizarlos.

## 2. Verificación

- [x] 2.1 Frontend: `pnpm exec tsc --noEmit`, `pnpm test` y `pnpm run build`.
- [x] 2.2 Capturas en 1440 px con el sidebar plegado y abierto, y en 1920 px plegado, de inicio, simular, chat, reporte, CV, historial y perfil. Comprobar que:
  - no queda franja vacía a la derecha;
  - las burbujas no pasan de unos 65 caracteres;
  - ninguna pantalla se ve rota por el ancho extra.
- [x] 2.3 `openspec validate contenido-sin-ancho-maximo --strict`.

## 3. Cierre (lo hace Jorge)

- [ ] 3.1 Revisar las capturas y hacer el commit. No lo hace Claude.
