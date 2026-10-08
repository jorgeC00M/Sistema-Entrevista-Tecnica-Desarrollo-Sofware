import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { ErrorAPI } from '@/api/client'
import { iniciarEntrevista } from '@/api/entrevistas'
import Alerta from '@/components/ui/Alerta'
import ControlSegmentado from '@/components/ui/ControlSegmentado'
import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Spinner from '@/components/ui/Spinner'
import Tarjeta from '@/components/ui/Tarjeta'
import PanelDeSesion from '@/features/seleccion/components/PanelDeSesion'
import SelectorNivel from '@/features/seleccion/components/SelectorNivel'
import TarjetaPuesto from '@/features/seleccion/components/TarjetaPuesto'
import { useCatalogos } from '@/hooks/useCatalogos'
import { ICONO_POR_DEFECTO, ICONO_POR_PUESTO } from '@/lib/iconosPorArea'

/** Valor del control de tecnología que significa "no fijar stack". */
const SIN_PREFERENCIA = ''

/**
 * Se elige puesto, nivel y —opcionalmente— tecnología, no un área.
 *
 * Es el encuadre de una postulación real: nadie aplica a un puesto de "Bases de
 * Datos". El puesto decide qué temas recorren las preguntas, y `PanelDeSesion`
 * los enumera para el puesto elegido, de modo que eso queda a la vista antes de
 * empezar.
 *
 * Acepta `?puesto=<código>` para llegar con el puesto ya elegido: es lo que usa
 * el módulo de CV para enlazar a practicar el puesto que mejor encaja. Un código
 * que no está en el catálogo se ignora en silencio: no hay puesto elegido, y no
 * se puede empezar hasta elegir uno.
 *
 * El reparto en dos columnas no es decorativo: deja las tres tarjetas de puesto
 * en una sola fila —comparables de un vistazo— y mantiene la acción de comenzar
 * siempre alcanzable dentro del panel, en vez de al final del scroll.
 */
export default function SeleccionPuestoPage() {
  const navigate = useNavigate()
  const [parametros] = useSearchParams()
  const { catalogos, cargando: cargandoCatalogo, error: errorCatalogo } = useCatalogos()

  // Solo el valor inicial: la URL no se sincroniza con lo que el usuario elija.
  const [puesto, setPuesto] = useState(() => parametros.get('puesto') ?? '')
  const [nivel, setNivel] = useState('')
  const [tecnologia, setTecnologia] = useState(SIN_PREFERENCIA)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const manejarInicio = async () => {
    // Contra el catálogo y no contra el texto: un código inválido llegado por la
    // URL no debe viajar al backend.
    const puestoValido = catalogos?.puestos.some((p) => p.codigo === puesto) ?? false
    if (!puestoValido || !nivel) return
    setError('')
    setCargando(true)
    try {
      const datos = await iniciarEntrevista({
        puesto,
        nivel,
        // Sin preferencia se traduce a no enviar el campo, no a enviar vacío.
        ...(tecnologia ? { tecnologia } : {}),
      })
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

  const puestoElegido = catalogos.puestos.find((p) => p.codigo === puesto)
  const nivelElegido = catalogos.niveles.find((n) => n.codigo === nivel)
  const tecnologiaElegida = catalogos.tecnologias.find((t) => t.codigo === tecnologia)

  // El backend publica los códigos de las áreas que cubre cada puesto; los
  // nombres salen del catálogo de áreas de la misma respuesta, para no tener el
  // mismo texto duplicado en dos sitios del payload.
  const nombrePorArea = new Map(catalogos.areas.map((a) => [a.codigo, a.nombre]))
  const areasDelPuesto = (puestoElegido?.areas ?? []).map(
    (codigo) => nombrePorArea.get(codigo) ?? codigo,
  )

  return (
    // El relleno inferior compensa la barra fija de la acción en pantallas
    // estrechas: sin él taparía el último control al recorrerlo con el teclado.
    <div className="mx-auto max-w-5xl pb-28 lg:pb-0">
      <EtiquetaMono tono="marca">Fase 01 · Parámetros de evaluación</EtiquetaMono>
      <h1 className="mt-1 mb-1 font-serif text-headline-xl font-semibold text-vidrio-ink">
        Configura tu nueva sesión de práctica
      </h1>
      <p className="text-base text-vidrio-texto">
        Elige el puesto al que quieres postular y el nivel de exigencia.
      </p>

      <Alerta>{error}</Alerta>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="space-y-6">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-vidrio-ink">Puesto</legend>
            {/* Las tres en una fila: comparar opciones repartidas en dos filas
                obliga a recordar las que quedaron arriba. */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {catalogos.puestos.map((p) => (
                <TarjetaPuesto
                  key={p.codigo}
                  nombre={p.nombre}
                  descripcion={p.descripcion}
                  icono={ICONO_POR_PUESTO[p.codigo] ?? ICONO_POR_DEFECTO}
                  activo={puesto === p.codigo}
                  onClick={() => setPuesto(p.codigo)}
                />
              ))}
            </div>
          </fieldset>

          <SelectorNivel
            niveles={catalogos.niveles}
            seleccionado={nivel}
            onSeleccionar={setNivel}
          />

          {/* Opcional a propósito: un egresado puede no tener stack de
              preferencia, y en ese caso las preguntas no deben atarse a uno.
              A todo el ancho de la columna y no en media fila junto al nivel:
              son cuatro opciones de etiqueta larga y el control segmentado las
              reparte en una sola fila. */}
          <Tarjeta className="flex flex-col gap-3 p-4">
            <div className="flex items-center gap-2">
              <span className="text-headline-sm font-semibold text-vidrio-ink">
                Stack de preferencia
              </span>
              <EtiquetaMono>Opcional</EtiquetaMono>
            </div>
            <ControlSegmentado
              etiqueta="Tecnología"
              opciones={[
                { valor: SIN_PREFERENCIA, etiqueta: 'Sin preferencia' },
                ...catalogos.tecnologias.map((t) => ({ valor: t.codigo, etiqueta: t.nombre })),
              ]}
              seleccionado={tecnologia}
              onSeleccionar={setTecnologia}
            />
          </Tarjeta>
        </div>

        <PanelDeSesion
          puestoElegido={puestoElegido}
          nivelElegido={nivelElegido}
          tecnologiaElegida={tecnologiaElegida}
          areas={areasDelPuesto}
          totalPreguntas={catalogos.preguntas_por_entrevista}
          cargando={cargando}
          onComenzar={manejarInicio}
        />
      </div>
    </div>
  )
}
