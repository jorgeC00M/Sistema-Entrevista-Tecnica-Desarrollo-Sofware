## Purpose

Diagnosticar por qué un currículum queda fuera de la búsqueda de un reclutador que usa un ATS, midiendo el documento regla por regla y sin publicar nunca un puntaje.

## ADDED Requirements

### Requirement: «Plan de Mejora» abre con la tarjeta «Arreglar el formato»
La pestaña «Plan de Mejora», en los dos tipos de análisis, SHALL mostrarse en una sola columna y empezar con una tarjeta «Arreglar el formato», con la frase «Hazlo primero: si el sistema no lee un dato, tampoco lo puede comparar.». Debajo SHALL seguir el análisis de viñetas y la redacción con IA. La pestaña NO SHALL mostrar «Lo que ya funciona», el conteo de correcciones medidas y sugerencias, ni el aviso «La IA no encontró nada que sugerir». Los avisos de que las sugerencias de IA se están pidiendo o fallaron SHALL mantenerse.

#### Scenario: Orden de la pestaña
- **WHEN** el usuario abre «Plan de Mejora»
- **THEN** lo primero es «Arreglar el formato» y debajo están las viñetas y la redacción

### Requirement: Cada arreglo es una fila con acción y antes y después
Cada corrección medida SHALL ser una fila de la tarjeta, en orden de gravedad, sin casilla «marcar como hecho» (se retiró por decisión del usuario, ver `plan-de-mejora-sin-casilla-y-con-brechas`), con:
- **a la izquierda,** la acción, la etiqueta de su severidad («Resta visibilidad», «Impide la lectura» o «Detalle») y cómo hacerlo;
- **a la derecha, apiladas,** una caja «AHORA» con lo que se encontró (el diagnóstico medido) y, si la corrección tiene ejemplo, una caja «DESPUÉS» con ese ejemplo.

En pantallas de menos de 640 px, las cajas SHALL ir debajo del texto. «AHORA» NO SHALL mostrar texto copiado del CV: el CV no se guarda. Cada fila SHALL poder recibir el foco desde el enlace de su error en el Resumen.

#### Scenario: Corrección con ejemplo
- **WHEN** el CV está maquetado a dos columnas
- **THEN** la fila dice «Pásalo a una sola columna», con «AHORA: Tu CV está maquetado a dos columnas» y «DESPUÉS» con el ejemplo de una columna

#### Scenario: Corrección sin ejemplo
- **WHEN** la corrección no tiene ejemplo (por ejemplo, demasiadas páginas)
- **THEN** la fila muestra solo la caja «AHORA»

#### Scenario: Sin arreglos
- **WHEN** el análisis no tiene correcciones medidas
- **THEN** la tarjeta muestra una fila con el icono de éxito y «No hay arreglos de formato pendientes»

### Requirement: Plan de Mejora no puntúa
La pantalla NO SHALL mostrar puntaje, porcentaje ni conteo de avance de los arreglos. El sistema NO SHALL guardar qué arreglos se dieron por hechos (ver `plan-de-mejora-sin-casilla-y-con-brechas`).

#### Scenario: Sin avance
- **WHEN** el usuario abre «Plan de Mejora»
- **THEN** no ve casillas, porcentajes ni conteos de arreglos
