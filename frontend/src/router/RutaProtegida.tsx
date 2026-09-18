import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { useCajonNavegacion } from '@/components/layout/useCajonNavegacion'
import { useEntrevistaEnCurso } from '@/components/layout/useEntrevistaEnCurso'
import IconoNav from '@/components/ui/IconoNav'
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
  const { abierto, alternar, cerrar, cajonRef, disparadorRef } = useCajonNavegacion()
  const [plegado, setPlegado] = useState(false)
  const entrevistaEnCurso = useEntrevistaEnCurso()

  if (cargando) return <Spinner texto="Verificando sesión…" />
  if (!usuario) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen bg-slate-50">
      {/* A todo lo ancho y por encima de todo lo demás: el sidebar y el cajón
          se anclan a su altura (top-16) para quedar debajo, nunca a su lado. */}
      <Header ref={disparadorRef} onAbrirMenu={alternar} menuAbierto={abierto} />

      {/* Barra fija en escritorio, debajo del encabezado. El ancho cambia al
          plegar, con transición. */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-10 hidden border-r border-slate-800 bg-slate-900 transition-[width] duration-200 ease-out lg:block ${
          plegado ? 'w-[76px]' : 'w-64'
        }`}
      >
        <Sidebar
          plegado={plegado}
          onAlternarPlegado={() => setPlegado((v) => !v)}
          entrevistaEnCurso={entrevistaEnCurso}
        />
      </aside>

      {/* Cajón en pantallas estrechas, también debajo del encabezado: el
          botón que lo abre sigue visible y pulsable mientras está abierto. */}
      {abierto && (
        <>
          <div
            className="fixed inset-x-0 top-16 bottom-0 z-20 bg-slate-900/40 lg:hidden"
            onClick={cerrar}
            aria-hidden="true"
          />
          <aside
            ref={cajonRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            className="fixed top-16 bottom-0 left-0 z-30 w-72 border-r border-slate-800 bg-slate-900 shadow-xl lg:hidden"
          >
            <div className="flex justify-end p-2">
              <button
                type="button"
                onClick={cerrar}
                aria-label="Cerrar menú"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors duration-150 hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                <IconoNav nombre="cerrar" />
              </button>
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

      <div className={`transition-[padding] duration-200 ease-out ${plegado ? 'lg:pl-[76px]' : 'lg:pl-64'}`}>
        <main className="mx-auto max-w-4xl px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
