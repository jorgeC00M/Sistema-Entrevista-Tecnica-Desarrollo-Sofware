import Tarjeta from '@/components/ui/Tarjeta'
import EtiquetaMono from '@/components/ui/EtiquetaMono'
import { useAuth } from '@/features/auth/hooks/useAuth'

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-BO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function PerfilPage() {
  const { usuario } = useAuth()
  // `RutaProtegida` no monta esta página sin usuario, así que aquí siempre hay.
  if (!usuario) return null

  const campos: { etiqueta: string; valor: string }[] = [
    { etiqueta: 'Nombre completo', valor: usuario.nombre_completo },
    { etiqueta: 'Correo electrónico', valor: usuario.email },
    { etiqueta: 'Miembro desde', valor: formatearFecha(usuario.date_joined) },
  ]
  if (usuario.carnet) {
    campos.splice(2, 0, { etiqueta: 'Carnet de identidad', valor: usuario.carnet })
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-headline-xl font-semibold text-vidrio-ink">Mi perfil</h1>
      <p className="mt-1 text-base text-vidrio-texto">
        Estos son los datos de tu cuenta. Por ahora son de solo lectura.
      </p>

      <Tarjeta como="dl" className="mt-6 divide-y divide-vidrio-linea">
        {campos.map((campo) => (
          <div key={campo.etiqueta} className="flex flex-col gap-1.5 p-4 sm:flex-row sm:items-center sm:gap-4">
            <dt className="sm:w-48 sm:shrink-0">
              <EtiquetaMono tono="suelto">{campo.etiqueta}</EtiquetaMono>
            </dt>
            <dd className="text-sm text-vidrio-ink">{campo.valor}</dd>
          </div>
        ))}
      </Tarjeta>
    </div>
  )
}
