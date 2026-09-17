import { Navigate, Route, Routes } from 'react-router-dom'

import LoginPage from '@/features/auth/pages/LoginPage'
import RegistroPage from '@/features/auth/pages/RegistroPage'
import EntrevistaPage from '@/features/entrevista/pages/EntrevistaPage'
import HistorialPage from '@/features/historial/pages/HistorialPage'
import EntradaRaiz from '@/features/landing/pages/EntradaRaiz'
import ResultadosPage from '@/features/resultados/pages/ResultadosPage'
import SeleccionAreaPage from '@/features/seleccion/pages/SeleccionAreaPage'
import RutaProtegida from '@/router/RutaProtegida'

export default function Rutas() {
  return (
    <Routes>
      {/* Pública y fuera de RutaProtegida: es la puerta de entrada. Decide por
          sí misma si muestra la landing o lleva al usuario ya autenticado a su
          aplicación. */}
      <Route path="/" element={<EntradaRaiz />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegistroPage />} />

      <Route element={<RutaProtegida />}>
        <Route path="/nueva-entrevista" element={<SeleccionAreaPage />} />
        <Route path="/entrevista/:id" element={<EntrevistaPage />} />
        <Route path="/entrevista/:id/resultados" element={<ResultadosPage />} />
        <Route path="/historial" element={<HistorialPage />} />
      </Route>

      {/* El progreso se fusionó dentro del historial: un marcador guardado a
          /progreso aterriza donde ahora vive ese contenido, no en la portada. */}
      <Route path="/progreso" element={<Navigate to="/historial" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
