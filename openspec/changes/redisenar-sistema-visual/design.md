## Context

Ver `proposal.md` — Why, y la auditoría entregada antes de este documento. Resumen de lo que condiciona las decisiones:

- Tailwind v4, sin `tailwind.config.js` — todo token se declara en `@theme` dentro de `styles/index.css`.
- 40/70 archivos usan clases Tailwind crudas. `Card.tsx` existe pero está subutilizado: casi toda "caja blanca redondeada" lo repite a mano.
- `features/resultados/bandas.ts::ESTILO_DE_BANDA` ya centraliza el color por banda, consumido por 4 archivos — es el patrón correcto, solo que vive en el sitio equivocado.
- Dos módulos de iconos paralelos (`components/ui/IconoNav.tsx`, `features/landing/components/Icono.tsx`), ambos SVG en línea sin librería.
- El proyecto ha rechazado explícitamente cada dependencia de UI que se propuso hasta ahora: GSAP, librería de gráficos, Radix, `focus-trap`, `lucide-react`, shadcn. Es un patrón consistente, no una serie de casualidades.
- `RutaProtegida.tsx` mantiene el estado `plegado` de la barra lateral con `useState`, y como es una *layout route*, no se remonta al navegar entre rutas hijas — el estado persiste mientras dura la sesión.
- El backend (`apps/evaluaciones/rubricas.py::BANDAS`) define 4 bandas con cortes en 40/60/80; el campo `banda` en la API es la única fuente de verdad sobre esos cortes.

## Goals / Non-Goals

**Goals:**

- Un solo sistema de tokens (color, tipografía, radio) que todo el frontend consuma, sin clases Tailwind crudas ni hex sueltos fuera de lo que un SVG dibujado a mano exige.
- Componentes base completos en `components/ui/`, de modo que ninguna página vuelva a repetir el marcado de una tarjeta, un badge o un input.
- Un solo lugar donde vivan los umbrales de puntuación (ya existe, se consolida) y un solo módulo de iconos.
- Cero regresión de comportamiento: mismas rutas, misma lógica de negocio, mismo contrato con la API, misma accesibilidad ya lograda en el sidebar (foco atrapado, `aria-current`, contraste).

**Non-Goals:**

- No se instala ninguna dependencia nueva de npm.
- No se agrega modo claro/oscuro conmutable.
- No se construye detección de bloques de código ni resaltado de sintaxis en el chat.
- No se cambia el criterio de calificación de la rúbrica ni sus cortes numéricos.
- No se crean tests.

## Decisions

### Los tokens van en `@theme`, no en un `tailwind.config.js` nuevo

La especificación original asume Tailwind v3. Este proyecto es v4: los tokens se declaran como variables CSS dentro de `@theme` en `styles/index.css`, exactamente como ya se hizo para `--font-sans` en `sidebar-estilo-oscuro`. Traducción directa:

```css
@theme {
  --color-tinta-50: #F6F7FB;
  --color-tinta-100: #E9ECF3;
  --color-tinta-300: #A4AAC0;
  --color-tinta-500: #5B6380;
  --color-tinta-700: #2E3657;
  --color-tinta-800: #1E2542;
  --color-tinta-900: #131A33;
  --color-tinta-950: #0B1020;

  --color-iris-50: #EEF0FF;
  --color-iris-400: #7C83F0;
  --color-iris-600: #4B4FD1;
  --color-iris-700: #3C3FAE;

  --color-exito-texto: #15803D;
  --color-exito-fondo: #DCFCE7;
  --color-progreso-texto: #B45309;
  --color-progreso-fondo: #FEF3C7;
  --color-error-texto: #B91C1C;
  --color-error-fondo: #FEE2E2;

  --radius-superficie: 16px;
  --radius-control: 8px;

  --font-sans: 'IBM Plex Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, 'Cascadia Code', 'Courier New', monospace;
}
```

Esto habilita clases como `bg-tinta-950`, `text-iris-600`, `rounded-superficie` directamente, sin archivo de configuración adicional.

### `iris` es el único color de acción; el gráfico SVG usa las mismas variables, no clases

`GraficoProgreso.tsx` dibuja con `fill`/`stroke` en atributos SVG, que no aceptan clases Tailwind — hoy tiene 8 hex sueltos. Se resuelven leyendo las variables CSS de `@theme` vía `getPropertyValue` o repitiendo el valor hex junto a un comentario que referencia el token (`'#4B4FD1', // iris-600`), igual que ya se comenta con `// indigo-600` hoy. La paleta por área (programación/bases de datos/estructuras/desarrollo web) no es parte de la regla "solo `iris` para acción" — son categorías, no acciones ni estados, así que conservan colores distintos entre sí, ahora tomados de los tokens semánticos disponibles en vez de hex arbitrarios donde sea posible.

### "Cerrar sesión" no es un botón semántico ni una acción `iris`

La regla "los semánticos solo expresan estado, nunca aparecen en un botón" deja sin resolver cómo se ve una acción destructiva como cerrar sesión — no debe ser `iris` (se confundiría con la acción principal) ni `error` (violaría la regla).

Se resuelve con la variante `fantasma` de `Boton`: `text-tinta-300`, `hover:bg-tinta-900 hover:text-white` sobre el sidebar oscuro. Usa solo tokens neutros, no introduce un color "de peligro" nuevo, y queda visualmente subordinado a la acción principal.

### Iconos: se consolidan en un módulo, con trazos reales de Tabler, sin el paquete

`components/ui/IconoNav.tsx` y `features/landing/components/Icono.tsx` se funden en `components/ui/Icono.tsx`, usado en toda la aplicación — landing incluida — para que "mismo grosor y tamaño en todo el sistema" sea literal y no solo declarado.

*Alternativa considerada:* instalar `@tabler/icons-react`. Se descarta por el mismo motivo que cada dependencia de UI anterior: son unos 20 iconos, no justifican un paquete completo cuando el patrón de SVG en línea ya está establecido y probado en el proyecto. Los trazos se toman de la fuente pública de Tabler (mismo `viewBox 24x24`, `stroke-width` consistente) para que la fidelidad visual sea real, no aproximada a mano.

### `ChipPuntaje` traduce la `banda` del backend, no reinventa cortes — decisión ya validada

`lib/puntajes.ts` no recalcula nada desde el número crudo. Expone:

```ts
export const NIVEL_POR_BANDA: Record<BandaDeRubrica, 'error' | 'progreso' | 'exito'> = {
  insuficiente: 'error',
  en_desarrollo: 'error',
  aceptable: 'progreso',
  solido: 'exito',
}

export function obtenerNivel(banda: BandaDeRubrica) {
  return NIVEL_POR_BANDA[banda]
}
```

Los cortes 40/60/80 siguen viviendo solo en `apps/evaluaciones/rubricas.py`. `ChipPuntaje` recibe `puntuacion` (para mostrar el número) y `banda` (para decidir el color) — no recibe solo el número, precisamente para no poder reinventar el corte por accidente en una llamada futura. `features/resultados/bandas.ts::ESTILO_DE_BANDA` se mueve a `lib/puntajes.ts` y se reexporta desde ahí; los 4 archivos que ya lo consumen (`TablaPuntuaciones`, `PanelCualitativo`, `RepartoPorBandas`, `ListaObservaciones`) actualizan el import.

Se conserva el texto de la banda real (`insuficiente`/`en_desarrollo`/`aceptable`/`solido`) donde ya se muestra como etiqueta, aunque el color se agrupe en 3 — así no se pierde la distinción fina que sí importa para la rúbrica, solo se simplifica la paleta.

### Modo enfoque: colapso derivado de la ruta, sin pisar el ajuste manual dentro de la misma entrevista

`RutaProtegida` ya mantiene `plegado` con `useState`, y como layout route no se remonta entre navegaciones — el estado persiste durante toda la sesión. Se añade un efecto:

```ts
useEffect(() => {
  if (matchPath('/entrevista/:id', pathname)) setPlegado(true)
}, [pathname])
```

Esto se dispara solo cuando `pathname` cambia — es decir, al entrar a la conversación. Mientras el estudiante permanece en esa misma URL (las 5 preguntas de una entrevista son una sola pantalla, sin navegación entre ellas), el efecto no se repite, así que si el estudiante reabre la barra manualmente con el control de plegado, nada la vuelve a colapsar hasta que `pathname` cambie de nuevo — que es exactamente "se puede reabrir, no se fuerza nada al salir". Al entrar a una entrevista *nueva* (otro id, por tanto otro `pathname`), el efecto se dispara de nuevo y reaplica el colapso, que es el comportamiento del cuarto escenario de la spec.

*Alternativa considerada:* un modo estricto que deshabilite el control mientras dura la entrevista. Se descarta — fue la opción explícitamente no elegida al resolver esta ambigüedad con Jorge.

### El foco atrapado se extrae, `Modal` lo reutiliza

`useCajonNavegacion.ts` hoy mezcla dos responsabilidades: abrir/cerrar el cajón y atrapar el foco dentro de él. Se extrae la segunda a `hooks/useFocusTrap.ts` — recibe una ref del contenedor y un booleano `activo`, y aplica exactamente la misma lógica que ya existe (Escape, confinamiento del tabulador, devolución de foco al disparador). `useCajonNavegacion` pasa a componerlo en vez de duplicarlo; `Modal` lo usa igual.

*Riesgo:* extraer código ya probado y en producción tiene un costo real de posible regresión sutil. Se mitiga verificando explícitamente los tres comportamientos (Escape, clic fuera, retorno de foco) después de la extracción, no dando por hecho que "solo se movió código".

### Reestructuración del sidebar: un hook, cinco componentes

`useSidebar.ts` centraliza lo que hoy está disperso directamente en `RutaProtegida.tsx`: el estado `plegado` (+ el efecto de modo enfoque), `useCajonNavegacion`, y `useEntrevistaEnCurso`. `RutaProtegida` pasa a consumir un solo hook en vez de tres.

`Sidebar.tsx` se convierte en composición de `SidebarMarca`, `SidebarAccionPrincipal` (el botón "Nueva entrevista" + "Continuar · N/5", ahora ambos con estilo `iris-600` sólido — `ContinuarEntrevista` deja el tono ámbar que tenía desde `sidebar-estilo-oscuro`, unos días atrás, por ser una acción, no un estado), `SidebarNavItem` (un ítem de navegación, con el divisor de 1px incluido) y `SidebarPerfil`.

Flotante con margen de 12px: pasa de `fixed top-16 bottom-0 left-0` a `fixed top-3 bottom-3 left-3`, y el contenido gana ese mismo margen para no quedar pegado. El header dejará de cubrir el ancho completo del viewport — vuelve a cubrir solo el área de contenido, como antes de `sidebar-estilo-oscuro`, porque un sidebar flotante con su propio margen ya no encaja bien debajo de un header de ancho completo.

### La lista de retroalimentación se unifica con una prop `variante`

`PanelCualitativo.tsx` hoy repite tres bloques casi idénticos (fortalezas/debilidades/sugerencias) con solo el color cambiando. `ListaRetroalimentacion` recibe un arreglo de `{variante: 'fortaleza' | 'debilidad' | 'sugerencia', texto: string}` y resuelve icono + color internamente desde los tokens — sin introducir un cuarto sistema de color paralelo al de `puntajes.ts`.

## Risks / Trade-offs

**Es un diff grande sobre casi todo `src/`** → Mitigación: se implementa en el orden de `tasks.md` (tokens → iconos → componentes base → sidebar → feature por feature), verificando `tsc`/`build` después de cada grupo, no solo al final.

**Agrupar 4 bandas en 3 colores puede leerse como pérdida de matiz para quien evalúa la tesis** → Mitigación: el texto de la banda real se conserva donde ya se mostraba como etiqueta; solo el color se simplifica, no la información.

**Extraer el foco atrapado a un hook compartido puede introducir una regresión sutil en el cajón, que ya funciona y está verificado** → Mitigación: verificación explícita de las tres conductas después de la extracción, como tarea propia, no asumida.

**El sidebar flotante cambia la relación con el header** (deja de cubrir el ancho completo) → Es un cambio de layout real, no solo de color. Se documenta aquí para que no se lea como un efecto secundario accidental: es la consecuencia directa de pedir un sidebar flotante con márgenes propios.

## Migration Plan

0. **Crear la rama `rediseno-sistema-visual` antes de tocar nada** — el pedido dice "haz commit al terminar", pero todo el trabajo debe aterrizar ahí desde el primer archivo, no solo el commit final.
1. **Tokens y tipografía** — `@theme` en `styles/index.css`, fuentes en `index.html`. Nada más depende de esto y todo lo demás lo usa.
2. **Iconos** — módulo consolidado `components/ui/Icono.tsx`.
3. **Componentes base** — `components/ui/*` nuevos y ajustados, `lib/puntajes.ts`, `hooks/useFocusTrap.ts`.
4. **Sidebar** — reestructuración completa, modo enfoque, `useSidebar.ts`.
5. **Resto del sistema**, feature por feature: landing → auth → selección → entrevista → resultados → historial/retroalimentación/perfil.
6. **`docs/arquitectura.md`** con la guía de estilo.
7. **Verificación y cierre**: grep de clases viejas, `tsc`, `lint`, `build`, commit.

**Rollback**

Todo el trabajo vive en la rama `rediseno-sistema-visual`, separada de `jorge` desde el primer commit. Si algo no convence, se descarta la rama sin tocar el resto del proyecto.

## Open Questions

Ninguna — las dos ambigüedades reales (bandas de puntaje, modo enfoque) se resolvieron con Jorge antes de escribir este documento.
