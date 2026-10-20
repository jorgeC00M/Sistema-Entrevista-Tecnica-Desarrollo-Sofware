## Purpose

Que configurar una entrevista desde una convocatoria sea un camino lineal (pegar o subir, analizar, revisar lo detectado, iniciar) y que toda entrevista, de cualquier pestaña, empiece después de una confirmación que dice qué va a pasar.

## ADDED Requirements

### Requirement: Entrada de la convocatoria en una columna

La pestaña "Con convocatoria" SHALL mostrar, en este orden:
1. un área de texto con la etiqueta visible "Texto de la convocatoria", un contador de caracteres (máximo 5000) y ejemplos para probar;
2. un separador "o";
3. una zona para subir un archivo PDF o DOCX;
4. el botón "Analizar convocatoria", alineado a la derecha.

La pestaña MUST NOT mostrar un conmutador entre pegar y subir, ni campos de selección de puesto, nivel o tecnología.

#### Scenario: Entrar a la pestaña
- **WHEN** el usuario selecciona "Con convocatoria"
- **THEN** ve el área de texto con su etiqueta, la zona de archivo debajo y "Analizar convocatoria" a la derecha, sin desplegables

### Requirement: Texto y archivo se excluyen

Mientras el área de texto tenga contenido, la zona de archivo SHALL estar deshabilitada e indicar "Borra el texto para subir un archivo". Mientras haya un archivo elegido, el área de texto MUST estar deshabilitada e indicar "Quita el archivo para pegar texto". "Analizar convocatoria" MUST habilitarse solo con 30 caracteres o más de texto, o con un archivo.

#### Scenario: Escribir bloquea el archivo
- **WHEN** el usuario escribe en el área de texto
- **THEN** la zona de archivo queda deshabilitada con la indicación correspondiente

#### Scenario: Elegir archivo bloquea el texto
- **WHEN** el usuario elige un PDF
- **THEN** el área de texto queda deshabilitada y se analiza el archivo

### Requirement: Resumen de lo detectado

Tras un análisis exitoso, debajo del botón SHALL aparecer el resumen:
- el puesto, la tecnología (con capas, "Frontend + Backend") y el nivel;
- los requisitos que orientarán las preguntas y lo que no se evalúa;
- un aviso si el nivel se supuso.

Si la configuración detectada está completa, MUST aparecer debajo "Iniciar entrevista". Un análisis fallido (aviso que no es de software, archivo ilegible o servicio no disponible) MUST mostrar el mensaje junto a la entrada, sin resumen.

#### Scenario: Aviso completo
- **WHEN** el usuario analiza un aviso de Full Stack con React y Express, de nivel Junior
- **THEN** el resumen muestra "Desarrollador Full Stack", "React + Express" y "Junior · Inicial", con "Iniciar entrevista" debajo

#### Scenario: Aviso que no es de software
- **WHEN** el análisis no identifica un puesto de desarrollo
- **THEN** se muestra el mensaje del servidor y no aparece resumen ni botón de inicio

### Requirement: Completar en Personalizada

Si el resumen queda incompleto (sin tecnología, o sin una de las capas de un puesto que las tiene), SHALL marcar el dato faltante y ofrecer "Completar en Personalizada" en lugar de "Iniciar entrevista". Ese botón MUST:
- pasar a la pestaña "Personalizada" con lo detectado ya cargado en los campos;
- conservar la convocatoria (sus requisitos siguen orientando las preguntas y se ve la etiqueta "Desde convocatoria");
- llevar el foco al primer campo vacío.

Cambiar a "Personalizada" con las pestañas MUST seguir descartando la convocatoria.

#### Scenario: Falta la tecnología
- **WHEN** el aviso indica Backend y Junior pero ninguna tecnología del catálogo
- **THEN** el resumen dice que la tecnología no se indicó y ofrece "Completar en Personalizada"; al pulsarlo, Puesto y Nivel aparecen cargados, el foco va a Tecnología y se mantiene "Desde convocatoria"

#### Scenario: Cambiar de pestaña a mano
- **WHEN** tras analizar, el usuario selecciona la pestaña "Personalizada"
- **THEN** los campos conservan los valores y la convocatoria deja de usarse

### Requirement: Confirmación informativa antes de iniciar

En ambas pestañas, "Iniciar entrevista" (sin icono) SHALL abrir el modal del sistema, titulado "Iniciar entrevista", con:
- el puesto, la tecnología y el nivel elegidos;
- "Basada en tu convocatoria" si aplica;
- tres indicaciones: la cantidad de preguntas, que la nota se ve al terminar y que la entrevista se puede abandonar.

El modal MUST ofrecer Cancelar y Comenzar:
- **Comenzar** MUST iniciar la entrevista mostrando que está cargando; si el inicio falla, MUST mostrar el error dentro del modal y dejarlo abierto.
- **Cancelar, la X y Esc** MUST cerrar sin iniciar y devolver el foco al botón.

#### Scenario: Iniciar desde Personalizada
- **WHEN** con todo elegido el usuario pulsa "Iniciar entrevista" y luego "Comenzar"
- **THEN** se crea la entrevista y se abre la pantalla de la entrevista

#### Scenario: Cancelar
- **WHEN** en el modal el usuario pulsa Cancelar
- **THEN** el modal se cierra, no se crea ninguna entrevista y el foco vuelve a "Iniciar entrevista"

#### Scenario: Error al iniciar
- **WHEN** el servidor rechaza el inicio
- **THEN** el modal sigue abierto y muestra el mensaje de error
