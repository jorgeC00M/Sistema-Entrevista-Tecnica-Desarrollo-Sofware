## 1. Backend — catálogo público

Es todo el trabajo de backend de este cambio. No se crean tests: la suite queda en 94.

- [x] 1.1 Añadir `CatalogosPublicosView(CatalogosView)` en `backend/apps/catalogos/views.py` sobreescribiendo solo `permission_classes = [AllowAny]`; el cuerpo del `get` se hereda, sin duplicar la construcción de la respuesta
- [x] 1.2 Registrar `path("publico/", CatalogosPublicosView.as_view(), name="catalogos-publicos")` en `backend/apps/catalogos/urls.py`
- [x] 1.3 Verificar sin token que `GET /api/catalogos/publico/` responde 200 con las áreas, los niveles y `preguntas_por_entrevista`
- [x] 1.4 Verificar sin token que `GET /api/catalogos/` sigue respondiendo 401, que es lo que afirma `test_requiere_autenticacion`
- [x] 1.5 Verificar que un área marcada como inactiva desaparece de la respuesta pública, igual que de la autenticada
- [x] 1.6 Ejecutar `python manage.py test` y verificar que siguen siendo 94 tests en verde, ni uno más ni uno menos

## 2. Frontend — contrato y rutas

- [x] 2.1 Añadir `CatalogosPublicos` a `frontend/src/types/catalogos.ts` reutilizando `ElementoDeCatalogo`; verificar con `pnpm exec tsc --noEmit`
- [x] 2.2 Añadir `obtenerCatalogosPublicos()` a `frontend/src/api/catalogos.ts` contra `/api/catalogos/publico/`, con `autenticado: false` para que `client.ts` no adjunte el token ni intente refrescarlo
- [x] 2.3 Mover la pantalla de selección de `/` a `/nueva-entrevista` dentro de `RutaProtegida` en `frontend/src/router/index.tsx`
- [x] 2.4 Actualizar el enlace "Nueva entrevista" de `components/layout/Header.tsx` a `/nueva-entrevista`; verificar que `NavLink` con `end` sigue marcando el estado activo correctamente
- [x] 2.5 Actualizar los dos enlaces a `/` de `features/resultados/pages/ResultadosPage.tsx`
- [x] 2.6 Crear `features/landing/pages/EntradaRaiz.tsx`: con sesión redirige a `/nueva-entrevista`, sin sesión renderiza la landing, y mientras `cargando` muestra `Spinner` para no enseñar la landing a quien sí tiene sesión
- [ ] 2.7 Montar `EntradaRaiz` en `/` fuera de `RutaProtegida`; verificar que un visitante anónimo ya no acaba en `/login`

## 3. Frontend — base visual

- [x] 3.1 Cargar Plus Jakarta Sans en `src/styles/index.css` con `display=swap` y solo los pesos 400, 500, 600 y 700; declararla como familia por defecto en el tema de Tailwind
- [x] 3.2 Verificar que la fuente se aplica también a las pantallas de la aplicación, no solo a la landing
- [x] 3.3 Crear `features/landing/components/Icono.tsx` con los SVG en línea que necesiten los pasos y las áreas, todos con `aria-hidden="true"` por ser decorativos; sin emojis y sin librería de iconos
- [x] 3.4 Crear `features/landing/hooks/useRevelarAlEntrar.ts` con `IntersectionObserver`; debe devolver el estado final de inmediato cuando `prefers-reduced-motion: reduce` está activo

## 4. Frontend — header y footer de la landing

- [x] 4.1 Crear `features/landing/components/HeaderLanding.tsx`: marca con logo SVG y nombre del sistema, navegación a las secciones, y las acciones "Iniciar sesión" (secundaria) y "Crear cuenta" (primaria) reutilizando `Boton`
- [ ] 4.2 Hacer el header pegajoso y verificar que las dos acciones siguen alcanzables al desplazarse, que es lo que la guía llama CTA persistente
- [ ] 4.3 Colapsar la navegación en pantallas estrechas dejando visibles las dos acciones; verificar a 375 px que no aparece desplazamiento horizontal
- [x] 4.4 Crear `features/landing/components/FooterLanding.tsx` con identidad académica (Proyecto de Grado, Ingeniería de Sistemas, UMSS, autor y año), enlaces a las secciones y a las acciones de acceso, y correo de contacto
- [ ] 4.5 Añadir un enlace "Saltar al contenido" al inicio del documento, visible solo al recibir foco; verificar tabulando desde la barra de direcciones

## 5. Frontend — secciones de la landing

- [x] 5.1 Crear `features/landing/pages/LandingPage.tsx` como composición de las secciones, con un único `h1` y `<main>` como punto de destino del enlace de salto
- [x] 5.2 Crear `sections/Hero.tsx`: titular con la promesa, subtítulo que nombra al destinatario (egresados de Ingeniería de Sistemas de la UMSS) y las dos acciones
- [x] 5.3 Crear `sections/ComoFunciona.tsx` con los tres pasos: elegir área y nivel, responder por escrito, recibir la evaluación; el número de preguntas sale de `preguntas_por_entrevista`, no escrito a mano
- [x] 5.4 Crear `sections/QueRecibes.tsx` describiendo puntuación de 0 a 100, fortalezas, debilidades y sugerencias
- [x] 5.5 Añadir en esa misma sección la nota de que la evaluación la genera una IA y no sustituye a un entrevistador humano, que es lo que exige el alcance del perfil
- [x] 5.6 Crear `features/landing/hooks/useCatalogosPublicos.ts` que pida el catálogo al montar y exponga `{catalogos, cargando, error}`
- [ ] 5.7 Crear `sections/AreasTecnicas.tsx` con una tarjeta por área usando `nombre` y `descripcion` del backend; verificar que desactivar un área en `/admin/` la retira de la landing
- [x] 5.8 Hacer que un fallo al cargar el catálogo omita la sección de áreas y deje el resto de la landing funcionando, en lugar de bloquear la página o dejar un hueco roto
- [x] 5.9 Crear `sections/CierreCTA.tsx` con el encabezado "¿Quieres iniciar con la entrevista?" y las dos acciones: crear cuenta, e iniciar sesión para quien ya la tiene
- [ ] 5.10 Aplicar la revelación al entrar en las secciones y verificar que con movimiento reducido activado la página aparece completa y sin animación

## 6. Cierre y verificación

- [x] 6.1 Añadir `<meta name="description">` y `<html lang="es">` verificado en `frontend/index.html`, y actualizar el `<title>` para que describa el servicio y no solo lo nombre
- [x] 6.2 Verificar la jerarquía de encabezados: un solo `h1` en el hero y `h2` por sección, sin saltar niveles
- [ ] 6.3 Verificar el contraste de texto a 4,5:1 como mínimo, en particular el texto secundario en `slate` sobre fondo claro y la etiqueta del botón primario sobre indigo
- [ ] 6.4 Verificar que todo elemento interactivo tiene foco visible al tabular y un área mínima de 44×44 px
- [ ] 6.5 Verificar el recorrido completo a 375, 768, 1024 y 1440 px sin desplazamiento horizontal en ningún ancho
- [ ] 6.6 Verificar los dos caminos de la raíz: anónimo ve la landing; con sesión aterriza en `/nueva-entrevista` sin ver la landing
- [ ] 6.7 Verificar que las acciones llevan a donde dicen: crear cuenta a `/registro`, iniciar sesión a `/login`
- [x] 6.8 Ejecutar `pnpm exec tsc --noEmit`, `pnpm run lint` y `pnpm run build` y verificar que los tres terminan sin errores
- [x] 6.9 Actualizar la sección de frontend de `CLAUDE.md` con la feature `landing` y el reparto de la ruta raíz
