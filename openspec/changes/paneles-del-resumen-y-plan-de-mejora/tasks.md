## 1. Resumen en paneles

- [x] 1.1 En `VeredictoDeLegibilidad.tsx`:
  - extraer «Formato» a `BloqueDeFormato` (una función local);
  - devolver la grilla `grid gap-4 md:grid-cols-[auto_1fr] lg:gap-6` (luego `md:grid-cols-[1fr_2fr]`, ver `dona-en-un-tercio`), que tiene:
    - la `Tarjeta` de la dona con su leyenda y la frase `sr-only`;
    - una columna con la `Tarjeta` del estado (etiqueta, título y regla). Sin `requisitos`, lleva además «Formato» debajo de un `border-t`;
    - con `requisitos`, `grid gap-4 lg:grid-cols-2 lg:gap-6` con una `Tarjeta` de «Formato» y `{requisitos}`.
  - actualizar el docstring.
- [x] 1.2 En `RequisitosNoDetectados.tsx`:
  - envolverlo en `Tarjeta como="section"`;
  - el título «Requisitos de la oferta» y, si hay ausentes, «No se detectó:» una sola vez;
  - una fila por requisito con `ChipDeRequisito` y su tipo, y después la nota;
  - con el vacío como hasta ahora.

  Verificar con tsc y con `estilos.test.ts`.

## 2. Plan de Mejora

- [x] 2.1 En `ArreglosDeFormato.tsx`, la fila pasa a `grid gap-y-3 lg:grid-cols-[2fr_1fr] lg:gap-x-6`. Se conservan `id`, `tabIndex`, `scroll-mt-32` y el foco. Actualizar el docstring.

## 3. Specs, documentación y verificación

- [x] 3.1 En la delta de `vista-dirigida-resumen-match-y-plan`, hacer que los bloques del panel derecho y «No se detectó» por fila remitan a este cambio. Verificar con `openspec validate` de los dos cambios.
- [x] 3.2 En `CLAUDE.md`:
  - el banner en paneles: dona | estado, y en el dirigido estado arriba, con «Formato» | «Requisitos» debajo;
  - el encabezado único «No se detectó:»;
  - los arreglos en 2fr / 1fr desde 1024 px;
  - este cambio en la lista de reaperturas.
- [x] 3.3 Ejecutar `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm run lint` (deben quedar 5 advertencias) y `pnpm run build`.

## 4. Cierre (lo hace el usuario)

- [ ] 4.1 Pruebas manuales en escritorio, a 800 px y a 375 px, del Resumen general, del Resumen dirigido (con y sin requisitos ausentes) y de «Plan de Mejora». Los enlaces de «Formato» deben seguir llevando a su fila.
- [ ] 4.2 No hacer commit; lo hace el usuario.
