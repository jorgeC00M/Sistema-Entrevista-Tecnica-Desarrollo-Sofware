import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import Alerta from '@/components/ui/Alerta'
import Icono from '@/components/ui/Icono'
import BotonGoogle from '@/features/auth/components/BotonGoogle'

interface Props {
  titulo: string
  subtitulo: string
  error: string
  onCredentialGoogle: (idToken: string) => void
  pregunta: string
  textoEnlace: string
  rutaEnlace: string
  children: ReactNode
}

/**
 * Chrome compartido de login/registro: fondo, tarjeta de vidrio, marca,
 * título/subtítulo, alerta de error, el formulario (`children`), la
 * alternativa de Google y el enlace de cambio de vista.
 *
 * Antes `LoginPage` y `RegistroPage` repetían este marcado casi al
 * carácter, sin nada que las mantuviera sincronizadas. Con un solo
 * componente de layout, las dos pantallas ya no pueden divergir
 * visualmente por accidente.
 */
export default function TarjetaAuth({
  titulo,
  subtitulo,
  error,
  onCredentialGoogle,
  pregunta,
  textoEnlace,
  rutaEnlace,
  children,
}: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-tinta-50 px-4 py-12">
      {/* Tarjeta de vidrio: misma familia de color que el fondo (tinta),
          nunca blanco puro — se distingue por transparencia, desenfoque,
          borde y sombra, no por ser un tono distinto. */}
      <div className="w-full max-w-sm rounded-superficie border border-tinta-100 bg-tinta-100/60 p-8 text-center shadow-xl backdrop-blur">
        <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-control bg-iris-50 text-iris-600">
          <Icono nombre="marca" className="h-6 w-6" />
        </span>
        <h1 className="text-headline-xl font-semibold text-tinta-950">{titulo}</h1>
        <p className="mt-2 text-sm text-tinta-500">{subtitulo}</p>

        <div className="mt-4 text-left">
          <Alerta tipo="error">{error}</Alerta>
        </div>

        {children}

        <div className="my-5 flex items-center gap-3 text-xs text-tinta-500">
          <span className="h-px flex-1 bg-tinta-300" />
          <span>o</span>
          <span className="h-px flex-1 bg-tinta-300" />
        </div>

        <BotonGoogle onCredential={onCredentialGoogle} />

        <p className="mt-6 text-sm text-tinta-500">
          {pregunta}{' '}
          <Link to={rutaEnlace} className="font-medium text-iris-600 hover:underline">
            {textoEnlace}
          </Link>
        </p>
      </div>
    </div>
  )
}
