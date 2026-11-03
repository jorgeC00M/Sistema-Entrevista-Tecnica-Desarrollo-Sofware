## ADDED Requirements

### Requirement: Búsqueda de entrevistas por texto
Encima de la tabla de "Tus entrevistas", el sistema SHALL ofrecer un campo de búsqueda que filtre las entrevistas mientras el usuario escribe.

Una entrevista SHALL coincidir cuando el texto aparece en su puesto, su tecnología o su nivel. La comparación SHALL ignorar mayúsculas, tildes y los espacios al principio y al final.

El campo SHALL tener un nombre accesible y un botón para borrarlo cuando tenga texto.

#### Scenario: Buscar por tecnología
- **WHEN** el usuario escribe «django»
- **THEN** la tabla muestra solo las entrevistas cuya tecnología, puesto o nivel contiene «Django»

#### Scenario: Mayúsculas y tildes no importan
- **WHEN** el usuario escribe «SENIOR» o «senior»
- **THEN** ve las mismas entrevistas de nivel Senior
- **WHEN** escribe «movil»
- **THEN** encuentra las de «Desarrollador Móvil»

#### Scenario: Borrar la búsqueda
- **WHEN** el usuario pulsa el botón de borrar del campo
- **THEN** el campo queda vacío y la tabla vuelve a mostrar todas las entrevistas

### Requirement: Filtro por nivel
Junto al buscador, el sistema SHALL ofrecer un único selector, **Nivel**: Todos los niveles y los niveles del catálogo, en su orden (Junior, Semi-Senior, Senior). No SHALL ofrecer un filtro por estado: el estado se lee en su columna de la tabla.

El filtro SHALL combinarse con la búsqueda por texto: solo se muestran las entrevistas que cumplen ambos.

#### Scenario: Texto y nivel a la vez
- **WHEN** el usuario escribe «backend» y elige «Junior»
- **THEN** la tabla muestra solo las entrevistas Junior de Desarrollador Backend

#### Scenario: Sin filtro de estado
- **WHEN** el usuario abre "Historial y progreso"
- **THEN** junto al buscador ve solo el selector de Nivel, y la tabla sigue mostrando la columna Estado

#### Scenario: Solo un nivel
- **WHEN** el usuario elige «Senior»
- **THEN** la tabla muestra solo las entrevistas Senior

### Requirement: Paginación sin rango visible
La paginación SHALL mostrar solo sus botones (anterior, hasta tres números y siguiente), alineados a la derecha, sin el texto «Mostrando X–Y de N». Con un filtro activo, SHALL calcular las páginas sobre las entrevistas que coinciden.

Al cambiar de página, SHALL anunciar «Página <p> de <total>» a los lectores de pantalla, sin mostrarlo en pantalla.

Cambiar un filtro SHALL devolver la tabla a la página 1. Con una sola página, la paginación no SHALL mostrarse.

#### Scenario: Pocos resultados
- **WHEN** hay 14 entrevistas y la búsqueda deja 3
- **THEN** la tabla muestra las 3, sin paginación ni texto de rango

#### Scenario: Filtrar desde otra página
- **WHEN** el usuario está en la página 2 y escribe en el buscador
- **THEN** la tabla vuelve a la página 1 de los resultados

### Requirement: Búsqueda sin resultados
Cuando ninguna entrevista coincide, el sistema SHALL reemplazar la tabla por el mensaje «Ninguna entrevista coincide con tu búsqueda.» y un botón «Limpiar búsqueda». Ese botón SHALL vaciar el texto y poner el nivel en Todos los niveles.

#### Scenario: Sin coincidencias
- **WHEN** el usuario busca «kotlin» y no tiene entrevistas con esa tecnología
- **THEN** ve el mensaje y el botón, y al pulsar «Limpiar búsqueda» vuelven todas sus entrevistas

### Requirement: Los filtros se conservan en la dirección
El texto de búsqueda y el nivel SHALL reflejarse en la URL (`?q=` y `?nivel=`), junto a `?pagina=`. Así, volver desde unos resultados o recargar mantiene la misma vista filtrada.

Un nivel desconocido en la URL SHALL tratarse como «Todos los niveles». Un `?estado=` heredado de una dirección antigua SHALL ignorarse.

#### Scenario: Volver desde unos resultados
- **WHEN** el usuario filtra por «django» y «Junior», abre unos resultados y vuelve atrás
- **THEN** el campo dice «django», el nivel es «Junior» y la tabla muestra los mismos resultados

#### Scenario: Dirección con estado
- **WHEN** el usuario entra con `?estado=abandonada` en la URL
- **THEN** la tabla y los gráficos muestran todas las entrevistas, como sin ese parámetro

### Requirement: Evolución en tres tarjetas por nivel
"Evolución en el tiempo" SHALL mostrarse debajo de la tabla, en tres tarjetas: una por nivel (Junior, Semi-Senior y Senior), en el orden del catálogo.

Sin filtro de nivel, las tres tarjetas SHALL mostrarse siempre. Con un nivel elegido, SHALL mostrarse solo la de ese nivel. Si un nivel no tiene entrevistas finalizadas en lo que muestra la tabla, su tarjeta SHALL decir «Aún sin entrevistas <Nivel> finalizadas».

Desde 1280 px de ancho de ventana, las tres SHALL ir en una sola fila. Por debajo, SHALL apilarse en el mismo orden.

Las tres SHALL usar la misma escala vertical, de 0 a 100, con las mismas líneas guía. Así un mismo puntaje se ve a la misma altura en cualquiera de ellas.

#### Scenario: Escritorio
- **WHEN** el usuario abre el historial en una ventana de 1280 px o más
- **THEN** ve las tarjetas Junior, Semi-Senior y Senior una al lado de la otra

#### Scenario: Pantalla angosta
- **WHEN** la ventana mide menos de 1280 px
- **THEN** las tres tarjetas se apilan en ese orden

#### Scenario: Nivel sin datos
- **WHEN** el usuario no tiene entrevistas Senior finalizadas
- **THEN** la tarjeta Senior sigue en su lugar y dice «Aún sin entrevistas Senior finalizadas»

#### Scenario: Filtro de nivel
- **WHEN** el usuario elige «Junior» en el filtro de Nivel
- **THEN** "Evolución en el tiempo" muestra solo la tarjeta Junior, a todo el ancho

### Requirement: Una línea por puesto, con color fijo
Dentro de cada tarjeta, SHALL dibujarse una línea por puesto con las entrevistas finalizadas de ese puesto en ese nivel.

Cada puesto SHALL tener siempre el mismo color, en las tres tarjetas y con cualquier filtro. Los colores SHALL distinguirse entre sí para personas con daltonismo y no SHALL ser los de estado de una nota (verde, ámbar, rojo).

Una sola leyenda sobre las tres tarjetas SHALL nombrar los puestos que aparecen en ellas, con su color.

En pantalla no SHALL mostrarse una frase de lectura. Cada tarjeta SHALL tener un resumen para lectores de pantalla que diga, por puesto, «<Puesto>: de <primera> a <última> en <n> entrevistas».

#### Scenario: Dos puestos en el mismo nivel
- **WHEN** el usuario tiene entrevistas Junior finalizadas de Backend y de Frontend
- **THEN** la tarjeta Junior muestra dos líneas de colores distintos, y la leyenda nombra Backend y Frontend

#### Scenario: El color no cambia
- **WHEN** Backend aparece en las tarjetas Junior y Semi-Senior
- **THEN** su línea tiene el mismo color en las dos

### Requirement: Eje por número de entrevista
El eje horizontal SHALL ser el número de entrevista dentro de cada puesto (1, 2, 3…), en orden de fecha de finalización. No SHALL ser el calendario.

La fecha de cada punto SHALL verse al pasar el puntero.

Cuando entre dos entrevistas consecutivas de un mismo puesto hayan pasado más de 90 días, el gráfico SHALL marcar ese salto con una línea punteada que indique los días transcurridos.

Con más de 8 entrevistas, el eje SHALL rotular solo algunas posiciones: la primera, las múltiplos de 5 y la última. Los puntos SHALL seguir dibujándose todos.

#### Scenario: Diez entrevistas en una semana
- **WHEN** el usuario hizo 10 entrevistas Backend Junior en 7 días
- **THEN** se ven 10 puntos igualmente espaciados, no apiñados

#### Scenario: Salto de años
- **WHEN** entre la entrevista 1 y la 2 de un puesto pasaron 3 años
- **THEN** entre ambos puntos aparece una línea punteada que indica los días transcurridos

### Requirement: Cuadro de detalle de un punto
Al pasar el puntero sobre un punto del gráfico, o al enfocarlo con el teclado, SHALL aparecer junto a él un cuadro con cuatro datos de esa entrevista:
- **Fecha:** de finalización, día/mes/año.
- **Puesto.**
- **Tecnología:** las dos unidas con « + » en Full Stack, o «—» si no tiene.
- **Puntaje:** «<nota>/100».

El cuadro SHALL cerrarse al salir el puntero, al perder el foco o con Esc. SHALL quedar dentro de la tarjeta aunque el punto esté en un borde.

Cada punto SHALL poder enfocarse con Tab y SHALL tener un nombre accesible con esos mismos datos.

Todos los puntos SHALL dibujarse igual, rellenos con el color de su puesto, sin distinguir si la entrevista fue personalizada o vino de una convocatoria. La leyenda SHALL nombrar solo los puestos.

#### Scenario: Pasar el puntero
- **WHEN** el usuario pasa el puntero sobre el punto de una entrevista de Desarrollador Backend con Django, terminada el 21/10/2026 con 75
- **THEN** aparece un cuadro con «Fecha 21/10/2026», «Puesto Desarrollador Backend», «Tecnología Django» y «Puntaje 75/100»

#### Scenario: Con teclado
- **WHEN** el usuario llega con Tab a un punto
- **THEN** aparece el mismo cuadro, y al pulsar Esc se cierra

#### Scenario: Entrevista desde convocatoria
- **WHEN** una entrevista del gráfico se inició desde una convocatoria
- **THEN** su punto se ve igual que el de una personalizada, y la leyenda no menciona el origen

### Requirement: Los gráficos siguen a la tabla
Los gráficos SHALL dibujarse con las mismas entrevistas que muestra la tabla después de aplicar la búsqueda y el nivel. Cambiar un filtro SHALL actualizar a la vez la tabla y los gráficos.

#### Scenario: Filtrar por puesto
- **WHEN** el usuario escribe «backend» en el buscador
- **THEN** cada tarjeta muestra solo la línea de Backend, y las tarjetas sin entrevistas Backend muestran su mensaje

### Requirement: Sin filtro por origen
La búsqueda SHALL ofrecer solo el texto y el filtro de Nivel. No SHALL ofrecer un filtro de origen (personalizada o con convocatoria). Un `?origen=` en la URL SHALL ignorarse.

La tabla SHALL seguir mostrando la etiqueta «Convocatoria» junto al puesto de las entrevistas iniciadas desde una convocatoria.

#### Scenario: Barra de búsqueda
- **WHEN** el usuario abre "Historial y progreso"
- **THEN** ve el campo de búsqueda y el selector de Nivel, y ningún selector de Origen ni de Estado

#### Scenario: Dirección antigua
- **WHEN** el usuario entra con `?origen=convocatoria` en la URL
- **THEN** la tabla y los gráficos muestran todas las entrevistas, como sin ese parámetro

### Requirement: Encabezado con descripción
Bajo el título «Historial y progreso», la página SHALL mostrar solo esta descripción: «Revisa tus entrevistas anteriores y sigue cómo evoluciona tu puntaje en cada puesto y nivel.».

No SHALL mostrar el número de entrevistas registradas, el de completadas ni el promedio general.

#### Scenario: Encabezado
- **WHEN** el usuario abre "Historial y progreso"
- **THEN** ve el título y la descripción, y ninguna cifra de entrevistas ni promedio

### Requirement: Sin endpoint de estadísticas
La API SHALL no ofrecer `GET /api/estadisticas/`, que se usaba solo para las cifras del encabezado. `GET /api/estadisticas/retroalimentacion/` SHALL seguir disponible sin cambios.

#### Scenario: Endpoint retirado
- **WHEN** un cliente autenticado pide `GET /api/estadisticas/`
- **THEN** recibe 404, y `GET /api/estadisticas/retroalimentacion/` sigue respondiendo 200

### Requirement: El historial no repite el desglose por área
"Historial y progreso" SHALL no mostrar un gráfico de promedio por área. El desglose por área SHALL seguir disponible en Retroalimentación.

#### Scenario: Página de historial
- **WHEN** el usuario abre "Historial y progreso"
- **THEN** ve el título con su descripción, el buscador con la tabla y "Evolución en el tiempo" con sus tarjetas por nivel, y ningún «Promedio por área»

### Requirement: Acción con icono
La columna Acción de la tabla, y la tarjeta de cada entrevista en pantallas angostas, SHALL mostrar un enlace con icono y un verbo corto:
- **ojo + «Ver»** para una entrevista finalizada o abandonada, que lleva a sus resultados;
- **play + «Continuar»** para una entrevista en curso, que la retoma.

El nombre accesible de cada enlace SHALL decir de qué entrevista se trata: «Ver resultados: <Puesto> del <fecha>» o «Continuar: <Puesto> del <fecha>». El icono SHALL ser decorativo.

El mismo enlace (ojo + «Ver») SHALL usarse en Retroalimentación para abrir la entrevista de una observación, con el nombre accesible «Ver la entrevista completa: pregunta <n> de <área>».

#### Scenario: Entrevista finalizada
- **WHEN** el usuario mira la fila de una entrevista de Desarrollador Backend finalizada el 21/10/2026
- **THEN** la columna Acción muestra el icono de ojo y «Ver», y un lector de pantalla anuncia «Ver resultados: Desarrollador Backend del 21/10/2026»

#### Scenario: Entrevista en curso
- **WHEN** el usuario mira la fila de una entrevista en curso
- **THEN** la columna Acción muestra el icono de play y «Continuar», y al pulsarlo retoma la entrevista

#### Scenario: Observación en Retroalimentación
- **WHEN** el usuario pulsa el ojo + «Ver» de una observación
- **THEN** se abren los resultados de esa entrevista
