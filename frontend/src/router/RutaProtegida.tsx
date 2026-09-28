import { Navigate, Outlet } from 'react-router-dom'

import { LimiteDeErrorDeRuta } from '@/components/LimiteDeError'

import Sidebar, { useSidebar } from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import BotonIcono from '@/components/ui/BotonIcono'
import Spinner from '@/components/ui/Spinner'
import { useAuth } from '@/features/auth/hooks/useAuth'

/**
 * Guard y layout a la vez.
 *
 * Es una *layout route*: decide el acceso y además renderiza el shell
 * autenticado. Separarlo en un `LayoutPrivado` aparte duplicaría la jerarquía
 * de rutas sin cambiar nada observable.
 */
export default function RutaProtegida() {
  const { usuario, cargando } = useAuth()
  const { plegado, alternarPlegado, entrevistaEnCurso, ultimaFinalizada, cajon } = useSidebar()
  // Desestructurado aparte: oxlint no reconoce una ref accedida como
  // propiedad de un objeto anidado (`cajon.cajonRef`) y la marca como lectura
  // de `.current` en render, aunque pasar la ref misma a `ref={}` es correcto.
  const { abierto, alternar, cerrar, cajonRef, disparadorRef } = cajon

  if (cargando) return <Spinner texto="Verificando sesión…" />
  if (!usuario) return <Navigate to="/login" replace />

  return (
    // Sistema "vidrio": fondo y tipografía propios de todo el dashboard,
    // fijados una sola vez aquí — el resto del árbol hereda por cascada,
    // igual que TarjetaAuth.tsx en login/registro. tinta/iris no aparecen
    // en ningún hijo de este nodo.
    <div className="min-h-screen bg-vidrio-bg text-vidrio-texto">
      {/* Barra fija en escritorio: panel de borde completo, toca los 3 bordes
          de la ventana (arriba, izquierda, abajo) sin margen ni radio — el
          header arranca justo en su esquina superior derecha. El ancho
          cambia al plegar, con transición. */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-10 hidden bg-vidrio-ink transition-[width] duration-200 ease-out lg:block ${
          plegado ? 'w-[72px]' : 'w-64'
        }`}
      >
        <Sidebar
          plegado={plegado}
          onAlternarPlegado={alternarPlegado}
          entrevistaEnCurso={entrevistaEnCurso}
          ultimaFinalizada={ultimaFinalizada}
        />
      </aside>

      {/* Cajón en pantallas estrechas, con el mismo estilo de borde completo. */}
      {abierto && (
        <>
          <div
            className="fixed inset-0 z-20 bg-vidrio-ink/40 lg:hidden"
            onClick={cerrar}
            aria-hidden="true"
          />
          <aside
            ref={cajonRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            className="fixed top-0 bottom-0 left-0 z-30 w-72 bg-vidrio-ink lg:hidden"
          >
            <div className="flex justify-end p-2">
              <BotonIcono
                icono="cerrar"
                aria-label="Cerrar menú"
                onClick={cerrar}
              />
            </div>
            <div className="h-[calc(100%-3.5rem)]">
              <Sidebar
                plegado={false}
                entrevistaEnCurso={entrevistaEnCurso}
                ultimaFinalizada={ultimaFinalizada}
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
        className={`transition-[padding] duration-200 ease-out ${
          plegado ? 'lg:pl-[72px]' : 'lg:pl-64'
        }`}
      >
        <Header ref={disparadorRef} onAbrirMenu={alternar} menuAbierto={abierto} />
        {/* Sin max-w aquí: cada página elige su propio ancho según lo que
            muestra (angosto para conversar/leer, más ancho para tablas y
            tarjetas de datos) — un tope único dejaba mucho espacio vacío en
            pantallas grandes. */}
        {/* Dentro del layout, no envolviéndolo: si una pantalla revienta, la
            barra lateral y la cabecera siguen en pie y el usuario puede irse a
            otra sección en vez de quedarse sin navegación. */}
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <LimiteDeErrorDeRuta>
            <Outlet />
          </LimiteDeErrorDeRuta>
        </main>
      </div>
    </div>
  )
}
