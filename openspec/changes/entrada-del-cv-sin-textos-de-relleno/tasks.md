## 1. Textos

- [x] 1.1 En `EntradaDelAnalisis.tsx`, cambiar la nota del candado a «No guardamos tu archivo ni enviamos tus datos de contacto a la IA.» y ajustar su comentario, que sigue citando `revision.py` y `anonimizar.py`. Verificar con tsc.
- [x] 1.2 En `CampoConvocatoria.tsx`:
  - borrar el `<p id="convocatoria-instruccion">` y su comentario;
  - quitar `aria-describedby="convocatoria-instruccion"`;
  - poner el placeholder «Pega aquí el aviso completo, con sus títulos de requisitos y deseables.».

  Verificar con tsc y lint.

## 2. Specs, documentación y verificación

- [x] 2.1 En la delta de `cv-critica-p1`, el requisito «Privacidad y límites visibles al subir el CV» pasa a pedir una sola frase: el archivo no se guarda y los datos de contacto no van a la IA. Verificar con `openspec validate cv-critica-p1`.
- [x] 2.2 En `CLAUDE.md`, actualizar la descripción de la nota de privacidad en el párrafo de `EntradaDelAnalisis`. Verificar con un `grep`.
- [x] 2.3 Verificación completa:
  - `pnpm exec tsc --noEmit`;
  - `pnpm test`;
  - `pnpm run lint`, que debe quedar en 5 advertencias;
  - `pnpm run build`;
  - `grep` sin resultados de `convocatoria-instruccion`, «conserva esos títulos» ni «solo secciones de tu CV» en `frontend/src`;
  - `openspec validate entrada-del-cv-sin-textos-de-relleno`.

## 3. Cierre (lo hace el usuario)

- [ ] 3.1 Prueba manual:
  - «Tu CV» muestra una sola línea con el candado;
  - en «Análisis dirigido» → «Pegar texto», el cuadro vacío muestra el placeholder nuevo y no hay párrafo debajo.
- [ ] 3.2 No hacer commit. El usuario lo hará tras revisar.
