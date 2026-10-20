## 1. Componentes

- [x] 1.1 Crear `components/ui/Pestanas.tsx` (D1), que incluye:
  - un tablist con `aria-label`, pestañas con `role="tab"`, `aria-selected`, `aria-controls` y tabindex móvil;
  - ← y → con vuelta, Inicio y Fin, y activación automática;
  - un subrayado de acento en la seleccionada y una altura mínima de 44 px;
  - la exposición de los ids de las pestañas para el `aria-labelledby` del panel.

  Se verifica con `tsc` sin errores.
- [x] 1.2 Crear `features/seleccion/components/ResumenDeEntrevista.tsx` a partir de `BarraDeResumen` (D3), que incluye:
  - un borde superior y nada de `sticky`;
  - el resumen o lo que falta, con su `aria-live`, y la etiqueta "Desde convocatoria";
  - el error con `role="alert"`;
  - el botón "Iniciar entrevista" con `tamano="sm"`, alineado a la derecha y sin `w-full`.

  Se verifica con `tsc` sin errores.

## 2. Página y limpieza

- [x] 2.1 En `SeleccionPuestoPage.tsx` (D2, D4):
  - reemplazar `ControlSegmentado` por `Pestanas` ("Personalizada" / "Con convocatoria");
  - envolver el panel de convocatoria, el formulario y `ResumenDeEntrevista` en un único `role="tabpanel"`;
  - quitar la barra fija y el `Alerta` suelto.

  Eliminar después `BarraDeResumen.tsx` y verificar que `grep -rE "BarraDeResumen|Elegir yo|Desde una convocatoria|Comenzar entrevista" frontend/src` no da resultados. Se verifica con `tsc`, `pnpm test`, `pnpm run lint` (sin avisos nuevos) y `pnpm run build`, todos en verde.

## 3. Documentación y prueba manual

- [x] 3.1 Actualizar en `CLAUDE.md` los nombres de las pestañas, "Iniciar entrevista", el resumen dentro del panel y la desaparición de la barra fija. Se verifica con `grep` de "Elegir yo", "sticky summary bar" y "Comenzar entrevista", que no deben dar resultados.
- [ ] 3.2 Prueba manual que cubra:
  - ← y → entre pestañas;
  - el lector anuncia "pestaña, 1 de 2";
  - el resumen bajo Tecnología;
  - el botón pequeño abajo a la derecha, también a 375 px;
  - el error de inicio dentro del panel;
  - el foco va a "Iniciar entrevista" tras una "Repetir última" completa.

  Si no se puede ejecutar, queda **sin marcar**.
