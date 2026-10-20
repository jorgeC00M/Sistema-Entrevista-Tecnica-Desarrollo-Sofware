## Purpose

Que el estilo del frontend se controle desde un lugar conocido —tokens y capas CSS más componentes base— y que se vea igual en toda la app: una regla de forma, un foco visible y un velo para los overlays, con una guarda que impida que vuelva a desviarse.

## ADDED Requirements

### Requirement: Capas CSS con responsabilidad única

El estilo global SHALL organizarse en archivos dentro de `src/styles/`:
- **tokens:** colores, radios, sombras, tipografía y velo;
- **base:** elementos HTML y preferencias del usuario;
- **utilidades:** reglas reutilizables como el foco y la base de campo;
- **overlays:** modal y cajón.

`styles/index.css` MUST limitarse a importarlos. Todo valor visual reutilizado MUST salir de un token.

#### Scenario: Cambiar el acento
- **WHEN** se cambia el valor de `--color-vidrio-acento` en `tokens.css`
- **THEN** cambian en toda la app los botones primarios, las pestañas activas, los anillos de foco y los enlaces de acción, sin tocar componentes

### Requirement: Regla de forma única

Los botones de **acción** (con texto) SHALL tener forma de píldora. Los **controles** (botones de solo icono, campos de formulario, tarjetas y paneles) MUST usar el radio de 8 px. Ningún componente MUST usar radios escritos a mano.

#### Scenario: Botón de acción
- **WHEN** se renderiza cualquier `Boton` con texto, en cualquier pantalla
- **THEN** su forma es píldora

#### Scenario: Botón de icono
- **WHEN** se renderiza el botón de cerrar del modal o el de mostrar contraseña
- **THEN** su radio es de 8 px

### Requirement: Botones solo desde los componentes base

Todo botón SHALL renderizarse con `Boton` o `BotonIcono`, o ser parte interna de un componente de `components/ui/`. Un enlace con apariencia de botón MUST usar las clases de `clasesDeBoton()` sobre el propio enlace y MUST NOT envolver un `<button>`. `Boton` MUST ofrecer las variantes primario, secundario, contorno, texto, peligro y fantasma, y los tamaños sm, md y lg.

#### Scenario: Enviar el login
- **WHEN** se renderiza el formulario de inicio de sesión
- **THEN** su botón de envío es un `Boton` primario de tamaño lg, con foco visible y estado de carga

#### Scenario: Enlace como botón
- **WHEN** el reporte ofrece "Practicar de nuevo este puesto"
- **THEN** es un único enlace con apariencia de botón, sin un `<button>` dentro

### Requirement: Foco visible en todo control interactivo

Todo botón, enlace, pestaña, campo y control interactivo SHALL mostrar un anillo de foco visible al recibir el foco por teclado, definido una sola vez como utilidad y con una variante para fondos oscuros.

#### Scenario: Recorrer el login con teclado
- **WHEN** el usuario recorre el login con Tab
- **THEN** cada campo, el botón para mostrar la contraseña, el de Google y el de enviar muestran un anillo de foco

#### Scenario: Carrusel de la landing
- **WHEN** el foco llega a las flechas o a los puntos del carrusel
- **THEN** muestran un anillo de foco

### Requirement: Un solo tratamiento de campo

Los campos de texto, área de texto y selección SHALL compartir la misma base visual: borde, fondo, radio de 8 px, foco y estados deshabilitado y con error.

#### Scenario: Campos de distintas pantallas
- **WHEN** se comparan el campo de correo del login, el área de texto de la convocatoria y el desplegable de Puesto
- **THEN** comparten borde, fondo, radio y anillo de foco

### Requirement: Overlays coherentes y animados

El modal SHALL abrirse con una animación breve de entrada (opacidad y escala) sobre un velo definido por token; al cerrarse desaparece sin animación, porque se desmonta. El cajón móvil MUST usar el mismo velo. Con `prefers-reduced-motion: reduce`, MUST abrirse y cerrarse sin animación.

#### Scenario: Abrir un modal
- **WHEN** el usuario pulsa "Abandonar" en la entrevista
- **THEN** el modal aparece con una transición breve sobre el velo común

#### Scenario: Movimiento reducido
- **WHEN** el sistema tiene activado reducir el movimiento
- **THEN** el modal aparece sin animación

### Requirement: Guarda contra la deriva

Una prueba automática SHALL recorrer los componentes y fallar si encuentra:
- `<button>` fuera de `components/ui/`;
- sombras, radios o tamaños de texto escritos a mano (`shadow-[`, `rounded-[`, `text-[` con unidad);
- colores de la paleta cruda de Tailwind.

Las excepciones MUST declararse en una lista explícita, con su motivo.

#### Scenario: Alguien agrega un botón a mano
- **WHEN** un componente nuevo de `features/` incluye `<button className="…">`
- **THEN** `pnpm test` falla e indica el archivo y la línea
