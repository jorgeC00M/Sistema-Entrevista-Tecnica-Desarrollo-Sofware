import FooterLanding from '@/features/landing/components/FooterLanding'
import HeaderLanding from '@/features/landing/components/HeaderLanding'
import CierreCTA from '@/features/landing/sections/CierreCTA'
import ComoFunciona from '@/features/landing/sections/ComoFunciona'
import Hero from '@/features/landing/sections/Hero'
import PuestosDisponibles from '@/features/landing/sections/PuestosDisponibles'
import QueRecibes from '@/features/landing/sections/QueRecibes'
import RevisaTuCV from '@/features/landing/sections/RevisaTuCV'
import { useCatalogos } from '@/hooks/useCatalogos'

export default function LandingPage() {
  const { catalogos } = useCatalogos({ publico: true })

  // Un fallo del catálogo no rompe la landing: las secciones que dependen de
  // él se omiten y el resto sigue cumpliendo su función, que es explicar el
  // servicio y llevar al registro.
  const totalPreguntas = catalogos?.preguntas_por_entrevista ?? null
  const hayPuestos = (catalogos?.puestos.length ?? 0) > 0

  return (
    // Sistema "vidrio": fondo y tipografía propios de toda la landing,
    // fijados una sola vez aquí; el resto del árbol hereda por cascada,
    // igual que RutaProtegida.tsx en el dashboard y TarjetaAuth.tsx en
    // login/registro.
    <div className="min-h-screen bg-vidrio-bg text-vidrio-texto">
      <a href="#contenido" className="salto-al-contenido">
        Saltar al contenido
      </a>

      <HeaderLanding />

      <main id="contenido">
        <Hero totalPreguntas={totalPreguntas} />
        {/* Sin franja de cifras: "3 puestos, 5 preguntas" con un contador animado
            restaba credibilidad, y esos datos ya aparecen con su contexto en el
            hero y en "Puestos". */}
        <ComoFunciona totalPreguntas={totalPreguntas} />
        <QueRecibes />
        {/* No depende del catálogo: sin él, la sección sigue explicando el módulo. */}
        <RevisaTuCV />
        {hayPuestos && catalogos && (
          <PuestosDisponibles
            puestos={catalogos.puestos}
            areas={catalogos.areas}
            niveles={catalogos.niveles}
          />
        )}
        <CierreCTA />
      </main>

      <FooterLanding />
    </div>
  )
}
