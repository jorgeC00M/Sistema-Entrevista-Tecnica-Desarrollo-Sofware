## Context

Ver `proposal.md`, en «Why». El documento fuente es `docs/Copia de Copia de PerfilJorgeV3.docx.md`, una exportación del Word.
- Las imágenes van incrustadas en base64 al final del archivo: nunca se reescriben.
- Lo que el sistema hace se toma de los modelos, de `PLAN_POR_PUESTO`, de `rubricas.py`, de `apps/catalogos/datos.py` y de CLAUDE.md, no de la memoria.

## Goals / Non-Goals

**Goals:**
- Que cada sección de los capítulos I a III diga lo que el sistema hace hoy, y nada más.
- Indicar en cada sección si basta con texto o conviene una tabla o una imagen, y por qué.
- Avanzar capítulo por capítulo, con revisión del usuario entre uno y otro.

**Non-Goals:**
- Cambiar los objetivos (decisión del usuario).
- Escribir los capítulos IV en adelante.
- Generar capturas de pantalla, que las toma el usuario.
- Mencionar proveedores de IA distintos de Claude.
- Tocar código.

## Decisions

**D1. Se edita la copia en Markdown, no el Word.** El usuario traslada los cambios. Cada capítulo se cierra con su revisión antes de seguir con el siguiente.

**D2. Diagramas como código.** Se entregan en PlantUML o Mermaid, en `docs/diagramas/`, y el usuario exporta la imagen. Así son reproducibles y se pueden corregir sin un editor gráfico.

**D3. Las cifras externas no se inventan.** Si una cifra o cita no puede verificarse, se marca `[VERIFICAR]` en el texto para que el usuario la confirme con la fuente. Por ejemplo: LinkedIn 2024; el Foro Económico Mundial 2024 y 2025; la OIT; el INE; las referencias de G-Eval, Prometheus y ATS.

**D4. Las decisiones aprobadas el 21-10-2026** están en `proposal.md`. Todo lo demás es corrección de hecho frente al código.

### Guía por capítulo

### CAPÍTULO I. Introducción

**1.1 Antecedentes (texto + 1 tabla)**
- **Verificar las cifras y citarlas en Referencias:**
  - «LinkedIn 2024: 62% de los reclutadores».
  - «Foro Económico Mundial 2024: 97 millones de empleos para 2027 y 44% de habilidades obsoletas». La cifra de 97 millones es del informe de 2020 y tenía como horizonte 2025; el 44% es del informe de 2023. Hay que corregir el año o el dato.
- **Interviewing.io:** se apoya sobre todo en ingenieros humanos. Conviene ajustar la frase a lo que ofrece hoy.
- **Agregar una tabla «Sistemas similares»** con estas columnas: idioma español, gratuito, conversacional, retroalimentación por criterio, análisis de CV.
  - Filas: LeetCode, HackerRank, Interviewing.io, Pramp y este sistema.
  - **Por qué:** muestra en un vistazo el vacío que llena el proyecto. Hoy ese vacío solo se afirma en prosa.

**1.2 Análisis del problema (texto + 1 figura)**
- Agregar un **árbol de problemas** (causas → problema → efectos), de elaboración propia.
- **Por qué:** es la figura que se espera en un perfil de la UMSS. Además ordena las causas que hoy están dispersas en tres párrafos: falta de práctica, herramientas en inglés o de pago, ausencia de un componente conversacional.

**1.2.1 Definición del problema (solo texto)**
- Gramática: «La ausencia de **un** sistema web que **simule**…».

**1.3 Objetivos (sin cambios, por decisión)**
- Solo una revisión ortográfica: en el objetivo 2 hay un doble espacio en «áreas  para».

**1.4 Área de conocimiento:** sin cambios.

**1.5 Alcance (solo texto: es la sección con más cambios)**

Viñetas que **se reescriben**:
- **Cochabamba y UMSS:** «Orientado a egresados de Ingeniería de Sistemas de la UMSS (Cochabamba), público del piloto.» Se quitan «solamente» y «exclusivamente».
- **Selección de áreas:** «Módulo de selección de **puesto** (Frontend, Backend, Full Stack, Móvil, Escritorio, QA y Desarrollo de Videojuegos), **tecnología** del puesto y **nivel**. Cada puesto abarca varias áreas técnicas (programación, bases de datos o estructuras de datos, desarrollo web…), una por pregunta.»
- **Niveles:** «Niveles Junior (inicial), Semi-Senior (intermedio) y Senior (avanzado).»
- **Evaluación:** cada respuesta se califica con una **rúbrica de tres criterios**: corrección, completitud y claridad.
  - La IA elige un nivel de 0 a 4 en cada criterio, y el sistema calcula la nota de 0 a 100.
  - La nota se muestra al finalizar la entrevista.
- **Retroalimentación:** fortalezas, debilidades, sugerencias y los puntos clave que una respuesta completa debía cubrir, además de una retroalimentación acumulada.
- **Historial:** gráfico de evolución por puesto y nivel.

Viñetas que **se agregan**:
- **Entrevistas de 5 preguntas:** las dos primeras se generan juntas, y las siguientes se adaptan al desempeño.
- **Abandono:** se puede abandonar una entrevista, y entonces se obtiene una nota parcial.
- **Convocatoria:** se puede iniciar una entrevista desde una convocatoria pegada como texto o subida en PDF o DOCX, para orientar las preguntas a sus requisitos.
- **Análisis de CV:** el CV (PDF o DOCX) se analiza frente a filtros ATS.
  - Muestra qué campos lee un ATS y qué corregir, y opcionalmente lo compara con una convocatoria.
  - La IA solo sugiere mejoras.
- **Acceso:** registro e inicio de sesión con correo y contraseña o con una cuenta de Google.

Limitaciones que **se reescriben o agregan**:
- **Nivel avanzado:** la viñeta se elimina, o se acota a «No se incluyen ejercicios de codificación en vivo ni de pizarra». Recomiendo acotarla, porque es una limitación real y defendible.
- **Puntaje ATS:** el análisis de CV no asigna un puntaje ATS ni garantiza pasar el filtro de una empresa concreta.
- **Archivo del CV:** no se almacena. Solo se guarda el texto extraído y el análisis.

**1.6 Justificación (texto + 1 tabla opcional)**
- **Técnica:** sumar la rúbrica analítica (una nota reproducible y explicable) y el análisis de CV sin IA en la medición.
- **Económica:** agregar una pequeña **tabla de costos** con hosting gratuito, base de datos gratuita y la API de Claude (carga única de unos USD 5 a 10 para el piloto).
  - **Por qué:** «reduce costos» sin cifras no convence. Hay que confirmar los montos con Jorge al aplicar.
- **Social y académica:** sin cambios de fondo.

---

### CAPÍTULO II. Marco teórico

**2.1.2 Agentes conversacionales (texto):** la frase termina en «para:» y la lista no aparece. Hay que completarla: generar preguntas, mantener el hilo de la entrevista y adaptarse a las respuestas.

**2.1.5 Inteligencia Artificial (texto):** los dos párrafos dicen lo mismo. Hay que fundirlos en uno.

**2.1.6 Características (texto):** aclarar que el «aprendizaje continuo» es propio del modelo. **El sistema no entrena ningún modelo**, como dice el Alcance.

**Sección nueva 2.1.8 «Evaluación con rúbrica analítica y LLM como evaluador» (texto + 1 tabla)**
- **Por qué:** es la decisión técnica más defendible del sistema («¿de dónde sale el 74?») y hoy no tiene sustento teórico.
- **Referencias sugeridas** (Jorge debe verificarlas):
  - Liu et al. (2023), *G-Eval*;
  - Kim et al. (2024), *Prometheus*;
  - Zheng et al. (2023), *Judging LLM-as-a-judge*.
- **Tabla:** criterios × niveles 0–4, con la fórmula P = 100·(n₁+n₂+n₃)/12.

**Sección nueva 2.1.9 «Sistemas de seguimiento de candidatos (ATS)» (texto)**
- **Por qué:** el Alcance ahora incluye el análisis de CV. Hace falta explicar qué es un ATS y que no rechaza automáticamente por puntaje, sino que el problema es que el candidato no aparece en la búsqueda del reclutador.
- **Pendiente:** Jorge debe aportar las fuentes (documentación de Workday, Taleo o Greenhouse).

**2.2 Metodología (corrección en la tabla)**
- La Tabla 1 se titula «metodologías ágiles», pero el modelo Incremental no es ágil. Debe ser «Cuadro comparativo de metodologías de desarrollo».
- Opcional: en 2.2.3, una **figura del ciclo incremental** con los incrementos reales: catálogo y selección, entrevista, evaluación, historial, CV y convocatoria.

**2.3 Plataforma (corregir figuras + texto)**
- La Figura 1 y la Figura 2 tienen el pie «Cuadro comparativo entre metodologías ágiles», copiado de la tabla. Deben decir «Logotipo de React» y «Logotipo de Django», o reemplazarse por una **figura de la arquitectura**: React ↔ API REST (Django REST Framework) ↔ PostgreSQL, y Django ↔ API de Claude.
- Mencionar **TypeScript**, Vite y Tailwind en el frontend, y JWT y Django REST Framework en el backend. Es lo que se usa de verdad.

**2.4 Gestión de datos (reestructurar + 1 tabla)**
- 2.4.1 define **solo MongoDB**, pero el sistema usa PostgreSQL. Debe definir PostgreSQL primero.
- En 2.4.3, convertir la comparación en una **tabla PostgreSQL vs. MongoDB**: modelo, integridad referencial, transacciones, integración con Django y JSON.
- Mencionar que PostgreSQL guarda la evaluación en `jsonb`: tiene lo mejor de ambos mundos, y es un buen argumento.

**2.5 Herramientas (texto)**
- **2.5.4 API de Claude.** Hay que corregir tres cosas:
  - «mantener el contexto de la conversación multi-turno»: el sistema envía **un resumen comprimido** (tema y nota de cada pregunta previa), nunca el historial completo, y el evaluador no recibe historial;
  - «métricas de desempeño»: la IA elige niveles de la rúbrica y el sistema calcula la nota;
  - además, Claude analiza convocatorias y sugiere mejoras al CV, siempre con los datos personales enmascarados.
- **Modelo:** nombrar Claude Haiku 4.5.
- **Corregir la cita** «(Anthropic ,023)».
- **Opcional 2.5.5 «Despliegue»:** Render, si se usa en el piloto.
- **Referencias inconsistentes:** Pressman 2010 frente a Pressman & Maxim 2020, Sommerville 2011 frente a 2019, y Manning & Schütze 1999 frente a Manning et al. 2023. Hay que unificarlas.

---

### CAPÍTULO III. Área de aplicación

**3.1 Antecedentes (texto):** verificar las cifras del Foro Económico Mundial 2025, la OIT 2023 y el INE 2023, y que estén en Referencias.

**3.2 Definiciones (texto)**
- **3.2.6:** quitar «problemas de codificación». El sistema es conversacional, no ejecuta código.
- **3.2.7:** las «restricciones de tiempo» no existen. Hay un cronómetro informativo y el sistema registra el tiempo de respuesta, sin límite.
- **3.2.8:** la evaluación ocurre después de cada respuesta, pero **se muestra al final**.
- **3.2.9:** cambiar «áreas» por «puestos que abarcan áreas».
- **3.2.12:** Claude **no asigna la puntuación**. Elige un nivel por criterio y el sistema la calcula.
- **Definiciones nuevas, cortas:** Puesto, Nivel, Rúbrica analítica, Convocatoria y Sistema ATS.

**3.3 Procesos (imágenes: rehacer y agregar)**
- **3.3.1 Diagrama de flujo general:** rehacerlo.
  - Pasos: login (correo o Google) → Nueva entrevista (Personalizada o Con convocatoria) → confirmar → preguntas 1 y 2 → responder → evaluar → siguiente pregunta, abandonar o finalizar → resultados → historial y retroalimentación.
- **3.3.2 Diagrama de secuencia:** rehacerlo.
  - Debe mostrar Frontend → API → servicio → IA, con las dos primeras preguntas en una sola llamada y la evaluación de cada respuesta.
  - La nota no vuelve al frontend hasta que la entrevista termina.
- **Nuevo 3.3.3, diagrama de flujo del análisis de CV:** subir → extraer el texto → medir sin IA → mostrar el diagnóstico → pedir sugerencias a la IA con los datos enmascarados.
- **Por qué imágenes:** un flujo se entiende mejor dibujado. Además, los diagramas actuales describen un sistema que ya no existe.
- Se entrega el código PlantUML o Mermaid de los tres.

**3.4 Documentación (texto + tablas + 1 figura)**
- El párrafo «kardex» está repetido en la introducción de 3.4 y en 3.4.1. Hay que dejarlo una sola vez.
- **Agregar un diagrama entidad-relación** (figura).
  - **Por qué:** con 10 tablas, la imagen muestra las relaciones que las tablas sueltas no muestran.
- **Actualizar las tablas existentes:**
  - **Usuario:** `contraseña` puede estar vacía en las cuentas de Google, y `fecha_registro` y `ultimo_acceso` corresponden a `date_joined` y `last_login` (basta una nota).
  - **Entrevista:**
    - quitar `area_tecnica` y agregar `puesto` (FK), `tecnologia` (FK), `segunda_tecnologia` (FK, solo Full Stack), `nivel` (FK) y `convocatoria` (FK, opcional);
    - corregir la descripción de `id_entrevista`, que dice «del usuario».
  - **Intercambio:**
    - agregar `numero`, `area` (FK), `creado_en` y `respondido_en`, en lugar de `timestamp`;
    - indicar que `tiempo_respuesta` está en segundos.
  - **Evaluación:**
    - `puntuacion` la calcula el sistema;
    - agregar `proveedor_ia`, `modelo_ia` y `creado_en`;
    - `evaluacion_json` guarda los niveles, los pesos, la versión de la rúbrica y los puntos clave.
- **Tablas nuevas:** Puesto, Tecnología, Nivel, Área (catálogos), Convocatoria, Currículum y Análisis ATS.

**3.4.2 Formularios (imágenes + 1 tabla por formulario)**
- Hoy solo hay viñetas vacías. Para cada formulario, poner una **captura de pantalla** con su pie y una tabla corta con campo, tipo, si es obligatorio y su validación.
- Formularios: Registro, Inicio de sesión (con Google), **Nueva entrevista** (reemplaza a «selección de Área», con sus pestañas Personalizada y Con convocatoria), Respuesta en el chat, Resultados, Historial y progreso, Retroalimentación, Mi CV y Mi perfil (cambio de contraseña).
- **Por qué:** la sección se titula «formularios». Sin capturas no documenta nada, y las tablas de campos prueban las validaciones.

**Índices:** actualizar el índice de tablas y el de figuras, con numeración correlativa.

## Risks / Trade-offs

- **[El Alcance crece]** → Se compensa con limitaciones explícitas: sin codificación en vivo, sin puntaje ATS, sin almacenar el archivo del CV. Un Alcance más largo pero exacto se defiende mejor que uno corto que el sistema contradice.
- **[El nivel avanzado contradice el perfil aprobado]** → El usuario lo aprobó. Puede requerir avisar al tutor, porque el perfil firmado decía «básico e intermedio».
- **[Montos de la tabla de costos]** → Hay que confirmarlos con el usuario al aplicar el capítulo I. No se inventan.

## Open Questions

- ¿El piloto se despliega en Render? Decide si existe la sección 2.5.5 «Despliegue». Se pregunta al aplicar el capítulo II y no cambia el resto.
