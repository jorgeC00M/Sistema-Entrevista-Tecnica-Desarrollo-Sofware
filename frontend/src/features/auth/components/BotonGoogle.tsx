import { useEffect, useRef, useState } from 'react'

import { IconoGoogleAuth } from '@/features/auth/components/iconosAuth'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SRC_SCRIPT_GOOGLE = 'https://accounts.google.com/gsi/client'

interface RespuestaDeCredencial {
  credential: string
}

interface GoogleIdentityServices {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string
        callback: (respuesta: RespuestaDeCredencial) => void
      }) => void
      renderButton: (contenedor: HTMLElement, opciones: Record<string, unknown>) => void
    }
  }
}

declare global {
  interface Window {
    google?: GoogleIdentityServices
  }
}

function cargarScriptGoogle(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve()
      return
    }
    const existente = document.querySelector<HTMLScriptElement>(
      `script[src="${SRC_SCRIPT_GOOGLE}"]`,
    )
    if (existente) {
      existente.addEventListener('load', () => resolve())
      existente.addEventListener('error', () => reject(new Error('No se pudo cargar el script')))
      return
    }
    const script = document.createElement('script')
    script.src = SRC_SCRIPT_GOOGLE
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('No se pudo cargar el script'))
    document.head.appendChild(script)
  })
}

interface Props {
  onCredential: (idToken: string) => void
  /** Cambia el texto (real y de respaldo) entre "Continuar" y "Registrarse". */
  modo: 'login' | 'registro'
  /** Solo para el botón de respaldo cuando Google no está disponible. */
  etiquetaRespaldo: string
}

const CLASE_BOTON_RESPALDO =
  "flex h-11 w-full items-center justify-center gap-2.5 rounded-full bg-[rgba(255,255,255,0.72)] font-['Figtree'] text-[0.88rem] text-[#1c2f5e] opacity-60"

/**
 * Botón "Continuar con Google" usando Google Identity Services.
 *
 * Se degrada de forma controlada si VITE_GOOGLE_CLIENT_ID no está
 * configurado (espejo del 503 del backend cuando falta
 * GOOGLE_OAUTH_CLIENT_ID), o si el script no carga — en ambos casos
 * muestra un botón con el estilo del diseño, deshabilitado, en vez de un
 * simple texto de aviso.
 */
export default function BotonGoogle({ onCredential, modo, etiquetaRespaldo }: Props) {
  const contenedorRef = useRef<HTMLDivElement>(null)
  const [listo, setListo] = useState(false)
  const [error, setError] = useState(false)
  // Evita que StrictMode (que en desarrollo monta cada efecto dos veces)
  // llame a initialize()/renderButton() dos veces: la bandera sobrevive al
  // doble montaje porque los refs no se reinician entre esas dos pasadas.
  const inicializadoRef = useRef(false)

  useEffect(() => {
    if (!CLIENT_ID) return
    let cancelado = false

    cargarScriptGoogle()
      .then(() => {
        if (!cancelado) setListo(true)
      })
      .catch(() => {
        if (!cancelado) setError(true)
      })

    return () => {
      cancelado = true
    }
  }, [])

  useEffect(() => {
    if (!listo || !contenedorRef.current || !window.google) return
    if (inicializadoRef.current) return
    inicializadoRef.current = true

    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (respuesta) => onCredential(respuesta.credential),
    })
    window.google.accounts.id.renderButton(contenedorRef.current, {
      theme: 'outline',
      size: 'large',
      width: 320,
      // Botón nativo de Google: estas son las únicas opciones de forma y
      // texto que Google Identity Services permite. No es posible igualarlo
      // al píxel al botón del mockup — esto es lo más cerca que se puede
      // llegar sin dejar de usar el botón nativo real.
      text: modo === 'login' ? 'signin_with' : 'signup_with',
      locale: 'es',
      shape: 'pill',
      logo_alignment: 'center',
    })
  }, [listo, onCredential, modo])

  if (!CLIENT_ID || error) {
    return (
      <button type="button" disabled aria-disabled="true" className={CLASE_BOTON_RESPALDO}>
        <IconoGoogleAuth className="h-[18px] w-[18px]" />
        {etiquetaRespaldo}
      </button>
    )
  }

  return <div ref={contenedorRef} className="flex justify-center" />
}
