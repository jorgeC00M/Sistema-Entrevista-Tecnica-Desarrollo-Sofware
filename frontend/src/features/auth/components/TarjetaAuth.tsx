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
 * Chrome compartido de login/registro — réplica valor por valor de
 * `design/login-card.html` (Fraunces + Figtree, paleta propia del mockup,
 * tarjeta de vidrio), deliberadamente aislada del resto del sistema de
 * diseño (`tinta`/`iris`, IBM Plex): ningún color, radio o fuente de aquí
 * viene de un token compartido, así que nada de lo que se toque en
 * `styles/index.css` o en `components/ui/` puede alterar esta pantalla, y
 * viceversa.
 *
 * `LoginPage`/`RegistroPage` son solo composición sobre este componente —
 * no pueden divergir visualmente entre sí porque comparten una única
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
      <div className="w-full max-w-[440px] rounded-[22px] border border-vidrio-borde bg-vidrio-card px-6 pt-9 pb-8 text-center font-sans text-vidrio-texto shadow-[0_20px_50px_-20px_rgba(28,47,94,0.25)] backdrop-blur-[18px] backdrop-saturate-[1.4] sm:px-10">
        <Icono nombre="marca" className="mx-auto mb-[14px] h-9 w-9 text-vidrio-acento" />

        <h1 className="font-serif text-[2rem] leading-[1.1] font-semibold tracking-[-0.01em] text-vidrio-ink sm:text-[2.6rem]">
          {titulo}
        </h1>
        <p className="mt-[10px] mb-7 text-base">{subtitulo}</p>

        {error && (
          <div className="mb-4 text-left">
            <Alerta>{error}</Alerta>
          </div>
        )}

        {children}

        <div className="mt-6 mb-[18px] flex items-center gap-[14px] text-[0.82rem] text-vidrio-muted">
          <span className="h-px flex-1 bg-[rgba(28,47,94,0.12)]" />
          <span>o</span>
          <span className="h-px flex-1 bg-[rgba(28,47,94,0.12)]" />
        </div>

        <BotonGoogle
          onCredential={onCredentialGoogle}
          modo={modoGoogle}
          etiquetaRespaldo={etiquetaGoogle}
        />

        <p className="mt-6 text-[0.88rem]">
          {pregunta}
          <Link to={rutaEnlace} className="ml-1.5 font-semibold text-vidrio-acento hover:underline">
            {textoEnlace}
          </Link>
        </p>
      </div>
    </div>
  )
}
