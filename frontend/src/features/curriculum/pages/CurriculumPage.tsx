import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { matchPath, useLocation, useNavigate, useParams } from 'react-router-dom'

import { ErrorAPI } from '@/api/client'
import {
  analizarCurriculum,
  campoDeCurriculum,
  obtenerCurriculum,
  obtenerHistorialDeCurriculums,
} from '@/api/curriculums'
import { repartirErrores } from '@/api/errores'
import Alerta from '@/components/ui/Alerta'
import Spinner from '@/components/ui/Spinner'
import EntradaDelAnalisis from '@/features/curriculum/components/EntradaDelAnalisis'
import HistorialDeAnalisis from '@/features/curriculum/components/HistorialDeAnalisis'
import ResultadoDelAnalisis from '@/features/curriculum/components/ResultadoDelAnalisis'
import { rutaDelAnalisis, type TipoDeAnalisis } from '@/features/curriculum/hallazgos'
import { useRevisionDelCv } from '@/features/curriculum/hooks/useRevisionDelCv'
import { usePeticion } from '@/hooks/usePeticion'
import type { Curriculum, CurriculumEnLista, RevisionIA } from '@/types/curriculum'

/**
 * Diagnóstico de un currículum contra los filtros de un ATS.
 *
 * Dos destinos del menú, cada uno con su ruta. «Analizar CV» (el general)
 * responde "¿puede el ATS leer mi CV?" —veredicto, espejo y tecnologías
 * legibles—. «Comparar con oferta» (el dirigido) responde además "¿mi CV cubre
 * este aviso?". La convocatoria es lo único que los separa, y solo se envía en
 * el dirigido.
 *
 * No se pide un puesto. Lo hubo y no afectaba al análisis: `ats.analizar()` no lo
 * recibía, así que elegir backend, frontend o full-stack daba el mismo resultado.
 *
 * Qué se ve lo decide la URL, y también el tipo: `/mi-cv/analisis` y
 * `/mi-cv/oferta` son las entradas con su historial, y `…/:id` un análisis de
 * ese tipo, así que recargar o compartir el enlace lo conserva
 * (`rutaDelAnalisis` arma estas URL). El resultado se guarda en el estado de la
 * página y, si la URL pide otro que no está en memoria, se carga. Las cuatro
 * rutas usan este mismo componente, de modo que ir y volver no pierde el
 * archivo ni la convocatoria elegidos.
 */
export default function CurriculumPage() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const parametro = useParams().id
  const idEnLaUrl = parametro ? Number(parametro) : null
  // El tipo no es estado: lo dice el destino del menú por el que se entró.
  const tipo: TipoDeAnalisis = matchPath('/mi-cv/oferta/*', pathname) ? 'dirigido' : 'general'
  const [archivo, setArchivo] = useState<File | null>(null)
  const [convocatoria, setConvocatoria] = useState('')
  const [resultado, setResultado] = useState<Curriculum | null>(null)
  const [analizando, setAnalizando] = useState(false)
  // El error de analizar va junto al botón que lo causó, no arriba de la página.
  const [errorAlAnalizar, setErrorAlAnalizar] = useState('')
  // El id de un análisis que no se pudo cargar (ajeno, inexistente, sin red).
  const [noEncontrado, setNoEncontrado] = useState<number | null>(null)
  // Por campo del formulario (archivo, convocatoria), igual que en el
  // registro: cada mensaje va junto al control que lo causó.
  const [erroresPorCampo, setErroresPorCampo] = useState<Record<string, string>>({})
  const zonaDelCv = useRef<HTMLDivElement>(null)
  const zonaDeConvocatoria = useRef<HTMLDivElement>(null)

  // Lo que se muestra: solo si la URL lo pide y ya está cargado.
  const visible = idEnLaUrl !== null && resultado?.id === idEnLaUrl ? resultado : null
  const cargandoAnalisis = idEnLaUrl !== null && visible === null && noEncontrado !== idEnLaUrl

  // La URL pide un análisis que no está en memoria (recarga, enlace, historial):
  // se carga. El estado cambia en la respuesta, no dentro del efecto.
  useEffect(() => {
    if (idEnLaUrl === null || resultado?.id === idEnLaUrl || noEncontrado === idEnLaUrl) return
    const control = new AbortController()
    obtenerCurriculum(idEnLaUrl, control.signal)
      .then(setResultado)
      .catch(() => {
        if (!control.signal.aborted) setNoEncontrado(idEnLaUrl)
      })
    return () => control.abort()
  }, [idEnLaUrl, resultado?.id, noEncontrado])

  // Un id escrito en la ruta del otro tipo se lleva a la suya, sin dejar la
  // equivocada en el historial: así el menú y el título dicen lo que se ve.
  const conConvocatoriaVisible = visible?.con_convocatoria
  useEffect(() => {
    if (conConvocatoriaVisible === undefined || idEnLaUrl === null) return
    if (conConvocatoriaVisible !== (tipo === 'dirigido')) {
      navigate(rutaDelAnalisis(conConvocatoriaVisible, idEnLaUrl), { replace: true })
    }
  }, [conConvocatoriaVisible, idEnLaUrl, tipo, navigate])

  // Las sugerencias llegan después del diagnóstico: se fusionan en el resultado
  // solo si sigue siendo el mismo análisis (el usuario pudo abrir otro).
  const alLlegarLaRevision = useCallback((id: number, revision: RevisionIA) => {
    setResultado((previo) =>
      previo?.id === id && previo.analisis
        ? { ...previo, analisis: { ...previo.analisis, revision_ia: revision } }
        : previo,
    )
  }, [])
  const revision = useRevisionDelCv(visible, alLlegarLaRevision)

  // Su `error` se ignora a propósito: el historial es una ayuda, no un
  // requisito. Si falla, la sección no se pinta y se puede analizar igual.
  const {
    datos: historial,
    cargando: cargandoHistorial,
    recargar: refrescarHistorial,
  } = usePeticion<CurriculumEnLista[]>('curriculums', (signal) => obtenerHistorialDeCurriculums(signal))

  const analizar = async () => {
    if (!archivo) return
    setErrorAlAnalizar('')
    setErroresPorCampo({})
    setAnalizando(true)
    try {
      // En el general la convocatoria se conserva para volver al dirigido, pero no se envía.
      const nuevo = await analizarCurriculum(
        tipo === 'dirigido' ? { archivo, convocatoria } : { archivo },
      )
      setResultado(nuevo)
      setNoEncontrado(null)
      refrescarHistorial()
      navigate(rutaDelAnalisis(nuevo.con_convocatoria, nuevo.id))
    } catch (err) {
      if (!(err instanceof ErrorAPI)) {
        // Sin respuesta del servidor (tiempo agotado o red): el análisis pudo
        // haberse guardado igual. Se refresca la lista para que aparezca.
        setErrorAlAnalizar(
          'No recibimos la respuesta a tiempo. Puede que el análisis ya esté en tus análisis anteriores.',
        )
        refrescarHistorial()
      } else {
        const { general, porCampo } = repartirErrores(err, 'No se pudo analizar el currículum.', campoDeCurriculum)
        setErrorAlAnalizar(general)
        setErroresPorCampo(porCampo)
      }
    } finally {
      setAnalizando(false)
    }
  }

  // Si el usuario cambia un campo tras un error, ese error deja de describir lo
  // que hay escrito: mostrarlo sería afirmar algo que ya no es cierto.
  const limpiarErrorDeCampo = (campo: string) => {
    setErroresPorCampo((previos) => {
      if (!(campo in previos)) return previos
      const { [campo]: _descartado, ...resto } = previos
      return resto
    })
  }

  // Va a una entrada y lleva el foco al primer control de una de sus tarjetas.
  // Se lee del DOM al pintar: la entrada recién se monta al navegar.
  const volverA = (ruta: string, zona: RefObject<HTMLDivElement | null>) => {
    navigate(ruta)
    window.requestAnimationFrame(() => {
      zona.current?.querySelector<HTMLElement>('button, textarea, input:not([type="file"])')?.focus()
      zona.current?.scrollIntoView({ block: 'nearest' })
    })
  }

  // La entrada del tipo del resultado que se está viendo.
  const entradaDelTipo = rutaDelAnalisis(visible?.con_convocatoria ?? tipo === 'dirigido')

  // "Analizar otro" vuelve a la entrada de su tipo y conserva el archivo y la
  // convocatoria: lo habitual es corregir el CV y volver a subirlo contra la
  // misma oferta.
  const analizarOtro = () => volverA(entradaDelTipo, zonaDelCv)

  // Del análisis general a «Comparar con oferta»: el CV sigue elegido y solo
  // falta el aviso.
  const compararConConvocatoria = () => volverA(rutaDelAnalisis(true), zonaDeConvocatoria)

  // Un CV ilegible no se arregla reanalizando el mismo archivo: se suelta.
  const subirOtro = () => {
    setArchivo(null)
    volverA(entradaDelTipo, zonaDelCv)
  }

  const analisis = visible?.analisis ?? null

  return (
    <div>
      {/* Solo para lectores de pantalla: el encabezado fijo ya dice el nombre
          del destino y su subtítulo, y repetirlo a la vista empujaba las
          tarjetas hacia abajo. */}
      <h1 className="sr-only">{tipo === 'dirigido' ? 'Comparar con oferta' : 'Analizar CV'}</h1>

      {cargandoAnalisis ? (
        <Spinner texto="Abriendo el análisis…" />
      ) : visible && analisis ? (
        <ResultadoDelAnalisis
          key={`${visible.id}-${analisis.fecha}`}
          curriculum={visible}
          analisis={analisis}
          onAnalizarOtro={analizarOtro}
          onCompararConConvocatoria={compararConConvocatoria}
          onSubirOtro={subirOtro}
          estadoDeRevision={revision.estado}
          onReintentarRevision={revision.reintentar}
        />
      ) : (
        <div className="flex flex-col gap-6">
          {idEnLaUrl !== null && noEncontrado === idEnLaUrl && (
            <Alerta>No encontramos ese análisis. Puedes abrir otro de tu historial o analizar tu CV.</Alerta>
          )}
          <EntradaDelAnalisis
            tipo={tipo}
            archivo={archivo}
            convocatoria={convocatoria}
            analizando={analizando}
            errores={erroresPorCampo}
            errorGeneral={errorAlAnalizar}
            onArchivo={(valor) => {
              setArchivo(valor)
              limpiarErrorDeCampo('archivo')
            }}
            onConvocatoria={(valor) => {
              setConvocatoria(valor)
              limpiarErrorDeCampo('convocatoria')
            }}
            onAnalizar={() => void analizar()}
            refZonaDelCv={zonaDelCv}
            refZonaDeConvocatoria={zonaDeConvocatoria}
          />
          <HistorialDeAnalisis tipo={tipo} analisis={historial ?? []} cargando={cargandoHistorial} />
        </div>
      )}
    </div>
  )
}
