import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import Alerta from '@/components/ui/Alerta'
import BotonGoogle from '@/features/auth/components/BotonGoogle'
import Icono from '@/components/ui/Icono'

interface Props {
  titulo: string
  subtitulo: string
  error: string
  onCredentialGoogle: (idToken: string) => void
  modoGoogle: 'login' | 'registro'
  etiquetaGoogle: string
  pregunta: string
  textoEnlace: string
  rutaEnlace: string
  children: ReactNode
}

/**
 * Chrome compartido de login/registro: tarjeta de vidrio con titular serif,
 * sobre los mismos tokens que el resto del producto (`shadow-tarjeta`,
 * `rounded-tarjeta`, `text-titulo-auth`). Antes copiaba el mockup con valores
 * escritos a mano; ahora un cambio de paleta en `styles/tokens.css` la
 * alcanza como a cualquier otra pantalla.
 *
 * `LoginPage`/`RegistroPage` son solo composición sobre este componente: no
 * pueden divergir visualmente entre sí porque comparten una única
 * implementación del chrome.
 */
export default function TarjetaAuth({
  titulo,
  subtitulo,
  error,
  onCredentialGoogle,
  modoGoogle,
  etiquetaGoogle,
  pregunta,
  textoEnlace,
  rutaEnlace,
  children,
}: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-vidrio-bg p-4 sm:p-6">
      <div className="w-full max-w-[440px] rounded-tarjeta border border-vidrio-borde bg-vidrio-card px-6 pt-9 pb-8 text-center text-vidrio-texto shadow-tarjeta backdrop-blur-[18px] backdrop-saturate-[1.4] sm:px-10">
        <Icono nombre="marca" className="mx-auto mb-[14px] h-9 w-9 text-vidrio-acento" />

        <h1 className="font-serif text-titulo-auth text-vidrio-ink">{titulo}</h1>
        <p className="mt-[10px] mb-7 text-base">{subtitulo}</p>

        {error && (
          <div className="mb-4 text-left">
            <Alerta>{error}</Alerta>
          </div>
        )}

        {children}

        <div className="mt-6 mb-[18px] flex items-center gap-[14px] text-meta text-vidrio-muted">
          <span className="h-px flex-1 bg-vidrio-linea" />
          <span>o</span>
          <span className="h-px flex-1 bg-vidrio-linea" />
        </div>

        <BotonGoogle
          onCredential={onCredentialGoogle}
          modo={modoGoogle}
          etiquetaRespaldo={etiquetaGoogle}
        />

        <p className="mt-6 text-sm">
          {pregunta}
          <Link to={rutaEnlace} className="foco-anillo ml-1.5 rounded-chip font-semibold text-vidrio-acento hover:underline">
            {textoEnlace}
          </Link>
        </p>
      </div>
    </div>
  )
}
