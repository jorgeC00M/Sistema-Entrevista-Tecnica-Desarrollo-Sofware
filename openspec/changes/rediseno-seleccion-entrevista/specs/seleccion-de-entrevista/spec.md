## Purpose

Permitir que el candidato configure una entrevista como en una postulación real: busca y elige un puesto, una tecnología propia de ese puesto y su nivel de experiencia, en una sola página, con la opción de repetir su última configuración.

## ADDED Requirements

### Requirement: Catálogo de puestos con sus tecnologías

El sistema SHALL ofrecer los puestos activos, cada uno con: nombre, descripción, icono, palabras clave, las áreas que cubre y sus tecnologías activas en orden. Una tecnología MUST pertenecer a un único puesto; si el mismo nombre aplica a dos puestos, son dos tecnologías distintas. Ningún puesto ni tecnología MUST estar escrito en el código de la interfaz.

#### Scenario: Consultar el catálogo
- **WHEN** un usuario autenticado pide `GET /api/catalogos/puestos/`
- **THEN** recibe los 6 puestos activos, cada uno con sus tecnologías, palabras clave e icono, en una sola respuesta

#### Scenario: Tecnología repetida entre puestos
- **WHEN** se consultan los puestos Backend y Escritorio
- **THEN** ambos incluyen "C# .NET", con códigos distintos

#### Scenario: Sin sesión
- **WHEN** se pide el catálogo de puestos sin autenticación
- **THEN** la respuesta es 401

### Requirement: Lo más practicado sale de datos reales

El catálogo de puestos SHALL incluir hasta 5 combinaciones puesto + tecnología "más practicadas", ordenadas por el número de entrevistas iniciadas con esa combinación entre todos los usuarios. Solo cuentan las combinaciones activas. Si hay menos de 5 con datos, el resto MUST completarse con la primera tecnología de cada puesto en orden de catálogo, sin repetir.

#### Scenario: Sin entrevistas todavía
- **WHEN** no existe ninguna entrevista
- **THEN** "lo más practicado" contiene la primera tecnología de los 5 primeros puestos

#### Scenario: Con historial
- **WHEN** la combinación Backend + Python tiene más entrevistas que cualquier otra
- **THEN** aparece primera en "lo más practicado"

### Requirement: Niveles Junior, Semi-Senior y Senior

El sistema SHALL ofrecer exactamente tres niveles: `junior` (Inicial), `semi_senior` (Intermedio) y `senior` (Avanzado), mostrados con su nombre y su grado. Las entrevistas existentes MUST conservar su nivel: Básico (luego Practicante) pasa a Junior; Intermedio (luego Junior) pasa a Semi-Senior.

#### Scenario: Entrevista antigua
- **WHEN** se consulta el historial de una entrevista creada con nivel Básico
- **THEN** su nivel se muestra como Junior y sus notas, áreas y evaluaciones no cambian

#### Scenario: Senior disponible
- **WHEN** el usuario elige un puesto
- **THEN** puede elegir Junior, Semi-Senior o Senior

### Requirement: Iniciar una entrevista exige puesto, tecnología y nivel coherentes

`POST /api/entrevistas/` SHALL exigir puesto, tecnología y nivel activos. Si la tecnología no pertenece al puesto, la petición MUST rechazarse con 400 y no crear ninguna entrevista ni llamar a la IA.

#### Scenario: Combinación válida
- **WHEN** se inicia con puesto Frontend, tecnología React de Frontend y nivel junior
- **THEN** se crea la entrevista con esos tres valores y responde 201

#### Scenario: Tecnología de otro puesto
- **WHEN** se inicia con puesto Frontend y la tecnología Flutter de Móvil
- **THEN** responde 400 indicando que la tecnología no pertenece al puesto

#### Scenario: Sin tecnología
- **WHEN** se inicia sin tecnología
- **THEN** responde 400

### Requirement: Última configuración

`GET /api/entrevistas/ultima-configuracion/` SHALL devolver el puesto, la tecnología y el nivel de la entrevista más reciente del usuario, con códigos y nombres, o 204 si el usuario no tiene entrevistas. Si la tecnología de esa entrevista está inactiva o es nula, MUST devolverse nula en lugar de omitir la respuesta.

#### Scenario: Usuario con entrevistas
- **WHEN** la última entrevista del usuario fue Backend + Python + practicante
- **THEN** recibe esos tres valores

#### Scenario: Usuario nuevo
- **WHEN** el usuario no tiene entrevistas
- **THEN** la respuesta es 204 sin cuerpo

#### Scenario: Solo las propias
- **WHEN** otro usuario tiene una entrevista más reciente
- **THEN** la respuesta refleja solo las entrevistas del usuario autenticado

### Requirement: Búsqueda de puestos en el navegador

La pantalla SHALL filtrar los puestos mientras se escribe, sin distinguir mayúsculas ni tildes. Debe buscar en el nombre, la descripción, las tecnologías y las palabras clave, y exigir que coincidan todas las palabras escritas. MUST:
- resaltar la coincidencia en el nombre y la descripción;
- anunciar el número de resultados en una región `aria-live`;
- ofrecer atajos "Ir directo a" con hasta 6 tecnologías que coincidan, cuando se escriben 2 o más caracteres;
- mostrar un estado vacío con sugerencias de búsqueda cuando nada coincide.

Los resultados MUST ordenarse por relevancia: una coincidencia en el nombre pesa más que en una tecnología, esta más que en una palabra clave y esta más que en la descripción; con empate se respeta el orden del catálogo. El resaltado MUST cubrir todas las palabras de la consulta y no puede interpretar el texto como HTML. La consulta MUST conservarse en la URL (`?q=`). Con el buscador vacío MUST mostrarse "Lo más practicado". La tecla "/" enfoca el buscador y Esc lo borra.

#### Scenario: Sin tildes
- **WHEN** el usuario escribe "movil"
- **THEN** aparece Desarrollador Móvil, con "Móvil" resaltado

#### Scenario: Atajo a una tecnología
- **WHEN** el usuario escribe "react" y pulsa el atajo "React Native · Móvil"
- **THEN** quedan elegidos el puesto Móvil y la tecnología React Native

#### Scenario: Relevancia
- **WHEN** el usuario escribe "react"
- **THEN** Desarrollador Frontend aparece antes que Desarrollador Full Stack

#### Scenario: Varias palabras
- **WHEN** el usuario escribe "react native"
- **THEN** solo aparece Desarrollador Móvil

#### Scenario: Símbolos en la consulta
- **WHEN** el usuario escribe "c#"
- **THEN** aparecen Desarrollador Backend y Desarrollador de Escritorio

#### Scenario: Texto del catálogo con caracteres de HTML
- **WHEN** una descripción del catálogo contiene "<script>"
- **THEN** se muestra como texto literal, resaltado si coincide, y no se ejecuta

#### Scenario: Recargar la página
- **WHEN** el usuario buscó "qa" y recarga
- **THEN** el buscador conserva "qa" y la lista sigue filtrada

#### Scenario: Nada coincide
- **WHEN** el usuario escribe "cocina"
- **THEN** ve un mensaje de que no hay puestos y sugerencias de búsqueda que, al pulsarlas, reemplazan el texto del buscador

### Requirement: Elección y comienzo

Al elegir un puesto SHALL aparecer su lista de tecnologías y la elección de experiencia. Cambiar de puesto MUST borrar la tecnología elegida. La barra de resumen fija MUST mostrar lo elegido o lo que falta. "Comenzar entrevista" MUST estar habilitado solo con las tres elecciones; al pulsarlo inicia la entrevista y navega a ella. "Repetir configuración" MUST rellenar las tres elecciones desde la última configuración, descartando las que ya no estén activas. Las opciones MUST exponer `aria-pressed`. La opción de pegar la convocatoria MUST verse deshabilitada con el texto "Próximamente".

#### Scenario: Cambiar de puesto
- **WHEN** el usuario tenía Frontend + React y elige Backend
- **THEN** la tecnología queda sin elegir y "Comenzar entrevista" se deshabilita

#### Scenario: Comenzar
- **WHEN** hay puesto, tecnología y experiencia elegidos y el usuario pulsa "Comenzar entrevista"
- **THEN** se crea la entrevista y la pantalla navega a la entrevista nueva

#### Scenario: Error al comenzar
- **WHEN** el servidor responde con error al iniciar
- **THEN** se muestra el mensaje de error, las elecciones se conservan y el botón vuelve a habilitarse

#### Scenario: Llegar con preselección
- **WHEN** el usuario llega a `/nueva-entrevista?puesto=backend&nivel=junior`
- **THEN** el puesto y el nivel quedan preseleccionados si existen en el catálogo, sin iniciar nada
