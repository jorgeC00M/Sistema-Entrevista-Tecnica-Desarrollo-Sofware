import { Navigate } from 'react-router-dom'

import Spinner from '@/components/ui/Spinner'
import { useAuth } from '@/features/auth/hooks/useAuth'
import LandingPage from '@/features/landing/pages/LandingPage'

/**
 * Reparte la ruta raíz entre el visitante y el usuario con sesión.
 *
 * Mientras se resuelve el perfil no se sabe a quién se está atendiendo, así
 * que se muestra el mismo spinner que usa `RutaProtegida`: enseñar la landing
 * durante ese instante haría parpadear la página de marketing a alguien que
 * solo quería entrar a su aplicación.
 */
export default function EntradaRaiz() {
  const { usuario, cargando } = useAuth()

  if (cargando) return <Spinner texto="Verificando sesión…" tono="vidrio" />
  if (usuario) return <Navigate to="/nueva-entrevista" replace />

  return <LandingPage />
}
