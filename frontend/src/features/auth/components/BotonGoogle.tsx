import { useEffect, useRef, useState } from 'react'

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
}

/**
 * Botón "Continuar con Google" usando Google Identity Services.
 *
 * Se degrada de forma controlada si VITE_GOOGLE_CLIENT_ID no está
 * configurado (espejo del 503 del backend cuando falta
 * GOOGLE_OAUTH_CLIENT_ID) en vez de romper la pantalla de login.
 */
export default function BotonGoogle({ onCredential }: Props) {
  const contenedorRef = useRef<HTMLDivElement>(null)
  const [listo, setListo] = useState(false)
  const [error, setError] = useState(false)

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

    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (respuesta) => onCredential(respuesta.credential),
    })
    window.google.accounts.id.renderButton(contenedorRef.current, {
      theme: 'outline',
      size: 'large',
      width: 320,
      text: 'continue_with',
      locale: 'es',
    })
  }, [listo, onCredential])

  if (!CLIENT_ID) {
    return (
      <p className="rounded-lg bg-slate-50 px-3 py-2 text-center text-xs text-slate-400 ring-1 ring-slate-200">
        Inicio de sesión con Google no está configurado.
      </p>
    )
  }

  if (error) {
    return (
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-600 ring-1 ring-amber-200">
        No se pudo cargar el inicio de sesión con Google.
      </p>
    )
  }

  return <div ref={contenedorRef} className="flex justify-center" />
}
