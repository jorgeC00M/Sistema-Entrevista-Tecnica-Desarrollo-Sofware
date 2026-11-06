import { useRef, useState } from 'react'

import Boton from '@/components/ui/Boton'
import Tarjeta from '@/components/ui/Tarjeta'
import EtiquetaMono from '@/components/ui/EtiquetaMono'
import { useAuth } from '@/features/auth/hooks/useAuth'
import ModalCambiarContrasena from '@/features/perfil/components/ModalCambiarContrasena'
import { fechaLarga } from '@/lib/fechas'

export default function PerfilPage() {
  const { usuario } = useAuth()
  const [cambiando, setCambiando] = useState(false)
  const [confirmacion, setConfirmacion] = useState('')
  const botonCambiar = useRef<HTMLButtonElement>(null)
  // `RutaProtegida` no monta esta página sin usuario, así que aquí siempre hay.
  if (!usuario) return null

  const campos: { etiqueta: string; valor: string }[] = [
    { etiqueta: 'Nombre completo', valor: usuario.nombre_completo },
    { etiqueta: 'Correo electrónico', valor: usuario.email },
    { etiqueta: 'Miembro desde', valor: fechaLarga(usuario.date_joined) },
  ]
  if (usuario.carnet) {
    campos.splice(2, 0, { etiqueta: 'Carnet de identidad', valor: usuario.carnet })
  }

  return (
    <div>
      <h1 className="font-serif text-headline-xl font-semibold text-vidrio-ink">Mi perfil</h1>
      <p className="mt-1 text-base text-vidrio-texto">
        Estos son los datos de tu cuenta.
      </p>

      {/* Un dato por tarjeta: en escritorio se reparten en dos columnas y
          ocupan el ancho del contenedor; en móvil, una debajo de otra. */}
      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        {campos.map((campo) => (
          <Tarjeta key={campo.etiqueta} className="flex min-w-0 flex-col gap-1.5 p-4">
            <dt>
              <EtiquetaMono tono="suelto">{campo.etiqueta}</EtiquetaMono>
            </dt>
            {/* `break-words`: un correo largo no debe ensanchar la tarjeta. */}
            <dd className="text-sm break-words text-vidrio-ink">{campo.valor}</dd>
          </Tarjeta>
        ))}
      </dl>

      <section aria-labelledby="titulo-seguridad" className="mt-8">
        <h2 id="titulo-seguridad" className="mb-3 text-headline-md font-semibold text-vidrio-ink">
          Seguridad
        </h2>
        <Tarjeta className="p-4">
          {usuario.tiene_contrasena ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1.5">
                <EtiquetaMono tono="suelto">Contraseña</EtiquetaMono>
                <span className="text-sm text-vidrio-ink">
                  <span aria-hidden="true" className="tracking-widest">
                    ••••••••
                  </span>
                  <span className="sr-only">Configurada</span>
                </span>
              </div>
              <Boton
                ref={botonCambiar}
                variante="secundario"
                tamano="sm"
                onClick={() => {
                  setConfirmacion('')
                  setCambiando(true)
                }}
                className="self-start sm:self-auto"
              >
                Cambiar contraseña
              </Boton>
            </div>
          ) : (
            // Sin botón para crear una: hacerlo sin otra prueba dejaría que una
            // sesión robada se quedara la cuenta.
            <p className="text-sm text-vidrio-texto">Entras con Google: tu cuenta no tiene contraseña.</p>
          )}
        </Tarjeta>
        <p aria-live="polite" className="mt-3 text-sm text-exito-texto">
          {confirmacion}
        </p>
      </section>

      {cambiando && (
        <ModalCambiarContrasena
          onCancelar={() => setCambiando(false)}
          onCambiada={() => {
            setCambiando(false)
            setConfirmacion('Contraseña actualizada. Cerramos tu sesión en otros dispositivos.')
          }}
          focoAlCerrar={() => botonCambiar.current}
        />
      )}
    </div>
  )
}
