## 1. Backend: correcciones con acción

- [x] 1.1 `integrations/documentos/ats.py`:
  - agregar `Hallazgo.accion: str = ""`;
  - redactar la acción de cada debilidad según la tabla de D4, con las variantes dinámicas;
  - darle acción también a `IDIOMA_DISTINTO` y a `sin_capa_de_texto`.
- [x] 1.2 Reescribir cada `detalle` de debilidad según la regla de D4:
  - qué pasa en el ATS y qué hacer;
  - sin «parser»;
  - con los matices de `MOTIVOS_DE_INVISIBILIDAD`;
  - conservando los datos que citan los tests.
- [x] 1.3 Subir `VERSION_DE_REGLAS` a 6.
- [x] 1.4 En `apps/curriculums/serializers.py::HallazgoSerializer`, agregar `accion = CharField(default="")`.
- [x] 1.5 Tests:
  - en `tests/integration/test_ats.py`, cada debilidad de documentos construidos que cubren todos los códigos tiene `accion`, y ninguna fortaleza la tiene;
  - ajustar los `assertIn` que citan textos cambiados;
  - en `apps/curriculums/tests`, un análisis guardado sin `accion` se serializa con `accion: ""`.

## 2. Backend: eliminar el endpoint del texto

- [x] 2.1 Borrar:
  - `CurriculumTextoView` (`views.py`);
  - la ruta `<int:pk>/texto/` y su import (`urls.py`);
  - `lineas_del_texto` y el import de `titulo_de` (`selectors.py`).
- [x] 2.2 Borrar `TextoDelATSTest` y `test_pedir_el_texto_del_curriculum_de_otro_devuelve_404` (`apps/curriculums/tests/test_curriculums.py`).
- [x] 2.3 `python manage.py test`, completo en verde.

## 3. Frontend: correcciones con acción

- [x] 3.1 En `types/curriculum.ts`, agregar `Hallazgo.accion?: string`.
- [x] 3.2 En `hallazgos.ts`, agregar `accionDe(h)`, con su test en `hallazgos.test.ts`.
- [x] 3.3 `ListaDeHallazgos.tsx`, en cada corrección:
  - la acción como título, con el chip de efecto;
  - «Encontramos: …», solo si hay `accion`;
  - el detalle.
- [x] 3.4 En `ResumenDelAnalisis.tsx`, «Lo primero que mejorar» muestra `accionDe(h)`.

## 4. Frontend: eliminar «Así ve tu CV el ATS»

- [x] 4.1 Borrar:
  - `components/TextoDelATS.tsx` y su uso en `ResumenDelAnalisis`;
  - `obtenerTextoDelCurriculum` (`api/curriculums.ts`);
  - `LineaDelTexto` (`types/curriculum.ts`).
- [x] 4.2 Borrar `MOTIVOS_DE_INVISIBILIDAD` y `loQueElAtsNoVe` de `hallazgos.ts`, con sus tests.

## 5. Frontend: dos pestañas, requisitos y práctica en el Resumen

- [x] 5.1 `ResultadoDelAnalisis.tsx`:
  - `Pestana = 'resumen' | 'mejorar'`;
  - borrar las ramas `requisitos` y `entrevista`;
  - `irA` solo hacia «Mejorar»;
  - borrar los imports y las variables muertas (`sugerenciasDeRequisitos`, `idDeRequisito`, …);
  - actualizar el docstring y los comentarios.
- [x] 5.2 `FrenteAlAviso.tsx` absorbe lo útil de `BrechaDeRequisitos`, en el orden de D6:
  - el aviso de `con_evidencia`;
  - la aclaración de `posible_subestimacion`;
  - las sugerencias de experiencia y cargo;
  - el plegable «Cómo cubrir lo que te falta»;
  - los extras.

  Además:
  - los chips pasan a solo lectura;
  - la prop `sugerencias` reemplaza a `onIrARequisito`.
- [x] 5.3 `ResumenDelAnalisis.tsx`:
  - arma `sugerencias` desde `revision_ia.requisitos` y las pasa a `FrenteAlAviso`;
  - se quita `onIrARequisito` de sus props.
- [x] 5.4 Mover la práctica al final del Resumen:
  - **`PreguntasProbables.tsx`:**
    - primero, el botón «Practicar la entrevista»;
    - debajo, el `<details>` cerrado «Preguntas que podrían hacerte (n)», con «Sugerencia de IA».
  - **`ResumenDelAnalisis`:**
    - lo usa como cierre;
    - borra su bloque de práctica propio y los imports que queden sin uso.
- [x] 5.5 Borrar:
  - `BrechaDeRequisitos.tsx` e `InventarioDeTerminos.tsx`;
  - `idDeRequisito`, con su test en `requisitos.test.ts`;
  - las constantes de `aspectos.ts` que queden sin uso.
- [x] 5.6 `grep` sin restos de:
  - `TextoDelATS`, `obtenerTextoDelCurriculum`, `LineaDelTexto`;
  - `MOTIVOS_DE_INVISIBILIDAD`, `loQueElAtsNoVe`;
  - `InventarioDeTerminos`, `BrechaDeRequisitos`;
  - `idDeRequisito`, `onIrARequisito`, `/texto/`.
- [x] 5.7 Chequeos del frontend:
  - `pnpm exec tsc --noEmit`;
  - `pnpm test`, incluido `estilos.test.ts`;
  - `pnpm run lint`, que debe quedar en 5 advertencias;
  - `pnpm run build`.

## 6. Documentación y specs

- [x] 6.1 `CLAUDE.md`, sección del CV.
  - **Agregar:**
    - las dos pestañas;
    - las correcciones con acción;
    - «Frente a este aviso» con el detalle y las sugerencias;
    - la práctica al cierre del Resumen;
    - `VERSION_DE_REGLAS` 6 y por qué.
  - **Quitar** las menciones a `TextoDelATS`, `texto/`, `MOTIVOS_DE_INVISIBILIDAD`, `idDeRequisito` y las pestañas eliminadas.
- [x] 6.2 En `openspec/changes/cv-cierre-final/pendientes.md`, el texto del CV junto a la ficha queda descartado por decisión del usuario.
- [x] 6.3 Delta spec de `diferenciar-revision-y-comparacion-de-cv` (D8):
  - quitar el requisito del texto del ATS;
  - el chip ya no abre la pestaña Requisitos.

  Correr `openspec validate` de los dos cambios.

## 7. Verificación manual y cierre

- [ ] 7.1 Pruebas manuales:
  - un CV a dos columnas muestra la acción, «Encontramos» y el porqué;
  - un análisis viejo del historial muestra el título de antes, sin «Encontramos»;
  - sin convocatoria, dos pestañas y el plegable de preguntas;
  - con convocatoria, «Frente a este aviso» con las sugerencias y los extras.
- [ ] 7.2 No hacer commit. El usuario lo hará tras revisar.
