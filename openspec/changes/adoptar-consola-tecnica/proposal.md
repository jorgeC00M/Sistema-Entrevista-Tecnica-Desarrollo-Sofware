## Why

El rediseño anterior (`rediseno-sistema-visual`) dejó el sistema con la paleta y la tipografía correctas —`tinta`/`iris`, IBM Plex Sans/Mono— pero con un layout todavía genérico: tarjetas blandas, pantallas sin identidad y un reporte de resultados que se lee como una lista de campos. La maqueta de Stitch ("Calm Engineering Terminal") usa exactamente esos mismos tokens y muestra a dónde debía llegar el producto: una consola técnica, con metadatos en mono, chips de puntaje y densidad de herramienta de trabajo.

La brecha ya no es de color, es de composición. Este cambio la cierra en el frontend, sin tocar backend.

## What Changes

**Consola de entrevista (`/entrevista/:id`)**

- Cabecera de sesión fija: área, nivel, contador `PREGUNTA 03 / 05` en mono y barra de progreso.
- **Retroalimentación en línea**: tras cada respuesta evaluada se muestra su chip de puntaje y el comentario de la IA dentro del hilo. Hoy ese dato llega en la respuesta de `responder()` y el frontend lo descarta; pasa a conservarse y mostrarse. **BREAKING** respecto al comportamiento actual, donde las notas solo se ven al terminar.
- **Cronómetro ascendente** de sesión y de pregunta actual, informativo: no hay límite ni cierre por tiempo.
- Burbujas al estilo de la maqueta: entrevistador en superficie clara con borde, candidato en `tinta-900` con texto blanco.
- Campo de respuesta con contador de caracteres y atajo `Ctrl + Enter`.

**Reporte de evaluación (`/entrevista/:id/resultados`)**

- Encabezado con id de sesión, estado y duración total (derivada de `fecha_inicio`/`fecha_fin`).
- Calificación general destacada en mono sobre tarjeta, junto al desglose.
- Fortalezas, debilidades y sugerencias como tres tarjetas con acento superior de color semántico.
- "Desglose por pregunta" como tabla con divisores: número, enunciado, duración (`tiempo_respuesta`) y chip de puntaje por fila.

**Configuración de entrevista (`/nueva-entrevista`)**

- Áreas como tarjetas 2×2 con icono, descripción, chip de `N PREGUNTAS` y estado seleccionado con anillo `iris`.
- Nivel como control segmentado dentro de una tarjeta de calibración.
- Tarjeta de resumen de sesión antes del botón de arranque.

**Shell**

- Sidebar con Nueva entrevista, Entrevista en curso, Resultados, Historial y progreso, Retroalimentación y Mi perfil. "Entrevista en curso" y "Resultados" aparecen según haya o no entrevista disponible, en vez de ser enlaces muertos.
- Cabecera con migas en mono (`SIMULADOR TÉCNICO / <sección>`).

**Tokens**

- Radios a los de la maqueta: superficie 8px, control 4px (hoy 16px y 8px).
- Escala tipográfica completa del sistema de diseño (`headline-*`, `body-*`, `label-mono`, `metric-counter`, `code-*`).

**Alcance extendido**: el lenguaje visual (cabeceras en mono, chips de metadatos, listas con divisores) se extrapola también a landing, login, registro, historial, retroalimentación y perfil, que no tienen maqueta propia.

**Fuera de alcance, a backlog para la fase de backend**: etiquetas de tema por pregunta, títulos cortos de pregunta, sub-puntajes (Precisión/Claridad/Eficiencia), diagnóstico global de la IA, criterios esperados bajo la pregunta activa, corte de contratación, banda de la nota promedio y exportación a PDF. Ninguno tiene dato que lo sostenga hoy; se omiten en vez de maquetarse vacíos.

**Marca**: se conservan el logo y el avatar de iniciales del proyecto. Las imágenes de la maqueta (logotipo `Entrevista.dev`, fotos de stock) no se incorporan.

## Capabilities

### New Capabilities

- `consola-entrevista`: qué ve y qué puede hacer el candidato durante una entrevista en curso — progreso, retroalimentación por respuesta y cronómetro.
- `navegacion-app`: qué destinos ofrece el shell autenticado y bajo qué condiciones aparece cada uno.

### Modified Capabilities

Ninguna. No hay specs publicadas en `openspec/specs/` todavía; el resto del cambio es presentación y no altera requisitos existentes.

## Impact

- **Frontend**: `features/entrevista/` (hook `useEntrevista`, `ChatEntrevista`, `BurbujaPregunta`, `CampoRespuesta`, `BarraProgreso`, `EntrevistaPage`), `features/resultados/`, `features/seleccion/`, `components/layout/` (sidebar, header, destinos), `components/ui/` (`ChipPuntaje`, `Card`, `Badge`, nuevos componentes de metadato mono), `styles/index.css` (radios y escala tipográfica), y pases de estilo sobre `features/{landing,auth,historial,retroalimentacion,perfil}/`.
- **Backend**: sin cambios. Ni modelos, ni serializers, ni endpoints, ni prompts.
- **Contrato de API**: sin cambios. Todo lo que se muestra ya viaja en las respuestas actuales.
- **Dependencias**: ninguna nueva. Los iconos siguen siendo los trazos ya incluidos en `components/ui/Icono.tsx`; no se adopta la fuente de iconos de la maqueta.
- **Documentación**: `docs/arquitectura.md` se actualiza con los radios y la escala nuevos.
