import { Navigate, Outlet } from 'react-router-dom'

import Header from '@/components/layout/Header'
import Spinner from '@/components/ui/Spinner'
import { useAuth } from '@/features/auth/hooks/useAuth'

/**
 * Guard y layout a la vez.
 *
 * Es una *layout route*: decide el acceso y además renderiza el shell
 * autenticado. Separarlo en un `LayoutPrivado` aparte duplicaría la jerarquía
 * de rutas sin cambiar nada observable.
 */
export default function RutaProtegida() {
  const { usuario, cargando } = useAuth()

  if (cargando) return <Spinner texto="Verificando sesión…" />
  if (!usuario) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
