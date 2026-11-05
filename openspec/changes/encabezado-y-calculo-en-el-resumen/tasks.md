## 1. Encabezado

- [x] 1.1 En `features/resultados/pages/ResultadosPage.tsx`:
  - quitar la `EtiquetaMono` de encima del título;
  - debajo del `h1`, un `<p>` `flex flex-wrap` con puesto · tecnología (solo si existe) · nivel · `Badge` del estado y duración, sin el número de sesión.

## 2. Fórmula compartida

- [x] 2.1 Crear `features/resultados/formula.ts` con `formulaGeneral(rubrica)` y `operacion(niveles, puntuacion, rubrica | null)`. La lógica de `operacion()` sale de `DesgloseDeNota.tsx`; sin catálogo usa `ORDEN_DE_CRITERIOS`, pesos 1 y `NIVEL_MAXIMO_POR_DEFECTO`.
- [x] 2.2 Crear `formula.test.ts`: pesos iguales («100 · (3 + 2 + 3) / 12 = 67»), pesos distintos, sin catálogo y la fórmula general.

## 3. Transcripción y Resumen

- [x] 3.1 En `PreguntaDeLaTranscripcion.tsx`:
  - quitar `DesgloseDeNota` y «Una respuesta completa cubría»;
  - con `niveles`, agregar la línea `text-meta` «Nombre n/4 · … → cuenta» antes de las tres cajas;
  - mantener el encabezado «Análisis IA» con el tiempo de respuesta.
- [x] 3.2 En `DesgloseDeLaEvaluacion.tsx`, agregar el `<details>` «¿Cómo se calcula?», que solo aparece con `rubrica`. Lleva la fórmula general, un `dl` por criterio con sus cinco descriptores y la nota de que la IA elige los niveles. Actualizar el docstring.
- [x] 3.3 Borrar `DesgloseDeNota.tsx` y comprobar con `grep` que no queden importaciones ni referencias.

## 4. Specs, documentación y verificación

- [x] 4.1 Hacer que remitan a este cambio:
  - en la delta de `reporte-de-entrevista-en-pestanas`, el requisito de la Transcripción (que ya no lleva «¿Cómo se calcula?» ni los puntos clave por pregunta);
  - en la delta de `formula-de-puntuacion`, «La fórmula se publica al candidato» y su escenario: la cuenta por pregunta va en una línea y los descriptores, en el Resumen.
- [x] 4.2 En `CLAUDE.md`:
  - el encabezado en una línea;
  - la transcripción con la línea de niveles;
  - «¿Cómo se calcula?» en el Desglose;
  - `formula.ts`;
  - y corregir las menciones a «¿Cómo se calcula?» por pregunta.
- [x] 4.3 Ejecutar `openspec validate` de este cambio, de `reporte-de-entrevista-en-pestanas` y de `formula-de-puntuacion`.
- [x] 4.4 Ejecutar `pnpm exec tsc --noEmit`, `pnpm test` (con `estilos.test.ts`), `pnpm run lint` (deben quedar 5 advertencias) y `pnpm run build`.

## 5. Cierre (lo hace el usuario)

- [ ] 5.1 Pruebas manuales a 1280, 800 y 375 px:
  - el encabezado;
  - una pregunta de la transcripción con niveles y una sin ellos;
  - el «¿Cómo se calcula?» del Resumen.
- [ ] 5.2 Actualizar la tabla del contenido del reporte en el perfil de tesis (líneas 1043-1044).
- [ ] 5.3 No hacer commit; lo hace el usuario.
