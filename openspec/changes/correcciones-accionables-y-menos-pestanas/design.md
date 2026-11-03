## Context

Lo que hay hoy, comprobado en el código:

**Backend:**
- `ats.py::Hallazgo(codigo, severidad, titulo, detalle, favorable)` se guarda con `asdict` en `AnalisisATS.hallazgos`, un JSON.
- `HallazgoSerializer` publica esos cinco campos.
- `VERSION_DE_REGLAS = 5`.

**`ResultadoDelAnalisis.tsx`:**
- Tiene cuatro pestañas:
  - `resumen`;
  - `mejorar`;
  - `requisitos`: `BrechaDeRequisitos` con convocatoria, `InventarioDeTerminos` sin ella;
  - `entrevista`: `PreguntasProbables`.
- `irA(destino, id)` lleva el foco a una fila de otra pestaña.

**`ResumenDelAnalisis.tsx`:**
- Ya muestra `FrenteAlAviso`, el veredicto, el espejo, «Lo primero que mejorar», `TextoDelATS`, `TecnologiasLegibles` y «Qué ya funciona».
- Cierra con un bloque propio «Practicar la entrevista», que duplica el pie de `PreguntasProbables`.

**Duplicaciones:**
- `InventarioDeTerminos` y `TecnologiasLegibles` muestran la misma lista (`analisis.inventario`).
- `FrenteAlAviso` y `BrechaDeRequisitos` muestran las mismas filas de experiencia, cargo y filtros. Solo `BrechaDeRequisitos` añade las sugerencias de la IA (`revision.requisitos`), los extras y el aviso de `con_evidencia`.

**Piezas que solo usa `TextoDelATS`:**
- `GET /api/curriculums/<id>/texto/`, con `CurriculumTextoView` y `selectors.lineas_del_texto`;
- `obtenerTextoDelCurriculum` y `LineaDelTexto`;
- `hallazgos.ts::MOTIVOS_DE_INVISIBILIDAD` y `loQueElAtsNoVe`.

**`idDeRequisito`** (`requisitos.ts`) solo sirve para que un chip lleve el foco a una fila de la pestaña Requisitos.

## Goals / Non-Goals

**Goals:**
- Que cada corrección diga primero qué hacer.
- Un resultado de dos pestañas, sin vistas repetidas.
- Borrar todo el código que quede sin uso.

**Non-Goals:**
- Cambiar qué se mide o la severidad de cada hallazgo.
- Cambiar los textos de las fortalezas.
- Cambiar el contrato de la revisión con IA: las preguntas y las sugerencias por requisito se siguen pidiendo igual.

## Decisions

### D1. La acción vive en el backend, junto a la regla

`Hallazgo` gana `accion: str = ""`. Cada `_verificar_*` la redacta al lado de su `titulo` y su `detalle`, igual que hoy redacta los textos dinámicos («Saca tu correo del encabezado», «Resúmelo en 2 páginas»).

**Descartado: un mapa por `codigo` en el frontend.**
- Separaría el arreglo de la regla que lo motiva.
- No sabría redactar las variantes dinámicas.
- Un código nuevo podría quedar sin acción sin que ningún test lo detecte.

**Test:** en `tests/integration/test_ats.py`, se analizan documentos construidos que cubren todas las debilidades y se exige `accion` no vacía en cada una y vacía en cada fortaleza.

### D2. `titulo` se conserva como diagnóstico

- La pantalla lo muestra como «Encontramos: …», con la primera letra en minúscula.
- `VeredictoDeLegibilidad` lo sigue usando: «Lo principal: tu CV está maquetado a dos columnas».
- Borrarlo obligaría a inventar otro texto para el veredicto.

### D3. Compatibilidad con los análisis guardados

- **Serializer:** `HallazgoSerializer.accion = CharField(default="")`.
- **Frontend:** `accionDe(h) = h.accion || h.titulo`. La línea «Encontramos» solo aparece si hay `accion`, para no repetir el título.
- **Versión:** `VERSION_DE_REGLAS = 6`, así que volver a subir el CV recalcula el análisis. Lo que solo se abre desde el historial se ve con el título de antes y no falla.

### D4. Acciones y redacción de los detalles

**Acciones:**

| Código | Acción |
|---|---|
| `sin_capa_de_texto` | Genera tu CV como texto, no como imagen |
| `texto_en_cuadros` (con un dato de contacto) | Saca tu {dato} del cuadro de texto |
| `texto_en_cuadros` | Pasa el texto de los cuadros al cuerpo del CV |
| `texto_en_encabezado` (con un dato de contacto) | Saca tu {dato} del encabezado |
| `texto_en_encabezado` | Pasa el encabezado y el pie al cuerpo del CV |
| `sin_correo` | Escribe tu correo como texto |
| `sin_telefono` | Agrega tu número de teléfono |
| `sin_ubicacion` | Escribe tu ciudad y país |
| `secciones_no_reconocidas` | Usa títulos de sección convencionales |
| `antiguedad_no_calculable` | Pon fecha de inicio y fin a cada empleo |
| `formatos_de_fecha_mezclados` | Usa un solo formato de fecha |
| `dos_columnas` | Pásalo a una sola columna |
| `contiene_tablas` | Cambia las tablas por texto |
| `habilidades_en_graficos` | Escribe tus habilidades como texto |
| `contiene_imagenes` | Revisa que tus imágenes no tengan información |
| `texto_oculto` | Elimina el texto que no se ve |
| `solo_sigla_o_solo_nombre` | Escribe cada sigla también con su nombre |
| `demasiadas_paginas` | Resúmelo en {N} páginas |
| `idioma_distinto` | Envía tu CV en el idioma del aviso |

**Regla del detalle:**
- dos partes, en este orden: qué le pasa al CV en el ATS y qué hacer;
- sin «parser»;
- con un ejemplo cuando ayuda.

**Ejemplo para `dos_columnas`:** «El ATS lee cada línea de izquierda a derecha, sin saber que hay dos columnas, y mezcla una con la otra: un puesto queda separado de su fecha y una habilidad termina dentro de otro empleo. Usa una sola columna: tus datos arriba y debajo cada sección, una tras otra.»

**Matices de `MOTIVOS_DE_INVISIBILIDAD` que pasan a los detalles correspondientes:**
- las tablas se extraen, pero pueden leerse en desorden;
- de una imagen no se sabe si tiene texto, porque no hay OCR;
- el texto blanco o diminuto se toma como un intento de engañar al filtro.

**Se conservan los datos que citan los tests:** «escaneó», «cuadros de texto», «imagen», «Amazon Web Services (AWS)» y el extracto «Lo que hay ahí: «…»».

### D5. Se elimina la vista del texto del ATS, endpoint incluido

- **Por qué:** es la decisión del usuario.
- **Por qué también el endpoint:** dejarlo sin pantalla sería código muerto, además de una ruta que devuelve un CV completo sin que nadie la necesite.
- **Se borran:** la vista, la ruta, el selector, los tests, el componente, la función de la API, el tipo y el mapa de motivos.

### D6. Dos pestañas, y «Frente a este aviso» absorbe `BrechaDeRequisitos`

**Props de `FrenteAlAviso`:**
- recibe `sugerencias` (requisito → texto), armado en `ResumenDelAnalisis` a partir de `revision.requisitos`;
- deja de recibir `onIrARequisito`.

**Contenido de la tarjeta, en este orden:**
1. la búsqueda;
2. los chips, de solo lectura;
3. el aviso de `con_evidencia`;
4. experiencia, cargo y filtros, con la `Fila` local, la aclaración de `posible_subestimacion` y la `SugerenciaIA` de experiencia y cargo;
5. el plegable «Cómo cubrir lo que te falta», con los términos declarados o ausentes que tengan sugerencia;
6. los extras.

**Por qué un plegable:** las sugerencias pueden ser ocho párrafos. Abiertas, empujarían el veredicto y el espejo hacia abajo.

**Se borra:**
- `BrechaDeRequisitos.tsx`, con `FilaDeRequisito`, `FilaDeExperiencia` y `notaDeExperiencia`. Antes se trae a `FrenteAlAviso` lo que sirve.
- `InventarioDeTerminos.tsx`.
- `idDeRequisito`, con su test.
- Las ramas `requisitos` y `entrevista` de `ResultadoDelAnalisis`.
- Las constantes de `aspectos.ts` que queden sin uso.

`irA` deja de recibir el destino: solo lleva a «Mejorar».

### D7. La práctica y las preguntas

- `PreguntasProbables` pone primero el botón «Practicar la entrevista» y, si hay preguntas, debajo el `<details>` cerrado «Preguntas que podrían hacerte (n)».
- `ResumenDelAnalisis` lo usa como cierre y borra su bloque de práctica propio.

### D8. Specs que esto reemplaza

La delta de `diferenciar-revision-y-comparacion-de-cv`, que no está archivada, se ajusta en este cambio:
- se quita el requisito «El usuario ve el texto que leyó el ATS…»;
- en «Frente a este aviso», el chip deja de abrir la pestaña Requisitos.

Así, al archivar los dos cambios, no quedan requisitos que se contradigan.

## Risks / Trade-offs

- **El Resumen con convocatoria se alarga.**
  - Se mitiga con dos plegables: las sugerencias y las preguntas.
  - La alternativa, la pestaña Requisitos, la descartó el usuario.
- **Se pierde la vista del texto plano.**
  - Era la única prueba visible de que el texto a dos columnas sale revuelto.
  - Se acepta: la corrección lo explica en palabras, y el usuario la juzgó inútil.
- **Cambiar los detalles puede romper tests que citan frases.**
  - Por eso se conservan los datos citados y se ajustan solo los `assertIn` necesarios.
