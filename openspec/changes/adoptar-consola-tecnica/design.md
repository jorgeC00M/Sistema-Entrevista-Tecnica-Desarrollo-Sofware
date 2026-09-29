## Context

Ver `proposal.md — Why` para la motivación.

Estado del que se parte, verificado en el código:

- `styles/index.css` ya declara la paleta completa en `@theme` (Tailwind v4, sin `tailwind.config.js`). Los hex de la maqueta y los del proyecto **coinciden uno a uno**: `#0B1020` es `tinta-950`, `#4B4FD1` es `iris-600`, `#E9ECF3` es `tinta-100`, y los tres pares semánticos son idénticos. Lo único que difiere son los radios (16/8 aquí, 8/4 en la maqueta) y la escala tipográfica, que aquí es la de Tailwind y allí es nominal (`headline-lg`, `label-mono`, `metric-counter`).
- `useEntrevista` reconstruye el hilo desde el servidor al montar y descarta `resultado.evaluacion` tras cada envío. `MensajeDeChat` es `{ autor, texto }`.
- `useEntrevistaEnCurso` ya pide `obtenerHistorial()` en cada cambio de ruta, y solo hace una segunda petición cuando encuentra una entrevista a medias.
- `Intercambio` incluye `tiempo_respuesta` (segundos medidos en el servidor) y `Entrevista` incluye `fecha_inicio`/`fecha_fin`. Las duraciones que pide la maqueta ya existen como dato.
- El cambio anterior dejó `Sidebar/` dividido en subcomponentes, `lib/puntajes.ts` como única fuente de color por banda, y el "modo enfoque" que auto-colapsa el sidebar al entrar a `/entrevista/:id`.

Restricción dura del encargo: **no se toca backend**. Ni modelos, ni serializers, ni prompts, ni el contrato de la API.

## Goals / Non-Goals

**Goals:**

- Que las tres pantallas con maqueta queden visualmente equivalentes a ella con los datos que hoy existen.
- Que el resto del sistema herede el mismo lenguaje sin inventar pantallas nuevas.
- Que la retroalimentación en línea no altere la reanudación ni el reintento idempotente que ya funcionan.
- Dejar por escrito qué le falta al backend para completar la maqueta, con la forma de dato que haría falta.

**Non-Goals:**

- Renombrar el producto. La maqueta dice "Entrevista.dev"; el proyecto se sigue llamando como se llama y usa su propio logo.
- Editor de código, resaltado de sintaxis o parseo de markdown en las preguntas. La maqueta muestra chips de código dentro del enunciado; eso exige un formato que el backend no emite.
- Límite de tiempo, pausa de sesión o exportación a PDF.

## Decisions

### Los radios pasan a 8px y 4px, y se renombra un token

La maqueta usa 8px en tarjetas y 4px en chips. Hoy `--radius-superficie` vale 16px y `--radius-control` 8px.

Cambiar los valores de los dos tokens existentes propaga el nuevo aspecto a todo el sistema sin tocar una sola clase, porque `rounded-superficie` y `rounded-control` ya están aplicados en todas partes. Pero quedarían mal nombrados: `superficie` (8px) y `control` (8px) valdrían lo mismo, y no habría token para los 4px de los chips.

Decisión: `--radius-superficie: 8px`, `--radius-control: 8px` y se añade `--radius-chip: 4px`. Se conservan los dos nombres actuales aunque coincidan en valor, porque expresan intenciones distintas y volverán a divergir si el diseño cambia. Los chips de puntaje, badges y tags mono pasan a `rounded-chip`.

Alternativa descartada: un solo token `--radius`. Pierde la distinción semántica y obliga a revisar cada uso a mano si mañana las tarjetas vuelven a 16px.

### La escala tipográfica se añade como tokens nominales

La maqueta nombra los tamaños (`headline-xl`, `body-md`, `label-mono`, `metric-counter`, `code-block`). Hoy el proyecto usa la escala numérica de Tailwind (`text-2xl`, `text-sm`) y eso obliga a recordar qué tamaño corresponde a qué papel.

Decisión: declarar en `@theme` los tamaños nominales del sistema de diseño (`--text-headline-lg`, `--text-label-mono`, `--text-metric-counter`, etc.) con su `line-height` y `letter-spacing`, y usarlos en las pantallas nuevas. Los usos existentes se migran donde se toque la pantalla, no en un barrido aparte.

Esto hace que `label-mono` —mayúsculas, 11px, `tracking` amplio, mono— sea una sola clase en vez de cuatro utilidades repetidas en cada etiqueta de metadato, que es el patrón más frecuente de toda la maqueta.

### La evaluación viaja con el mensaje del candidato

`MensajeDeChat` pasa de `{ autor, texto }` a incluir una evaluación opcional en los mensajes del candidato:

```
{ autor: 'usuario', texto, evaluacion?: Evaluacion }
```

Se elige colgar la evaluación del mensaje al que califica —y no emitir un tercer mensaje de tipo "evaluación"— porque así el hilo no puede quedar con una calificación huérfana ni desordenada respecto a su respuesta, y porque la reconstrucción desde `obtenerResultados()` ya entrega `intercambio.respuesta` y `intercambio.evaluacion` juntos.

Consecuencias en los dos caminos que ya existen:

- **Reanudación**: el `flatMap` que reconstruye el hilo adjunta `i.evaluacion` al mensaje del candidato. Un intercambio sin evaluar simplemente no la lleva.
- **Reintento**: el rollback tras un fallo (`previos.slice(0, -1)`) sigue retirando el mensaje del candidato completo, con su evaluación si la tuviera. No cambia.

### El cronómetro es de pantalla, no de sesión

Cuenta desde que se monta la pantalla de entrevista, no desde `fecha_inicio`. Si contara desde `fecha_inicio`, una entrevista retomada al día siguiente mostraría "18:42:07", que no informa de nada.

Se guarda en un `useRef` el instante de montaje y se actualiza con un intervalo de un segundo, limpiado al desmontar. Bajo `prefers-reduced-motion` el reloj sigue actualizándose —es información, no decoración— pero se suprime el punto pulsante que lo acompaña.

Alternativa descartada: cronómetro por pregunta además del de sesión. El servidor ya mide `tiempo_respuesta` de forma autoritativa y mostrarlo en vivo desde el cliente introduciría dos relojes que pueden discrepar.

### Los destinos condicionales salen de la petición que ya se hace

`useEntrevistaEnCurso` ya trae el historial completo en cada cambio de ruta. Se amplía para devolver también la entrevista finalizada más reciente, de la misma respuesta. Coste adicional en red: cero.

Se renombra a `useDestinosDisponibles` y devuelve `{ enCurso, ultimaFinalizada }`. El sidebar decide con eso qué ítems pinta.

Alternativa descartada: un endpoint nuevo tipo `/api/mi-estado/`. Sería más limpio, pero es backend y está fuera del encargo.

### Lo que la maqueta pide y el backend no tiene

Se omite de la UI. Queda aquí registrado con la forma de dato que necesitaría, para que la fase de backend no tenga que volver a deducirlo de las capturas:

| Elemento de la maqueta | Dato que haría falta |
|---|---|
| Tag de tema por pregunta (`SCOPE & HOISTING`) | Campo `tema` en la pregunta generada; hoy `Pregunta` es `{ texto, numero }` |
| Título corto por pregunta | Campo `titulo` en la pregunta, o derivarlo en el evaluador |
| Sub-puntajes Precisión / Claridad / Eficiencia | Tres enteros en `ESQUEMA_EVALUACION` + columnas en `Evaluacion` + migración. Ojo: la rúbrica real es *corrección técnica, completitud y claridad*, que no coincide con los tres nombres de la maqueta |
| "Diagnóstico de la IA" (párrafo global) | Síntesis a nivel entrevista: una llamada más al cerrar, o un campo en `Entrevista` |
| "Criterios esperados de evaluación" | Lista de criterios emitida junto a la pregunta |
| Banda de la nota promedio (`COMPETENTE · NIVEL BÁSICO`) | `banda_de(promedio)` expuesto en el serializer de `Entrevista` |
| "Corte estándar de contratación: 75 pts" | Umbral de negocio; no existe el concepto |
| Metadatos por área (`Python, JS, Go`) | Campo nuevo en `Area`; hoy solo hay `descripcion` |
| Exportar a PDF | Generación de informe |

### Los iconos y la marca siguen siendo los del proyecto

La maqueta usa Material Symbols como webfont. El proyecto tiene `components/ui/Icono.tsx` con trazos inline y precedente explícito de no añadir dependencias de UI. Los iconos de línea de ambos conjuntos son visualmente equivalentes al tamaño en que se usan.

Se añaden a `Icono.tsx` los trazos que falten para los destinos nuevos (terminal, insights) tomándolos del mismo conjunto que ya se usa, para no mezclar grosores.

## Risks / Trade-offs

- **Ver la nota a mitad de entrevista puede condicionar al candidato** → Es la decisión tomada y coincide con lo que la propia pantalla de configuración promete ("feedback inmediato tras cada respuesta"). Si resulta contraproducente, revertirlo es dejar de pasar `evaluacion` al componente: el dato se sigue recibiendo igual.
- **Bajar las tarjetas de 16px a 8px toca toda la aplicación de golpe** → Es un cambio de dos tokens, reversible en un commit. El riesgo real es visual, no funcional, y se verifica pantalla por pantalla en la tarea de revisión.
- **La escala nominal convive un tiempo con la de Tailwind** → Migrar toda la escala de una vez multiplicaría el diff sin beneficio inmediato. Se acepta la convivencia y se documenta en `docs/arquitectura.md` cuál es la preferente para código nuevo.
- **El cronómetro se reinicia al recargar la página** → Consecuencia buscada de contar desde el montaje. Se rotula como tiempo de la sesión actual, no como tiempo total de la entrevista, para que no prometa lo que no mide.
- **Extrapolar el estilo a pantallas sin maqueta es interpretación** → Se limita a aplicar patrones ya definidos (cabecera con metadato mono, tarjeta con borde, lista con divisores, chip de puntaje). No se inventan composiciones nuevas.

## Open Questions

Ninguna que bloquee. Las decisiones de alcance se resolvieron antes de escribir esto y están recogidas en `proposal.md`.
