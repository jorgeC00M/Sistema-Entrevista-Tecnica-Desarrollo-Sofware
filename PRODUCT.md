# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Estudiantes (usuario principal):** egresados y estudiantes de últimos semestres de Ingeniería de Sistemas en Bolivia que se preparan para su primera entrevista técnica de desarrollo de software y para postular a un empleo. Practican solos, sin agendar con nadie, cuantas veces quieran, a menudo desde el celular.
- **Docentes y tutores (audiencia secundaria):** quieren ver cómo progresan sus estudiantes. **Decisión abierta:** hoy no existe un rol docente ni una vista para docentes en el sistema; cada usuario solo ve sus propios datos.

## Product Purpose

Antesala simula una entrevista técnica para el puesto al que postula el estudiante y le dice qué mejorar, antes de la evaluación real. También revisa su CV contra lo que realmente hace un ATS. Es un Proyecto de Grado de Ingeniería de Sistemas (Universidad Mayor de San Simón).

El éxito es que el estudiante llegue a la entrevista real habiendo practicado, sabiendo en qué temas falla y con un CV que los filtros automáticos sí pueden leer.

## Positioning

- **La entrevista se elige por puesto, no por tema:** backend, frontend o full stack, más el nivel y, opcionalmente, una tecnología. Un plan fijo por puesto decide el área de cada una de las 5 preguntas, así que la entrevista es reproducible y explicable.
- **Es adaptativa:** las dos primeras preguntas son de calentamiento; desde la tercera, el entrevistador ajusta la exigencia según las respuestas anteriores.
- **Evaluación con rúbrica fija** (corrección técnica, completitud, claridad), de 0 a 100. El evaluador no ve el historial: cada respuesta se califica sola.
- **La nota no se publica hasta terminar**, como en una entrevista real.
- **El módulo de CV no inventa un puntaje.** Los ATS reales no puntúan: filtran. El módulo muestra qué datos extrae el sistema del CV y qué hace que el reclutador no lo encuentre. Las métricas son conteos ("5/8", "4/6"), nunca un porcentaje ni una nota sobre 100.
- **El código mide y la IA solo sugiere.** Todo hallazgo del CV sale de medir el documento. La IA propone cómo redactarlo, siempre rotulado como sugerencia, y nunca cambia un veredicto.

## Operating Context

- **Flujo de la entrevista:** el estudiante elige puesto y nivel → responde 5 preguntas por escrito en un chat, a su ritmo, y puede retomarla después → al terminar ve los resultados → con el tiempo consulta su historial, sus estadísticas por tema y la retroalimentación acumulada.
- **Flujo del CV:** sube su CV en PDF o DOCX, opcionalmente con la convocatoria de trabajo (pegada o como archivo) → ve la ficha que armaría el ATS, qué corregir, qué conservar, el mapa de requisitos frente a la convocatoria y las sugerencias de IA → puede ir a practicar la entrevista del puesto sugerido.
- **Acceso:** registro con correo y contraseña, o con Google.
- **Idioma:** español.

## Capabilities and Constraints

- Las respuestas de la entrevista son **solo por escrito**. Se evaluó responder por voz y se descartó: el dictado no funciona en todos los navegadores y en Chrome envía el audio a terceros.
- **Presupuesto cero:** se despliega en planes gratuitos (Render), que se suspenden con la inactividad y tienen disco efímero.
- **El archivo del CV nunca se guarda:** solo el texto extraído y el análisis. El CV de una persona real no sale entero hacia la IA; solo se envían secciones con los datos personales tapados.
- **La IA puede fallar o tardar.** Cuando no está disponible, el diagnóstico del CV llega igual y las sugerencias se marcan como "no disponibles".
- **Terminología del dominio:** puesto, nivel, tecnología, área técnica, intercambio (pregunta + respuesta), evaluación, banda de puntaje, convocatoria, hallazgo, ficha del ATS, mapa de evidencia (demostrado / declarado / ausente).
- **Decisión abierta:** la vista para docentes (ver Users).

## Brand Commitments

- **Nombre: Antesala.** Elegido por el usuario. **Pendiente:** el código todavía muestra "Entrevistas Técnicas" en la landing, el menú y el pie de página.
- **Tono:** honesto sobre lo que la herramienta hace y no hace. La evaluación la genera una IA y no sustituye el criterio de un entrevistador humano: se dice donde se lee, no se esconde.
- **Recursos propios:** de una maqueta o diseño externo se adopta el aspecto, nunca sus logos, imágenes ni dependencias.

## Evidence on Hand

- Documento del perfil de tesis: `docs/Copia de Copia de PerfilJorgeV3.docx.md` (objetivos, alcance y modelo de datos).
- Proyecto de Grado de Ingeniería de Sistemas, Universidad Mayor de San Simón.
- **No hay** testimonios, usuarios reales, cifras de uso, clientes ni prensa. No deben inventarse en ninguna superficie.

## Product Principles

1. **Decir solo lo que el sistema hace.** Toda afirmación de cualquier pantalla se tiene que poder señalar en el sistema.
2. **Medir antes que opinar.** Lo que se puede medir lo mide el código; la IA solo sugiere, y siempre rotulada.
3. **Ningún puntaje sin respaldo.** No mostrar una cifra que no se pueda explicar regla por regla.
4. **Funcionar para todos.** Ninguna función debe dejar fuera a un navegador o a un dispositivo; lo que no esté en todos se ofrece solo donde funciona, sin cambiar la evaluación.
5. **Proteger los datos de una persona real.** Mínimo necesario, nada de archivos guardados, nada de datos personales hacia terceros.

## Accessibility & Inclusion

- **WCAG 2.1 AA** como mínimo obligatorio: contraste, navegación con teclado y lectores de pantalla.
- **Uso desde el celular:** toda función tiene que funcionar completa en pantallas pequeñas.
- **Conexiones lentas:** páginas livianas, sin recursos pesados; debe cargar bien con internet móvil.
- Respetar la preferencia de "reducir movimiento" del sistema operativo.
