import FooterLanding from '@/features/landing/components/FooterLanding'
import HeaderLanding from '@/features/landing/components/HeaderLanding'
import { useCatalogosPublicos } from '@/features/landing/hooks/useCatalogosPublicos'
import AreasTecnicas from '@/features/landing/sections/AreasTecnicas'
import CierreCTA from '@/features/landing/sections/CierreCTA'
import ComoFunciona from '@/features/landing/sections/ComoFunciona'
import Hero from '@/features/landing/sections/Hero'
import QueRecibes from '@/features/landing/sections/QueRecibes'

export default function LandingPage() {
  const { catalogos } = useCatalogosPublicos()

  // Un fallo del catálogo no rompe la landing: las secciones que dependen de
  // él se omiten y el resto sigue cumpliendo su función, que es explicar el
  // servicio y llevar al registro.
  const totalPreguntas = catalogos?.preguntas_por_entrevista ?? null
  const hayAreas = (catalogos?.areas.length ?? 0) > 0

  return (
    // Sistema "vidrio": fondo y tipografía propios de toda la landing,
    // fijados una sola vez aquí — el resto del árbol hereda por cascada,
    // igual que RutaProtegida.tsx en el dashboard y TarjetaAuth.tsx en
    // login/registro. tinta/iris no aparecen en ningún hijo de este nodo.
    <div className="min-h-screen bg-vidrio-bg font-['Figtree'] text-vidrio-texto">
      <a href="#contenido" className="salto-al-contenido">
        Saltar al contenido
      </a>

      <HeaderLanding />

      <main id="contenido">
        <Hero totalPreguntas={totalPreguntas} />
        <ComoFunciona totalPreguntas={totalPreguntas} />
        <QueRecibes />
        {hayAreas && catalogos && (
          <AreasTecnicas areas={catalogos.areas} niveles={catalogos.niveles} />
        )}
        <CierreCTA />
      </main>

      <FooterLanding />
    </div>
  )
}
