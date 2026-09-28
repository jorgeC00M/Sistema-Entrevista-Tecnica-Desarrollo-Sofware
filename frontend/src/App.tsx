import { BrowserRouter } from 'react-router-dom'

import LimiteDeError from '@/components/LimiteDeError'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import Rutas from '@/router'

export default function App() {
  return (
    <BrowserRouter>
      {/* Red de último recurso: cubre al proveedor de sesión y al enrutador,
          que quedan fuera del límite por ruta. Aquí ya no hay navegación en la
          que apoyarse, así que la única salida honesta es recargar. */}
      <LimiteDeError recuperacion="recargar">
        <AuthProvider>
          <Rutas />
        </AuthProvider>
      </LimiteDeError>
    </BrowserRouter>
  )
}
