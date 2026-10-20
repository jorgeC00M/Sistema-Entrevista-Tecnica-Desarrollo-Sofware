## 1. Lógica pura

- [x] 1.1 Simplificar `features/seleccion/seleccion.ts` (D3):
  - quitar `abierto`, `Paso`, `PASOS`, `estadoDelPaso`, `editar` y `avanzar`;
  - convertir `pasoPendiente` en `campoFaltante`;
  - hacer que `elegirTecnologia` con `codigo: ''` vacíe la capa.

  Actualizar `seleccion.test.ts`: quitar los tests de pasos y edición, y añadir los de `campoFaltante` (vacío → puesto; Full Stack solo con frontend → tecnología; completo → `null`) y los de vaciar una capa. Se verifica con `pnpm test` en verde.

## 2. Componentes

- [x] 2.1 Cargar las skills de UI/UX (ui-ux-pro-max) y de diseño (design-taste-frontend / impeccable) y crear `CampoSelect.tsx` (D1, D2), que incluye:
  - `<label htmlFor>`, `<select>` con `appearance-none` y chevron, ayuda con `aria-describedby`;
  - marcador "Selecciona…" deshabilitado, soporte de `<optgroup>` y estado deshabilitado.

  Se verifica con `tsc` sin errores.
- [x] 2.2 Crear `FormularioDeEntrevista.tsx`:
  - campos Puesto (con la descripción como ayuda), Tecnología (uno o dos según `capasDe`, agrupados con `agruparPorGrupo`) y Nivel ("Nombre · Grado");
  - rejilla de 2 columnas en `sm` para las capas.

  Se verifica con `tsc` sin errores.
- [x] 2.3 Crear `PanelDeConvocatoria.tsx` a partir de `ConvocatoriaModal` (D4), que incluye:
  - las pestañas Pegar/Subir, `Textarea` con contador, `ZonaDeArchivo`, los ejemplos y "Analizar convocatoria";
  - los estados de carga y error (422, 400, 503) y el resumen "Perfil detectado" con requisitos y lo que no se evalúa.

  Se verifica con `tsc` sin errores.

## 3. Página y limpieza

- [x] 3.1 Reescribir `SeleccionPuestoPage.tsx` (D5, D6, D7):
  - pestañas "Elegir yo" / "Desde una convocatoria" con `ControlSegmentado`;
  - el panel, el formulario y la barra con `campoFaltante`;
  - "Repetir última" con foco al primer campo vacío o a "Comenzar";
  - `?puesto=&nivel=`;
  - pasar a "Elegir yo" anula `convocatoriaId`;
  - "Volver a aplicar este perfil".

  Se verifica con `tsc` sin errores.
- [x] 3.2 Eliminar `PasoDeSeleccion.tsx`, `TarjetaPuesto.tsx`, `EleccionDeTecnologia.tsx`, `EleccionDeNivel.tsx` y `ConvocatoriaModal.tsx`. Se verifica que `grep -rE "PasoDeSeleccion|TarjetaPuesto|EleccionDe|ConvocatoriaModal|estadoDelPaso|pasoPendiente" frontend/src` no da resultados, junto con `tsc`, `pnpm test`, `pnpm run lint` (sin avisos nuevos) y `pnpm run build`, todos en verde.

## 4. Documentación y prueba manual

- [x] 4.1 Actualizar `CLAUDE.md`:
  - la pantalla de selección pasa a ser un formulario con selects y modos;
  - el modal de convocatoria ya no existe y analizar aplica a los campos.

  Se verifica releyendo el texto contra el código.
- [ ] 4.2 Prueba manual en el navegador, que cubra:
  - las etiquetas de cada campo;
  - el `optgroup` de Backend;
  - Full Stack con dos selects;
  - cambiar de puesto vacía la tecnología;
  - el modo convocatoria con texto y con un PDF, que rellena los campos;
  - pasar a "Elegir yo" quita "Desde convocatoria";
  - "Repetir última" con una combinación retirada;
  - `?puesto=backend&nivel=senior`;
  - solo teclado;
  - móvil a 375 px.

  Si no se puede ejecutar, queda **sin marcar**.
