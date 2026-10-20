## 1. Modal

- [x] 1.1 `components/ui/Modal.tsx`: prop opcional `focoAlCerrar` (ref). Al desmontar, enfoca `focoAlCerrar.current` si existe; si no, el elemento que abrió el modal. `ModalDeConfirmacion` la reenvía. Verificar con `tsc` y en el navegador que Cancelar sigue devolviendo el foco al botón que abrió el modal.

## 2. Repetir configuración

- [x] 2.1 `RepetirConfiguracion.tsx`: quitar `seleccionActual`, `busqueda`, `loQueSeReemplaza()` y el párrafo de advertencia, y aceptar `focoAlCerrar`. Verificar con un grep de `seleccionActual|loQueSeReemplaza` sin resultados.
- [x] 2.2 `BarraDeResumen.tsx` y `EleccionDePuesto.tsx`: exponer refs al botón "Comenzar entrevista" y a la primera tecnología (prop `ref` de React 19). Verificar con `tsc`.
- [x] 2.3 `SeleccionPuestoPage.tsx`:
  - en `repetir()`, decidir el destino (D2);
  - desplazar con `desplazarSuave()`;
  - anunciar en `aria-live` (D3);
  - quitar el cálculo de `seleccionActual`.

  Verificar con `tsc`, `pnpm run lint` (≤ 5 avisos) y `pnpm run build`.

## 3. Verificación y documentación

- [ ] 3.1 En el navegador (`IA_PROVEEDOR=fake`):
  - con una última entrevista completa, confirmar deja el foco en "Comenzar entrevista" y el buscador vacío;
  - con una entrevista antigua (tecnología inactiva), el foco queda en la primera tecnología y el botón sigue deshabilitado;
  - Cancelar, X y Esc no cambian nada.
- [x] 3.2 `CLAUDE.md`: actualizar el apartado de "Repetir última" (cuerpo sin advertencia; a dónde lleva el foco; `focoAlCerrar` en `Modal`). Verificar releyendo ese apartado.
