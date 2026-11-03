## Why

El perfil aprobado (`docs/Copia de Copia de PerfilJorgeV3.docx.md`) es el contrato de la tesis, y los capítulos I a III ya no describen el sistema que existe. Algunos desfases:
- habla de «elegir un área», pero el sistema pide puesto, tecnología y nivel;
- excluye el nivel avanzado, pero el sistema tiene Senior;
- no menciona el análisis de CV, la entrevista desde convocatoria, el puesto Videojuegos ni el inicio con Google;
- dice que Claude asigna la nota, pero la calcula el sistema a partir de una rúbrica;
- las tablas de 3.4.1 no coinciden con la base de datos, y 3.4.2 está vacío.

Un tribunal señala justo eso: lo implementado y no declarado, o lo declarado y no implementado.

## What Changes

Se revisa el documento capítulo por capítulo. Para cada sección se indica qué mejorar y si basta con texto o conviene una tabla o una imagen, y por qué. La guía completa está en `design.md`.

Decisiones aprobadas por el usuario (21-10-2026):
- **Niveles:** el documento pasa a Junior (inicial), Semi-Senior (intermedio) y Senior (avanzado). La exclusión del nivel avanzado se acota a «sin codificación en vivo ni pizarra».
- **Objetivos:** no cambian, ni siquiera el objetivo 2 («selección de diferentes áreas»). El **Alcance** sí explica que se elige un puesto, que cubre varias áreas.
- **Módulos no declarados:** el análisis de CV (ATS), la entrevista desde convocatoria, el puesto Videojuegos y el inicio con Google entran como **viñetas de Alcance**, sin objetivo nuevo.
- **Cochabamba y UMSS:** se redactan como **público objetivo**, no como una restricción que el sistema imponga.
- **Proveedor de IA:** se documenta solo Claude. Los demás proveedores son respaldo interno y no se mencionan.

Qué se toca y qué no:
- Se edita solo la copia en Markdown del perfil, un capítulo por vez. El usuario lo pasa al Word.
- Las capturas de pantalla y la exportación de diagramas quedan a cargo del usuario. Se entrega el código PlantUML o Mermaid de cada diagrama.
- No se toca código del sistema.

## Capabilities

### New Capabilities
- `perfil-academico`: lo que el perfil de la tesis (capítulos I a III) debe declarar para coincidir con el sistema implementado.

### Modified Capabilities
<!-- Ninguna. -->

## Impact

- **Archivos:**
  - `docs/Copia de Copia de PerfilJorgeV3.docx.md`: capítulos I, II y III, y los índices de tablas y figuras;
  - `docs/diagramas/`: nuevo, con el código PlantUML o Mermaid de los diagramas.
- **Fuentes de verdad que se consultan sin modificarlas:**
  - los modelos de `backend/apps/*/models.py`;
  - `integrations/ia/prompts/schemas.py` (`PLAN_POR_PUESTO`);
  - `apps/evaluaciones/rubricas.py`;
  - `apps/catalogos/datos.py`;
  - CLAUDE.md.
- **Sin impacto** en la base de datos, la API ni el frontend.
