import { Navigate, Outlet } from 'react-router-dom'
import Cargando from '../components/comunes/Cargando'
import Encabezado from '../components/comunes/Encabezado'
import { useAuth } from '../context/AuthContext'

export default function RutaProtegida() {
  const { usuario, cargando } = useAuth()

  if (cargando) return <Cargando texto="Verificando sesión…" />
  if (!usuario) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen bg-slate-50">
      <Encabezado />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
