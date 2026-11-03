## Context

Lo que hay hoy, comprobado en el código:
- **`convocatoria.partir()`** separa el aviso en bloques obligatorio y deseable por sus títulos. Del bloque obligatorio lee `anos_requeridos` y, de todo el texto, el cargo.
- **`brecha.calcular()`** arma `Brecha` con los grupos, `extras`, `separada`, `con_evidencia`, `experiencia`, `cargo` e `idioma_distinto`. Se guarda como JSON en `AnalisisATS.brecha`.
- **`secciones.py`** reconoce experiencia, educación, habilidades y proyectos. No reconoce idiomas.
- **`ubicaciones.encontrar()`** ya detecta las ciudades para el campo Ubicación del espejo.
- **`terminos.TERMINOS`** tiene unos 105 términos, con `_patron` que pone límites de palabra en los extremos alfanuméricos.
- **`VERSION_DE_REGLAS = 4`** en `ats.py`.

## Goals / Non-Goals

**Goals:**
- Informar los tres filtros que un reclutador boliviano aplica más, sin afirmar nunca un rechazo.
- Reconocer las herramientas que más se pierden hoy.

**Non-Goals:**
- Usar IA para extraer requisitos: la medición sigue siendo literal y reproducible.
- Filtros salariales, de edad o de género. No se miden, y algunos serían discriminatorios.
- Normalizar todas las carreras de Bolivia: se reconoce la familia de sistemas e informática y su estado.

## Decisions

**D1. Un módulo `filtros.py` con una función por filtro**, como el registro de `ats.py`. Cada filtro tiene dos partes:
- **Leer:** `leer_<filtro>(texto_obligatorio) -> Pedido | None`. Devuelve `None` cuando no se reconoce el filtro, y entonces no se informa.
- **Comprobar:** `comprobar_<filtro>(pedido, cv, bloques) -> Filtro(tipo, pedido, estado, nota)`.

Agregar un filtro es agregar dos funciones y una entrada del registro.

**D2. Título.**
- **En el aviso:** se busca una palabra de grado (`titulado`, `licenciado`, `licenciatura`, `ingeniero`, `bachiller en`, `egresado`) **en la misma línea** que una carrera reconocida (sistemas, informática, software, computación, telecomunicaciones o «afines»). Exigir los dos en la misma línea evita tomar «ingeniería de software» como materia.
- **En el CV:** solo en el bloque `educacion` de `segmentar()`. Estado detectado: titulado o licenciado, egresado, o estudiante («cursando», «semestre», un año futuro).
- **Correspondencia:**
  - se pide titulado y el CV dice titulado → `cumple`;
  - se pide titulado y el CV dice egresado o estudiante → `no_verificable`, con la nota «el aviso pide título; tu CV dice egresado»;
  - no hay bloque de educación, o no se nombra la carrera → `no_aparece`;
  - se pide «egresado» y el CV dice titulado o egresado → `cumple`.
- **Por qué `no_verificable` y no «no cumple»:** el CV puede estar desactualizado, o el aviso puede aceptar «afines». El consejo útil es aclararlo en el CV.

**D3. Idioma.**
- **En el aviso:** se reconocen inglés, portugués y francés, y un nivel. Los niveles se normalizan a una escala: básico = A1/A2, intermedio = B1/B2, avanzado o fluido = C1/C2, nativo.
- **En el CV:** primero el bloque `idiomas` (sección nueva en `secciones.py`: «idiomas», «languages»); si no existe, todo el texto.
  - **Si el idioma aparece con un nivel:** `cumple` si el nivel alcanza al pedido; si no, `no_verificable`, con la nota del nivel.
  - **Si aparece sin nivel:** `no_verificable` («menciona inglés sin nivel»).
  - **Si no aparece:** `no_aparece`.
- **Contra falsos positivos:** el CV de un candidato que escribe en inglés no cuenta como «menciona inglés». Se busca la palabra del idioma, no se detecta el idioma del texto.

**D4. Ubicación y modalidad.**
- **En el aviso:** una ciudad que reconoce `ubicaciones.encontrar()` cerca de «presencial», «híbrido», «en oficina» o «ubicado en»; o «remoto» o «teletrabajo».
- **Si el aviso es remoto:** el filtro no se informa, porque no excluye a nadie.
- **Si es presencial o híbrido con ciudad:**
  - ubicación del CV igual a la ciudad → `cumple`;
  - otra ciudad → `no_verificable`, con la nota «tu CV dice La Paz; el puesto es en Cochabamba», porque el candidato puede mudarse;
  - sin ubicación detectada → `no_aparece`.

**D5. Los filtros viven en `Brecha.filtros: tuple[Filtro, ...]`**, fuera de los grupos, como `experiencia`. Así:
- la cobertura «4/6» sigue contando solo las tecnologías;
- el JSON guardado solo agrega una clave;
- el frontend tolera su ausencia, porque los análisis de la versión 4 no la tienen hasta recalcularse.

**D6. Diccionario.** Se agregan entradas a `TERMINOS` con variantes reales («power bi», «powerbi»; «sap», «sap erp», «sap hana»; «jira»; «figma»; «linux», «ubuntu»; «tableau»; «excel avanzado», «excel»). Cada entrada lleva un test de verdadero positivo y otro de falso positivo. Los términos de 2 o 3 letras siguen la regla existente: solo con una variante inequívoca.

**D7. `VERSION_DE_REGLAS = 5`.** Lo exige la regla de CLAUDE.md: cambian `analizar()` y `brecha.calcular()`. El recálculo en el sitio (`update_or_create`) ya existe y reinicia `revision_ia`.

## Risks / Trade-offs

- **[Falsos negativos en el título por cómo se escribe la carrera]** → Se informa `no_aparece` y no «no cumples». Es un consejo («escribe tu carrera completa»), no un rechazo. La lista de carreras se puede ampliar.
- **[Un aviso con requisitos en prosa sin títulos]** → Todo cae en obligatorias, igual que hoy. Exigir grado y carrera en la misma línea reduce el ruido.
- **[Los niveles de idioma se escriben de muchas formas]** → Si no se reconoce el nivel, el resultado es `no_verificable`, nunca `cumple`.
- **[Recalcular cambia análisis viejos]** → Es lo esperado: la versión existe justamente para eso.
