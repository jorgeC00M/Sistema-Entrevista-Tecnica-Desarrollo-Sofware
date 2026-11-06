## 1. Backend: la convocatoria solo como texto

- [x] 1.1 En `apps/curriculums/serializers.py`, quitar de `SubirCurriculumSerializer`:
  - `archivo_convocatoria`;
  - `validate_archivo_convocatoria`;
  - la rama de `validate` (borrarla si queda vacía);
  - el import de `texto_de_convocatoria` si queda sin uso.
  - Actualizar el docstring.
- [x] 1.2 En `test_curriculums.py`:
  - eliminar los tres tests de la vía por archivo;
  - agregar uno que verifique que un `archivo_convocatoria` enviado sin texto se ignora y da un análisis general (`con_convocatoria` falso, sin `brecha`).

## 2. Frontend: datos y lógica

- [x] 2.1 En `api/curriculums.ts`, quitar `archivoConvocatoria`, su `append` y la traducción `archivo_convocatoria`.
- [x] 2.2 En `hallazgos.ts`, dejar `puedeAnalizar(tipo, archivo, convocatoria)` y actualizar `hallazgos.test.ts`.
- [x] 2.3 En `CurriculumPage.tsx`, quitar el estado `archivoConvocatoria`, su envío, su prop y la limpieza de su error.

## 3. Frontend: la pantalla

- [x] 3.1 En `CampoConvocatoria.tsx`, dejar solo el textarea, el contador y el error. Quitar `via`, `ControlSegmentado`, `ZonaDeArchivo`, `archivo` y `onArchivo`, y actualizar el docstring.
- [x] 3.2 En `EntradaDelAnalisis.tsx`:
  - en el dirigido, `lg:grid-cols-2` con «Paso 1 · Sube tu CV» y «Paso 2 · Pega la convocatoria», a través de `EncabezadoDePaso`, con el check `fortaleza` y «Listo» como texto;
  - el general sigue con `2fr 1fr` y sin pasos;
  - quitar las props de archivo de la convocatoria;
  - actualizar el docstring.
- [x] 3.3 Eliminar `components/ui/ControlSegmentado.tsx` y ajustar el comentario de `Pestanas.tsx` que lo nombra.

## 4. Documentación y verificación

- [x] 4.1 Actualizar `CLAUDE.md`:
  - la entrada del CV: el dirigido en 1:1 con pasos y la convocatoria solo pegada;
  - «Two routes» y la tabla, si mencionan el archivo;
  - las menciones a `ControlSegmentado`.
- [x] 4.2 Buscar con `grep` en `frontend/src` y `backend/apps/curriculums` que no queden `archivoConvocatoria`, `archivo_convocatoria` ni `ControlSegmentado`.
- [x] 4.3 Backend: `python manage.py test apps.curriculums` y luego la suite completa.
- [x] 4.4 Frontend: `pnpm exec tsc --noEmit`, `pnpm test` (con `estilos.test.ts`), `pnpm run lint` y `pnpm run build`.
- [x] 4.5 `openspec validate comparar-con-oferta-en-dos-pasos --strict`.

## 5. Cierre (lo hace Jorge)

- [ ] 5.1 Pruebas manuales:
  - «Comparar con oferta» a 1366 px (dos paneles iguales) y a 1024 px;
  - la misma pantalla a 360 px (apilado: Paso 1, Paso 2, botón);
  - «Listo» aparece y desaparece en cada paso;
  - «Analizar CV» sigue con 2/3 – 1/3 y sin pasos;
  - «Compara con una convocatoria» desde un resultado general lleva el foco al Paso 2.
- [ ] 5.2 Tesis: si menciona subir la convocatoria al módulo de CV, cambiarlo a «pegar el texto».
- [ ] 5.3 No hacer commit; lo hace Jorge.
