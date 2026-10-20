## Purpose

Que pedir el análisis de un CV sea un paso claro (el CV primero, la convocatoria opcional) y que el resultado empiece por lo importante y permita ir directo a cada parte.

## ADDED Requirements

### Requirement: Entrada con el CV primero y la convocatoria opcional plegada

Antes de analizar, "Revisar mi CV" SHALL mostrar una sola tarjeta, en este orden:
1. el campo del currículum (PDF o DOCX);
2. un control "Comparar con una convocatoria (opcional)" (que, abierto, dice "Quitar la convocatoria"), plegado al entrar, que al abrirse muestra cómo dar la convocatoria (pegar el texto o subir el archivo) y qué se gana con ella;
3. "Analizar mi CV", habilitado solo con un CV elegido.

El control de la convocatoria MUST indicar si está abierto o cerrado a los lectores de pantalla. Al cerrarlo, MUST vaciarse lo que tenía, para no enviar una convocatoria que ya no se ve. Debajo de la tarjeta MUST verse el historial de análisis anteriores.

#### Scenario: Entrar a la pantalla
- **WHEN** el usuario abre "Revisar mi CV"
- **THEN** ve primero el campo del CV y la opción plegada de comparar con una convocatoria, y debajo su historial

#### Scenario: Plegar la convocatoria
- **WHEN** el usuario pega una convocatoria y luego pliega la opción
- **THEN** la convocatoria se vacía y el análisis se hace sin ella

### Requirement: Resultado con barra de contexto

Tras analizar o abrir un análisis del historial, la entrada y el historial SHALL ser reemplazados por el resultado. Este empieza con una barra que muestra:
- el nombre del archivo;
- si se comparó con una convocatoria;
- la fecha;
- el botón "Analizar otro".

"Analizar otro" MUST volver a la entrada conservando el archivo y la convocatoria elegidos, mostrar de nuevo el historial y llevar el foco al campo del CV.

#### Scenario: Reanalizar tras corregir
- **WHEN** el usuario pulsa "Analizar otro"
- **THEN** vuelve a la entrada con su archivo y su convocatoria aún elegidos

### Requirement: Resultado organizado en pestañas

El resultado SHALL organizarse en pestañas, empezando por "Resumen", que se selecciona cada vez que llega un resultado nuevo:

| Pestaña | Contenido | Cuándo aparece |
|---|---|---|
| **Resumen** | las cifras clave (campos que lee el ATS; requisitos cubiertos si hubo comparación con requisitos reconocidos; viñetas con resultado si las hay), el aviso de la revisión de IA, las tres debilidades más graves ordenadas por severidad y un enlace "Ver todo en Qué corregir" que selecciona esa pestaña. Sin debilidades, indica que no se encontraron problemas de parseo | siempre |
| **Qué corregir** | lo que el ATS extrae (el espejo), las debilidades y las fortalezas; su etiqueta muestra el número de debilidades | siempre |
| **Requisitos** o **Tecnologías** | con convocatoria, el mapa de evidencia o el aviso de que no se reconoció ningún requisito; sin ella, el inventario de tecnologías | siempre |
| **Viñetas** | el análisis de viñetas de logro y la revisión de redacción | si hay alguno de los dos |
| **Para la entrevista** | las preguntas probables si las hay, el puesto sugerido y el paso a practicar la entrevista | siempre, porque el paso a practicar no depende de las preguntas |

Las pestañas MUST manejarse con teclado (flechas, Inicio y Fin).

En un CV sin capa de texto, el resumen MUST mostrar solo ese hallazgo, sin cifras de requisitos inventadas.

#### Scenario: Ver lo importante primero
- **WHEN** termina el análisis de un CV con 5 debilidades
- **THEN** la pestaña Resumen muestra las 3 más graves, primero las críticas, y "Ver todo en Qué corregir"

#### Scenario: Sin convocatoria
- **WHEN** el análisis se hizo sin convocatoria
- **THEN** la tercera pestaña se llama "Tecnologías" y muestra el inventario

#### Scenario: Sin viñetas ni preguntas
- **WHEN** el CV no usa viñetas, no hay correcciones de redacción y la IA no trajo preguntas
- **THEN** no aparece la pestaña "Viñetas", y "Para la entrevista" muestra solo el paso a practicar
