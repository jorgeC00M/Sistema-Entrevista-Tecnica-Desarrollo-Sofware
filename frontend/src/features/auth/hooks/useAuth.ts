import { useContext } from 'react'

import { AuthContext } from '@/features/auth/context/contexto'
import type { ContextoDeAuth } from '@/features/auth/context/contexto'

export function useAuth(): ContextoDeAuth {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return contexto
}
