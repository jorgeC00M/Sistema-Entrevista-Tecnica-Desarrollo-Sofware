import Tarjeta from '@/components/ui/Tarjeta'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ErrorAPI } from '@/api/client'
import { iniciarEntrevista } from '@/api/entrevistas'
import Alerta from '@/components/ui/Alerta'
import Boton from '@/components/ui/Boton'
import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Icono from '@/components/ui/Icono'
import Spinner from '@/components/ui/Spinner'
import SelectorNivel from '@/features/seleccion/components/SelectorNivel'
import TarjetaArea from '@/features/seleccion/components/TarjetaArea'
import { useCatalogos } from '@/hooks/useCatalogos'
import { ICONO_POR_AREA, ICONO_POR_DEFECTO } from '@/lib/iconosPorArea'

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
  if (errorCatalogo) return <Alerta>{errorCatalogo}</Alerta>
  if (cargandoCatalogo || !catalogos) return <Spinner texto="Cargando opciones…" />

  const total = catalogos.preguntas_por_entrevista
  const areaElegida = catalogos.areas.find((a) => a.codigo === area)

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-1 flex items-center gap-2">
        <EtiquetaMono tono="marca">Fase 01 · Parámetros de evaluación</EtiquetaMono>
      </div>
      <h1 className="mb-1 font-serif text-headline-xl font-semibold text-vidrio-ink">
        Configura tu nueva sesión de práctica
      </h1>
      <p className="mb-6 text-base text-vidrio-texto">
        Elige un área técnica y un nivel de dificultad. La entrevista consta de {total}{' '}
        {total === 1 ? 'pregunta' : 'preguntas'}.
      </p>

      <Alerta>{error}</Alerta>

      <div className="mt-4 space-y-6">
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-vidrio-ink">Área técnica</legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {catalogos.areas.map((a) => (
              <TarjetaArea
                key={a.codigo}
                nombre={a.nombre}
                descripcion={a.descripcion}
                icono={ICONO_POR_AREA[a.codigo] ?? ICONO_POR_DEFECTO}
                totalPreguntas={total}
                activo={area === a.codigo}
                onClick={() => setArea(a.codigo)}
              />
            ))}
          </div>
        </fieldset>

        <SelectorNivel niveles={catalogos.niveles} seleccionado={nivel} onSeleccionar={setNivel} />

        <Tarjeta className="flex items-start gap-3 p-4 shadow-[0_8px_24px_-12px_rgba(28,47,94,0.18)]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-vidrio-acento-suave text-vidrio-acento">
            <Icono nombre="reloj" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-headline-sm font-semibold text-vidrio-ink">Resumen de la sesión</p>
            <p className="text-sm text-vidrio-texto">
              {total} {total === 1 ? 'pregunta técnica' : 'preguntas técnicas'}
              {areaElegida && <> de {areaElegida.nombre.toLowerCase()}</>} · evaluación y
              retroalimentación inmediata de la IA tras cada respuesta.
            </p>
          </div>
        </Tarjeta>

        <div className="flex flex-col items-center justify-between gap-3 pt-1 sm:flex-row">
          <p className="flex items-center gap-1.5 text-sm text-vidrio-muted">
            <Icono nombre="brujula" className="h-4 w-4 text-vidrio-muted" />
            Podrás retomar la entrevista si la dejas a medias.
          </p>
          <Boton
            variante="vidrio"
            forma="pildora"
            className="w-full sm:w-auto"
            disabled={!area || !nivel}
            cargando={cargando}
            onClick={manejarInicio}
          >
            Comenzar Entrevista
          </Boton>
        </div>
      </div>
    </div>
  )
}
