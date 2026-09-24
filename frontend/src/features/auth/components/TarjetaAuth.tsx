import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import Alerta from '@/components/ui/Alerta'
import BotonGoogle from '@/features/auth/components/BotonGoogle'
import { IconoMarcaAuth } from '@/features/auth/components/iconosAuth'

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
    <div className="flex min-h-screen items-center justify-center bg-[#e8edf5] p-6">
      <div className="w-full max-w-[440px] rounded-[22px] border border-[rgba(255,255,255,0.8)] bg-[rgba(255,255,255,0.55)] px-10 pt-9 pb-8 text-center font-['Figtree'] text-[#4a5572] shadow-[0_20px_50px_-20px_rgba(28,47,94,0.25)] backdrop-blur-[18px] backdrop-saturate-[1.4]">
        <IconoMarcaAuth className="mx-auto mb-[14px] h-9 w-9 text-[#2b55a3]" />

        <h1 className="font-['Fraunces'] text-[2.6rem] leading-[1.1] font-semibold tracking-[-0.01em] text-[#1c2f5e]">
          {titulo}
        </h1>
        <p className="mt-[10px] mb-7 text-base">{subtitulo}</p>

        {error && (
          <div className="mb-4 text-left">
            <Alerta tipo="error">{error}</Alerta>
          </div>
        )}

        {children}

        <div className="mt-6 mb-[18px] flex items-center gap-[14px] text-[0.82rem] text-[#8a93a8]">
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
          <Link to={rutaEnlace} className="ml-1.5 font-semibold text-[#2b55a3] hover:underline">
            {textoEnlace}
          </Link>
        </p>
      </div>
    </div>
  )
}
