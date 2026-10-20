## Context

`SeleccionPuestoPage` envuelve todo en `<div className="max-w-3xl">`, una excepción dejada por `pantallas-responsivas`. La tarjeta (`rounded-control border … bg-white`) contiene `Pestanas` y un único `tabpanel`:
- **"Personalizada":** `FormularioDeEntrevista` (`grid grid-cols-1 sm:grid-cols-2`, con Tecnología en `sm:col-span-2` si no hay capas) más `ResumenDeEntrevista` (el texto arriba y, debajo, una fila con la etiqueta y el botón).
- **"Con convocatoria":** `PanelDeConvocatoria` (`flex flex-col gap-5`: `EleccionDeVia`, el campo, el error, "Analizar" y el slot `resumen`).

Ver proposal.md.

## Goals / Non-Goals

**Goals:**
- Que la pantalla ocupe el contenedor completo en escritorio.
- Que los campos vayan en una fila y la convocatoria en dos columnas, solo con clases responsivas.

**Non-Goals:**
- Tocar `seleccion.ts`, el foco, el modal, las pestañas, la API o el aspecto por debajo de 1024 px.

## Decisions

### D1. Solo se quita el ancho máximo de la página
`<div className="max-w-3xl">` pasa a `<div>`. La cabecera ya es `sm:flex-row sm:justify-between`, así que "Repetir última" queda a la derecha del contenedor sin más cambios.

### D2. Rejilla de campos según el número de columnas
En `FormularioDeEntrevista`, la rejilla añade `lg:grid-cols-3` sin capas, o `lg:grid-cols-4` con dos. El campo único de Tecnología pasa de `sm:col-span-2` a `sm:col-span-2 lg:col-span-1`.
- **El orden del DOM no cambia:** Puesto, Nivel, Tecnología. Así se conservan el Tab y `destinoDelFoco()`, que busca el primer `<select>` vacío.
- **Por qué clases fijas y no `grid-cols-[repeat(n,…)]`:** la guarda de estilos y Tailwind solo ven clases literales.

### D3. Resumen en una fila desde `lg`
`ResumenDeEntrevista` pasa de dos filas a `flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between`:
- **izquierda:** el texto, "Cubre: …" y la etiqueta "Desde convocatoria", que baja dentro de ese bloque;
- **derecha:** el botón, `lg:shrink-0`.

En móvil y tablet se ve como hoy.

### D4. Convocatoria en dos columnas, con aviso previo solo en escritorio
`PanelDeConvocatoria` pasa a `grid gap-6 lg:grid-cols-2 lg:items-start`:
- **primera columna:** el bloque de entrada actual, sin cambios internos;
- **segunda columna:** `resumen` si existe; si no, un aviso con `hidden lg:flex`, borde discontinuo `border-vidrio-borde` y `rounded-control`, el icono `documento` y el texto "Aquí verás el puesto, la tecnología y el nivel detectados".
- **Por qué solo en escritorio:** en una columna, un hueco de aviso debajo del botón no aporta nada.
- **Por qué un aviso y no una columna vacía:** evita que la entrada se desplace al aparecer el resultado y dice qué esperar.
- **Foco:** tras analizar sigue yendo al botón del resumen (`alAnalizar`), sin cambios.

## Risks / Trade-offs

- [Selects de 1/4 del ancho en Full Stack a 1024 px (unos 220 px con la barra de iconos)] → los nombres más largos ("Kotlin (Jetpack Compose)") caben en ese ancho, y si no, el `select` nativo recorta el valor visible y muestra la lista completa al abrirse. Se revisa en la prueba manual.
- [La etiqueta "Desde convocatoria" cambia de sitio en escritorio] → sigue junto al resumen que califica.
- [Sustituye una excepción de un cambio sin archivar] → se archiva después de `pantallas-responsivas`.
