## Context

- **`PanelDeConvocatoria.tsx`** usa `grid gap-6 lg:grid-cols-2 lg:items-start`:
  - **izquierda:** `EleccionDeVia` («Pegar texto» / «Subir archivo», radios con forma de tarjeta) y debajo el `Textarea` (30-5000, `MINIMO_CARACTERES` y `MAXIMO_CARACTERES`) o una `ZonaDeArchivo`; el error, con `AlertaDeIA`, dice «Tu texto/archivo sigue aquí.»; y «Analizar convocatoria»;
  - **derecha:** `resumen`, o el marcador punteado.
- **`EleccionDeVia`** solo se usa ahí. `Pestanas.tsx` la cita en un comentario como ejemplo de radios.
- **`api/entrevistas.ts::analizarConvocatoria`** recibe `{texto} | {archivo}`, y en el segundo caso arma un `FormData`.
- **`AnalizarConvocatoriaSerializer`** acepta `texto` o `archivo` (no los dos), extrae el texto del archivo con `texto_de_convocatoria`, valida 30 ≤ largo ≤ máximo y devuelve `{"texto": ...}`.
- **`apps/common/archivos.py`** tiene `validar_archivo` (CV y convocatoria) y `texto_de_convocatoria`, que tras `comparar-con-oferta-en-dos-pasos` solo usa este serializer.
- **`test_convocatoria.py`** tiene tres tests de archivo (DOCX, escaneado y las dos vías a la vez) y sus helpers.

## Goals / Non-Goals

**Goals:**
- una sola vía para la convocatoria en toda la app;
- el mismo espacio de la pestaña;
- no dejar código muerto.

**Non-Goals:**
- cambiar el análisis con IA, la caché, el enmascarado o `ResumenDeConvocatoria`;
- cambiar los límites de 30 y 5000 caracteres.

## Decisions

1. **`PanelDeConvocatoria`:**
   - sin el estado `via` ni `archivo`, sin `EleccionDeVia` ni `ZonaDeArchivo`;
   - `listo = largo >= MINIMO_CARACTERES` y `analizar()` llama a `analizarConvocatoria(texto.trim())`;
   - la grilla, el marcador y el resto no cambian;
   - el docstring explica por qué solo texto y remite a `comparar-con-oferta-en-dos-pasos`.
2. **`analizarConvocatoria(texto: string)`** envía JSON `{texto}`. El docstring deja de hablar de `FormData` y de 400 por archivo ilegible; queda el 422 de puesto no identificado.
3. **`AnalizarConvocatoriaSerializer`:**
   - solo declara `texto`. DRF ignora un `archivo` no declarado, así que un cliente viejo cae en la validación de largo, que responde el mismo 400 de aviso incompleto antes de cualquier llamada a la IA (el serializer valida en la vista antes del servicio);
   - `validate` conserva el mínimo y el máximo, y sigue devolviendo `{"texto": pegado}`;
   - no se toca la vista.
4. **`apps/common/archivos.py`:**
   - se borran `texto_de_convocatoria` y el import de `extraer`, que quedan sin uso;
   - `validar_archivo` y `MAXIMO_BYTES` se quedan para el CV;
   - el docstring del módulo pasa a decir que lo usa el módulo de CV (y por qué sigue en `common`: es la validación de subida, no lógica del CV).
5. **Los tests de archivo se eliminan,** junto con sus helpers si quedan sin uso. Se agrega uno: un `archivo` sin `texto` responde 400 y el proveedor no se llama. Se verifica con un doble que cuenta llamadas, si el módulo ya tiene uno, o parcheando `get_analizador_de_convocatoria`.
6. **El comentario de `Pestanas.tsx`** deja de citar `EleccionDeVia`: dice «un grupo de radios», sin nombrar un componente.
7. **La delta de `comparar-con-oferta-en-dos-pasos`** («Simular entrevista… sigue aceptando un archivo») recibe una nota: «(`convocatoria-de-entrevista-solo-texto` lo dejó también solo con texto)». Así, al archivarse, las dos no se contradicen.

## Risks / Trade-offs

- **[El aviso solo existe en PDF]** → El usuario lo abre y copia el texto. Ya era la vía principal, y es la misma regla que en el CV.
- **[Un cliente viejo envía un archivo]** → Recibe el 400 con un mensaje que dice qué hacer, y no gasta cuota de IA.

## Migration Plan

Sin datos ni migraciones: `Convocatoria.texto` siempre fue texto. Para revertir, restaurar desde git el serializer, `texto_de_convocatoria`, `EleccionDeVia` y el panel.
