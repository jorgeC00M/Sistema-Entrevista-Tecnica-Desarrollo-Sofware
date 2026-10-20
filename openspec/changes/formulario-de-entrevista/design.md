## Context

Hoy `SeleccionPuestoPage` pinta tres `PasoDeSeleccion` (tarjetas, botones por capa y grupo, niveles), y su estado es un reducer puro en `features/seleccion/seleccion.ts` con `abierto`, avance automático y la acción `editar`. La convocatoria se analiza en `ConvocatoriaModal` (un `Modal` de dos pasos que usa `ControlSegmentado`, la `textarea`, `ZonaDeArchivo` de `features/curriculum` y `analizarConvocatoria`), y "Usar este perfil" llama a `aplicar`. La API ya entrega todo lo necesario, incluidos `capa` y `grupo`. Ver proposal.md.

## Goals / Non-Goals

**Goals:**
- Un formulario de campos con etiqueta y `<select>` nativo, accesible por construcción.
- La convocatoria como un modo del mismo formulario, sin modal.
- Conservar la lógica pura testeable y eliminar lo que deja de usarse.

**Non-Goals:**
- Desplegables personalizados con iconos (descartado por el usuario).
- Cambios en el backend, la API o el formato del perfil de convocatoria.
- Tests de componentes (sigue sin haber DOM en Vitest).

## Decisions

### D1. `<select>` nativo con estilo, no un listbox propio
Con el `<select>` nativo, el teclado, el lector de pantalla y el selector del sistema en el móvil vienen hechos, y `<optgroup>` resuelve los grupos sin código.
- Se estiliza con `appearance-none`, el borde y el fondo de los tokens `vidrio-*`, un chevron (icono `desplegar`) superpuesto con `pointer-events-none` y foco con `outline` de acento.
- **Coste aceptado:** el puesto pierde su icono en la lista; su descripción pasa al texto de ayuda del campo.

### D2. `CampoSelect`, un componente de campo
Props: `id`, `etiqueta`, `valor`, `opciones` (lista plana o `[grupo, opciones][]`), `onCambiar`, `ayuda?`, `deshabilitado?` y `marcador = "Selecciona…"`.
- Renderiza `<label htmlFor>`, `<select>` (con `aria-describedby` hacia la ayuda) y la ayuda.
- El marcador es una `<option value="" disabled>`, visible solo mientras no hay valor.
- Vive en `features/seleccion/components/`: hoy solo lo usa esta pantalla, y si otra lo necesita se mueve a `components/ui`.

### D3. `seleccion.ts` deja de modelar pasos
Se eliminan `abierto`, `Paso`, `PASOS`, `estadoDelPaso`, la acción `editar` y `avanzar`. `pasoPendiente` se convierte en `campoFaltante(seleccion, catalogo): Campo | null` (`'puesto' | 'tecnologia' | 'nivel'`), que alimenta la barra y el foco.

Las acciones `elegirPuesto`, `elegirTecnologia`, `elegirNivel` y `aplicar` se mantienen con sus reglas:
- cambiar de puesto vacía las tecnologías;
- `aplicar` ignora los códigos inactivos o ajenos.

`elegirTecnologia` con `codigo: ''` vacía esa capa. También se mantienen `capasDe`, `tecnologiasElegidas`, `nombreDeTecnologias`, `agruparPorGrupo` y `estaCompleta`.
- **Por qué no `useState` sueltos:** las reglas (descartar al cambiar de puesto, validar al aplicar) son las mismas y ya están probadas; perderlas para ahorrar unas líneas sería un retroceso.

### D4. `PanelDeConvocatoria` en lugar de `ConvocatoriaModal`
Es el contenido del modal sin `Modal` ni los dos pasos:
- pestañas Pegar/Subir con `ControlSegmentado`;
- el componente `Textarea` existente, con su contador, más el mínimo de 30 caracteres;
- `ZonaDeArchivo`, los ejemplos y "Analizar convocatoria" (con `Boton` y `cargando`);
- los errores en un `role="alert"`.

Al terminar llama a `onAnalizada(convocatoria)`. La página despacha `aplicar`, guarda `convocatoriaId` y el perfil, y el panel muestra el resumen "Perfil detectado" con los requisitos (✓) y lo que no se evalúa (ⓘ). Con un perfil no identificado (422), el panel muestra el error y no aplica nada.

### D5. El modo es estado de la página
`modo: 'manual' | 'convocatoria'` se elige con `ControlSegmentado`.
- **Pasar a `manual`:** pone `convocatoriaId = null` y conserva la selección. Es una decisión registrada: si el usuario deja la convocatoria, la entrevista no debe seguir usando sus requisitos sin que lo vea.
- **Volver a `convocatoria`:** muestra el último perfil analizado. No lo reaplica a los campos automáticamente, para no pisar lo que el usuario cambió; ofrece "Volver a aplicar este perfil".

### D6. Foco desde los manejadores
Tras `aplicar` (convocatoria o "Repetir última"), el foco va a `document.getElementById(id del campo de campoFaltante())` o a "Comenzar".
- Para "Repetir última" se mantiene la ref `pendienteTrasAplicar`, porque `Modal` evalúa `focoAlCerrar` con la función de su primer render.
- Elegir en un `<select>` no mueve el foco: en un formulario el usuario avanza con Tab, y saltar solo sería sorpresivo.

### D7. Disposición
- Una tarjeta (`rounded-control border bg-white`) con las pestañas de modo arriba, el panel de convocatoria (si aplica) separado por un divisor, y los campos en una rejilla de 1 columna, que pasa a 2 en `sm` para los dos campos de capa.
- La barra de resumen sigue fija abajo.
- Título "Configura tu entrevista" y "Repetir última" a la derecha.
- Antes de implementar se cargan las skills de UI/UX y de diseño para revisar jerarquía, espaciado y estados, sin introducir colores ni fuentes nuevos.

## Risks / Trade-offs

- [El `<select>` nativo se ve distinto en cada sistema] → se estiliza el control cerrado; la lista abierta es la del sistema, que es lo esperado en un formulario y lo mejor en el móvil.
- [El usuario pierde de vista las descripciones de los otros puestos] → la ayuda muestra la del puesto elegido, y los nombres ("Desarrollador Backend") ya son descriptivos.
- [Analizar aplica sin confirmar] → los campos quedan visibles y editables debajo, con el resumen del perfil: confirmar en un paso aparte era la razón de ser del modal, y ya no hace falta.
- [Sin tests de DOM] → la lógica queda en Vitest; la interfaz, en una prueba manual que debe ejecutarse antes de marcarse.

## Migration Plan

Solo frontend: se despliega con el build. Para revertir se restauran los archivos de `features/seleccion/`.
