## Purpose

Definir cómo pide «Comparar con oferta» el CV y la convocatoria antes de analizar: dos pasos del mismo peso, el estado de cada uno, y la convocatoria solo como texto.

## ADDED Requirements

### Requirement: Dos pasos del mismo peso
La entrada de «Comparar con oferta» SHALL mostrar dos paneles:
- «Paso 1 · Sube tu CV», con la zona para subir el CV (PDF o DOCX);
- «Paso 2 · Pega la convocatoria», con el campo de texto de la convocatoria.

Desde 1024 px SHALL ir lado a lado, con el mismo ancho y la misma altura, el Paso 1 a la izquierda. Por debajo de 1024 px SHALL apilarse en ese orden, y el orden de lectura y de tabulación SHALL ser el visual. «Analizar CV» SHALL ir debajo de los dos paneles y habilitarse solo con el CV elegido y la convocatoria con texto que no sea solo espacios.

#### Scenario: Escritorio
- **WHEN** el usuario abre «Comparar con oferta» en una pantalla de 1366 px
- **THEN** ve «Paso 1 · Sube tu CV» y «Paso 2 · Pega la convocatoria» lado a lado, del mismo ancho

#### Scenario: Celular
- **WHEN** abre la misma pantalla a 360 px
- **THEN** ve el Paso 1, debajo el Paso 2 y al final «Analizar CV»

#### Scenario: Falta un paso
- **WHEN** eligió el CV pero la convocatoria está vacía
- **THEN** «Analizar CV» está deshabilitado

### Requirement: Un paso completo se marca
El encabezado de cada paso SHALL mostrar un check con el texto «Listo» cuando el paso está completo: el CV elegido en el Paso 1, y la convocatoria con texto que no sea solo espacios en el Paso 2. La marca MUST NOT depender solo del color. Si el usuario quita el CV o borra el texto, la marca SHALL desaparecer.

#### Scenario: CV elegido
- **WHEN** el usuario elige su CV
- **THEN** el Paso 1 muestra «Listo» con su check, y el Paso 2 no

#### Scenario: Borra la convocatoria
- **WHEN** borra todo el texto de la convocatoria
- **THEN** el Paso 2 deja de mostrar «Listo»

### Requirement: La convocatoria solo como texto
En el módulo de CV, la convocatoria SHALL pegarse o escribirse; MUST NOT ofrecerse subirla como archivo ni elegir entre vías. La API de análisis de CV SHALL recibir la convocatoria solo como texto. Un archivo de convocatoria enviado MUST ignorarse y no reemplazar ni completar la convocatoria. «Simular entrevista › Con convocatoria» no cambia en este cambio. (Después, `convocatoria-de-entrevista-solo-texto` la dejó también solo con texto.)

#### Scenario: La pantalla
- **WHEN** el usuario está en «Comparar con oferta»
- **THEN** el Paso 2 muestra solo el campo de texto, sin «Pegar texto / Subir archivo»

#### Scenario: Un cliente envía un archivo
- **WHEN** se llama a la API con un CV y un archivo de convocatoria, sin texto de convocatoria
- **THEN** el análisis se hace sin convocatoria, como un análisis general

### Requirement: El análisis general no cambia
La entrada de «Analizar CV» SHALL mantener su fila de 2/3 para «Tu CV» y 1/3 para «¿Qué revisamos?», sin numerar pasos: tiene una sola acción.

#### Scenario: Analizar CV
- **WHEN** el usuario abre «Analizar CV» en una pantalla de 1366 px
- **THEN** ve «Tu CV» en dos tercios y «¿Qué revisamos?» en el tercio derecho, sin «Paso 1» ni «Paso 2»
