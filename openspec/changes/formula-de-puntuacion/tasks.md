## 1. Contrato del evaluador (capa de IA, sin Django)

- [x] 1.1 En `integrations/ia/prompts/schemas.py`:
  - añadir `Niveles(correccion, completitud, claridad)`, enteros de 0 a 4;
  - sustituir `Evaluacion.puntuacion` por `Evaluacion.niveles`;
  - reescribir `parsear_evaluacion()` para que valide cada nivel (entero, no bool, de 0 a 4, aceptando también un dígito en texto como hoy) e ignore cualquier `puntuacion` que venga en la respuesta.

  Verificar con casos en `tests/integration/test_validacion.py`: 3/2/3 aceptado; 5 rechazado; nivel ausente rechazado; `true` rechazado; `puntuacion` extra ignorada.
- [x] 1.2 En `integrations/ia/prompts/evaluador.py`:
  - reescribir `RUBRICA` con los descriptores 0–4 de los tres criterios (design.md, D1), manteniendo la calibración por nivel del puesto;
  - cambiar `ESQUEMA_EVALUACION` a `niveles{correccion,completitud,claridad}` (enteros, de 0 a 4) + los tres textos, sin `puntuacion`.

  Verificar en `tests/integration/test_prompts.py` que el esquema exige los niveles y que la rúbrica contiene los 5 descriptores de cada criterio.
- [x] 1.3 `integrations/ia/fake.py`: devolver los niveles 3/3/3. Verificar con `python manage.py test tests.integration` en verde.

## 2. Fórmula y persistencia

- [x] 2.1 En `apps/evaluaciones/rubricas.py`, añadir `NIVEL_MAXIMO`, `PESOS`, `VERSION_DE_RUBRICA = 2` y `puntuacion_de(niveles)` con la fórmula ponderada. Exponer también los descriptores para la API. Verificar en `test_rubricas.py`:
  - la tabla completa de `S` de 0 a 12 contra sus 13 notas esperadas;
  - 4/4/4 → 100 y 0/0/0 → 0;
  - cada nota cae en la banda prevista por la tabla de proposal.md.
- [x] 2.2 `apps/evaluaciones/services.py::guardar()`: calcular `puntuacion = puntuacion_de(resultado.niveles)` y escribir en `evaluacion_json` `niveles`, `pesos` y `version_rubrica`, además de los textos. Verificar con un test que, aplicando la fórmula al JSON guardado, se obtiene la columna `puntuacion`, y que `makemigrations --check` no detecta cambios.
- [x] 2.3 `EvaluacionSerializer`: exponer `niveles` (objeto o `null`) y `version_rubrica` (o `null`), leídos de forma tolerante. `EntrevistaSerializer`: exponer `preguntas_calificadas` y `preguntas_previstas`. `/api/catalogos/`: publicar los descriptores y los pesos. Verificar con tests: una evaluación antigua serializa `niveles: null`, y una abandonada con 2 calificadas devuelve `preguntas_calificadas: 2`.
- [x] 2.4 Ajustar los tests existentes que construyen evaluaciones con `puntuacion` (`test_modelos`, `test_idempotencia`, `test_contrato_ia`, `test_estadisticas`, etc.) y ejecutar `python manage.py test` completo en verde contra PostgreSQL.

## 3. Medición de consistencia

- [x] 3.1 Crear `apps/evaluaciones/consistencia/casos.json` con 8 casos (dos por banda, en al menos 4 áreas, niveles Básico e Intermedio), escritos a mano y sin datos personales. Verificar que el JSON carga y que cada caso tiene contexto, área, pregunta y respuesta.
- [x] 3.2 Crear el comando `medir_consistencia` (`--repeticiones`, mínimo 2; `--proveedor` opcional). Para cada caso imprime la media, la desviación estándar y el porcentaje en la banda modal, y al final un resumen global. No escribe en la base de datos. Verificar con un test:
  - con el proveedor simulado y K = 3, la desviación es 0 y la coincidencia de banda es 100 %;
  - el número de filas de `Evaluacion` y `Entrevista` no cambia;
  - K = 1 produce un error.

## 4. Frontend

- [x] 4.1 `src/types/entrevista.ts`: `Niveles`, `Evaluacion.niveles: Niveles | null`, `version_rubrica`, y `Entrevista.preguntas_calificadas/preguntas_previstas`; tipos de los descriptores en el catálogo. Verificar con `pnpm exec tsc --noEmit`.
- [x] 4.2 `PanelCualitativo.tsx`: fila de tres niveles ("Corrección 3/4 · Completitud 2/4 · Claridad 3/4") y un desplegable "¿Cómo se calcula?" con los descriptores de esos niveles y la operación sustituida. Oculto si `niveles` es nulo. Verificar en el navegador con una evaluación nueva y una antigua.
- [x] 4.3 Resumen de resultados: si el estado es `ABANDONADA`, mostrar "Nota parcial · sobre k de 5 preguntas". Verificar en el navegador con una entrevista abandonada.

## 5. Verificación y documentación

- [x] 5.1 `pnpm exec tsc --noEmit`, `pnpm run lint` (sin subir de 5 avisos) y `pnpm run build` en verde.
- [ ] 5.2 Recorrido con `IA_PROVEEDOR=fake`: una entrevista completa muestra niveles 3/3/3, nota 75, banda Aceptable y la fórmula. Ejecutar `medir_consistencia --repeticiones 3` con `fake`. Con Gemini, lo ejecuta el usuario y guarda la salida para el capítulo de pruebas.
- [x] 5.3 Actualizar `CLAUDE.md`:
  - en "Entrevistador and evaluador…": la IA elige niveles y `rubricas.puntuacion_de` calcula la nota;
  - en "Statistics…": la nota final es la media simple y las abandonadas se marcan como parciales.

  (`reporte-final-entrevista` ya quedó alineado a los niveles 0–4 en la planificación; ver design.md, D6.)
