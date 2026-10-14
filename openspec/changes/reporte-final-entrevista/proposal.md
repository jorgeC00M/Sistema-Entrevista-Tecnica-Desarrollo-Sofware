## Why

Mostrar la nota al terminar **no es opcional: lo exige el perfil**. El modelo de datos (3.4.1) define `puntuacion` 0–100 por pregunta y `puntuacion_promedio` por entrevista. Las definiciones operativas hablan de "una evaluación personalizada con **métricas de desempeño**" (API de Claude) y de una IA que "asigna una puntuación basada en **criterios técnicos predefinidos**" (Evaluación automatizada). El problema no es *mostrar* el número, sino que hoy es **difícil de defender y poco útil para mejorar**:

1. **"¿De dónde sale el 74?"** El evaluador declara tres criterios de igual peso (corrección, completitud, claridad), pero devuelve un único número. El reporte no muestra cómo se compone, así que la nota parece una opinión de la IA y no la aplicación de una rúbrica.
2. **No hay reporte final consolidado.** El perfil dice que la retroalimentación "se genera después de cada respuesta y **se consolida en un reporte final**" (Retroalimentación personalizada). Hoy la pantalla es una nota grande más cinco tarjetas sueltas. Nadie junta las cinco para decir qué priorizar.
3. **No enseña la respuesta.** "Debilidades: faltan detalles" no dice *qué* detalles. Para mejorar en la próxima, el candidato necesita saber qué cubría una respuesta completa.
4. **No hay progreso.** El perfil pide "analizar su progreso a lo largo del tiempo" (Alcance), pero el reporte no compara con la entrevista anterior del mismo puesto.

## What Changes

- **Depende de `formula-de-puntuacion`**, que se aplica antes: la IA elige un nivel 0–4 por criterio y el código calcula la nota con `P = 100·(n₁+n₂+n₃)/12`. Este cambio no vuelve a definir la nota; consume esos niveles.
- **El evaluador indica qué esperaba.** Devuelve `puntos_clave`, de 2 a 4 ideas que una respuesta completa debía cubrir para ese nivel. Es la pieza que convierte la nota en aprendizaje.
- **Todo se guarda en `evaluacion_json`**, que el perfil ya define como "datos completos en formato JSON". No cambia el esquema de tablas del perfil, no hay migración y las estadísticas existentes siguen leyendo `puntuacion`.
- **Nuevo reporte final consolidado al inicio de la pantalla de resultados**, calculado en el backend **sin otra llamada a la IA**:
  - la banda general ("Aceptable") y el promedio, sin número gigante;
  - el nivel medio de cada criterio en toda la entrevista (sobre 4) y el **criterio más débil**;
  - la **prioridad para la próxima**: el área con peor nota, con su sugerencia;
  - la **comparación** con la entrevista finalizada anterior del mismo puesto y nivel (diferencia del promedio), cuando existe;
  - la acción "Practicar de nuevo este puesto", que preselecciona puesto y nivel en `/nueva-entrevista`.
- **Cada pregunta del reporte** muestra además los "puntos clave esperados" (los niveles y la fórmula los añade `formula-de-puntuacion`).
- **Las evaluaciones antiguas no se recalculan.** Una evaluación sin niveles se muestra como hoy, con nota y textos, y queda fuera del nivel medio por criterio. Una migración nunca llama al proveedor.
- La regla de no publicar la nota mientras la entrevista está `EN_PROGRESO` **no cambia**: el resumen se rige por la misma condición.

## Capabilities

### New Capabilities
- `reporte-de-entrevista`: los puntos clave de cada respuesta y qué reporte consolidado recibe el candidato al terminar una entrevista para preparar la siguiente.

### Modified Capabilities
<!-- No hay specs previas en openspec/specs/. -->

## Impact

- **Backend / IA (sin Django):**
  - `integrations/ia/prompts/evaluador.py`: rúbrica, esquema y prompt.
  - `integrations/ia/prompts/schemas.py`: `Evaluacion` y `parsear_evaluacion`.
  - `integrations/ia/fake.py`: devuelve puntos clave.
  - Tests en `tests/integration/` (`test_contrato_ia`, `test_prompts`, `test_validacion`).
- **Backend / apps:**
  - `apps/evaluaciones/services.py::guardar` persiste los campos nuevos en `evaluacion_json`.
  - `apps/evaluaciones/serializers.py` expone `puntos_clave` (lista vacía si faltan).
  - Nuevo `apps/entrevistas/selectors.py::resumen_de()` (más `anterior_comparable()`).
  - `ResultadosView` añade la clave `resumen`, que es `null` mientras la entrevista está `EN_PROGRESO`.
- **Frontend:**
  - `features/resultados/`: nuevo `ResumenFinal` que reemplaza a `TarjetaResumen`, y `PanelCualitativo` con puntos clave.
  - Tipos en `types/entrevista.ts`.
  - `SeleccionPuestoPage` lee también `?nivel=`.
- **Sin cambios:** modelo de datos, migraciones, estadísticas, retroalimentación acumulada, idempotencia de `responder()`.
- **Costo de IA:** el mismo número de llamadas. La salida del evaluador crece en unos 60–100 tokens por respuesta.
