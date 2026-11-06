import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { LimiteDeErrorDeRuta } from '@/components/LimiteDeError'
import Spinner from '@/components/ui/Spinner'
import RutaProtegida from '@/router/RutaProtegida'

// Cada página se descarga la primera vez que se visita: quien solo ve la
// landing no baja el chat, el reporte ni el módulo de CV, y el paquete inicial
// queda en lo que se usa para entrar.
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const RegistroPage = lazy(() => import('@/features/auth/pages/RegistroPage'))
const CurriculumPage = lazy(() => import('@/features/curriculum/pages/CurriculumPage'))
const EntrevistaPage = lazy(() => import('@/features/entrevista/pages/EntrevistaPage'))
const HistorialPage = lazy(() => import('@/features/historial/pages/HistorialPage'))
const InicioPage = lazy(() => import('@/features/inicio/pages/InicioPage'))
const EntradaRaiz = lazy(() => import('@/features/landing/pages/EntradaRaiz'))
const PerfilPage = lazy(() => import('@/features/perfil/pages/PerfilPage'))
const ResultadosPage = lazy(() => import('@/features/resultados/pages/ResultadosPage'))
const SeleccionPuestoPage = lazy(() => import('@/features/seleccion/pages/SeleccionPuestoPage'))

export default function Rutas() {
  // Cubre las rutas públicas, que no pasan por el layout autenticado y por
  // tanto no tienen el límite que RutaProtegida monta alrededor del Outlet.
  return (
    <LimiteDeErrorDeRuta>
      {/* Mientras llega el código de una página se ve el mismo indicador que
          mientras llegan sus datos. */}
      <Suspense fallback={<Spinner />}>
        <Routes>
          {/* Pública y fuera de RutaProtegida: es la puerta de entrada. Decide por
              sí misma si muestra la landing o lleva al usuario ya autenticado a su
              aplicación. */}
          <Route path="/" element={<EntradaRaiz />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegistroPage />} />

          <Route element={<RutaProtegida />}>
            <Route path="/inicio" element={<InicioPage />} />
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
      </Suspense>
    </LimiteDeErrorDeRuta>
  )
}
