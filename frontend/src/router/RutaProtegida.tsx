import { Navigate, Outlet } from 'react-router-dom'

import { LimiteDeErrorDeRuta } from '@/components/LimiteDeError'

import Sidebar, { useSidebar } from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import BotonIcono from '@/components/ui/BotonIcono'
import Spinner from '@/components/ui/Spinner'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { DESDE_ESCRITORIO, useMediaQuery } from '@/hooks/useMediaQuery'

/**
 * Guard y layout a la vez.
 *
 * Es una *layout route*: decide el acceso y además renderiza el shell
 * autenticado. Separarlo en un `LayoutPrivado` aparte duplicaría la jerarquía
 * de rutas sin cambiar nada observable.
 */
export default function RutaProtegida() {
  const { usuario, cargando } = useAuth()
  const { plegado, alternarPlegado, entrevistaEnCurso, cajon } = useSidebar()
  // Desestructurado aparte: oxlint no reconoce una ref accedida como
  // propiedad de un objeto anidado (`cajon.cajonRef`) y la marca como lectura
  // de `.current` en render, aunque pasar la ref misma a `ref={}` es correcto.
  const { abierto, alternar, cerrar, cajonRef, disparadorRef } = cajon
  // Tablet (md): barra fija de iconos, siempre plegada; a 768 px un sidebar
  // de 256 px dejaría 512 de contenido. Plegar a mano es cosa de escritorio.
  const esEscritorio = useMediaQuery(DESDE_ESCRITORIO)
  const plegadoEfectivo = plegado || !esEscritorio

  if (cargando) return <Spinner texto="Verificando sesión…" />
  if (!usuario) return <Navigate to="/login" replace />

  return (
    // Sistema "vidrio": fondo y tipografía propios de todo el dashboard,
    // fijados una sola vez aquí — el resto del árbol hereda por cascada,
    // igual que TarjetaAuth.tsx en login/registro. tinta/iris no aparecen
    // en ningún hijo de este nodo.
    <div className="min-h-screen bg-vidrio-bg text-vidrio-texto">
      {/* Barra fija desde tablet: panel de borde completo, toca los 3 bordes
          de la ventana (arriba, izquierda, abajo) sin margen ni radio — el
          header arranca justo en su esquina superior derecha. En tablet es
          solo de iconos; en escritorio el ancho cambia al plegar. */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-10 hidden bg-vidrio-ink transition-[width] duration-200 ease-out md:block ${
          plegadoEfectivo ? 'w-[72px]' : 'w-64'
        }`}
      >
        <Sidebar
          plegado={plegadoEfectivo}
          onAlternarPlegado={esEscritorio ? alternarPlegado : undefined}
          entrevistaEnCurso={entrevistaEnCurso}
        />
      </aside>

      {/* Cajón en pantallas estrechas, con el mismo estilo de borde completo. */}
      {abierto && (
        <>
          <div
            className="velo fixed inset-0 z-20 md:hidden"
            onClick={cerrar}
            aria-hidden="true"
          />
          <aside
            ref={cajonRef}
            // jsx-a11y sugiere <dialog> nativo en vez de role="dialog". No se
            // adopta: el cajón ya trae su propio atrapado de foco
            // (useFocusTrap) y su propio "clic fuera" (el fondo oscurecido de
            // arriba); <dialog> añadiría un segundo modelo de apertura/cierre
            // (showModal, ::backdrop) que competiría con ese, sin ganancia de
            // accesibilidad real — el patrón ARIA ya está completo.
            // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            // `.cajon` (styles/overlays.css): entra desde la izquierda.
            className="cajon fixed top-0 bottom-0 left-0 z-30 w-72 bg-vidrio-ink md:hidden"
          >
            <div className="flex justify-end p-2">
              <BotonIcono
                icono="cerrar"
                tono="oscuro"
                aria-label="Cerrar menú"
                onClick={cerrar}
              />
            </div>
            <div className="h-[calc(100%-3.5rem)]">
              <Sidebar
                plegado={false}
                entrevistaEnCurso={entrevistaEnCurso}
                onNavegar={cerrar}
              />
            </div>
          </aside>
        </>
      )}

      {/* Contenido: header + main comparten el mismo margen izquierdo, igual
          al ancho exacto del sidebar — sin hueco de por medio, porque ya no
          es flotante. En móvil no hay margen — el sidebar no está en flujo,
          es el cajón. */}
      <div
        className={`transition-[padding] duration-200 ease-out md:pl-[72px] ${
          plegadoEfectivo ? '' : 'lg:pl-64'
        }`}
      >
        <Header ref={disparadorRef} onAbrirMenu={alternar} menuAbierto={abierto} />
        {/* Un solo contenedor para todas las pantallas: hasta 1280 px y sin
            `mx-auto`, pegado al sidebar. Antes cada página se centraba en su
            propio ancho (672 a 1024 px) y dejaba franjas vacías a ambos lados.
            Lo que no debe estirarse (un formulario, el chat, un párrafo) se
            limita a sí mismo, alineado a la izquierda con el título. */}
        {/* Dentro del layout, no envolviéndolo: si una pantalla revienta, la
            barra lateral y la cabecera siguen en pie y el usuario puede irse a
            otra sección en vez de quedarse sin navegación. */}
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="max-w-7xl">
            <LimiteDeErrorDeRuta>
              <Outlet />
            </LimiteDeErrorDeRuta>
          </div>
        </main>
      </div>
    </div>
  )
}
