## Purpose

Diagnosticar por qué un currículum queda fuera de la búsqueda de un reclutador que usa un ATS, midiendo el documento regla por regla y sin publicar nunca un puntaje.

## ADDED Requirements

### Requirement: El tipo de análisis ocupa la primera fila y viene en «general»
La entrada SHALL empezar con «Tipo de análisis» en una fila completa, con dos opciones:
- «Análisis general»;
- «Análisis dirigido».

El control con el que se elige lo define `tipo-de-analisis-en-pestanas`. Al entrar a `/mi-cv`, «Análisis general» SHALL venir elegido. Bajo el tipo NO SHALL haber texto de ayuda, pregunta ni explicación del ATS.

#### Scenario: Entrada
- **WHEN** el usuario entra a `/mi-cv` por primera vez
- **THEN** «Análisis general» está elegido

#### Scenario: Cambiar a dirigido
- **WHEN** el usuario elige «Análisis dirigido»
- **THEN** aparece la tarjeta «Convocatoria»

### Requirement: CV y convocatoria comparten fila
Desde 1024 px, «Tu CV» SHALL ocupar siempre la parte izquierda de la fila bajo el tipo de análisis, con cualquier tipo elegido (en proporción 2/3, ver `entrada-del-cv-dos-tercios`). Con «Análisis dirigido», «Convocatoria» (pegar texto o subir PDF/DOCX) SHALL ocupar la parte derecha de esa misma fila, con la misma altura que «Tu CV». Elegir o dejar el dirigido NO SHALL mover ni redimensionar «Tu CV».

#### Scenario: Dirigido en computadora
- **WHEN** en una pantalla de 1280 px el usuario elige «Análisis dirigido»
- **THEN** «Convocatoria» aparece a la derecha de «Tu CV», en la misma fila y con la misma altura

#### Scenario: General en computadora
- **WHEN** en una pantalla de 1280 px está elegido «Análisis general»
- **THEN** «Tu CV» ocupa la parte izquierda y a su derecha está «¿Qué revisamos?» (ver `entrada-del-cv-que-revisamos` y `entrada-del-cv-dos-tercios`)

### Requirement: Un solo orden en todos los anchos
El orden visual, el de lectura y el de Tab SHALL ser el mismo: tipo de análisis, Tu CV, Convocatoria (solo en dirigido) y «Analizar CV». Por debajo de 1024 px las tarjetas SHALL apilarse en ese orden.

#### Scenario: Celular
- **WHEN** el usuario abre `/mi-cv` en una pantalla de 390 px y elige «Análisis dirigido»
- **THEN** ve el tipo de análisis, debajo «Tu CV» y debajo «Convocatoria»

### Requirement: El botón espera a que el análisis esté listo
«Analizar CV» SHALL seguir deshabilitado mientras falte el CV o, en el análisis dirigido, la convocatoria. No hay un aviso de lo que falta: lo quitó `entrada-del-cv-que-revisamos`.

#### Scenario: Dirigido sin aviso
- **WHEN** el usuario eligió «Análisis dirigido» y subió su CV, pero no dio convocatoria
- **THEN** «Analizar CV» sigue deshabilitado
