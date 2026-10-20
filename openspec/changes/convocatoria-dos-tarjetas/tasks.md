## 1. Componentes

- [x] 1.1 Crear `features/seleccion/components/EleccionDeVia.tsx` (D1, D2): un `fieldset` con la `legend` "Elige una forma de darnos la convocatoria" y dos `label` con un radio `sr-only`, icono (`respuesta`, `documento`), título y ayuda. Lleva estilos `has-[:checked]` y `has-[:focus-visible]`, `rounded-control` y `grid sm:grid-cols-2`, y las props `via`, `onCambiar` y `deshabilitado`. Se verifica con `tsc` sin errores.
- [x] 1.2 En `PanelDeConvocatoria.tsx` (D3):
  - añadir el estado `via` y usar `EleccionDeVia` arriba;
  - mostrar solo el campo de la vía;
  - `listo` y el envío según la vía;
  - eliminar `EJEMPLOS`, la fila de `Chip`, el separador "o", el bloqueo mutuo, sus ayudas y `useId`;
  - actualizar el comentario del componente.

  Se verifica con `grep -nE "EJEMPLOS|Probar con|Bloqueado|Borra el texto|Quita el archivo" frontend/src/features/seleccion`, que no debe dar resultados.

## 2. Verificación y documentación

- [x] 2.1 Ejecutar `pnpm exec tsc --noEmit`, `pnpm test` (incluida la guarda de estilos), `pnpm run lint` (sin avisos nuevos) y `pnpm run build`, todos en verde.
- [x] 2.2 Actualizar en `CLAUDE.md` el párrafo de la pestaña "Con convocatoria": las dos tarjetas en lugar del bloqueo mutuo, sin ejemplos. Se verifica con `grep -n "Borra el texto" CLAUDE.md`, que no debe dar resultados.
- [ ] 2.3 Prueba manual que cubra:
  - entrar a la pestaña con "Pegar texto" elegida;
  - cambiar con las flechas;
  - escribir texto, pasar a archivo, elegir un PDF y analizar (se analiza el PDF);
  - volver a texto, que conserva lo escrito;
  - las tarjetas deshabilitadas mientras analiza;
  - lector de pantalla o inspector de accesibilidad: "1 de 2, seleccionado";
  - 375 px apiladas.

  Si no se puede ejecutar, queda **sin marcar**.
