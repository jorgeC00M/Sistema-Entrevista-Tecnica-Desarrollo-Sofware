## 1. Capítulo I: Introducción

- [x] 1.1 **1.1 Antecedentes.**
  - Marcar `[VERIFICAR]` las cifras de LinkedIn y del Foro Económico Mundial, y corregir la del FEM: 97 millones es del informe de 2020 y tenía como horizonte 2025.
  - Ajustar la frase sobre Interviewing.io.
  - Agregar la tabla «Sistemas similares»: LeetCode, HackerRank, Interviewing.io, Pramp y este sistema, con las columnas español, gratuito, conversacional, retroalimentación por criterio y análisis de CV.
- [x] 1.2 **1.2 Análisis del problema.** Dejar el lugar y el pie de la figura «Árbol de problemas» y entregar su código en `docs/diagramas/arbol-de-problemas`. Corregir la gramática de 1.2.1.
- [x] 1.3 **1.3 Objetivos.** Solo ortografía: el doble espacio del objetivo 2.
- [x] 1.4 **1.5 Alcance.**
  - Reescribir las viñetas de público, puesto/tecnología/nivel, niveles, evaluación, retroalimentación e historial.
  - Agregar las viñetas de 5 preguntas, abandono, convocatoria, análisis de CV y acceso con Google.
  - Ajustar las limitaciones: acotar la del nivel avanzado y agregar «sin puntaje ATS» y «no se almacena el archivo del CV».
  - Contrastar cada viñeta con el código.
- [ ] 1.5 **1.6 Justificación.**
  - Técnica: agregar la rúbrica y el análisis de CV.
  - Económica: tabla de costos, con los montos que confirme el usuario.
- [x] 1.6 **Revisión del usuario.** No se pasa al capítulo II sin su aprobación.

## 2. Capítulo II: Marco teórico

- [x] 2.1 **2.1 Área de conocimiento.**
  - Completar la lista de 2.1.2.
  - Fundir los dos párrafos de 2.1.5.
  - Aclarar en 2.1.6 que el sistema no entrena modelos.
- [x] 2.2 **Nueva 2.1.8, evaluación con rúbrica analítica (LLM como evaluador).**
  - Texto con referencias marcadas `[VERIFICAR]`.
  - Tabla de criterios × niveles 0–4 y la fórmula, tomadas de `rubricas.py` y `evaluador.py`.
- [x] 2.3 **Nueva 2.1.9, sistemas ATS.** Texto con fuentes `[VERIFICAR]`, aportadas por el usuario.
- [x] 2.4 **2.2 Metodología.** Corregir el título de la Tabla 1. Opcional: la figura del ciclo incremental con los incrementos reales.
- [x] 2.5 **2.3 Plataforma.**
  - Corregir los pies de las Figuras 1 y 2, o reemplazarlas por la figura de la arquitectura (código en `docs/diagramas/arquitectura`).
  - Mencionar TypeScript, Vite, Tailwind, Django REST Framework y JWT.
- [x] 2.6 **2.4 Gestión de datos.**
  - Definir PostgreSQL primero.
  - Agregar la tabla PostgreSQL vs. MongoDB.
  - Mencionar `jsonb`.
- [x] 2.7 **2.5 Herramientas.**
  - Corregir en 2.5.4 lo del contexto multi-turno (el sistema envía un resumen comprimido) y lo de las métricas (la nota la calcula el sistema).
  - Agregar el análisis de convocatoria y las sugerencias de CV con los datos enmascarados.
  - Nombrar Claude Haiku 4.5 y corregir la cita «(Anthropic ,023)».
  - Preguntar por 2.5.5 «Despliegue».
  - Unificar las referencias de Pressman, Sommerville y Manning.
- [x] 2.8 **Revisión del usuario.**

## 3. Capítulo III: Área de aplicación

- [x] 3.1 **3.1 Antecedentes.** Marcar `[VERIFICAR]` las cifras del FEM 2025, la OIT 2023 y el INE 2023.
- [x] 3.2 **3.2 Definiciones.**
  - Corregir 3.2.6, 3.2.7, 3.2.8, 3.2.9 y 3.2.12.
  - Agregar Puesto, Nivel, Rúbrica analítica, Convocatoria y Sistema ATS.
- [x] 3.3 **3.3 Procesos.**
  - Entregar el código de los diagramas en `docs/diagramas/`: flujo general, secuencia de una entrevista y flujo del análisis de CV.
  - Actualizar los títulos y la introducción de 3.3, y agregar 3.3.3.
- [x] 3.4 **3.4.1 Estructura de datos.**
  - Quitar el párrafo «kardex» duplicado.
  - Actualizar las tablas Usuario, Entrevista, Intercambio y Evaluación según los modelos.
  - Agregar las tablas de los catálogos (Puesto, Tecnología, Nivel y Área), Convocatoria, Currículum y Análisis ATS.
  - Agregar el diagrama entidad-relación (código en `docs/diagramas/entidad-relacion`).
- [x] 3.5 **3.4.2 Formularios.** Dejar para cada formulario el lugar de la captura con su pie, y una tabla de campo, tipo, si es obligatorio y su validación, tomada del código de cada pantalla. Formularios: Registro, Inicio de sesión, Nueva entrevista, chat, Resultados, Historial, Retroalimentación, Mi CV y Mi perfil.
- [x] 3.6 **Índices de tablas y figuras.** Numeración correlativa.
- [ ] 3.7 **Revisión del usuario y validación.** Ejecutar `openspec validate actualizar-perfil-capitulos-1-a-3`.
- [ ] 3.8 No hagas commit. El usuario lo hará tras revisar.
