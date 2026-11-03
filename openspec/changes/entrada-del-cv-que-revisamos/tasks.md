## 1. Lógica

- [x] 1.1 En `hallazgos.ts`:
  - reemplazar `faltaParaAnalizar` por `puedeAnalizar(tipo, archivo, convocatoria, archivoConvocatoria): boolean`, con la misma regla;
  - agregar `CAMPOS_QUE_BUSCA_EL_ATS` (los 8 nombres), con un comentario que la ata a `CAMPOS_DE_LA_FICHA` de `ats.py`.

  En `hallazgos.test.ts`, pasar los casos a `puedeAnalizar` y fijar los 8 campos en orden. Verificar con `pnpm test`.

## 2. Entrada

- [x] 2.1 En `EntradaDelAnalisis.tsx`:
  - quitar el `<p>` del candado y su comentario, y el import de `Icono` si queda sin uso;
  - la línea `aria-live` muestra solo «Leyendo tu CV y aplicando las reglas del ATS…» mientras se analiza, y sigue montada;
  - `disabled={!puedeAnalizar(...)}`;
  - actualizar el docstring.

  Verificar con tsc.
- [x] 2.2 En la grilla, solo con `tipo === 'general'`, agregar la `Tarjeta` «Qué revisamos», con un `h2` del mismo estilo que «Tu CV» y una lista de 3 puntos:
  - los 8 datos, con `CAMPOS_QUE_BUSCA_EL_ATS`;
  - el formato: columnas, tablas, imágenes, encabezados y pies;
  - las viñetas: logros o solo tareas.

  Verificar con tsc, lint y `estilos.test.ts`.
- [x] 2.3 Pedido del usuario al aplicar: quitar la etiqueta «N análisis» junto a «Historial de análisis» en `HistorialDeAnalisis.tsx`. Verificar con tsc y lint.
- [x] 2.4 Pedido del usuario: quitar la pregunta al inicio de cada panel («¿El ATS lee mi CV?» / «¿Encajo en el aviso?») y `preguntaDelTipo`, que queda sin uso, con su test. Ajustar las deltas de `tipo-de-analisis-en-pestanas` y `tipo-de-analisis-en-combo`. Verificar con tsc, tests, lint, build y `openspec validate`.

## 3. Specs, documentación y verificación

- [x] 3.1 Hacer que remitan a este cambio:
  - `entrada-del-cv-sin-textos-de-relleno`: la nota en una línea;
  - `cv-critica-p1`: la privacidad visible, conservando el límite de 2 MB;
  - `tipo-de-analisis-e-historial-en-tabla`, `tipo-de-analisis-en-combo` y `tipo-de-analisis-en-pestanas`: la línea de lo que falta y «sin otra tarjeta a la derecha» en general.

  Verificar con `openspec validate` de cada uno.
- [x] 3.2 En `CLAUDE.md`, párrafo de la entrada del CV:
  - sin nota de privacidad;
  - sin línea de lo que falta (`puedeAnalizar`);
  - el panel «Qué revisamos» en general, con la constante atada a `CAMPOS_DE_LA_FICHA`.

  Verificar con un `grep`.
- [x] 3.3 Verificación completa:
  - `pnpm exec tsc --noEmit`;
  - `pnpm test`;
  - `pnpm run lint`, que debe quedar en 5 advertencias;
  - `pnpm run build`;
  - `grep` sin resultados de «No guardamos tu archivo», «Sube tu CV.», «Pega o sube la convocatoria.» ni `faltaParaAnalizar` en `frontend/src`;
  - `openspec validate entrada-del-cv-que-revisamos`.

## 4. Cierre (lo hace el usuario)

- [ ] 4.1 Pruebas manuales:
  - en «general», «Qué revisamos» queda a la derecha y a la misma altura que el CV;
  - en «dirigido» aparece la convocatoria en su lugar;
  - no se ven ni la nota ni los avisos;
  - el botón se activa al tener lo necesario y, al analizar, se anuncia «Leyendo tu CV…».
- [ ] 4.2 No hacer commit. El usuario lo hará tras revisar.
