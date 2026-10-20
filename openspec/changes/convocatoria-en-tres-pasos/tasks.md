## 1. Componentes

- [x] 1.1 Reescribir `PanelDeConvocatoria.tsx` (D2, D7):
  - `Textarea` con la etiqueta "Texto de la convocatoria", el contador y los `Chip` de ejemplo;
  - un separador "o" y la `ZonaDeArchivo`;
  - exclusión texto/archivo con sus ayudas;
  - "Analizar convocatoria" a la derecha;
  - los errores con `role="alert"`;
  - sin `ControlSegmentado`, `via`, `aplicada` ni reaplicado.

  Recibe el contenido del resumen como `children` o slot. Se verifica con `tsc` sin errores.
- [x] 1.2 Crear `ResumenDeConvocatoria.tsx` (D3): una `dl` desde `seleccion`, el dato faltante marcado, requisitos y lo que no se evalúa, el aviso de nivel supuesto, y "Iniciar entrevista" sin icono o bien "Completar en Personalizada". Se verifica con `tsc` sin errores.
- [x] 1.3 Crear `ModalDeInicio.tsx` (D5) sobre `ModalDeConfirmacion`, con el resumen, "Basada en tu convocatoria", tres indicaciones, Cancelar/Comenzar, `cargando` y el error dentro. Quitar de `ResumenDeEntrevista` el icono y la prop `error` (D6). Se verifica con `tsc` sin errores.

## 2. Página

- [x] 2.1 En `SeleccionPuestoPage.tsx` (D1, D4, D5):
  - el contenido del `tabpanel` cambia según la pestaña, con `PanelDeConvocatoria` siempre montado;
  - `completarEnPersonalizada()` conserva la convocatoria y enfoca el primer campo vacío;
  - "Iniciar entrevista" de ambas pestañas abre `ModalDeInicio`, y Comenzar llama a `iniciar` con el error en el modal.

  Verificar que `grep -rnE "Volver a aplicar|aplicada=|Perfil aplicado" frontend/src` no da resultados. Se verifica con `tsc`, `pnpm test` (incluida la guarda de estilos), `pnpm run lint` (sin avisos nuevos) y `pnpm run build`, todos en verde.

## 3. Documentación y prueba manual

- [x] 3.1 Actualizar en `CLAUDE.md` los párrafos del formulario y de la convocatoria: los 3 pasos, la exclusión texto/archivo, "Completar en Personalizada" frente a cambiar de pestaña, y el modal de inicio. Se verifica con `grep` de "Volver a aplicar", que no debe dar resultados.
- [ ] 3.2 Prueba manual que cubra:
  - escribir bloquea el archivo y viceversa;
  - el ejemplo Full Stack muestra el resumen completo e "Iniciar entrevista";
  - un aviso sin tecnología lleva a "Completar en Personalizada" con el foco en Tecnología y "Desde convocatoria" conservado;
  - el modal se abre en las dos pestañas, Cancelar no inicia nada y Comenzar inicia la entrevista;
  - un error dentro del modal;
  - solo teclado;
  - 375 px.

  Si no se puede ejecutar, queda **sin marcar**.
