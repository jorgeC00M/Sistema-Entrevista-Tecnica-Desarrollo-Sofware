UNIVERSIDAD MAYOR DE SAN SIMÓN

FACULTAD DE CIENCIAS Y TECNOLOGÍA

CARRERA DE INGENIERÍA DE SISTEMAS

 

|  SISTEMA WEB DE SIMULACIÓN DE ENTREVISTAS TÉCNICAS, PARA EVALUAR EL NIVEL DE COMPETENCIAS DE DESARROLLO DE SOFTWARE DE ESTUDIANTES EGRESADOS DE INGENIERÍA DE SISTEMAS, MEDIANTE EL USO DE INTELIGENCIA ARTIFICIAL Y UN AGENTE CONVERSACIONAL  Proyecto de Grado. Presentado para optar al Diplomado Académico de Licenciatura en Ingeniería de Sistemas    |
| ----- |

**Presentado por:** Jorge Condori Maita

**Tutor:**  PhD. Américo Fiorilo Lozada 

**COCHABAMBA \- BOLIVIA** 

**ÍNDICE GENERAL**

[CAPÍTULO I \- INTRODUCCIÓN	3](#capítulo-i---introducción)

[1.1 Antecedentes	3](#1.1-antecedentes)

[1.2 Análisis del problema	4](#1.2-análisis-del-problema)

[1.2.1 Definición del Problema	5](#1.2.1-definición-del-problema)

[1.3. Objetivos	5](#1.3.-objetivos)

[1.3.1 Objetivo general	5](#1.3.1-objetivo-general)

[1.3.2 Objetivos específicos	5](#1.3.2-objetivos-específicos)

[1.4 Área de Conocimiento	6](#1.4-área-de-conocimiento)

[1.5 Alcance	6](#1.5-alcance)

[1.6 Justificación	8](#1.6-justificación)

[1.6.1 Justificación Técnica	8](#1.6.1-justificación-técnica)

[1.6.2 Justificación Económica	8](#1.6.2-justificación-económica)

[1.6.3 Justificación Social y Académica	8](#1.6.3-justificación-social-y-académica)

[CAPÍTULO II \- MARCO TEÓRICO	9](#capítulo-ii---marco-teórico)

[2.1 Área de Conocimiento	9](#2.1-área-de-conocimiento)

[2.1.1 Procesamiento de Lenguaje Natural(PLN)	9](#2.1.1-procesamiento-de-lenguaje-natural\(pln\))

[2.1.2 Agente Conversacionales	10](#2.1.2-agente-conversacionales)

[2.1.3 Prompt Engineering (Ingeniería de Instrucciones)	10](#2.1.3-prompt-engineering-\(ingeniería-de-instrucciones\))

[2.1.4 Entrevista Técnica	10](#2.1.4-entrevista-técnica)

[2.1.5 Inteligencia Artificial	10](#2.1.5-inteligencia-artificial)

[2.1.6 Características	11](#2.1.6-características)

[2.1.7 Elementos principales	11](#2.1.7-elementos-principales)

[2.2 Metodología de Desarrollo	11](#2.2-metodología-de-desarrollo)

[2.2.1 Definición	12](#2.2.1-definición)

[2.2.2 Características	12](#2.2.2-características)

[2.2.3 Fases de desarrollo	12](#2.2.3-fases-de-desarrollo)

[2.2.4 Ventajas	13](#2.2.4-ventajas)

[2.3 Plataforma de Desarrollo	13](#2.3-plataforma-de-desarrollo)

[2.3.1 Definición	13](#2.3.1-definición)

[2.3.2 Características	14](#2.3.2-características)

[2.3.3 Ventajas	15](#2.3.3-ventajas)

[2.4 Gestión de Datos	15](#2.4-gestión-de-datos)

[2.4.1 Definición	15](#2.4.1-definición)

[2.4.2 Características	15](#2.4.2-características)

[2.4.3 Comparación	15](#2.4.3-comparación)

[2.4.4 Ventajas de PostgreSQL	16](#2.4.4-ventajas-de-postgresql)

[2.5 Herramientas	16](#2.5-herramientas)

[2.5.1 GitHub	16](#2.5.1-github)

[2.5.2 Lenguaje de programación: Python	16](#2.5.2-lenguaje-de-programación:-python)

[2.5.3 Visual Studio Code	17](#2.5.3-visual-studio-code)

[2.5.4 Herramientas de Inteligencia Artificial: API de Claude	17](#2.5.4-herramientas-de-inteligencia-artificial:-api-de-claude)

[CAPÍTULO III \- ÁREA DE APLICACIÓN	19](#capítulo-iii---área-de-aplicación)

[3.1 Antecedentes	19](#3.1-antecedentes)

[3.2 Definiciones	20](#3.2-definiciones)

[3.2.1 Inteligencia Artificial (IA)	20](#3.2.1-inteligencia-artificial-\(ia\))

[3.2.2 Agente Conversacional	20](#3.2.2-agente-conversacional)

[3.2.3 Modelo de Lenguaje de Gran Escala (LLM)	21](#3.2.3-modelo-de-lenguaje-de-gran-escala-\(llm\))

[3.2.4 Procesamiento de Lenguaje Natural (PLN)	21](#3.2.4-procesamiento-de-lenguaje-natural-\(pln\))

[3.2.5 Ingeniería de Instrucciones  (Prompt Engineering)	21](#3.2.5-ingeniería-de-instrucciones-\(prompt-engineering\))

[3.2.6 Entrevista Técnica	21](#3.2.6-entrevista-técnica)

[3.2.7 Simulación de Entrevista	21](#3.2.7-simulación-de-entrevista)

[3.2.8 Retroalimentación Personalizada	22](#3.2.8-retroalimentación-personalizada)

[3.2.9 Competencias de Desarrollo de Software	22](#3.2.9-competencias-de-desarrollo-de-software)

[3.2.10 Sistema Web	22](#3.2.10-sistema-web)

[3.2.11 Arquitectura Cliente-Servidor	22](#3.2.11-arquitectura-cliente-servidor)

[3.2.12 Evaluación Automatizada	23](#3.2.12-evaluación-automatizada)

[3.3 Procesos	23](#3.3-procesos)

[3.3.1 Diagrama de Flujo del Proceso General del Sistema	24](#3.3.1-diagrama-de-flujo-del-proceso-general-del-sistema)

[3.3.2 Diagrama de Secuencia de una Entrevista Completa	25](#3.3.2-diagrama-de-secuencia-de-una-entrevista-completa)

[3.4 Documentación / Información	25](#3.4-documentación-/-información)

[3.4.1 Estructura de datos	25](#3.4.1-estructura-de-datos)

[3.4.2 Formulario del sistema	27](#3.4.2-formulario-del-sistema)

**ÍNDICE DE FIGURAS**

[Figura 1\. Cuadro comparativo entre metodologías ágiles (Elaboración Propia)	15](#figura-1.-cuadro-comparativo-entre-metodologías-ágiles-\(elaboración-propia\))

[Figura 2\. Cuadro comparativo entre metodologías ágiles (Elaboración Propia)	15](#figura-2.-cuadro-comparativo-entre-metodologías-ágiles-\(elaboración-propia\))

**ÍNDICE DE TABLAS**

[Tabla 1\. Cuadro comparativo entre metodologías ágiles (Elaboración Propia)	13](#tabla-1.-cuadro-comparativo-entre-metodologías-ágiles-\(elaboración-propia\))

# **CAPÍTULO I \- INTRODUCCIÓN** {#capítulo-i---introducción}

## **1.1 Antecedentes** {#1.1-antecedentes}

En la última década, la inteligencia artificial ha transformado profundamente los procesos de selección y contratación de talento tecnológico a nivel mundial. Según el informe de LinkedIn sobre el futuro del trabajo 2024, más del 62% de los reclutadores de empresas tecnológicas ya utilizan herramientas basadas en IA para evaluar competencias técnicas de los candidatos antes de una entrevista presencial, convirtiendo la preparación digital en un requisito indispensable para acceder al mercado laboral del sector.

El mercado laboral tecnológico global experimenta una demanda sin precedentes de profesionales con habilidades en programación, bases de datos, redes, inteligencia artificial y desarrollo de software. De acuerdo con el Foro Económico Mundial 2024, se estima que para el año 2027 se crearán 97 millones de nuevos empleos relacionados con tecnología a nivel mundial, mientras que simultáneamente el 44% de las habilidades laborales actuales quedará obsoleto, generando una presión creciente sobre los egresados universitarios para demostrar competencias actualizadas y alineadas con las exigencias reales del mercado.

Ante este escenario, la preparación para entrevistas técnicas se ha convertido en una disciplina específica dentro de la formación profesional en tecnología. Las entrevistas técnicas en empresas del sector exigen no solo conocimiento teórico, sino la capacidad de resolver problemas algorítmicos en tiempo real, diseñar arquitecturas de sistemas, explicar conceptos de bases de datos y demostrar habilidades de comunicación bajo presión, competencias que difícilmente se desarrollan únicamente dentro del aula universitaria.

A nivel mundial han surgido diversas plataformas especializadas en la simulación de entrevistas técnicas mediante inteligencia artificial, evidenciando la magnitud del problema que buscan resolver. Interviewing.io, una de las plataformas más reconocidas del sector, ofrece entrevistas simuladas de voz a voz en tiempo real con IA para perfiles tecnológicos, conectando a los usuarios con ingenieros de empresas FAANG y utilizando algoritmos de aprendizaje automático para evaluar habilidades de codificación, resolución de problemas y comunicación.

En el ámbito académico, la Universidad Atlántida Argentina implementó en 2024 un recurso pedagógico mediado por inteligencia artificial para simular entrevistas laborales en sus cátedras de orientación profesional, demostrando que la simulación de entrevistas con IA no solo es aplicable en el mundo empresarial sino también como herramienta formativa dentro de las universidades para desarrollar habilidades blandas y técnicas en los estudiantes.

La Universidad Mayor de San Simón de Cochabamba, a través de su Carrera de Ingeniería de Sistemas, forma cada año a decenas de profesionales en el área tecnológica. Sin embargo, la formación académica tradicional se concentra en la adquisición de conocimientos teóricos y habilidades técnicas dentro del contexto universitario, sin contemplar de forma sistemática la preparación específica para los procesos de selección laboral que los estudiantes y egresados enfrentarán al integrarse al mercado de trabajo real.

## **1.2 Análisis del problema** {#1.2-análisis-del-problema}

El proceso de inserción laboral de los egresados de Ingeniería de Sistemas de la Universidad Mayor de San Simón (UMSS) en el área de desarrollo de software enfrenta un obstáculo crítico: la falta de preparación para superar las entrevistas técnicas. A pesar de que la formación académica proporciona sólidos fundamentos teóricos en programación, bases de datos, algoritmos y desarrollo web, los estudiantes egresan sin haber tenido la oportunidad de practicar en entornos que simulan las condiciones reales de un proceso de selección. Las entrevistas técnicas en la industria tecnológica exigen no solo conocimientos, sino también la capacidad de resolver problemas algorítmicos en tiempo real, diseñar arquitecturas de software y comunicar soluciones de manera clara y efectiva bajo presión (Behroozi et al., 2019; Lunn et al., 2021).

La situación se complejiza debido a la inexistencia de herramientas accesibles, gratuitas y en español que ofrecen simulaciones de entrevistas técnicas adaptadas al contexto boliviano. Los egresados de la UMSS dependen actualmente de plataformas internacionales como LeetCode o HackerRank, que si bien ofrecen ejercicios de programación, carecen de un componente conversacional que permite practicar la articulación de soluciones ante un entrevistador, o recurren a costosos cursos privados de preparación que no están al alcance económico de todos los estudiantes (Halukha & Bychkouski, 2024). 

Esta carencia genera una brecha significativa entre las competencias adquiridas en la universidad y las exigencias reales del mercado laboral, que cada vez demanda profesionales con habilidades técnicas y comunicativas más afinadas. Como consecuencia, muchos egresados experimentan ansiedad y bajo rendimiento durante sus primeras entrevistas reales, afectando negativamente sus oportunidades de inserción profesional, a pesar de poseer el conocimiento necesario para desempeñarse exitosamente en el campo del desarrollo de software (Gomez et al., 2025).

### **1.2.1 Definición del Problema** {#1.2.1-definición-del-problema}

La ausencia de una sistema web que simula entrevistas técnicas mediante inteligencia artificial limita la preparación profesional de los egresados de Ingeniería de Sistemas de la UMSS, quienes enfrentan dificultades para acceder al mercado laboral en desarrollo de software al carecer de oportunidades de práctica en un entorno realista y accesible que evalúe sus competencias técnicas y comunicativas (Behroozi et al., 2019; Gomez et al., 2025).

## **1.3. Objetivos** {#1.3.-objetivos}

### **1.3.1 Objetivo general**  {#1.3.1-objetivo-general}

Desarrollar un sistema web de simulación de entrevistas técnicas que permita evaluar y mejorar el nivel de competencia en desarrollo de software de estudiantes egresados de ingeniería de sistemas.

### **1.3.2 Objetivos específicos** {#1.3.2-objetivos-específicos}

1. Analizar los requerimientos necesarios para la simulación de entrevista técnica, identificando las variables de entrada, proceso y salida del sistema.

2. Desarrollar un módulo de selección de diferentes áreas  para realizar la simulación de entrevistas técnicas.

3. Implementar entrevistas técnicas simuladas mediante preguntas estructuradas según el área seleccionada.

4. Registrar las respuestas proporcionadas por el usuario durante la simulación de entrevista.

5. Implementar un módulo de análisis de resultados de entrevistas técnicas simuladas, para la generación automática de sugerencias de mejora personalizadas.

6. Investigar la viabilidad de integrar tecnologías de inteligencia artificial y agentes conversacionales.

## **1.4 Área de Conocimiento** {#1.4-área-de-conocimiento}

\-Área: Ingeniería de Software.

\-Sub Área: Inteligencia Artificial.

## **1.5 Alcance** {#1.5-alcance}

- La  plataforma web estará disponible solamente para el departamento de Cochabamba.

- La plataforma web será desarrollada con un diseño responsivo.

- El sistema integrará un módulo de selección de áreas técnicas, tales como programación, bases de datos, estructuras de datos y desarrollo web, permitiendo personalizar la entrevista.

- Para el proceso de interacción se permitirá al usuario ingresar respuestas en formato de texto en la plataforma.

- El sistema registrará cada una de las respuestas proporcionadas por el usuario durante la simulación de la entrevista para su posterior análisis.

- El sistema procesa las respuestas utilizando técnicas de inteligencia artificial para generar una evaluación automatizada del desempeño del usuario.

- El sistema generará retroalimentación personalizada basada en el análisis de las respuestas, indicando fortalezas y debilidades del usuario..

- El sistema permitirá almacenar el historial de entrevistas realizadas por cada usuario para analizar su progreso a lo largo del tiempo.

- El sistema será desarrollado como una aplicación web bajo arquitectura cliente-servidor.

- El sistema estará orientado exclusivamente a egresados de la carrera de Ingeniería de Sistemas de la Universidad Mayor de San Simón.

- El sistema permitirá la ejecución de entrevistas técnicas de nivel básico e intermedio en el área de desarrollo de software.

- No se implementará reconocimiento de voz para el ingreso de respuestas.

- No se integrará el sistema con plataformas reales de reclutamiento o empresas externas.

- No se realizará evaluación en tiempo real por entrevistadores humanos, siendo el proceso completamente automatizado.

- No se garantizará la precisión absoluta en la evaluación de respuestas, debido a las limitaciones de los modelos de inteligencia artificial.

- No se incluirán entrevistas de nivel avanzado utilizadas en grandes empresas tecnológicas.

- No se desarrollará una aplicación móvil en esta etapa del proyecto, limitándose a su uso en navegadores web.

- No se realizará el seguimiento en tiempo real del desempeño del usuario fuera de la plataforma.

- No se desarrollará un sistema de certificación oficial de competencias basado en los resultados obtenidos.

- No se incluirá análisis de emociones, lenguaje corporal o expresiones faciales del usuario durante la entrevista.

- No se implementará un sistema de aprendizaje automático entrenado con grandes volúmenes de datos reales.

## **1.6 Justificación** {#1.6-justificación}

### **1.6.1 Justificación Técnica** {#1.6.1-justificación-técnica}

- Aporta la implementación de una plataforma web interactiva orientada a la simulación de entrevistas técnicas en el área de desarrollo de software, integrando componentes de evaluación automatizada y gestión de información.

- Incorpora el uso de tecnologías emergentes como la inteligencia artificial y agentes conversacionales para el análisis de respuestas y generación de retroalimentación personalizada.

- Demuestra la aplicación práctica de técnicas de procesamiento de lenguaje natural para interpretar respuestas textuales dentro de un contexto técnico.

- Propone una arquitectura de software basada en cliente-servidor que permite la gestión de usuarios, almacenamiento de resultados y escalabilidad del sistema.

- Optimiza el proceso de simulación de entrevistas mediante automatización, evitando la necesidad de intervención humana en la evaluación inicial.

### **1.6.2 Justificación Económica** {#1.6.2-justificación-económica}

- Reduce los costos asociados a la preparación profesional mediante la eliminación de la necesidad de cursos privados, asesorías personalizadas o simulaciones pagadas de entrevistas técnicas.

- Disminuye el tiempo requerido para la preparación de entrevistas al ofrecer una herramienta accesible que permite practicar de manera continua y autónoma.

- Evita gastos adicionales en plataformas externas de simulación de entrevistas que requieren suscripciones o pagos recurrentes.

### **1.6.3 Justificación Social y Académica** {#1.6.3-justificación-social-y-académica}

- Beneficia directamente a los estudiantes egresados de la carrera de Ingeniería de Sistemas de la Universidad Mayor de San Simón, quienes requieren fortalecer sus habilidades para enfrentar procesos de selección laboral.

- Apoya a la comunidad académica al proporcionar una herramienta de práctica y autoevaluación que complementa la formación teórica adquirida durante la carrera.

- Reduce la brecha existente entre la formación universitaria y las exigencias reales del mercado laboral en el área de desarrollo de software.

- Incrementa el nivel de preparación de los egresados, mejorando sus oportunidades laborales.

# **CAPÍTULO II \- MARCO TEÓRICO** {#capítulo-ii---marco-teórico}

## **2.1 Área de Conocimiento** {#2.1-área-de-conocimiento}

El presente proyecto se inscribe dentro de la Ingeniería de Software, con un enfoque directo y transversal  en el área de Inteligencia Artificial.

### **2.1.1 Procesamiento de Lenguaje Natural(PLN)** {#2.1.1-procesamiento-de-lenguaje-natural(pln)}

El Procesamiento de Lenguaje Natural (PLN) es una subdisciplina de la Inteligencia Artificial que se enfoca en la interacción entre las computadoras y el lenguaje humano. Su objetivo es que las máquinas puedan comprender, interpretar y generar texto o voz de manera significativa y contextual (Manning & Schütze, 1999).

En el contexto de este proyecto, el PLN es fundamental porque permite al agente conversacional:

* Interpretar respuestas textuales: Analizar la respuesta del usuario y extraer su significado técnico.  
* Identificar conceptos clave: Detectar si el usuario menciona términos técnicos relevantes.  
* Evaluar la calidad: Determinar si la respuesta es correcta, parcial o incorrecta.  
* Generar retroalimentación: Producir sugerencias de mejora en lenguaje natural

### **2.1.2 Agente Conversacionales** {#2.1.2-agente-conversacionales}

Un agente conversacional es un sistema de software diseñado para interactuar con usuarios mediante lenguaje natural, simulando una conversación humana (Jurafsky & Martin, 2023). A diferencia de los chatbots basados en reglas, los agentes conversacionales modernos utilizan Modelos de Lenguaje de Gran Escala (LLM) para:

### **2.1.3 Prompt Engineering (Ingeniería de Instrucciones)** {#2.1.3-prompt-engineering-(ingeniería-de-instrucciones)}

El Prompt Engineering es la técnica de diseñar y optimizar instrucciones textuales (prompts) para guiar el comportamiento de los modelos de lenguaje de gran escala (LLM). Un prompt bien diseñado es fundamental para obtener respuestas precisas, relevantes y alineadas con los objetivos del sistema (Liu et al., 2023).

### **2.1.4 Entrevista Técnica** {#2.1.4-entrevista-técnica}

Una entrevista técnica es un proceso de evaluación estructurada utilizado en la industria tecnológica para medir las competencias de un candidato en áreas como programación, algoritmos, estructuras de datos, bases de datos y diseño de sistemas (Behroozi et al., 2019).

### **2.1.5 Inteligencia Artificial** {#2.1.5-inteligencia-artificial}

Dentro de la Ingeniería de Software, la Inteligencia Artificial (IA) constituye la sub-área principal del proyecto. La IA es la rama de la informática que estudia y desarrolla sistemas capaces de realizar tareas que normalmente requieren inteligencia humana, tales como el razonamiento, el aprendizaje, la comprensión del lenguaje natural y la toma de decisiones. En el presente sistema, la IA es el componente central que permite generar preguntas dinámicas, analizar respuestas textuales y producir retroalimentación personalizada para el usuario. 

La Inteligencia Artificial se define como el campo de la ciencia de la computación dedicado a la creación de sistemas capaces de realizar tareas que, de ser ejecutadas por seres humanos, requerirían de inteligencia, tales como el razonamiento, el aprendizaje y la comprensión del lenguaje (Russell & Norvig, 2022). Dentro de esta área, el Procesamiento de Lenguaje Natural enfoca sus esfuerzos en hacer que las máquinas interpreten y generen texto o voz humana de manera coherente y contextual (Manning et al., 2023).

### **2.1.6 Características** {#2.1.6-características}

* **Adaptabilidad:** Capacidad de los modelos para ajustarse a diferentes contextos lingüísticos de entrada.  
* **Aprendizaje Continuo:** Habilidad de los sistemas basados en redes neuronales para mejorar su precisión a través del entrenamiento con nuevos conjuntos de datos masivos.  
* **Procesamiento en Tiempo Real:** Aptitud técnica para recibir entradas conversacionales texturizadas y devolver respuestas con una latencia mínima para simular un diálogo fluido.

### **2.1.7 Elementos principales** {#2.1.7-elementos-principales}

* **Modelos de Lenguaje de Gran Escala (LLMs):** Redes transformadoras entrenadas para predecir y generar secuencias de texto lógicas.  
* **Agentes Conversacionales:** Interfaces de software programadas para mantener conversaciones estructuradas o libres interactuando con un usuario.  
* **Prompt Engineering (Ingeniería de Prompts):** Técnica de diseño y optimización de instrucciones textuales para guiar las respuestas de los modelos de IA de forma precisa.

## **2.2 Metodología de Desarrollo** {#2.2-metodología-de-desarrollo}

| CRITERIO | INCREMENTAL | SCRUM | XP |
| :---- | :---- | :---- | :---- |
| **Descripción** | Modelo de proceso que divide el sistema en módulos funcionales (incrementos) entregados de forma secuencial | Marco ágil estructurado en sprints, con roles y eventos definidos, orientada en la gestión de trabajo en equipo. | Metodología ágil centrada en prácticas técnicas rigurosas de codificación (pair programming). |
| **Tamaño de equipo** | 1 o más personas | 3-9 personas | 2-10 personas |
| **Planificación** | Fases y orden de incrementos definidos desde el inicio del proyecto. | Adaptativa el backlog se prioriza en cada sprint según retroalimentación. | Adaptativa, se ajustan sobre la marcha sin una planificación modular fija. |
| **Documentación generada** | Alta | Media | Baja |
| **Entregas verificables** | Un módulo funcional completo por incremento | Un incremento de producto por sprint | Código funcional constante |
| **Estructura el desarrollo en módulos de producto documentales por fases** | Si | Parcial | No |

###### *Tabla 1\. Cuadro comparativo entre metodologías ágiles (Elaboración Propia)*  {#tabla-1.-cuadro-comparativo-entre-metodologías-ágiles-(elaboración-propia)}

Para la gestión y construcción del software se utilizará el Modelo Incremental, ya que, a diferencia de Scrum y XP, estructura el desarrollo en módulos de producto entregables y documentales por fases, lo que facilita incorporar y calibrar progresivamente el componente de inteligencia artificial del sistema.

### **2.2.1 Definición** {#2.2.1-definición}

El ciclo de vida del desarrollo incremental divide el producto de software en múltiples módulos o piezas llamadas "incrementos". Cada incremento pasa por las fases de requerimientos, diseño, codificación y pruebas, entregando en cada iteración una parte operativa y funcional del sistema (Pressman & Maxim, 2020).

### **2.2.2 Características** {#2.2.2-características}

* **Desarrollo Modular:** El sistema se construye bloque por bloque, facilitando el aislamiento de errores (Sommerville, 2019).  
* **Priorización de Requerimientos:** Los componentes principales y críticos (como el motor de la entrevista) se desarrollan en los primeros ciclos.    
* **Iterativo:** Permite la retroalimentación constante sobre porciones de software ya construidas para guiar los siguientes incrementos.

### **2.2.3 Fases de desarrollo** {#2.2.3-fases-de-desarrollo}

**Análisis de Requerimientos:** Levantamiento de historias de usuario y variables de entrada/salida.  

**Diseño de la Arquitectura e Interfaz:** Modelado de la base de datos y prototipos de alta fidelidad.  

**Implementación de Incrementos:** Codificación consecutiva de los módulos (Selección de áreas, Simulación, Registro y Evaluación).  

**Validación e Integración:** Pruebas del sistema y corrección de bugs o latencias de comunicación con la IA.  

**Entrega:** presentación del incremento funcional como resultado del ciclo de desarrollo correspondiente.

### **2.2.4 Ventajas** {#2.2.4-ventajas}

* Permite identificar y corregir problemas en etapas tempranas del desarrollo, reduciendo el costo de las correcciones.  
* Facilita la gestión del proyecto al dividirlo en unidades de trabajo más pequeñas y manejables.  
* Genera confianza en el avance del proyecto al producir resultados concretos y verificables en cada incremento.   
* Se adapta bien a proyectos académicos con plazos definidos, ya que permite priorizar las funcionalidades más importantes en los primeros incrementos.

## **2.3 Plataforma de Desarrollo** {#2.3-plataforma-de-desarrollo}

### **2.3.1 Definición** {#2.3.1-definición}

* React es una biblioteca de JavaScript de código abierto desarrollada por Meta para la construcción de interfaces de usuario interactivas y dinámicas. Se basa en el concepto de componentes reutilizables, lo que permite construir interfaces complejas a partir de piezas independientes y aisladas. En el presente proyecto, React es utilizado como tecnología principal del frontend para desarrollar la interfaz web de la plataforma de simulación de entrevistas. 

##### Figura 1\. Cuadro comparativo entre metodologías ágiles (Elaboración Propia)  {#figura-1.-cuadro-comparativo-entre-metodologías-ágiles-(elaboración-propia)}

* Django es un framework de desarrollo web de alto nivel escrito en Python que sigue el patrón arquitectónico Modelo-Vista-Template (MVT). Fue diseñado para facilitar el desarrollo rápido de aplicaciones web seguras y mantenibles. En este proyecto, Django se utiliza para desarrollar el backend del sistema, gestionando la lógica de negocio, la autenticación de usuarios, el almacenamiento de datos y la integración con la API de Claude.

##### Figura 2\. Cuadro comparativo entre metodologías ágiles (Elaboración Propia)  {#figura-2.-cuadro-comparativo-entre-metodologías-ágiles-(elaboración-propia)}

### **2.3.2 Características** {#2.3.2-características}

**React:**

* Basado en componentes: la interfaz se construye mediante componentes independientes y reutilizables que gestionan su propio estado.  
* Virtual DOM: React utiliza una representación virtual del DOM para optimizar las actualizaciones de la interfaz, mejorando el rendimiento de la aplicación.  
* Flujo de datos unidireccional: los datos fluyen de componentes padre a componentes hijo, lo que facilita el rastreo y depuración del estado.  
* Ecosistema amplio: cuenta con bibliotecas complementarias para gestión de estado, enrutamiento y comunicación con APIs REST.

**Django:**

* Arquitectura MVT: separa la lógica de datos, la lógica de negocio y la presentación en capas bien definidas.  
* ORM integrado: permite interactuar con la base de datos mediante objetos Python sin necesidad de escribir consultas SQL directamente.  
* Sistema de autenticación incorporado: ofrece mecanismos de autenticación y autorización de usuarios listos para usar.  
* Django REST Framework (DRF): extensión que facilita la construcción de APIs RESTful para la comunicación entre el frontend React y el backend Django.

### **2.3.3 Ventajas** {#2.3.3-ventajas}

* La combinación React y Django permite una arquitectura cliente-servidor clara donde el frontend consume una API REST expuesta por el backend, facilitando el mantenimiento y la escalabilidad del sistema.  
* Django en Python facilita la integración con la API de Claude de Anthropic, ya que el SDK oficial de Anthropic está disponible para Python.  
* React permite construir la interfaz de chat interactiva del agente conversacional con actualizaciones en tiempo real sin recargar la página.  
* Ambas tecnologías cuentan con documentación extensa, comunidades activas y amplio soporte, lo que reduce la curva de aprendizaje y los riesgos técnicos del proyecto.

## **2.4 Gestión de Datos** {#2.4-gestión-de-datos}

### **2.4.1 Definición** {#2.4.1-definición}

MongoDB es un sistema de gestión de bases de datos no relacional (NoSQL) orientado a documentos, que almacena los datos en formato BSON, ofreciendo flexibilidad en la estructura de los datos. 

### **2.4.2 Características** {#2.4.2-características}

**MongoDB:**

* Modelo de documentos flexible que permite almacenar datos con estructuras variables, como los historiales de conversación del agente.  
* Alta velocidad de escritura y lectura para grandes volúmenes de datos no estructurados.  
* Escalabilidad horizontal mediante sharding para manejar grandes volúmenes de datos.  
* Integración con Django mediante bibliotecas como Djongo o MongoEngine.

### **2.4.3 Comparación** {#2.4.3-comparación}

Para el presente proyecto, PostgreSQL resulta más adecuado por las siguientes razones: los datos principales del sistema (usuarios, entrevistas, respuestas, resultados) tienen una estructura definida y relaciones claras entre entidades, lo que se adapta mejor al modelo relacional. Además, Django tiene integración nativa y optimizada con PostgreSQL, y la consistencia de los datos es un requisito importante para garantizar la integridad del historial de entrevistas de cada usuario. MongoDB sería más conveniente si el proyecto manejara grandes volúmenes de conversaciones no estructuradas o si los esquemas de datos cambiarán frecuentemente, situación que no corresponde al alcance actual del proyecto.

### **2.4.4 Ventajas de PostgreSQL** {#2.4.4-ventajas-de-postgresql}

 Basado en el análisis comparativo, el presente proyecto define a PostgreSQL como el sistema de gestión de base de datos para la implementación del sistema. La elección de una base de datos relacional se justifica por la naturaleza estructural y relacional de los datos que el sistema debe gestionar (usuarios, entrevistas, respuestas y evaluaciones). Esta decisión asegura la integridad referencial de los datos, soporte para transacciones ACID y una integración nativa y robusta con el ORM de Django, lo que permite un desarrollo más ágil y un mantenimiento eficiente . Aunque MongoDB ofrece flexibilidad para esquemas dinámicos, en este proyecto su uso implicaría sacrificar las herramientas y la filosofía de desarrollo de Django sin ofrecer beneficios sustanciales para el tipo de datos manejados .

## **2.5 Herramientas** {#2.5-herramientas}

### **2.5.1 GitHub** {#2.5.1-github}

GitHub es una plataforma de alojamiento de código fuente basada en el sistema de control de versiones Git. Permite a los desarrolladores gestionar el historial de cambios del código, colaborar en equipo y mantener distintas versiones del proyecto de forma organizada. En el presente proyecto, GitHub se utilizará para el control de versiones del código fuente tanto del frontend como del backend.(Chacon & Straub, 2014\)

**Características**

* Control de versiones distribuido mediante Git, permitiendo registrar cada cambio realizado en el código con su autor y descripción.  
* Gestión de ramas (branches) para desarrollar funcionalidades de forma paralela sin afectar al código principal.  
* Sistema de Issues y Pull Requests para el seguimiento de tareas y la revisión de código entre incrementos.  
* Integración con herramientas de despliegue continuo (CI/CD) para automatizar pruebas y despliegues.  
* Repositorios públicos y privados con control de acceso por colaborador.

### **2.5.2 Lenguaje de programación: Python** {#2.5.2-lenguaje-de-programación:-python}

Python es un lenguaje de programación de alto nivel, interpretado y de propósito general, caracterizado por su sintaxis clara y legible. Es el lenguaje base del framework Django utilizado en el backend del proyecto, y cuenta con el SDK oficial de Anthropic para la integración con la API de Claude.(Van Rossum & Drake, 2009\)

**Características**

* Sintaxis simple y legible que facilita el desarrollo y mantenimiento del código.  
* Tipado dinámico que agiliza el proceso de desarrollo durante los incrementos del proyecto.  
* Amplio ecosistema de bibliotecas para desarrollo web, procesamiento de datos e integración con APIs de inteligencia artificial.  
* Compatibilidad total con Django y con el SDK de Anthropic para Python.  
* Comunidad activa y extensa documentación oficial disponible de forma gratuita.

### **2.5.3 Visual Studio Code** {#2.5.3-visual-studio-code}

Visual Studio Code (VS Code) es un editor de código fuente gratuito y de código abierto desarrollado por Microsoft. Es uno de los entornos de desarrollo más utilizados a nivel mundial por su ligereza, velocidad y amplio ecosistema de extensiones. En el presente proyecto se utilizará como entorno de desarrollo principal tanto para el frontend en React como para el backend en Django. (Microsoft, 2015\) 

**Características**

* Soporte nativo para JavaScript, TypeScript y Python mediante extensiones especializadas.  
* Integración con Git y GitHub directamente desde la interfaz del editor sin herramientas externas.  
* Sistema de extensiones que permite agregar soporte para React, Django, linting y formateo de código.  
* Terminal integrada que permite ejecutar comandos de desarrollo sin salir del entorno.  
* Autocompletado inteligente de código (IntelliSense) que acelera el desarrollo y reduce errores.

### **2.5.4 Herramientas de Inteligencia Artificial: API de Claude** {#2.5.4-herramientas-de-inteligencia-artificial:-api-de-claude}

La API de Claude, desarrollada por Anthropic, es el servicio de inteligencia artificial que se utilizará como motor del agente conversacional en el presente proyecto. (Anthropic ,023) Claude es un modelo de lenguaje de gran escala (LLM) diseñado con énfasis en la seguridad, la utilidad y la precisión. A través de su API, el sistema puede enviar prompts estructurados y recibir respuestas generadas por el modelo en formato de texto.

En el contexto del proyecto, la API de Claude cumple tres funciones principales: generar preguntas técnicas dinámicas según el área seleccionada por el usuario, mantener el contexto de la conversación a lo largo de la entrevista simulada, y analizar las respuestas del usuario para producir una evaluación personalizada con métricas de desempeño, fortalezas y sugerencias de mejora.

**Características:**

* Soporte para conversaciones multi-turno que permite mantener el contexto de la entrevista de forma coherente durante toda la simulación.

* SDK oficial disponible para Python, compatible con Django, lo que facilita su integración en el backend del sistema.

* Capacidad de seguir instrucciones complejas mediante prompt engineering, permitiendo definir el rol del agente entrevistador y los criterios de evaluación.

* Modelos disponibles con diferentes niveles de capacidad, permitiendo seleccionar el más adecuado según los requerimientos del proyecto.

* Respuestas en formato de texto estructurado que pueden procesarse para extraer métricas y generar reportes de desempeño del usuario.

# **CAPÍTULO III \- ÁREA DE APLICACIÓN** {#capítulo-iii---área-de-aplicación}

## **3.1 Antecedentes** {#3.1-antecedentes}

La Universidad Mayor de San Simón de Cochabamba, a través de su Carrera de Ingeniería de Sistemas, forma cada año a profesionales en áreas de programación, bases de datos, redes y desarrollo de software. Sin embargo, estudios sobre formación universitaria en tecnología señalan que los planes de estudio tradicionales priorizan la adquisición de conocimientos teóricos sobre la preparación práctica para los procesos de selección laboral, generando una brecha entre lo que el estudiante aprende en el aula y lo que las empresas evalúan en sus procesos de contratación (Behroozi et al., 2019).

El mercado laboral tecnológico de América Latina experimenta un crecimiento sostenido en la demanda de profesionales con habilidades en desarrollo de software. De acuerdo con el Foro Económico Mundial (2025), la región necesitará incorporar más de 1,2 millones de profesionales tecnológicos para 2030, mientras que la tasa de desempleo juvenil profesional en el sector supera el 18% en países de la región, evidenciando una paradoja entre la alta demanda del mercado y la dificultad de los egresados para acceder a esos empleos (Organización Internacional del Trabajo \[OIT\], 2023).

En Bolivia, el sector tecnológico ha experimentado un crecimiento significativo en los últimos años. Según datos del Instituto Nacional de Estadística de Bolivia (INE, 2023), el sector de tecnologías de la información y comunicación registró un crecimiento del 7,3% en 2022, consolidándose como uno de los sectores de mayor dinamismo económico del país. En Cochabamba específicamente, el ecosistema tecnológico cuenta con empresas de desarrollo de software, consultoras digitales y startups que aplican procesos de selección con entrevistas técnicas estructuradas como mecanismo principal de evaluación de candidatos, exigiendo que los postulantes demuestren competencias en programación, algoritmos, bases de datos y diseño de sistemas en tiempo real y bajo presión (Halukha & Bychkouski, 2024).

A pesar de este crecimiento del mercado tecnológico local, los egresados de la Carrera de Ingeniería de Sistemas de la UMSS enfrentan dificultades concretas en sus primeras experiencias de selección laboral. Gomez et al. (2025) identificaron que sentirse poco preparado para el formato específico de la entrevista técnica es una de las experiencias negativas más comunes entre candidatos a puestos tecnológicos, independientemente de su nivel de conocimiento técnico real. Esta situación se agrava en el contexto boliviano por la inexistencia de herramientas digitales accesibles, gratuitas y en español adaptadas al mercado local, ya que las plataformas internacionales disponibles como LeetCode y HackerRank no ofrecen componentes conversacionales ni retroalimentación personalizada en el idioma nativo del candidato (Halukha & Bychkouski, 2024).

La brecha entre la formación académica y las exigencias del mercado laboral tecnológico local representa el área de aplicación concreta del presente proyecto. Como señalan Behroozi et al. (2019), los candidatos que nunca han practicado el formato de una entrevista técnica presentan un desempeño significativamente inferior al esperado en sus primeros procesos reales de selección, no por deficiencia en sus conocimientos técnicos sino por falta de familiaridad con las condiciones específicas de evaluación, situación que puede revertirse mediante la práctica sistemática en entornos simulados con retroalimentación inmediata.

## **3.2 Definiciones** {#3.2-definiciones}

A continuación, se presentan las definiciones operativas de los términos y conceptos fundamentales utilizados en el presente proyecto, con el fin de establecer un lenguaje común y claro para la comprensión del sistema propuesto.

### **3.2.1 Inteligencia Artificial (IA)** {#3.2.1-inteligencia-artificial-(ia)}

Rama de la informática que estudia y desarrolla sistemas capaces de realizar tareas que normalmente requieren inteligencia humana, como el razonamiento, el aprendizaje, la percepción y la comprensión del lenguaje natural (Russell & Norvig, 2022). En el contexto de este proyecto, la IA se utiliza como motor principal para la generación de preguntas, el análisis de respuestas y la retroalimentación personalizada durante las simulaciones de entrevistas técnicas.

### **3.2.2 Agente Conversacional** {#3.2.2-agente-conversacional}

Sistema de software que simula una conversación con un usuario mediante lenguaje natural. A diferencia de los chatbots basados en reglas, un agente conversacional basado en modelos de lenguaje de gran escala (LLM) puede mantener el contexto de la conversación, generar respuestas coherentes y adaptarse a las entradas del usuario de manera dinámica (Jurafsky & Martin, 2023). En este proyecto, el agente conversacional actúa como un "entrevistador virtual" que guía al egresado a través de una entrevista técnica completa.

### **3.2.3 Modelo de Lenguaje de Gran Escala (LLM)** {#3.2.3-modelo-de-lenguaje-de-gran-escala-(llm)}

Tipo de modelo de inteligencia artificial entrenado con grandes volúmenes de datos textuales para comprender y generar lenguaje humano. Estos modelos utilizan arquitecturas de redes neuronales profundas, como los transformadores, para aprender patrones, contextos y relaciones semánticas en el lenguaje (Brown et al., 2020). En este proyecto, se utiliza la API de Claude (Anthropic) como LLM para la generación de preguntas técnicas y la evaluación de respuestas. 

### **3.2.4 Procesamiento de Lenguaje Natural (PLN)** {#3.2.4-procesamiento-de-lenguaje-natural-(pln)}

Campo de la inteligencia artificial que se ocupa de la interacción entre las computadoras y el lenguaje humano. El PLN permite a las máquinas interpretar, analizar y generar texto de manera significativa y contextual (Manning & Schütze, 1999). En el sistema propuesto, el PLN es fundamental para que el agente conversacional pueda comprender las respuestas textuales del usuario y generar evaluaciones coherentes. 

### **3.2.5 Ingeniería de Instrucciones  (Prompt Engineering)** {#3.2.5-ingeniería-de-instrucciones-(prompt-engineering)}

Técnica de diseño y optimización de instrucciones textuales (prompts) para guiar el comportamiento de los modelos de lenguaje de gran escala (LLM). Un prompt bien diseñado define el rol del agente, el contexto de la tarea y los criterios de evaluación, permitiendo que la IA genere respuestas precisas y alineadas con los objetivos del sistema (Liu et al., 2023). En este proyecto, el prompt engineering se utiliza para configurar al agente como "entrevistador técnico" y definir los criterios de evaluación de las respuestas.

### **3.2.6 Entrevista Técnica** {#3.2.6-entrevista-técnica}

Proceso de evaluación estructurada utilizado en la industria tecnológica para medir las competencias de un candidato en áreas como programación, algoritmos, estructuras de datos, bases de datos y diseño de sistemas. Una entrevista técnica típica incluye preguntas teóricas, problemas de codificación y ejercicios de diseño, evaluando no solo el conocimiento técnico, sino también la capacidad de razonamiento, comunicación y resolución de problemas bajo presión (Behroozi et al., 2019). En este proyecto, la entrevista técnica se simula mediante un agente conversacional que realiza preguntas dinámicas y evalúa las respuestas del usuario.

### **3.2.7 Simulación de Entrevista** {#3.2.7-simulación-de-entrevista}

Entorno controlado que replica las condiciones de una entrevista real para permitir la práctica y la retroalimentación sin riesgos. Una simulación efectiva incluye preguntas realistas, restricciones de tiempo y un mecanismo de evaluación que proporciona retroalimentación constructiva (Gomez et al., 2025). En este proyecto, la simulación se realiza a través de una plataforma web donde el usuario interactúa con un agente conversacional basado en IA.

### **3.2.8 Retroalimentación Personalizada** {#3.2.8-retroalimentación-personalizada}

Conjunto de sugerencias, observaciones y recomendaciones generadas automáticamente por el sistema, basadas en el análisis de las respuestas del usuario. La retroalimentación personalizada indica las fortalezas, debilidades y áreas de mejora específicas del candidato, permitiendo un aprendizaje dirigido y efectivo (Daryanto et al., 2025). En el sistema propuesto, la retroalimentación es generada por la IA después de cada respuesta y se consolida en un reporte final.

### **3.2.9 Competencias de Desarrollo de Software** {#3.2.9-competencias-de-desarrollo-de-software}

Conjunto integrado de conocimientos, habilidades y actitudes que un profesional debe poseer para desempeñarse efectivamente en el desarrollo de software. Incluye competencias técnicas (programación, bases de datos, arquitectura de software) y competencias blandas (comunicación, trabajo en equipo, resolución de problemas) (Pressman, 2010). En este proyecto, las competencias evaluadas son específicamente técnicas, enfocadas en áreas como programación, bases de datos, estructuras de datos y desarrollo web.

### **3.2.10 Sistema Web** {#3.2.10-sistema-web}

Aplicación informática accesible a través de un navegador web, que funciona bajo una arquitectura cliente-servidor. El cliente (frontend) se encarga de la interfaz de usuario y la interacción, mientras que el servidor (backend) procesa la lógica de negocio, gestiona la base de datos y se comunica con servicios externos (Pressman, 2010). En este proyecto, la plataforma web está desarrollada con React (frontend) y Django (backend), permitiendo a los egresados acceder a las simulaciones desde cualquier dispositivo con conexión a Internet. 

### **3.2.11 Arquitectura Cliente-Servidor** {#3.2.11-arquitectura-cliente-servidor}

Modelo de comunicación en red donde un componente (cliente) solicita servicios o recursos y otro componente (servidor) proporciona dichos servicios. En el contexto de sistemas web, el navegador del usuario actúa como cliente y el servidor remoto aloja la lógica de negocio, la base de datos y la integración con servicios externos (Sommerville, 2011). En este proyecto, el frontend (React) se comunica con el backend (Django) mediante una API REST, y el backend se comunica con la API de Claude para el procesamiento de IA.

### **3.2.12 Evaluación Automatizada** {#3.2.12-evaluación-automatizada}

Proceso mediante el cual un sistema informático analiza y califica el desempeño de un usuario sin intervención humana. En el contexto educativo y de selección, la evaluación automatizada permite una retroalimentación inmediata, consistente y escalable (Frankford et al., 2025). En este proyecto, la evaluación automatizada es realizada por la API de Claude, que analiza las respuestas textuales del usuario y asigna una puntuación basada en criterios técnicos predefinidos.

## **3.3 Procesos** {#3.3-procesos}

A continuación, se presenta el diagrama de flujo que describe el comportamiento general del sistema desde que el usuario ingresa hasta que finaliza una entrevista y visualiza sus resultados. 

### **3.3.1 Diagrama de Flujo del Proceso General del Sistema** {#3.3.1-diagrama-de-flujo-del-proceso-general-del-sistema}

![][image1]

### **3.3.2 Diagrama de Secuencia de una Entrevista Completa** {#3.3.2-diagrama-de-secuencia-de-una-entrevista-completa}

![][image2]

## **3.4 Documentación / Información** {#3.4-documentación-/-información}

En esta sección se describen los formatos, estructuras y tipos de información que el sistema gestiona, almacena y presenta a los usuarios. Esta documentación sirve como base para el diseño de la base de datos, los formularios de la interfaz y los reportes generados por el sistema.    El sistema mantiene un registro histórico de cada entrevista realizada por cada usuario, similar a un kardex académico pero enfocado en competencias de desarrollo de software. 

### **3.4.1 Estructura de datos** {#3.4.1-estructura-de-datos}

El sistema mantiene un registro histórico de cada entrevista realizada por cada usuario, similar a un kardex académico pero enfocado en competencias de desarrollo de software. 

* **Estructura del Usuario (Perfil del Egresado)**


| Campo | Tipo | Longitud | Descripción |
| :---- | :---- | ----- | :---- |
| id\_usuario | INTEGER(PK) | – | Identificador único del usuario |
| nombre\_completo | VARCHAR | 100 | Nombre completo del egresado |
| email | VARCHAR | 100 | Correo electronico (unico) |
| contraseña | VARCHAR | 255 | Hash de la contraseña |
| carnet | VARCHAR | 15 | Número de carnet de identidad (opcional) |
| fecha\_registro | TIMESTAMP | – | Fecha y hora de registro |
| ultimo\_acceso | TIMESTAMP | – | Última vez que ingreso al sistema |

* **Estructura de Entrevista (Cabecera)**


| Campo | Tipo | Longitud | Descripción |
| :---- | :---- | ----- | :---- |
| id\_ entrevista | INTEGER (PK) | – | Identificador único del usuario de la entrevista. |
| id\_usuario | INTEGER (FK) | – | Referencia al usuario que realiza la entrevista. |
| area\_tecnica | VARCHAR | 30 | Área de evaluación. |
| nivel | VARCHAR | 20 | Nivel de dificultad |
| fecha\_inicio | TIMESTAMP | – | Momento en que inició la entrevista. |
| fecha\_fin | TIMESTAMP | – | Momento en que finalizó la entrevista. |
| estado | VARCHAR | – | Estado de la entrevista ( En progreso, Finalizado, Abandonada). |
| puntuacion\_promedio | DECIMAL | – | Promedio de las preguntas. |

* **Estructura de Intercambio (Pregunta – Respuesta)**


| Campo | Tipo | Longitud | Descripción |
| :---- | :---- | ----- | :---- |
| id\_intercambio | INTEGER (PK) | – | Identificador único del intercambio. |
| id\_entrevista | INTEGER (FK) | – | Referencia a la entrevista. |
| pregunta | TEXT | – | Pregunta generada por la IA. |
| respuesta\_usuario | TEXT | – | Respuesta escrita por el usuario. |
| tiempo\_respuesta | INTEGER | – | Tiempo que se tardó en responder. |
| timestamp | TIMESTAMP | – | Momento de la respuesta. |

* **Estructura de Evaluación (Resultados por Pregunta)**


| Campo | Tipo | Longitud | Descripción |
| :---- | :---- | ----- | :---- |
| id\_evaluacion | INTEGER (PK) | – | Identificador único de la evaluación. |
| id\_intercambio | INTEGER (FK) | – | Referencia al intercambio evaluado. |
| puntuacion | INTEGER | – | Puntuación del 0 al 100\. |
| fortalezas | TEXT | – | Aspectos positivos detectados. |
| debilidades | TEXT | – | Aspecto a mejorar. |
| sugerencias | TEXT | – | Recomendación de mejora. |
| evaluacion\_json | JSON | – | Datos completos en formato JSON. |

### **3.4.2 Formulario del sistema** {#3.4.2-formulario-del-sistema}

A continuación, se presentan los formularios principales que el usuario visualiza y completa durante la interacción con el sistema.

* **Formulario de Registro de Usuario**


  


  


  


  


  


  





* **Formulario de inicio de session**  
* **Formulario de selección de Área**  
* **Formulario de Respuesta en Entrevista (chat)**  
* **Formulario del panel de resultados**

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,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>