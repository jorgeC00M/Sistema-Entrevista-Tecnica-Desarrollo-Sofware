## Why

`comparar-con-oferta-en-dos-pasos` dejó la convocatoria del módulo de CV solo como texto: un aviso vive en una página web y lo natural es copiarlo. «Simular entrevista › Con convocatoria» sigue ofreciendo «Pegar texto» o «Subir archivo». Así hay dos reglas para lo mismo, y un paso de elegir antes de empezar que casi no aporta.

## What Changes

- **«Con convocatoria» solo con texto:** se quitan las dos tarjetas «Pegar texto / Subir archivo» y la zona de archivo. Queda el campo «Texto de la convocatoria», que va de 30 a 5000 caracteres e incluye el contador y el aviso de texto corto.
- **El espacio no cambia:** desde 1024 px, la entrada sigue a la izquierda y lo detectado a la derecha, con el marcador punteado antes del primer análisis; por debajo, se apila.
- **El aviso de IA** dice siempre «Tu texto sigue aquí.».
- **BREAKING (API):** `POST /api/entrevistas/convocatoria/` deja de aceptar `archivo`. Si llega uno sin texto, se ignora y responde el 400 de siempre («Pega el aviso completo…»), sin llamar a la IA.
- **Código muerto:** se eliminan `EleccionDeVia` (frontend) y `apps/common/archivos.py::texto_de_convocatoria` (backend), que solo usaban las vías por archivo.

## Capabilities

### New Capabilities
- `convocatoria-de-entrevista-solo-texto`: cómo se da la convocatoria al simular una entrevista (solo texto, mismo espacio) y qué acepta la API que la analiza.

### Modified Capabilities
- (ninguna: el flujo de selección no tiene una spec principal con este requisito; la delta sin archivar `comparar-con-oferta-en-dos-pasos`, que decía que «Simular entrevista» seguía aceptando archivo, se anota)

## Impact

- **Frontend:**
  - `features/seleccion/components/PanelDeConvocatoria.tsx`;
  - se elimina `features/seleccion/components/EleccionDeVia.tsx`;
  - `api/entrevistas.ts::analizarConvocatoria`;
  - un comentario en `components/ui/Pestanas.tsx`.
- **Backend:**
  - `apps/entrevistas/serializers.py::AnalizarConvocatoriaSerializer` y `apps/entrevistas/tests/test_convocatoria.py`;
  - `apps/common/archivos.py`: se queda `validar_archivo`, que el CV todavía usa.
- **Documentación:** `CLAUDE.md`, la delta de `comparar-con-oferta-en-dos-pasos` y la tesis, si menciona subir la convocatoria.
