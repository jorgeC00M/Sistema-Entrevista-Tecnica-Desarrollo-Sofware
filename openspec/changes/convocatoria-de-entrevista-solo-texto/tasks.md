## 1. Backend

- [x] 1.1 Dejar `AnalizarConvocatoriaSerializer` (`apps/entrevistas/serializers.py`) solo con `texto`:
  - quitar `archivo`, `validate_archivo`, la rama de las dos vías y los imports que queden sin uso;
  - actualizar el docstring.
- [x] 1.2 En `apps/common/archivos.py`:
  - eliminar `texto_de_convocatoria` y el import de `extraer`;
  - actualizar el docstring del módulo.
- [x] 1.3 En `test_convocatoria.py`:
  - eliminar los tres tests de archivo y los helpers sin uso;
  - agregar uno donde un archivo sin texto responde 400 sin llamar a la IA.

## 2. Frontend

- [x] 2.1 En `api/entrevistas.ts`, dejar `analizarConvocatoria(texto: string)` enviando solo JSON y actualizar el docstring.
- [x] 2.2 En `PanelDeConvocatoria.tsx`:
  - quitar `via`, `archivo`, `EleccionDeVia` y `ZonaDeArchivo`;
  - `listo` por largo;
  - el aviso de IA con «Tu texto sigue aquí.»;
  - actualizar el docstring;
  - la grilla y el marcador no cambian.
- [x] 2.3 Eliminar `EleccionDeVia.tsx` y ajustar el comentario de `Pestanas.tsx`.

## 3. Documentación y verificación

- [x] 3.1 `CLAUDE.md`:
  - la pestaña «Con convocatoria» (sin `EleccionDeVia`, solo `Textarea`);
  - «An interview can start from a job posting» (sin PDF/DOCX);
  - «Authenticated shell»;
  - la nota de `comparar-con-oferta-en-dos-pasos` sobre «Simular entrevista»;
  - `apps/common/archivos.py`.
- [x] 3.2 Anotar en la delta de `comparar-con-oferta-en-dos-pasos` que «Simular entrevista» también quedó solo con texto.
- [x] 3.3 Buscar con `grep` que no queden `EleccionDeVia`, `texto_de_convocatoria` ni `'archivo' in entrada`.
- [x] 3.4 Backend: `python manage.py test apps.entrevistas apps.curriculums` y luego la suite completa.
- [x] 3.5 Frontend: `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm run lint` y `pnpm run build`.
- [x] 3.6 `openspec validate convocatoria-de-entrevista-solo-texto --strict`.

## 4. Cierre (lo hace Jorge)

- [ ] 4.1 Pruebas manuales:
  - «Con convocatoria» a 1366 px (campo a la izquierda, marcador a la derecha) y a 360 px;
  - un texto corto no habilita;
  - analizar y luego «Iniciar entrevista» o «Completar en Personalizada»;
  - una falla de la IA muestra «Tu texto sigue aquí.».
- [ ] 4.2 Tesis: si menciona subir la convocatoria como archivo, cambiarlo a «pegar el texto».
- [ ] 4.3 No hacer commit; lo hace Jorge.
