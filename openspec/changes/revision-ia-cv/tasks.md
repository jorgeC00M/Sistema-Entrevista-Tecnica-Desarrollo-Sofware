## 0. Requisito previo

- [x] 0.1 Confirmar que `reglas-ats-ampliadas` está aplicado (existen
  `secciones.encabezado()`, `DocumentoExtraido.texto_en_encabezado` y
  `Brecha.experiencia`). Verificar con `python manage.py test tests.integration`.

## 1. Datos personales (sin Django)

- [x] 1.1 En `ats.py`, exponer como públicos `CORREO`, `URL`,
  `detectar_telefono` y `detectar_nombre` y actualizar sus usos internos.
  Verificar que `test_ats.py` sigue verde.
- [x] 1.2 Crear `integrations/documentos/anonimizar.py::enmascarar()`. Tests:
  correo, teléfono, URL y nombre sustituidos; "Python 3.11", "40%" y fechas
  sobreviven.

## 2. Contrato de IA (sin Django)

- [x] 2.1 Crear `integrations/ia/prompts/revisor_cv.py` con `EntradaDeRevision`,
  `RevisionDeCV`, `sistema()`, `usuario()` y `ESQUEMA_REVISION`. Test: el prompt
  de usuario contiene las viñetas y requisitos enviados y nada más.
- [x] 2.2 Implementar `parsear_revision()` con los cinco descartes y los topes.
  Tests: uno por descarte, uno por tope, y `RespuestaIAInvalida` si falta la
  estructura.
- [x] 2.3 `RevisorDeCV` en `base.py`; implementación en `ProveedorIAporJSON`;
  `revisar_cv` determinista y anclado en `FakeProveedorIA`;
  `factory.get_revisor_de_cv()`. Tests: `ProveedorIAporJSON` con `_pedir_json`
  falso devuelve la revisión; `test_privacidad.py` y `test_errores.py` siguen
  verdes sin tocarse.

## 3. Orquestación (app)

- [x] 3.1 `AnalisisATS.revision_ia` y migración `0007_analisisats_revision_ia`.
  Verificar `migrate` y `makemigrations --check`.
- [x] 3.2 Crear `apps/curriculums/revision.py` con `preparar_entrada()` (devuelve
  `None` con motivo sin capa de texto o sin secciones) y `revisar()`.
- [x] 3.3 En `services.analizar()`: llamada después de la transacción,
  captura de la taxonomía → `no_disponible`, reintento en caché cuando
  `revision_ia` es `null` o `no_disponible`. Serializer expone `revision_ia`.
  Tests: proveedor que falla → 201 con diagnóstico y `no_disponible`; caché `ok`
  no llama; caché `no_disponible` sí llama.
- [x] 3.4 Reescribir `tests/test_frontera_con_ia.py`: estático (solo
  `revision.py`), espía (sin nombre, correo, teléfono ni encabezado del
  fixture), omisión (títulos creativos y CV escaneado → cero llamadas). Inyectar
  a mano una violación de cada tipo y comprobar que el test falla; luego quitarla.

## 4. Frontend

- [x] 4.1 `types/curriculum.ts`: `RevisionIA` y subtipos. Verificar con
  `pnpm exec tsc --noEmit`.
- [x] 4.2 Crear `SugerenciaIA.tsx` y `AvisoDeRevision.tsx`.
- [ ] 4.3 `VinetasDeLogro.tsx` y `BrechaDeRequisitos.tsx`: sugerencia opcional
  bajo cada fila. Verificar en el navegador que sin revisión se ven igual que
  antes.
- [x] 4.4 Crear `PreguntasProbables.tsx` (preguntas con motivo y enlace
  `/nueva-entrevista?puesto=`) y `RevisionDeRedaccion.tsx`.
- [x] 4.5 `CurriculumPage.tsx`: montar las secciones; eliminar el bloque fijo
  "Practicar la entrevista", dejando el enlace sin puesto como respaldo dentro de
  `PreguntasProbables`.
- [ ] 4.6 `SeleccionPuestoPage.tsx`: `?puesto=` como valor inicial; validar con
  `puestoElegido`. Verificar en el navegador un código válido y uno inválido.
- [x] 4.7 `pnpm run lint` (sin subir de 6 advertencias) y `pnpm run build`.

## 5. Cierre

- [x] 5.1 `python manage.py test` completo; solo cambian a propósito los tests
  de frontera.
- [ ] 5.2 Prueba manual con `IA_PROVEEDOR=fake` y luego `gemini`: secciones
  rotuladas; "Practicar esta entrevista" abre con el puesto elegido; con la red
  cortada, análisis completo y aviso "no disponible".
- [x] 5.3 Actualizar `CLAUDE.md`: la medición no usa IA; la IA solo sugiere, con
  minimización, enmascarado, parser anclado y frontera verificada con espía.
