## 1. Lógica

- [x] 1.1 En `hallazgos.ts`:
  - agregar `regla` a cada nivel de `VEREDICTOS`;
  - agregar `correccionesPrioritarias(debilidades)` (las 3 primeras de `debilidadesPorGravedad`);
  - quitar `causa` de `veredictoDeLegibilidad`, que pasa a devolver solo el nivel (`NivelDeLegibilidad`); la interfaz `Veredicto` queda sin uso y se borra.

  En `hallazgos.test.ts`:
  - ajustar los tests del veredicto;
  - probar `correccionesPrioritarias` (orden por gravedad y corte en 3);
  - comprobar que cada nivel tiene `regla`.

  Verificar con `pnpm test`.
- [x] 1.2 En `LoQueDebesHacer.tsx`, usar `correccionesPrioritarias` y borrar la constante local `PRIMERAS`. El texto «y n correcciones más» se calcula igual. Verificar con tsc.

## 2. Banner

- [x] 2.1 Reescribir `VeredictoDeLegibilidad.tsx` como una `Tarjeta` con una grilla `sm:grid-cols-[auto_1fr]`:
  - **izquierda:** la dona `conic-gradient` sobre `var(--color-exito-texto)` / `var(--color-error-texto)`, con el centro «N / datos revisados» con la dona y la leyenda `aria-hidden` y una frase `sr-only` con el total y las cantidades (un `role="img"` sobre un `div` lo marca el lint); debajo, la leyenda «■ n extraídos / ■ m no extraídos»;
  - **derecha:** el chip de la etiqueta (`VEREDICTOS[nivel].clases`), el título, la regla y el bloque «Formato», una lista de `correccionesPrioritarias` con el icono de su severidad y su `titulo`, o «No hay errores que le impidan leer tu CV.».

  Actualizar el docstring y verificar con tsc, lint y `estilos.test.ts`.

## 3. Specs, documentación y verificación

- [x] 3.1 En la delta de `diferenciar-revision-y-comparacion-de-cv`, el requisito del veredicto (en palabras, con su causa principal) pasa a remitir a este cambio para su forma. Se mantiene: palabras, nunca un número, y la misma regla. Verificar con `openspec validate`.
- [x] 3.2 En `CLAUDE.md`, describir el banner del veredicto (dona de dos estados, total en el centro, regla, bloque «Formato» compartido con «Lo que debes hacer» vía `correccionesPrioritarias`, sin `causa`) y agregar este cambio a la lista de reaperturas. Verificar con un `grep` de «Lo principal».
- [x] 3.3 Verificación completa:
  - `pnpm exec tsc --noEmit`;
  - `pnpm test`;
  - `pnpm run lint`, que debe quedar en 5 advertencias;
  - `pnpm run build`;
  - `openspec validate veredicto-con-dona`.

## 4. Cierre (lo hace el usuario)

- [ ] 4.1 Pruebas manuales:
  - **un CV con pérdidas:** la dona muestra la proporción con «8 datos revisados» en el centro y la leyenda tiene las cantidades; la regla y los errores de «Formato» coinciden con «Lo que debes hacer»;
  - **un CV completo:** la dona está toda verde y «Formato» dice que no hay errores;
  - **en el celular:** los dos paneles se apilan;
  - **con un lector de pantalla:** se oye el total y las cantidades.
- [ ] 4.2 No hacer commit. El usuario lo hará tras revisar.
