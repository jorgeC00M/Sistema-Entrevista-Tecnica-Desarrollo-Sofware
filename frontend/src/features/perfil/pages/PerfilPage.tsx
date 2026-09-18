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
      <h1 className="text-lg font-semibold text-slate-900">Mi perfil</h1>
      <p className="mt-1 text-sm text-slate-500">
        Estos son los datos de tu cuenta. Por ahora son de solo lectura.
      </p>

      <dl className="mt-6 divide-y divide-slate-200 rounded-xl bg-white ring-1 ring-slate-200">
        {campos.map((campo) => (
          <div key={campo.etiqueta} className="flex flex-col gap-1 p-4 sm:flex-row sm:gap-4">
            <dt className="text-sm font-medium text-slate-500 sm:w-48 sm:shrink-0">
              {campo.etiqueta}
            </dt>
            <dd className="text-sm text-slate-900">{campo.valor}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
