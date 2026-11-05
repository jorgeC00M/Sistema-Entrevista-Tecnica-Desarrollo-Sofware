import Alerta from '@/components/ui/Alerta'
import Spinner from '@/components/ui/Spinner'
import { useAuth } from '@/features/auth/hooks/useAuth'
import EvolucionPorNivel from '@/features/inicio/components/EvolucionPorNivel'
import SiguientePaso from '@/features/inicio/components/SiguientePaso'
import TarjetasDeResumen from '@/features/inicio/components/TarjetasDeResumen'
import UltimaEntrevista from '@/features/inicio/components/UltimaEntrevista'
import UltimoCv from '@/features/inicio/components/UltimoCv'
import { evolucionPorNivel } from '@/features/inicio/evolucion'
import { useInicio } from '@/features/inicio/hooks/useInicio'

/**
 * Inicio: la primera pantalla con sesión. Cuánto practicaste (las cifras), qué
 * conviene hacer ahora (el siguiente paso), cómo te fue la última vez (la
 * última finalizada y el último CV) y tu evolución por nivel. Resume y enlaza:
 * no reemplaza al Historial ni al reporte.
 *
 * El orden del DOM es el orden visual. Todo sale de `useInicio`; aquí solo se
 * ordenan los bloques.
 */
export default function InicioPage() {
  const { usuario } = useAuth()
  const { cargando, error, datos } = useInicio()

  if (error) return <Alerta>{error}</Alerta>
  if (cargando || !datos) return <Spinner texto="Cargando tu resumen…" />

  const nombre = usuario?.nombre_completo.split(' ')[0]
  const catalogos = datos.catalogos

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-headline-xl font-semibold text-vidrio-ink">
        {nombre ? `Hola, ${nombre}` : 'Hola'}
      </h1>

      <TarjetasDeResumen cifras={datos.cifras} />

      <SiguientePaso paso={datos.siguiente} />

      {(datos.ultima || datos.cv) && (
        <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          {datos.ultima && <UltimaEntrevista entrevista={datos.ultima.entrevista} resumen={datos.ultima.resumen} />}
          {datos.cv && <UltimoCv fila={datos.cv.fila} detalle={datos.cv.detalle} puestos={catalogos?.puestos ?? []} />}
        </div>
      )}

      {/* Sin catálogo no hay niveles ni orden de puestos: se omite, sin bloquear el resto. */}
      {catalogos && (
        <section aria-labelledby="titulo-evolucion" className="flex flex-col gap-3">
          <h2 id="titulo-evolucion" className="text-headline-md font-semibold text-vidrio-ink">
            Tu evolución
          </h2>
          <EvolucionPorNivel
            niveles={evolucionPorNivel(
              datos.entrevistas,
              catalogos.niveles,
              catalogos.puestos.map((p) => p.codigo),
            )}
          />
        </section>
      )}
    </div>
  )
}
