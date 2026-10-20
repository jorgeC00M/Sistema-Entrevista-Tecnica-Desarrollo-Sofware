## 1. Capa de IA (sin Django)

- [x] 1.1 `integrations/ia/prompts/analista_convocatoria.py`: `EntradaDeConvocatoria`, `PerfilDetectado`, `sistema()`, `usuario()`, `ESQUEMA_PERFIL` y `parsear_perfil()` con el anclaje de design.md D1. Verificar con tests sin red en `tests/integration/test_analista_convocatoria.py`:
  - puesto fuera de opciones → `no_identificado`;
  - tecnología de otro puesto → `None`;
  - nivel inválido → Junior con `nivel_supuesto`;
  - requisito inventado descartado;
  - recorte a 8 y deduplicación.
- [x] 1.2 `Protocol AnalizadorDeConvocatoria` en `base.py`, su implementación en `ProveedorIAporJSON`, en `FakeProveedorIA` (reglas deterministas, D2) y en `ProveedorEnCadena`. Verificar con tests: el falso detecta Backend/Python/Junior en el ejemplo del prototipo, y la cadena pasa al siguiente ante un error.
- [x] 1.3 `ContextoDeEntrevista.requisitos` y la línea y regla de requisitos en `entrevistador.py` (sistema y calentamiento), sin tocar `evaluador.py`. Verificar en `test_prompts.py` que los requisitos aparecen en el entrevistador, no en el evaluador, y que sin requisitos no hay línea.

## 2. Backend

- [x] 2.1 Mover `_validar_archivo` a `apps/common/archivos.py` y usarlo desde `curriculums`. Verificar con `python manage.py test apps.curriculums` en verde.
- [x] 2.2 Modelo `Convocatoria`, la FK nullable `Entrevista.convocatoria` y la migración. Verificar con `makemigrations --check` tras generarla y que la migración se aplica y se revierte en la base local, con un respaldo previo.
- [x] 2.3 El servicio `analizar_convocatoria` (enmascarar, `partir()`, caché por hash, IA fuera de la transacción, `get_or_create`). Verificar con tests:
  - el contacto enmascarado en lo guardado y en lo enviado (proveedor espía);
  - un segundo análisis igual no llama a la IA;
  - `no_identificado` también se guarda.
- [x] 2.4 El endpoint `POST /api/entrevistas/convocatoria/`, el throttle `analizar-convocatoria` y el manejo de 422 y 400. Verificar con tests: 201 con texto, 201 con un DOCX de prueba, 400 escaneado, 400 ambos, 400 corto, 422 aviso no técnico y 401 sin sesión.
- [x] 2.5 `convocatoria` opcional al iniciar (pertenencia → 404), `_contexto` con los requisitos y `desde_convocatoria` en el serializer. Verificar con tests: los requisitos llegan al prompt del entrevistador (espía), la convocatoria ajena da 404 y la entrevista sin convocatoria queda igual que hoy.

## 3. Frontend

- [x] 3.1 Tipos (`PerfilDetectado`, `ConvocatoriaAnalizada`), `analizarConvocatoria()` (texto o `FormData`), `convocatoria?` en `DatosIniciarEntrevista` y `desde_convocatoria` en `Entrevista`. Verificar con `tsc`.
- [x] 3.2 `ConvocatoriaModal.tsx` sobre `Modal`: pestañas, contador, ejemplos, "Analizar", la vista de resultado y los estados de error y carga (D6). Verificar con `tsc` y lint.
- [x] 3.3 `SeleccionPuestoPage`:
  - habilitar el enlace;
  - "Usar este perfil" rellena la selección y enfoca el siguiente paso;
  - la etiqueta "Desde convocatoria" en `BarraDeResumen`;
  - enviar `convocatoria` al comenzar.

  En `EntrevistaPage`, mostrar "Basada en tu convocatoria". Verificar con `tsc`, `pnpm run lint` (≤ 5), `pnpm run build` y `pnpm test`.

## 4. Verificación y documentación

- [x] 4.1 `python manage.py test` completo en verde.
- [ ] 4.2 Recorrido en el navegador con `IA_PROVEEDOR=fake` (y luego con el proveedor real):
  - pegar el ejemplo "Backend Python" → perfil Backend/Python/Junior → "Usar este perfil" → comenzar → la entrevista muestra "Basada en tu convocatoria";
  - subir un PDF escaneado → mensaje de pegar el texto;
  - pegar un aviso de contador → no identificado.
- [x] 4.3 `CLAUDE.md`: el flujo de la convocatoria, el anclaje, la caché, la privacidad (enmascarado; cualquier proveedor), y que el evaluador no recibe los requisitos. Verificar releyendo el apartado.
