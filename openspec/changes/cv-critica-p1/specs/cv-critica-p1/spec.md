## Purpose

Que el resultado del análisis de CV empiece por lo que solo Antesala puede mostrar (qué lee el ATS de tu CV), nunca culpe a la causa equivocada, diga cómo se protege el CV y nombre los problemas por su efecto sobre el ATS en lugar de juzgar el CV.

## ADDED Requirements

### Requirement: Un CV ilegible se muestra en un solo panel

Si el análisis contiene el hallazgo de CV sin capa de texto, el resultado SHALL mostrar, en lugar de las pestañas:
- la barra de contexto;
- lo que el ATS extrae (todos los campos sin detectar);
- un aviso con la causa (el archivo es una imagen) y el arreglo (exportarlo desde Word o Google Docs, sin escanear);
- la acción para volver a analizar.

En ese caso MUST NOT mostrarse ningún mensaje que atribuya el problema a la convocatoria, a barras de habilidades ni a la redacción.

#### Scenario: PDF escaneado con convocatoria
- **WHEN** el usuario analiza un PDF escaneado junto con una convocatoria
- **THEN** ve un solo panel con el espejo vacío y "Tu PDF es una imagen", sin pestañas y sin ningún aviso sobre la convocatoria

### Requirement: El Resumen gira en torno al espejo del ATS

La pestaña Resumen SHALL mostrar:
1. lo que el ATS lee del CV, campo por campo, con lo detectado y lo no detectado, en forma compacta;
2. las tres correcciones más importantes, ordenadas por efecto, con el enlace para ver todas;
3. una línea "Qué ya funciona" con las fortalezas, o nada si no hay ninguna.

En pantallas de 1024 px o más, las correcciones MUST ir al lado del espejo; por debajo, debajo de él.

#### Scenario: Primer vistazo al resultado
- **WHEN** termina el análisis de un CV legible
- **THEN** lo primero que se ve es qué campos lee el ATS, y a su lado las tres correcciones más importantes

### Requirement: Cuatro pestañas de resultado

El resultado de un CV legible SHALL ofrecer cuatro pestañas:

| Pestaña | Contenido |
|---|---|
| **Resumen** | el espejo, las correcciones principales y lo que ya funciona |
| **Qué mejorar** (con el número de correcciones) | todas las correcciones del ATS, las viñetas de logro y la redacción, cuando existan |
| **Requisitos** o **Tecnologías** | igual que antes |
| **Para la entrevista** | igual que antes |

Las fortalezas MUST NOT aparecer dentro de la pestaña de correcciones.

#### Scenario: Sin convocatoria y con viñetas
- **WHEN** el análisis no usa convocatoria y el CV tiene viñetas
- **THEN** aparecen las pestañas "Resumen", "Qué mejorar", "Tecnologías" y "Para la entrevista", y las viñetas están dentro de "Qué mejorar"

### Requirement: Privacidad y límites visibles al subir el CV

La nota de privacidad junto a la zona del CV se retiró por decisión del usuario (ver `entrada-del-cv-que-revisamos`); la garantía sigue siendo cierta en el sistema.

El tamaño máximo (2 MB) MUST verse antes de elegir un archivo.

#### Scenario: Antes de subir
- **WHEN** el usuario abre "Revisar mi CV"
- **THEN** ve, junto a la zona del CV, el formato y el máximo de 2 MB

### Requirement: Severidades nombradas por su efecto

Las correcciones SHALL rotularse por su efecto sobre el ATS:

| Gravedad | Rótulo | Color de estado |
|---|---|---|
| máxima | "Impide la lectura" | error |
| alta | "Resta visibilidad" | progreso |
| menor | "Detalle" | neutro |

Los rótulos MUST salir de una sola definición compartida por todas las vistas que los muestran, y MUST leerse como texto aparte del título para los lectores de pantalla.

#### Scenario: Una corrección grave
- **WHEN** el CV está en dos columnas (gravedad máxima)
- **THEN** su corrección lleva el rótulo "Impide la lectura" en el color de error, tanto en el Resumen como en "Qué mejorar"
