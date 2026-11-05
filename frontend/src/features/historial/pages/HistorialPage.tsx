import { Link } from 'react-router-dom'

import { VIGENCIA_DEL_CATALOGO_MS, obtenerPuestos } from '@/api/catalogos'
import Alerta from '@/components/ui/Alerta'
import EstadoVacio from '@/components/ui/EstadoVacio'
import Spinner from '@/components/ui/Spinner'
import TablaDeEntrevistas from '@/features/historial/components/TablaDeEntrevistas'
import { useFiltrosDeHistorial } from '@/features/historial/hooks/useFiltrosDeHistorial'
import { useHistorial } from '@/features/historial/hooks/useHistorial'
import { usePeticion } from '@/hooks/usePeticion'

export default function HistorialPage() {
  const { entrevistas, cargando, error } = useHistorial()
  // Los niveles salen del catálogo, no de una lista escrita aquí. Su fallo no
  // bloquea la página: solo se omite el filtro de nivel. La evolución se mudó
  // al Inicio (`inicio-con-resumen`).
  const catalogo = usePeticion('catalogo-puestos', obtenerPuestos, { vigenciaMs: VIGENCIA_DEL_CATALOGO_MS })
  const niveles = catalogo.datos?.niveles ?? null
  const filtros = useFiltrosDeHistorial(
    entrevistas ?? [],
    (niveles ?? []).map((n) => n.codigo),
  )

  if (error) return <Alerta>{error}</Alerta>
  if (cargando || !entrevistas) return <Spinner texto="Cargando tu historial…" />

  if (entrevistas.length === 0) {
    return (
      <EstadoVacio icono="historial" titulo="Todavía no realizaste ninguna entrevista.">
        <Link to="/simular-entrevista" className="font-medium text-vidrio-acento hover:underline">
          Empieza la primera
        </Link>
      </EstadoVacio>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-headline-xl font-semibold text-vidrio-ink">Historial</h1>
        <p className="max-w-prose text-base text-vidrio-texto">
          Busca tus entrevistas anteriores y abre el reporte de cada una. Tu evolución está en Inicio.
        </p>
      </div>

      <section aria-labelledby="titulo-tus-entrevistas">
        <h2 id="titulo-tus-entrevistas" className="mb-3 text-headline-md font-semibold text-vidrio-ink">
          Tus entrevistas
        </h2>
        <TablaDeEntrevistas filtros={filtros} niveles={niveles} />
      </section>
    </div>
  )
}
