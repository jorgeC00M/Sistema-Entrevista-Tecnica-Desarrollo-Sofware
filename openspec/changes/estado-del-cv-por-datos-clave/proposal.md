## Why

Hoy el veredicto del CV sale de la gravedad de los hallazgos. Es crítico si alguno impide la lectura y tiene pérdidas si falta un dato o hay un hallazgo alto. Cada dato de la ficha solo puede estar extraído o no extraído. Eso deja dos huecos:
- **No se distingue un dato que el ATS leyó a medias** de uno bien leído. Por ejemplo, la experiencia con fechas que mezclan formatos, o las habilidades en parte dentro de gráficos.
- **El estado no dice qué perdió el reclutador.** No es lo mismo perder el correo que perder la ciudad.

Además, el Resumen reparte la respuesta en dos columnas: el banner a la izquierda y «Lo que debes hacer» a la derecha.

Jorge propuso un estado derivado de los **datos clave** (contacto, experiencia y habilidades) y una pestaña de una sola columna con el banner como protagonista. Aprobó cuatro decisiones:
- «incompleto» es una regla medida en el backend;
- si falta un dato que no es clave, el CV queda «Legible con pérdidas»;
- los errores del banner enlazan a su corrección y lo que ya funciona pasa a Plan de Mejora;
- los estados nuevos valen en todas partes: los dos Resúmenes y el historial.

## What Changes

- **Tres estados por dato:** extraído, incompleto o no extraído.
  - «Incompleto» lo marca el backend sobre hallazgos que ya existen, sin detecciones nuevas:
    - la experiencia, si las fechas mezclan formatos;
    - experiencia, educación y habilidades, si el CV está a dos columnas.

    «Habilidades en gráficos» no cuenta: solo se detecta cuando las habilidades ya no se extrajeron.
  - Cada dato incompleto lleva una nota que dice por qué.
  - **BREAKING** de la medición: `VERSION_DE_REGLAS` pasa de 7 a 8, así que un CV que se vuelve a subir se recalcula.
- **Datos clave:** Nombre, Correo y Teléfono (el contacto), Experiencia y Habilidades.
- **Un estado del CV derivado por función, no escrito a mano.** **BREAKING:** reemplaza Ilegible / Con pérdidas / Completo.
  - **Pérdidas importantes:** al menos un dato clave no se pudo extraer.
  - **Legible con pérdidas:** los datos clave se extrajeron, pero al menos un dato quedó incompleto o falta un dato que no es clave.
  - **Legible:** todos los datos se extrajeron completos.

  La misma regla está en el backend (historial) y en el frontend (Resumen), con un test en cada lado.
- **Banner del estado:**
  - **Dona de tres tramos** (extraídos, incompletos, no extraídos):
    - en el centro, «8 datos revisados», nunca una fracción;
    - debajo, una leyenda con la cantidad de cada estado;
    - el lector de pantalla oye una frase con las cantidades.
  - **A la derecha:**
    - la etiqueta del estado con su icono, el título y la regla que lo activó;
    - «Formato», donde cada error enlaza a su corrección en Plan de Mejora;
    - debajo, «Ver el plan de mejora».
- **El Resumen pasa a una sola columna a ancho completo,** en el general y en el dirigido. Lleva:
  - la línea de match, solo en el dirigido;
  - el banner;
  - el espejo, que muestra también el estado «incompleto» con su nota;
  - las tecnologías, solo en el general;
  - la práctica.

  Se quitan del Resumen «Lo que debes hacer» y «Consérvalo al corregir».
- **Plan de Mejora** abre con «Lo que ya funciona» (lo que antes era «Consérvalo al corregir»).
- **Código muerto:** se borra `LoQueDebesHacer.tsx`.

## Capabilities

### New Capabilities
- `revision-de-cv`: el estado por dato, el estado del CV por datos clave, el banner y el Resumen en una columna. Aún no tiene spec principal, así que la delta es ADDED, como en los cambios anteriores.

### Modified Capabilities

## Impact

- **Backend:**
  - `integrations/documentos/ats.py`: `Campo.incompleto`, `_marcar_incompletos`, `CAMPOS_CLAVE`, `estado_del_cv` y `VERSION_DE_REGLAS = 8`;
  - en `apps/curriculums/`: `models.py` (`AnalisisATS.veredicto`) y `serializers.py` (`CampoSerializer.incompleto`);
  - los tests de `ats.py` y de `curriculums`.
- **Frontend:**
  - `types/curriculum.ts`;
  - `features/curriculum/hallazgos.ts` y su test;
  - en `features/curriculum/components/`: `VeredictoDeLegibilidad`, `EspejoDelATS`, `ResumenDelAnalisis`, `ResultadoDelAnalisis` y `HistorialDeAnalisis`, y se borra `LoQueDebesHacer`.
- **API:**
  - cada campo publica `incompleto`;
  - el `veredicto` del historial cambia de valores (`perdidas_importantes`, `legible_con_perdidas` o `legible`).

  El frontend se actualiza a la par.
- **Specs sin archivar que se ajustan:** `veredicto-con-dona`, `diferenciar-revision-y-comparacion-de-cv`, `tipo-de-analisis-e-historial-en-tabla`, `resumen-en-dos-columnas-y-ejemplos` y `pestanas-del-resultado-por-tipo`.
- **Documentación:** `CLAUDE.md`.
- **Sin cambios** en la revisión con IA, en los prompts ni en la entrada.
