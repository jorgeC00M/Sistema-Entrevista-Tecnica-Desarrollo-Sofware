import { forwardRef } from 'react'
import { useLocation } from 'react-router-dom'

import { resolverTitulo } from '@/components/layout/titulosDeRuta'
import Icono from '@/components/ui/Icono'

interface Props {
  onAbrirMenu: () => void
  menuAbierto: boolean
}

/**
 * Encabezado de la zona autenticada.
 *
 * Ya no navega ni repite la marca: el sidebar ya tiene su propio bloque de
 * marca, y tener el nombre de la app en los dos sitios sería redundante.
 * En su lugar identifica en qué sección está el estudiante, resuelta por
 * `titulosDeRuta.ts` — nunca queda vacío, ni siquiera en una ruta que no esté
 * en el mapa. Tampoco lleva usuario ni cierre de sesión, que están al pie del
 * sidebar, ni campana ni avatar: no hay nada que notificar todavía y una foto
 * de perfil no existe en el modelo de datos.
 *
 * Recibe la referencia del botón de menú para que el cajón pueda devolverle
 * el foco al cerrarse.
 */
const Header = forwardRef<HTMLButtonElement, Props>(function Header(
  { onAbrirMenu, menuAbierto },
  disparadorRef,
) {
  const { pathname } = useLocation()
  const { titulo, subtitulo } = resolverTitulo(pathname)

  return (
    // Altura fija (h-16 = 64px) a propósito: el sidebar y el cajón se anclan
    // a este mismo valor (top-16) para quedar debajo del encabezado, nunca a
    // su lado.
    <header className="sticky top-0 z-40 h-16 border-b border-tinta-100 bg-white/90 backdrop-blur">
      <div className="flex h-full items-center gap-3 px-4">
        <button
          ref={disparadorRef}
          type="button"
          onClick={onAbrirMenu}
          aria-expanded={menuAbierto}
          aria-label="Abrir menú de navegación"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control text-tinta-500 transition-colors duration-150 hover:bg-tinta-100 hover:text-tinta-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iris-600 lg:hidden"
        >
          <Icono nombre="menu" />
        </button>

        {/*
          No es un <h1>: cada página ya tiene el suyo en su contenido
          (SeleccionAreaPage, HistorialPage, RetroalimentacionPage, PerfilPage).
          Un segundo <h1> aquí rompería la jerarquía de encabezados de la
          página. Esto es una etiqueta de la interfaz (chrome), no contenido.
        */}
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-tinta-950">{titulo}</p>
          {subtitulo && <p className="truncate text-xs text-tinta-500">{subtitulo}</p>}
        </div>
      </div>
    </header>
  )
})

export default Header
