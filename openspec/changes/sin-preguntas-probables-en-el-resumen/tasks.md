## 1. Pantalla

- [x] 1.1 Renombrar `PreguntasProbables.tsx` a `PracticarLaEntrevista.tsx`:
  - quitar el `<details>` de las preguntas, la variable `preguntas` y los imports que queden sin uso (`EtiquetaMono`, `Icono`);
  - actualizar el docstring: las preguntas siguen llegando de la IA, pero no se muestran;
  - en `ResumenDelAnalisis.tsx`, ajustar el import y el uso.

  Verificar con tsc y con un `grep` de `PreguntasProbables` y de «Preguntas que podrían hacerte» en `frontend/src`.
- [x] 1.2 En `AvisoDeRevision.tsx`, quitar `revision.preguntas.length` de la suma `vacia`, con un comentario breve. Verificar con tsc y lint.

## 2. Specs, documentación y verificación

- [x] 2.1 En la delta de `correcciones-accionables-y-menos-pestanas`, el requisito «La práctica de la entrevista cierra el Resumen» pasa a remitir a este cambio, sin el desplegable. Verificar con `openspec validate`.
- [x] 2.2 En `CLAUDE.md`:
  - el cierre del Resumen es `PracticarLaEntrevista`, sin preguntas;
  - la IA sigue proponiendo preguntas que el frontend no muestra; quitarlas del prompt es un cambio aparte;
  - la lista de reaperturas.
- [x] 2.3 Verificación completa:
  - `pnpm exec tsc --noEmit`;
  - `pnpm test`;
  - `pnpm run lint`, que debe quedar en 5 advertencias;
  - `pnpm run build`;
  - `openspec validate sin-preguntas-probables-en-el-resumen`.

## 3. Cierre (lo hace el usuario)

- [ ] 3.1 Prueba manual: el Resumen termina con «Practicar la entrevista», sin «Preguntas que podrían hacerte»; el botón lleva al puesto sugerido.
- [ ] 3.2 No hacer commit. El usuario lo hará tras revisar.
