import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import RutaProtegida from './routes/RutaProtegida'
import Entrevista from './pages/Entrevista'
import Historial from './pages/Historial'
import Login from './pages/Login'
import Progreso from './pages/Progreso'
import Registro from './pages/Registro'
import Resultados from './pages/Resultados'
import SeleccionArea from './pages/SeleccionArea'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          <Route element={<RutaProtegida />}>
            <Route path="/" element={<SeleccionArea />} />
            <Route path="/entrevista/:id" element={<Entrevista />} />
            <Route path="/entrevista/:id/resultados" element={<Resultados />} />
            <Route path="/historial" element={<Historial />} />
            <Route path="/progreso" element={<Progreso />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
