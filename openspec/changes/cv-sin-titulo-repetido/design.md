## Context

- **`Header.tsx`** es fijo, mide 64 px y muestra «Simulador técnico / <sección>» y un subtítulo tomados de `titulosDeRuta.ts`. Es igual en todas las pantallas y en el celular contiene el botón ☰.
- **`CurriculumPage`** pinta, bajo ese encabezado:
  - un `<h1>` visible, «Revisa tu CV contra los filtros ATS»;
  - un párrafo sobre el ATS, que solo aparece en la entrada (`enResultado`, del cambio `intro-solo-en-la-entrada-del-cv`).
- **Regla del proyecto:** cada página bajo `RutaProtegida` tiene su propio `<h1>`, y el encabezado usa un `<p>` precisamente para no duplicarlo.

## Goals / Non-Goals

**Goals:**
- Subir las tarjetas de la entrada y la barra del resultado unos 120 px.
- Mantener un solo `<h1>` por página.
- Conservar la explicación del ATS para quien la necesite.

**Non-Goals:**
- No se toca `Header`, ni `titulosDeRuta`, ni las demás pantallas.

## Decisions

**D1. El `<h1>` queda con la clase `sr-only` y dice «Revisar mi CV».**
- Borrarlo dejaría la página sin título principal, y los lectores de pantalla navegan por títulos.
- Dice lo mismo que el encabezado visible, así que lo que se ve y lo que se oye coinciden.
- **Alternativa descartada:** convertir el texto del encabezado en `<h1>` solo para esta ruta. Rompería la regla de que el encabezado es chrome y cada página tiene su propio título, y haría que esta pantalla fuera distinta de las demás en el código.

**D2. La explicación pasa a un `<details>` dentro de `EleccionDeTipo`, bajo el `legend`.**
- Ahí es donde el usuario decide «¿el ATS lee mi CV?», así que la pregunta «¿qué es un ATS?» aparece en el momento en que surge.
- `<details>`/`<summary>` nativos: teclado y lectores de pantalla funcionan sin código extra.
- Es el mismo patrón que «Consérvalo al corregir» y «Preguntas que podrían hacerte»: `summary` con `foco-anillo` y `rounded-control`.
- **Alternativa descartada:** un `Tooltip` con un ícono «i». Un tooltip no sirve para tres frases, y en el celular no hay *hover*.

**D3. Se elimina `enResultado`.** Sin párrafo, ya no hay nada que mostrar u ocultar según la vista. `cargandoAnalisis` y `visible` siguen, porque los usa el resto de la página.

## Risks / Trade-offs

- **[Quien entra por primera vez no ve la explicación salvo que la abra]** → «¿Qué es un ATS?» está a la vista en la tarjeta que hay que usar sí o sí, y el subtítulo del encabezado ya dice «Qué lee un ATS de tu currículum». (Después, en `tipo-de-analisis-en-combo`, el usuario retiró el desplegable: queda solo el subtítulo.)
- **[Esta pantalla queda distinta de las demás, que sí muestran título]** → Es una decisión del usuario para probar el formato aquí primero; queda anotado en `CLAUDE.md` como candidato para extender.
