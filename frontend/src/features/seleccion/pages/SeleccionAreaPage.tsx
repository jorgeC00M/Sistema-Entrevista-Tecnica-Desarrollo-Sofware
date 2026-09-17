import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ErrorAPI } from '@/api/client'
import { iniciarEntrevista } from '@/api/entrevistas'
import Alerta from '@/components/ui/Alerta'
import Boton from '@/components/ui/Boton'
import Spinner from '@/components/ui/Spinner'
import SelectorNivel from '@/features/seleccion/components/SelectorNivel'
import TarjetaArea from '@/features/seleccion/components/TarjetaArea'
import { useCatalogos } from '@/features/seleccion/hooks/useCatalogos'

export default function SeleccionAreaPage() {
  const navigate = useNavigate()
  const { catalogos, cargando: cargandoCatalogo, error: errorCatalogo } = useCatalogos()

  const [area, setArea] = useState('')
  const [nivel, setNivel] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const manejarInicio = async () => {
    if (!area || !nivel) return
    setError('')
    setCargando(true)
    try {
      const datos = await iniciarEntrevista({ area, nivel })
      navigate(`/entrevista/${datos.entrevista.id}`)
    } catch (err) {
      setError(err instanceof ErrorAPI ? err.message : 'No se pudo iniciar la entrevista.')
      setCargando(false)
    }
  }

  // Un fallo al cargar el catálogo se muestra como error, nunca como una lista
  // vacía: sin opciones no hay nada que elegir y el usuario merece saber por qué.
  if (errorCatalogo) return <Alerta tipo="error">{errorCatalogo}</Alerta>
  if (cargandoCatalogo || !catalogos) return <Spinner texto="Cargando opciones…" />

  const total = catalogos.preguntas_por_entrevista

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1 text-lg font-semibold text-slate-900">Nueva entrevista</h1>
      <p className="mb-6 text-sm text-slate-500">
        Elige un área técnica y un nivel de dificultad. La entrevista consta de {total}{' '}
        {total === 1 ? 'pregunta' : 'preguntas'}.
      </p>

      <Alerta tipo="error">{error}</Alerta>

      <div className="mt-4 space-y-6">
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-slate-700">Área técnica</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {catalogos.areas.map((a) => (
              <TarjetaArea key={a.codigo} activo={area === a.codigo} onClick={() => setArea(a.codigo)}>
                {a.nombre}
              </TarjetaArea>
            ))}
          </div>
        </fieldset>

        <SelectorNivel niveles={catalogos.niveles} seleccionado={nivel} onSeleccionar={setNivel} />

        <Boton
          className="w-full"
          disabled={!area || !nivel}
          cargando={cargando}
          onClick={manejarInicio}
        >
          Comenzar entrevista
        </Boton>
      </div>
    </div>
  )
}
