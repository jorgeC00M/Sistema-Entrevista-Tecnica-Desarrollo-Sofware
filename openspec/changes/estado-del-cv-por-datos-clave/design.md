## Context

`ats.py` arma la ficha como `Campo(nombre, detectado, valor, nota)` con los 8 nombres de `CAMPOS_DE_LA_FICHA`, y emite hallazgos con su `codigo` y su `severidad`. Entre ellos están `formatos_de_fecha_mezclados` (alta), `habilidades_en_graficos` (alta) y `dos_columnas` (alta). `AnalisisATS.veredicto` (backend, para el historial) y `hallazgos.ts::veredictoDeLegibilidad` (frontend, para el Resumen) aplican la regla vieja por gravedad: ilegible / con pérdidas / completo. `HistorialTest` comprueba que coincidan sobre fixtures reales.

El Resumen es una grilla de 5 columnas:
- a la izquierda, `VeredictoDeLegibilidad` (la dona de dos estados), `EspejoDelATS` y `TecnologiasLegibles`;
- a la derecha, fija, `LoQueDebesHacer` y `ConservaloAlCorregir`.

## Goals / Non-Goals

**Goals:**
- Un estado por dato, medido y explicable regla por regla.
- Un estado del CV por datos clave, igual en backend y frontend.
- Un Resumen en una columna, con el banner que lleva a corregir.

**Non-Goals:**
- Nuevas detecciones en los documentos.
- Cambiar qué se envía a la IA o los prompts.
- Cambiar la entrada o el Match con la Oferta.

## Decisions

**D1. `Campo.incompleto: bool` y una pasada final en `ats.py`.**
- `_marcar_incompletos(analisis)` corre al final de `analizar()`. Lee los códigos de `analisis.debilidades` y reemplaza los campos detectados afectados con `dataclasses.replace(campo, incompleto=True, nota=…)`. `Campo` es `frozen`.
- La tabla (código → campos → nota) es un dict a nivel de módulo, `_INCOMPLETOS_POR_HALLAZGO`. Agregar un caso es una entrada en ese dict.
- *Por qué estos dos códigos:* son los hallazgos que ya dicen que un dato existe pero llega al ATS dañado. `habilidades_en_graficos` se descartó al aplicar, con el usuario: `ats.py` solo lo emite cuando las habilidades **no** se detectaron, así que nunca marcaría un dato extraído. Las tablas, las imágenes o las páginas no afectan a un dato concreto, así que siguen solo en «Formato».

**D2. `estado_del_cv(campos)` puro en `ats.py`, con `CAMPOS_CLAVE`.**
- Recibe objetos o dicts (`nombre`, `detectado`, `incompleto` opcional), así sirve tanto para el análisis recién hecho como para el JSON guardado en `AnalisisATS.campos`.
- `AnalisisATS.veredicto` lo llama. Para los campos guardados con reglas anteriores, sin `incompleto`, toma `False`.
- La regla del frontend es una copia, `veredictoDeLegibilidad` sobre `analisis.campos`, con `CAMPOS_CLAVE` también copiado.
- Un test en cada lado fija los mismos casos, y `HistorialTest` compara los dos sobre fixtures.

**D3. Los valores nuevos son `perdidas_importantes`, `legible_con_perdidas` y `legible`.**
- `NivelDeLegibilidad` cambia de valores.
- `VEREDICTOS` (el único mapa) se reescribe:
  - etiquetas «Pérdidas importantes», «Legible con pérdidas» y «Legible»;
  - títulos, por ejemplo «El ATS pierde datos clave de tu CV», «El ATS lee tu CV con pérdidas» y «El ATS lee tu CV completo»;
  - reglas en palabras;
  - iconos y colores de error, de progreso y de éxito.
- El historial lo lee sin cambios de código, salvo las claves.

**D4. `VERSION_DE_REGLAS = 8` y compatibilidad.**
- Lo que produce `analizar()` cambia, así que la versión sube y un CV que se vuelve a subir se recalcula en el mismo registro.
- `CampoSerializer.incompleto = BooleanField(default=False)`: un análisis viejo se publica sin la clave y DRF usa el valor por defecto.
- Su veredicto en el historial se calcula con la regla nueva sobre `detectado`, porque `estado_del_cv` lee `incompleto` como `False`.

**D5. La dona de tres tramos.**
- `conic-gradient` con tres cortes sobre `--color-exito-texto`, `--color-progreso-texto` y `--color-error-texto`, con el porcentaje acumulado.
- El agujero, la leyenda de tres filas y la frase `sr-only` siguen como en `veredicto-con-dona`.
- `estadoDelCampo(campo)` da el estado de cada dato; el banner y el espejo cuentan con él.

**D6. «Formato» enlazado y la acción.**
- Cada error es un `Boton variante="texto"` que llama a `onIrA(codigo)`, con el mismo `irA` de `ResultadoDelAnalisis` que usaba «Lo que debes hacer»: enfoca la fila de la corrección en «Plan de Mejora».
- «Ver el plan de mejora» llama a `onVerTodo`.
- `correccionesPrioritarias` se conserva para elegir los errores. `LoQueDebesHacer.tsx` queda sin uso y se borra.

**D7. El Resumen en una columna.**
- `ResumenDelAnalisis` pasa a un `flex flex-col gap-5`, sin la grilla de 5, sin `IZQUIERDA` ni la columna fija (y sin el ajuste de `row-span` de `pestanas-del-resultado-por-tipo`).
- `ConservaloAlCorregir` se mueve al panel `mejorar` de `ResultadoDelAnalisis`, como primer bloque, con el título «Lo que ya funciona».

**D8. El espejo con estado incompleto.**
- `EspejoDelATS` agrega el caso incompleto: punto ámbar (`bg-progreso-fondo text-progreso-texto`), icono `mejora`, el valor extraído y debajo la nota en cursiva, y un `sr-only` «, incompleto».

## Risks / Trade-offs

- **[Riesgo] Cambia lo que un CV «es».** Un CV con texto oculto o tablas, pero con todos los datos completos, pasa de «Con pérdidas» a «Legible». → **Mitigación:** esos errores siguen en «Formato» y en Plan de Mejora. El estado mide qué datos pierde el reclutador, que es la tesis del módulo.
- **[Riesgo] Copias de la regla en dos lenguajes.** → **Mitigación:** cada lado tiene tests con los mismos casos, y `HistorialTest` compara el backend con lo que espera el frontend.
- **[Supuesto] «Contacto» = Nombre, Correo y Teléfono.** Si el usuario prefiere que el teléfono no sea clave, basta con cambiar `CAMPOS_CLAVE` en los dos lados.
- **[Trade-off] Los análisis anteriores muestran dos estados** hasta que se vuelve a subir el CV. Es la política de versiones de reglas de siempre.
