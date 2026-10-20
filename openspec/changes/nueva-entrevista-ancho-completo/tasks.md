## 1. Pantalla y componentes

- [x] 1.1 En `SeleccionPuestoPage.tsx`, quitar `max-w-3xl` y su comentario (D1). Se verifica con `grep -n "max-w-3xl" frontend/src/features/seleccion`, que no debe dar resultados.
- [x] 1.2 En `FormularioDeEntrevista.tsx`, poner `lg:grid-cols-3` o `lg:grid-cols-4` según las capas, con Tecnología en `lg:col-span-1`, sin cambiar el orden del DOM; actualizar su comentario (D2).
- [x] 1.3 En `ResumenDeEntrevista.tsx`, dejar una sola fila desde `lg`, con el texto, "Cubre" y la etiqueta a la izquierda y el botón a la derecha (D3).
- [x] 1.4 En `PanelDeConvocatoria.tsx`, dos columnas desde `lg`: la entrada a la izquierda y, a la derecha, `resumen` o el aviso previo (`hidden lg:flex`) (D4). Actualizar el comentario del componente.

## 2. Verificación y documentación

- [x] 2.1 Ejecutar `pnpm exec tsc --noEmit`, `pnpm test` (incluida la guarda de estilos), `pnpm run lint` (sin avisos nuevos) y `pnpm run build`, todos en verde.
- [x] 2.2 Actualizar `CLAUDE.md`:
  - en el párrafo de la pantalla de selección, la fila única de campos en escritorio y la convocatoria en dos columnas;
  - en el del contenedor común, quitar la selección de las excepciones en `max-w-3xl`.
- [ ] 2.3 Prueba manual a 375, 800, 1024 y 1440 px que cubra:
  - los campos en una fila desde 1024, también en Full Stack;
  - Tab en el orden Puesto → Nivel → Tecnología;
  - "Repetir última" y "Completar en Personalizada" enfocan el primer campo vacío;
  - en convocatoria, el aviso previo solo en escritorio, reemplazado por lo detectado sin que salte la entrada;
  - sin scroll horizontal.

  Si no se puede ejecutar, queda **sin marcar**.
