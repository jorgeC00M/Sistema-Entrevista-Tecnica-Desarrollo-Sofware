## Purpose

Que el sidebar ofrezca solo los destinos útiles, sin duplicados, ordenados según el recorrido del estudiante: preparar, practicar y revisar el progreso.

## ADDED Requirements

### Requirement: Destinos agrupados por etapa

El sidebar SHALL mostrar, bajo el botón principal, dos grupos de destinos, cada uno con su rótulo y en este orden:
1. **"PREPARARTE"**, con "Revisar mi CV";
2. **"TU PROGRESO"**, con "Historial y progreso" y "Retroalimentación".

El botón principal MUST seguir mostrando "Nueva entrevista" y, si hay una entrevista a medias, "Continuar · n/total".

Con el sidebar plegado, el rótulo de cada grupo MUST reemplazarse por una línea separadora visible y seguir disponible para lectores de pantalla.

Las mismas reglas MUST aplicarse en el cajón móvil, en la barra de iconos de tablet y en el sidebar de escritorio.

#### Scenario: Sidebar desplegado
- **WHEN** el usuario mira el sidebar en escritorio
- **THEN** ve "PREPARARTE" con "Revisar mi CV" y debajo "TU PROGRESO" con "Historial y progreso" y "Retroalimentación"

#### Scenario: Sidebar plegado
- **WHEN** el sidebar está plegado
- **THEN** cada grupo se separa con una línea, y un lector de pantalla anuncia su nombre

### Requirement: Sin destinos duplicados

El sidebar MUST NOT mostrar los destinos "Entrevista en curso", "Resultados" ni "Mi perfil" como ítems de la lista:
- a una entrevista a medias se llega con "Continuar";
- a los reportes, desde "Historial y progreso";
- al perfil, desde el bloque de usuario.

Las rutas de esas pantallas MUST seguir funcionando.

#### Scenario: Entrevista a medias
- **WHEN** el usuario tiene una entrevista sin terminar
- **THEN** ve "Continuar · n/total" en el botón principal y ningún ítem "Entrevista en curso" en la lista

#### Scenario: Entrevistas finalizadas
- **WHEN** el usuario tiene entrevistas terminadas
- **THEN** no aparece un ítem "Resultados", y sus reportes se abren desde "Historial y progreso"

### Requirement: El bloque de usuario lleva al perfil

El bloque con el avatar, el nombre y el correo, al pie del sidebar, SHALL ser un enlace a "Mi perfil" y MUST marcarse como la sección actual (visualmente y con `aria-current`) cuando el usuario está en esa pantalla.

Con el sidebar plegado, MUST mostrarse solo el avatar, con el nombre "Mi perfil" en un tooltip al pasar el cursor o al enfocarlo, y con un área táctil de al menos 44×44 px. En el cajón móvil, elegirlo MUST cerrar el cajón.

"Cerrar sesión" MUST seguir debajo, sin cambios.

#### Scenario: Ir al perfil
- **WHEN** el usuario pulsa su nombre al pie del sidebar
- **THEN** llega a "Mi perfil" y el bloque queda marcado como sección actual

#### Scenario: Perfil con el sidebar plegado
- **WHEN** el sidebar está plegado y el usuario enfoca el avatar con el teclado
- **THEN** aparece el tooltip "Mi perfil" y Enter lo lleva a esa pantalla
