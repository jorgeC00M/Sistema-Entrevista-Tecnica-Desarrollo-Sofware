## Purpose

Diagnosticar por qué un currículum queda fuera de la búsqueda de un reclutador que usa un ATS, midiendo el documento regla por regla y sin publicar nunca un puntaje.

## ADDED Requirements

### Requirement: La entrada no muestra nota de privacidad ni avisos de lo que falta
La entrada de «Revisar mi CV» NO SHALL mostrar una nota de privacidad bajo «Tu CV», ni una línea con lo que falta para analizar («Sube tu CV», «Pega o sube la convocatoria»). «Analizar CV» SHALL seguir deshabilitado mientras falte el CV o, en el análisis dirigido, el texto o archivo de la convocatoria. Mientras se analiza, SHALL anunciarse a los lectores de pantalla «Leyendo tu CV y aplicando las reglas del ATS…».

#### Scenario: Entrada vacía
- **WHEN** el usuario abre `/mi-cv` sin haber subido nada
- **THEN** «Analizar CV» está deshabilitado y no hay texto de aviso junto a él ni nota bajo «Tu CV»

#### Scenario: Analizando
- **WHEN** el usuario pulsa «Analizar CV»
- **THEN** se anuncia «Leyendo tu CV y aplicando las reglas del ATS…»

### Requirement: El panel «Qué revisamos» en el análisis general
En la pestaña «Análisis general», a la derecha de «Tu CV» desde 1024 px y con su misma altura, SHALL mostrarse un panel «¿Qué revisamos?» (su proporción y su jerarquía las define `entrada-del-cv-dos-tercios`) que diga:
- si el ATS extrae los 8 datos que busca: Nombre, Correo, Teléfono, Ubicación, Experiencia, Educación, Habilidades y Antigüedad, que son los mismos campos que el análisis mide;
- si el formato le impide leer: columnas, tablas, imágenes, encabezados y pies;
- si las viñetas muestran logros o solo tareas.

El panel NO SHALL mostrarse en «Análisis dirigido», donde ese lugar es de la convocatoria. Por debajo de 1024 px SHALL ir después de «Tu CV».

#### Scenario: General
- **WHEN** el usuario está en «Análisis general» en una pantalla de 1280 px
- **THEN** ve «Tu CV» a la izquierda y «Qué revisamos» a la derecha, en la misma fila

#### Scenario: Dirigido
- **WHEN** el usuario cambia a «Análisis dirigido»
- **THEN** «Qué revisamos» desaparece y en su lugar está «Convocatoria»

### Requirement: El historial no muestra un contador junto al título
Junto al título «Historial de análisis» NO SHALL mostrarse una etiqueta con la cantidad de análisis («4 análisis»). La tabla y su paginación ya muestran las filas.

#### Scenario: Historial con análisis
- **WHEN** el usuario tiene 4 análisis
- **THEN** la fila del título dice solo «Historial de análisis»

### Requirement: El panel de la pestaña no repite una pregunta
El panel de cada pestaña NO SHALL empezar con una pregunta («¿El ATS lee mi CV?», «¿Encajo en el aviso?»): empieza directamente con «Tu CV». El nombre de la pestaña ya dice qué análisis es.

#### Scenario: Panel
- **WHEN** el usuario abre cualquiera de las dos pestañas
- **THEN** lo primero del panel es la tarjeta «Tu CV»
