import { forwardRef } from 'react'
import { NavLink } from 'react-router-dom'

import IconoNav from '@/components/ui/IconoNav'

interface Props {
  onAbrirMenu: () => void
  menuAbierto: boolean
}

/**
 * Encabezado de la zona autenticada.
 *
 * Ya no navega: los destinos viven en el sidebar y tenerlos también aquí sería
 * duplicar la navegación. Tampoco lleva el usuario ni el botón de salir, que
 * ahora están al pie del sidebar. Conserva la marca y, en pantallas estrechas,
 * el botón que abre el cajón.
 *
 * Recibe la referencia de ese botón para que el cajón pueda devolverle el foco
 * al cerrarse.
 */
const Header = forwardRef<HTMLButtonElement, Props>(function Header(
  { onAbrirMenu, menuAbierto },
  disparadorRef,
) {
  return (
    // Altura fija (h-16) a propósito: el sidebar y el cajón se anclan a este
    // mismo valor (top-16) para quedar debajo del encabezado, nunca a su lado.
    <header className="sticky top-0 z-40 h-16 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex h-full items-center gap-3 px-4">
        <button
          ref={disparadorRef}
          type="button"
          onClick={onAbrirMenu}
          aria-expanded={menuAbierto}
          aria-label="Abrir menú de navegación"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 lg:hidden"
        >
          <IconoNav nombre="menu" />
        </button>

        <NavLink
          to="/nueva-entrevista"
          className="flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Entrevistas Técnicas
        </NavLink>
      </div>
    </header>
  )
})

export default Header
