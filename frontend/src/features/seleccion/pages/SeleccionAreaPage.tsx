import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ErrorAPI } from '@/api/client'
import { iniciarEntrevista } from '@/api/entrevistas'
import Alerta from '@/components/ui/Alerta'
import Boton from '@/components/ui/Boton'
import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Icono from '@/components/ui/Icono'
import type { NombreDeIcono } from '@/components/ui/Icono'
import Spinner from '@/components/ui/Spinner'
import SelectorNivel from '@/features/seleccion/components/SelectorNivel'
import TarjetaArea from '@/features/seleccion/components/TarjetaArea'
import { useCatalogos } from '@/features/seleccion/hooks/useCatalogos'

/**
 * `codigo` es texto libre de una tabla (ver `types/catalogos.ts`), no una
 * unión cerrada: un área nueva dada de alta en el admin no tiene por qué
 * tener entrada aquí, así que siempre cae al icono por defecto en vez de
 * romper.
 */
const ICONO_POR_AREA: Record<string, NombreDeIcono> = {
  programacion: 'area',
  bases_de_datos: 'datos',
  estructuras_de_datos: 'arbol',
  desarrollo_web: 'web',
}
const ICONO_POR_DEFECTO: NombreDeIcono = 'area'

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
  const areaElegida = catalogos.areas.find((a) => a.codigo === area)

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-1 flex items-center gap-2">
        <EtiquetaMono tono="marca">Fase 01 · Parámetros de evaluación</EtiquetaMono>
      </div>
      <h1 className="mb-1 text-headline-xl font-semibold text-tinta-950">
        Configura tu nueva sesión de práctica
      </h1>
      <p className="mb-6 text-base text-tinta-500">
        Elige un área técnica y un nivel de dificultad. La entrevista consta de {total}{' '}
        {total === 1 ? 'pregunta' : 'preguntas'}.
      </p>

      <Alerta tipo="error">{error}</Alerta>

      <div className="mt-4 space-y-6">
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-tinta-700">Área técnica</legend>
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

        <div className="flex items-start gap-3 rounded-superficie border border-tinta-100 bg-white p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-tinta-100 text-iris-600">
            <Icono nombre="reloj" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-headline-sm font-semibold text-tinta-950">Resumen de la sesión</p>
            <p className="text-sm text-tinta-500">
              {total} {total === 1 ? 'pregunta técnica' : 'preguntas técnicas'}
              {areaElegida && <> de {areaElegida.nombre.toLowerCase()}</>} · evaluación y
              retroalimentación inmediata de la IA tras cada respuesta.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 pt-1 sm:flex-row">
          <p className="flex items-center gap-1.5 text-sm text-tinta-500">
            <Icono nombre="brujula" className="h-4 w-4 text-tinta-500" />
            Podrás retomar la entrevista si la dejas a medias.
          </p>
          <Boton
            className="w-full sm:w-auto"
            disabled={!area || !nivel}
            cargando={cargando}
            onClick={manejarInicio}
          >
            Comenzar entrevista
          </Boton>
        </div>
      </div>
    </div>
  )
}
