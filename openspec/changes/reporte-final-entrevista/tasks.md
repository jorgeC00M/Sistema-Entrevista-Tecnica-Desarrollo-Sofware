## 1. Puntos clave en el contrato del evaluador (requiere `formula-de-puntuacion` aplicado)

- [x] 1.1 En `integrations/ia/prompts/schemas.py`, añadir `puntos_clave: tuple[str, ...]` a `Evaluacion` y validarlos en `parsear_evaluacion()`: entre 2 y 4 no vacíos, recortando a 4. Verificar en `tests/integration/test_validacion.py`: 6 puntos → 4; 1 punto → `RespuestaIAInvalida`; un punto vacío → `RespuestaIAInvalida`.
- [x] 1.2 En `integrations/ia/prompts/evaluador.py`, añadir `puntos_clave[]` al esquema y pedir que describan lo esperado para el nivel sin repetir la respuesta del candidato. Verificar en `test_prompts.py` que el esquema los exige y que `sistema()` sigue sin recibir historial.
- [x] 1.3 Hacer que `FakeProveedorIA.evaluar_respuesta` devuelva, además de los niveles 3/3/3, 3 puntos clave fijos. Verificar con `python manage.py test tests.integration` en verde.

## 2. Persistencia y API

- [x] 2.1 `apps/evaluaciones/services.py::guardar()`: escribir también `puntos_clave` (lista) dentro de `evaluacion_json`, sin columnas nuevas. Verificar con un test en `apps/evaluaciones/tests/test_evaluaciones.py` que el JSON guardado los contiene y que `makemigrations --check` no detecta cambios.
- [x] 2.2 `apps/evaluaciones/serializers.py::EvaluacionSerializer`: exponer `puntos_clave` (lista, vacía si falta), leídos de `evaluacion_json` de forma tolerante. Verificar con un test que una evaluación con `evaluacion_json` sin esas claves serializa `puntos_clave: []`.
- [x] 2.3 `apps/entrevistas/selectors.py`: añadir `anterior_comparable(entrevista)` (mismo usuario, puesto y nivel, `FINALIZADA`, `fecha_fin < fecha_inicio` de la actual, la más reciente) y `resumen_de(entrevista, intercambios)` (banda, promedio, nivel medio por criterio, sobre 4, solo en las evaluaciones con niveles, criterio más débil, prioridad con desempate por menor número, comparación o `null`). Verificar con un nuevo `apps/entrevistas/tests/test_resumen.py` que cubra:
  - empate en la prioridad;
  - primera entrevista sin comparación;
  - otro nivel sin comparación;
  - diferencia +8;
  - evaluaciones antiguas, con `criterios` en `null`.
- [x] 2.4 `ResultadosView`: añadir la clave `resumen` (`null` si `EN_PROGRESO`). Verificar con tests en `test_privacidad.py` (en progreso → `resumen` nulo) y `test_entrevistas.py` (finalizada → resumen presente). Verificar además, con un proveedor espía, que consultar resultados no hace ninguna llamada a la IA.
- [x] 2.5 Corregir los tests existentes que construyen evaluaciones a mano (`test_modelos`, `test_idempotencia`, `test_contrato_ia`, etc.) y ejecutar `python manage.py test` completo en verde contra PostgreSQL.

## 3. Frontend

- [x] 3.1 `src/types/entrevista.ts`: tipo `ResumenEntrevista`; `Evaluacion.puntos_clave: string[]`; respuesta de resultados con `resumen: ResumenEntrevista | null`. Verificar con `pnpm exec tsc --noEmit`.
- [x] 3.2 Crear `features/resultados/components/ResumenFinal.tsx` y eliminar `TarjetaResumen.tsx`.
  - Contenido:
    - banda con `ChipPuntaje` y promedio en tamaño de cuerpo;
    - tres barras finas por criterio con su nivel medio sobre 4, en mono;
    - la prioridad (área + sugerencia);
    - la comparación, solo si existe.
  - Si `resumen.criterios` es nulo, ocultar las barras.
  - Verificar que no queda ningún import de `TarjetaResumen` y que `tsc` pasa.
- [x] 3.3 `PanelCualitativo.tsx`: añadir la lista "Una respuesta completa cubría", oculta si la evaluación es antigua. Verificar con `tsc` y viendo una entrevista antigua y una nueva en el navegador.
- [x] 3.4 Acción "Practicar de nuevo este puesto" en `ResultadosPage` hacia `/nueva-entrevista?puesto=…&nivel=…`, y lectura de `nivel` en `SeleccionPuestoPage` igual que `puesto`. Verificar en el navegador que llega preseleccionado y que no empieza solo.

## 4. Verificación y documentación

- [x] 4.1 `pnpm exec tsc --noEmit`, `pnpm run lint` (sin subir de 5 avisos) y `pnpm run build` en verde.
- [ ] 4.2 Recorrido con `IA_PROVEEDOR=fake`: iniciar, responder 5 y abrir el reporte. Se ve la banda, los niveles medios 3/3/3, la prioridad, los puntos clave y, en una segunda entrevista del mismo puesto y nivel, la comparación. Revisar también a 390 px de ancho (pendiente del usuario en el navegador).
- [x] 4.3 Actualizar `CLAUDE.md`:
  - en "Entrevistador and evaluador…": puntos clave;
  - en "The grade is not published…": `resumen` sigue la misma regla.

  Verificar releyendo que ambos apartados describen el comportamiento nuevo.
