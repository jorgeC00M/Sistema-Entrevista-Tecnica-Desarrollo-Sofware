import { Navigate, Route, Routes } from 'react-router-dom'

import { LimiteDeErrorDeRuta } from '@/components/LimiteDeError'
import LoginPage from '@/features/auth/pages/LoginPage'
import RegistroPage from '@/features/auth/pages/RegistroPage'
import CurriculumPage from '@/features/curriculum/pages/CurriculumPage'
import EntrevistaPage from '@/features/entrevista/pages/EntrevistaPage'
import HistorialPage from '@/features/historial/pages/HistorialPage'
import EntradaRaiz from '@/features/landing/pages/EntradaRaiz'
import PerfilPage from '@/features/perfil/pages/PerfilPage'
import ResultadosPage from '@/features/resultados/pages/ResultadosPage'
import SeleccionPuestoPage from '@/features/seleccion/pages/SeleccionPuestoPage'
import RutaProtegida from '@/router/RutaProtegida'

export default function Rutas() {
  // Cubre las rutas públicas, que no pasan por el layout autenticado y por
  // tanto no tienen el límite que RutaProtegida monta alrededor del Outlet.
  return (
    <LimiteDeErrorDeRuta>
      <Routes>
        {/* Pública y fuera de RutaProtegida: es la puerta de entrada. Decide por
            sí misma si muestra la landing o lleva al usuario ya autenticado a su
            aplicación. */}
        <Route path="/" element={<EntradaRaiz />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />

        <Route element={<RutaProtegida />}>
          <Route path="/simular-entrevista" element={<SeleccionPuestoPage />} />
          <Route path="/entrevista/:id" element={<EntrevistaPage />} />
          <Route path="/entrevista/:id/resultados" element={<ResultadosPage />} />
          {/* Los dos destinos del CV, simétricos: entrada y resultado de cada
              tipo. Es el mismo componente, así que pasar de una ruta a otra no
              desmonta la página ni pierde lo elegido. */}
          <Route path="/mi-cv/analisis" element={<CurriculumPage />} />
          <Route path="/mi-cv/analisis/:id" element={<CurriculumPage />} />
          <Route path="/mi-cv/oferta" element={<CurriculumPage />} />
          <Route path="/mi-cv/oferta/:id" element={<CurriculumPage />} />
          <Route path="/historial" element={<HistorialPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
        </Route>

        {/* El progreso se fusionó dentro del historial: un marcador guardado a
            /progreso aterriza donde ahora vive ese contenido, no en la portada. */}
        <Route path="/progreso" element={<Navigate to="/historial" replace />} />
        {/* La retroalimentación acumulada se quitó: la de cada entrevista vive
            en su reporte, al que se llega desde el historial. */}
        <Route path="/retroalimentacion" element={<Navigate to="/historial" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LimiteDeErrorDeRuta>
  )
}
