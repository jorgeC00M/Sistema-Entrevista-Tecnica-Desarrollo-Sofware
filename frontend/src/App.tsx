import { BrowserRouter } from 'react-router-dom'

import { AuthProvider } from '@/features/auth/context/AuthProvider'
import Rutas from '@/router'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Rutas />
      </AuthProvider>
    </BrowserRouter>
  )
}
