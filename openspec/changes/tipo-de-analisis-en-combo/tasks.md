## 1. Tipo siempre elegido

- [x] 1.1 En `hallazgos.ts`:
  - `faltaParaAnalizar` recibe `tipo: TipoDeAnalisis`;
  - se borra la rama «Elige un tipo de análisis.»;
  - se actualiza el docstring.

  En `hallazgos.test.ts`, quitar la aserción con `null`. Verificar con `pnpm test`.
- [x] 1.2 En `CurriculumPage.tsx`:
  - `useState<TipoDeAnalisis>('general')`, con el comentario actualizado;
  - se quita `tipo === null` de `analizar`.

  Verificar con `pnpm exec tsc --noEmit`.

## 2. Combo y disposición

- [x] 2.1 Reescribir `EleccionDeTipo.tsx` con `CampoSelect`:
  - `id="tipo-de-analisis"`, etiqueta «Tipo de análisis» y `marcador={null}`;
  - cada opción con el texto «nombre · pregunta»;
  - quitar el `fieldset`, los radios, los iconos y `useId`.

  Verificar con tsc y lint.
- [x] 2.2 En `EntradaDelAnalisis.tsx`:
  - la tarjeta del tipo con `lg:col-span-2`;
  - el CV en la columna 1 y la convocatoria en la columna 2 (solo en dirigido);
  - quitar `items-start`, las colocaciones `lg:col-start-*`, `lg:row-start-*` y `lg:row-span-*`, y su comentario;
  - reescribir el docstring;
  - `tipo` sin `null`.

  Verificar con tsc.

## 3. Código muerto

- [x] 3.1 Devolver `clasesDeOpcion` como constante local de `EleccionDeVia.tsx`, ajustar su docstring y borrar `components/ui/estilosDeOpcion.ts`. Verificar:
  - con `grep`, que no quedan `clasesDeOpcion`, `estilosDeOpcion`, «Elige un tipo» ni `TipoDeAnalisis | null` en `frontend/src`;
  - que los iconos `documento` y `buscar` siguen usándose en otros sitios.

## 4. Specs, documentación y verificación

- [x] 4.1 En la delta de `tipo-de-analisis-e-historial-en-tabla`, remitir a este cambio en estos puntos:
  - el requisito de elegir el tipo (sin «ninguna marcada» ni «n de 2»);
  - la lista del botón (sin «Elige un tipo de análisis»);
  - el requisito de orden;
  - el escenario «debajo de Tu CV».

  Verificar con `openspec validate tipo-de-analisis-e-historial-en-tabla`.
- [x] 4.2 En `CLAUDE.md`:
  - el párrafo de `EntradaDelAnalisis`: combo, «general» por defecto, CV a la izquierda y convocatoria a la derecha, DOM = orden visual;
  - la mención de `clasesDeOpcion` en la pantalla de selección;
  - la lista de reaperturas.

  Verificar con un `grep` de `estilosDeOpcion`.
- [x] 4.3 Verificación completa:
  - `pnpm exec tsc --noEmit`;
  - `pnpm test`;
  - `pnpm run lint`, que debe quedar en 5 advertencias;
  - `pnpm run build`;
  - `openspec validate tipo-de-analisis-en-combo`.
- [x] 4.4 Por pedido del usuario, quitar la ayuda bajo el combo y el `<details>` «¿Qué es un ATS?» (con `detalle` y `elegida`, que quedan sin uso), y alinear `cv-sin-titulo-repetido`, `intro-solo-en-la-entrada-del-cv` y `CLAUDE.md`. Verificar con tsc, tests, lint, build y `openspec validate` de los tres cambios.

## 5. Cierre (lo hace el usuario)

- [ ] 5.1 Pruebas manuales:
  - al entrar, el combo dice «Análisis general» y la línea dice «Sube tu CV»;
  - en «dirigido», la convocatoria aparece a la derecha con la misma altura y el CV no se mueve;
  - al volver a «general», el aviso se conserva pero no se envía;
  - en el celular, el orden es tipo → CV → convocatoria;
  - «Compara con una convocatoria» lleva el foco a la convocatoria;
  - «Con convocatoria» de «Nueva entrevista» se ve igual que antes.
- [ ] 5.2 No hacer commit. El usuario lo hará tras revisar.
