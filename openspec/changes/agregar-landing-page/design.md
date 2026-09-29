## Context

Ver `proposal.md` — Why. Estado actual que condiciona el diseño:

- El frontend es React 19 + TypeScript estricto + Tailwind 4, organizado por features. Sin librería de componentes, sin gestor de estado, sin librería de gráficos y sin runner de tests. Esa austeridad es deliberada y este cambio no la rompe.
- El lenguaje visual existente es plano: `indigo-600` como primario, `slate` para neutros, `ring-1` en vez de bordes, esquinas `rounded-lg`. Tipografía del sistema, sin fuente cargada.
- `components/ui/` ya tiene `Boton`, `Input`, `Card`, `Spinner` y `Alerta` tipados y reutilizables.
- `GET /api/catalogos/` existe y exige sesión. DRF impone `IsAuthenticated` globalmente, así que cualquier recurso público necesita `AllowAny` explícito.
- `apps/catalogos/tests/test_catalogos.py::test_requiere_autenticacion` afirma que `/api/catalogos/` responde 401. Ese test debe seguir pasando.

La dirección visual se consultó con la skill `ui-ux-pro-max`, que devolvió el patrón *Hero + Features + CTA*, un estilo *Glassmorphism*, una paleta azul con acento naranja y la fuente *Plus Jakarta Sans*. Se adoptan el patrón, la lista de verificación y la guía de motion; se descartan el estilo y la paleta por las razones de abajo.

## Goals / Non-Goals

**Goals:**

- Que un egresado que llega sin contexto entienda qué recibe y decida registrarse sin haber tenido que registrarse antes.
- Que la landing y la aplicación se sientan el mismo producto: el visitante cruza la puerta sin notar un salto visual.
- Que la landing no invente su propia copia del catálogo, coherente con lo que ya se corrigió en la pantalla de selección.
- Que funcione y se lea en un teléfono, que es donde llegará la mitad de los enlaces compartidos.

**Non-Goals:**

- No se crean tests, ni de frontend ni de backend. La suite del backend queda en 94 exactamente.
- No se añade ninguna dependencia nueva de npm.
- No se implementa modo oscuro.
- No se añaden analíticas, formularios de contacto ni gestor de cookies.
- No se cambia el flujo de entrevista, evaluación, historial ni autenticación.

## Decisions

### Se descarta el glassmorphism y se conserva el lenguaje plano de la aplicación

La skill recomienda glassmorphism. Se rechaza.

La landing existe para llevar a alguien dentro de la aplicación. Si la puerta está hecha de cristal esmerilado y la habitación es plana, el visitante percibe dos productos distintos justo en el momento en que decide confiar. Además la propia skill marca su accesibilidad como `risk:conditional` por el contraste del texto sobre fondos translúcidos, y aquí no hay presupuesto de tests visuales para vigilarlo.

Se conserva `indigo-600`, `slate`, `ring-1` y `rounded-lg`, y se reutilizan `Boton`, `Card` y los demás primitivos que ya existen. La landing será más sobria que la recomendación, y eso es lo correcto para un proyecto de grado.

### Se descarta la paleta azul con acento naranja

La skill propone `#2563EB` con CTA en `#EA580C`. El acento naranja es buena técnica de conversión, pero introduce un segundo color de marca que no existe en ninguna otra pantalla.

Se mantiene `indigo-600` como único primario. La jerarquía del CTA se consigue con peso y tamaño, no con un color nuevo: el botón principal es sólido indigo, el secundario es `ring-1` sobre blanco. Es exactamente la distinción que ya hace `Boton` con sus variantes `primario` y `secundario`.

### Sí se adopta Plus Jakarta Sans, y de forma global

Es la única recomendación de la skill que se acepta tal cual, pero aplicada a toda la aplicación y no solo a la landing.

Hoy la tipografía es la del sistema, que en Windows significa Segoe UI y en el proyector de una defensa significa lo que haya. Una fuente cargada explícitamente hace que la presentación se vea igual en cualquier máquina. Aplicarla solo a la landing crearía el mismo salto visual que se evita rechazando el glassmorphism.

Coste: un `@import` en `styles/index.css` y una variable de tema de Tailwind. Se carga con `display=swap` y solo los pesos 400, 500, 600 y 700.

### Estructura de la página: Hero, Cómo funciona, Áreas, Cierre

Se sigue el patrón *Hero + Features + CTA* de la skill, con los nombres del dominio:

1. **Hero** — titular con la promesa, subtítulo con el destinatario (egresados de Ingeniería de Sistemas de la UMSS), y las dos acciones. El CTA aparece aquí y se repite al final, que es lo que la skill llama *deep CTA placement*.
2. **Cómo funciona** — tres pasos: eliges área y nivel, respondes N preguntas por escrito, recibes tu evaluación. El número de preguntas sale del backend.
3. **Qué recibes** — puntuación de 0 a 100, fortalezas, debilidades y sugerencias. Es lo que distingue este sistema de un banco de preguntas y merece su propia sección.
4. **Áreas técnicas** — tarjetas generadas desde el catálogo público, con el nombre y la descripción que ya guarda cada área en la base de datos.
5. **Cierre** — "¿Quieres iniciar con la entrevista?" con las dos acciones, que es el requisito explícito del encargo.
6. **Footer** — identidad académica, enlaces y contacto.

### El aviso de alcance va en el cuerpo, no en el footer

Al elegir el contenido del footer se descartó el aviso de que la evaluación la genera una IA. Se coloca en cambio dentro de la sección "Qué recibes", como una nota al pie de la sección.

La razón es doble: el alcance del perfil lo exige textualmente ("No se garantizará la precisión absoluta en la evaluación de respuestas"), y decirlo donde el visitante está leyendo qué recibe es más honesto que esconderlo en el pie. Una landing que promete más de lo que entrega es un problema en la defensa, no solo en la ética.

### Endpoint público por subclase, no por duplicación

```python
class CatalogosView(APIView):
    permission_classes = [IsAuthenticated]

class CatalogosPublicosView(CatalogosView):
    permission_classes = [AllowAny]
```

El cuerpo del `get` se comparte por herencia; lo único que cambia es el permiso. No hay duplicación que mantener sincronizada y el test que exige 401 en la ruta autenticada sigue pasando sin tocarlo.

*Alternativa considerada:* abrir `/api/catalogos/` con `AllowAny` y no crear una ruta nueva. Es menos código, pero rompe `test_requiere_autenticacion` y borra la distinción entre lo que el sistema publica y lo que entrega solo a usuarios. Mantener las dos rutas deja esa frontera explícita.

### Animación con CSS e `IntersectionObserver`, sin GSAP

La skill adjunta un preset de GSAP para el *scroll reveal*. Se implementa el mismo efecto con un `IntersectionObserver` y una transición de Tailwind.

GSAP son unos 70 kB para animar la aparición de cinco secciones en una sola página. El proyecto ya rechazó una librería de gráficos por el mismo motivo y dibujó el SVG a mano; la coherencia manda.

La animación se salta entera bajo `prefers-reduced-motion: reduce`, renderizando el estado final de inmediato. La duración es de 300-400 ms con `ease-out`, que es el rango que indica la skill para el nivel *Subtle*.

### Iconos SVG en línea, sin librería

La lista de verificación de la skill prohíbe emojis como iconos. No hay librería de iconos en el proyecto y no se añade una: los cuatro o cinco iconos que necesitan los pasos y las áreas se escriben como SVG en línea, con `aria-hidden="true"` por ser decorativos.

### La landing tiene su propio header y footer

`components/layout/Header.tsx` es el encabezado de la aplicación autenticada: muestra el nombre del usuario y el botón de salir, y usa `useAuth`. No sirve aquí.

La landing lleva `features/landing/components/{HeaderLanding,FooterLanding}.tsx`. Duplican la marca pero nada más, y la alternativa —un header con ramas condicionales según haya sesión— mezclaría dos responsabilidades en el componente que más se toca.

### La raíz se reparte con un componente de entrada

`/` monta un componente que lee `useAuth`: si hay sesión, redirige a `/nueva-entrevista`; si no, renderiza la landing. Mientras `cargando` es `true` muestra el spinner, para no enseñar la landing durante un parpadeo a alguien que sí tiene sesión.

La pantalla de selección se mueve a `/nueva-entrevista` dentro de `RutaProtegida`, y los tres enlaces internos que hoy apuntan a `/` se actualizan.

## Risks / Trade-offs

**El visitante con sesión ve un parpadeo antes de la redirección** → Mientras se resuelve el perfil no se sabe a dónde mandarlo. Mitigación: durante `cargando` se muestra el mismo spinner de verificación de sesión que ya usa `RutaProtegida`, no la landing.

**Mover la pantalla de selección rompe enlaces guardados a `/`** → Un usuario que tenga `/` en marcadores acabará en la landing y, si tiene sesión, será redirigido igualmente a `/nueva-entrevista`. No hay pérdida real; el caso queda cubierto por la propia redirección.

**El catálogo público expone qué áreas ofrece el sistema sin autenticación** → Es información que la landing publica a propósito; no hay nada sensible en cuatro nombres de área. El endpoint no expone conteos, usuarios ni entrevistas.

**Una landing larga en un proyecto sin tests de frontend** → No hay red que detecte una regresión visual. Mitigación: se reutilizan los primitivos de `components/ui/` en lugar de escribir marcado nuevo, y la verificación es manual en los cuatro anchos de la lista de la skill (375, 768, 1024, 1440).

**Añadir una fuente añade una petición de red bloqueante** → Se usa `display=swap` para que el texto se pinte con la fuente del sistema mientras carga, y se limitan los pesos a cuatro.

## Migration Plan

El orden evita que la aplicación quede rota en ningún punto intermedio:

1. **Backend** — vista pública y su ruta. Verificar con `curl` sin token que responde 200, y que `/api/catalogos/` sigue respondiendo 401. Correr los 94 tests.
2. **Contrato en el frontend** — tipo y función de API para el catálogo público.
3. **Rutas** — mover selección a `/nueva-entrevista`, actualizar los tres enlaces internos y añadir el componente de entrada en `/`. En este punto `/` aún puede renderizar un marcador de posición.
4. **Tipografía y primitivos** — la fuente global y los iconos SVG que necesiten las secciones.
5. **Secciones de la landing**, de arriba abajo: header, hero, cómo funciona, qué recibes, áreas, cierre, footer.
6. **Accesibilidad y responsive** como paso propio al final, no como algo que se da por hecho.

**Rollback**

Todo el trabajo es aditivo salvo el cambio de rutas. Revertir es `git revert` del commit; la base de datos no se toca y el endpoint público es una ruta nueva que nadie más consume.

## Open Questions

- El correo de contacto del footer y el año a mostrar los aporta Jorge al implementar; hasta entonces quedan como marcador de posición. No afecta a la estructura ni a las tareas.
