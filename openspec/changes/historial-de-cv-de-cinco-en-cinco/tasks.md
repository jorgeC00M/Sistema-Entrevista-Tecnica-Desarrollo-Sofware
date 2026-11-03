## 1. Implementación

- [x] 1.1 En `HistorialDeAnalisis.tsx`, cambiar `POR_PAGINA` de 10 a 5, con un comentario de por qué difiere de «Historial y progreso» (la tabla está debajo del formulario), y actualizar el docstring («de diez en diez» → «de cinco en cinco»). Verificar con `pnpm exec tsc --noEmit` y con un `grep` que confirme que no queda «diez» en el archivo.

## 2. Specs, documentación y verificación

- [x] 2.1 En la delta de `tipo-de-analisis-e-historial-en-tabla`, cambiar «Con más de 10 análisis… de a 10» y su escenario de 12 análisis por la referencia a este cambio (5 por página). Verificar con `openspec validate tipo-de-analisis-e-historial-en-tabla`.
- [x] 2.2 En `CLAUDE.md`, sección del CV y descripción de `Paginacion`, indicar 5 filas en el historial del CV y 10 en «Tus entrevistas». Verificar con un `grep`.
- [x] 2.3 Verificación completa:
  - `pnpm exec tsc --noEmit`;
  - `pnpm test`;
  - `pnpm run lint`, que debe quedar en 5 advertencias;
  - `pnpm run build`;
  - `openspec validate historial-de-cv-de-cinco-en-cinco`.

  Todo en verde.

## 3. Cierre (lo hace el usuario)

- [ ] 3.1 Prueba manual con 6 o más análisis:
  - aparece «‹ 1 2 ›»;
  - la página 2 muestra el resto;
  - al recargar se conserva la página;
  - con el teclado, el foco vuelve a la tabla al cambiar de página.
- [ ] 3.2 No hacer commit. El usuario lo hará tras revisar.
