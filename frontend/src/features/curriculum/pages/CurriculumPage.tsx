import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

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
import { useRevisionDelCv } from '@/features/curriculum/hooks/useRevisionDelCv'
import { usePeticion } from '@/hooks/usePeticion'
import type { Curriculum, CurriculumEnLista, RevisionIA } from '@/types/curriculum'

/**
 * Diagnóstico de un currículum contra los filtros de un ATS.
 *
 * Dos rutas, y la convocatoria es lo único que las separa. Sin ella se responde
 * "¿puede el ATS leer mi CV?" —parseabilidad, inventario de tecnologías legibles y
 * redacción de las viñetas—. Con ella se responde además "¿mi CV sirve para esta
 * convocatoria?", y solo una de las secciones del resultado cambia: el
 * inventario pasa a ser el mapa de evidencia.
 *
 * No se pide un puesto. Lo hubo y no afectaba al análisis: `ats.analizar()` no lo
 * recibía, así que elegir backend, frontend o full-stack daba el mismo resultado.
 *
 * Qué se ve lo decide la URL: `/mi-cv` es la entrada con el historial y
 * `/mi-cv/:id` un análisis, así que recargar o compartir el enlace lo conserva.
 * El resultado se guarda en el estado de la página y, si la URL pide otro que
 * no está en memoria, se carga. Las dos rutas usan este mismo componente, de
 * modo que ir y volver no pierde el archivo ni la convocatoria elegidos.
 */
export default function CurriculumPage() {
  const navigate = useNavigate()
  const parametro = useParams().id
  const idEnLaUrl = parametro ? Number(parametro) : null

  const [archivo, setArchivo] = useState<File | null>(null)
  const [convocatoria, setConvocatoria] = useState('')
  const [archivoConvocatoria, setArchivoConvocatoria] = useState<File | null>(null)
  const [resultado, setResultado] = useState<Curriculum | null>(null)
  const [analizando, setAnalizando] = useState(false)
  // El error de analizar va junto al botón que lo causó, no arriba de la página.
  const [errorAlAnalizar, setErrorAlAnalizar] = useState('')
  // El id de un análisis que no se pudo cargar (ajeno, inexistente, sin red).
  const [noEncontrado, setNoEncontrado] = useState<number | null>(null)
  // Por campo del formulario (archivo, convocatoria, archivoConvocatoria),
  // igual que en el registro: cada mensaje va junto al control que lo causó.
  const [erroresPorCampo, setErroresPorCampo] = useState<Record<string, string>>({})
  const zonaDelCv = useRef<HTMLDivElement>(null)

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
      const nuevo = await analizarCurriculum({ archivo, convocatoria, archivoConvocatoria })
      setResultado(nuevo)
      setNoEncontrado(null)
      refrescarHistorial()
      navigate(`/mi-cv/${nuevo.id}`)
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

  const enfocarLaEntrada = () => {
    window.requestAnimationFrame(() => {
      const zona = zonaDelCv.current
      zona?.querySelector<HTMLElement>('button, input:not([type="file"])')?.focus()
      zona?.scrollIntoView({ block: 'nearest' })
    })
  }

  // "Analizar otro" conserva el archivo y la convocatoria: lo habitual es
  // corregir el CV y volver a subirlo contra la misma oferta.
  const analizarOtro = () => {
    navigate('/mi-cv')
    enfocarLaEntrada()
  }

  // Un CV ilegible no se arregla reanalizando el mismo archivo: se suelta.
  const subirOtro = () => {
    setArchivo(null)
    navigate('/mi-cv')
    enfocarLaEntrada()
  }

  const analisis = visible?.analisis ?? null

  return (
    <div>
      <h1 className="mb-1 font-serif text-headline-xl font-semibold text-vidrio-ink">
        Revisa tu CV contra los filtros ATS
      </h1>
      <p className="max-w-prose text-base text-vidrio-texto">
        Un ATS (el sistema con el que las empresas filtran postulaciones) no te rechaza con una
        nota: convierte tu CV en campos que el reclutador busca y filtra. Si algo no se lee, no
        apareces en su búsqueda. Aquí ves exactamente qué lee de tu currículum.
      </p>

      {cargandoAnalisis ? (
        <Spinner texto="Abriendo el análisis…" />
      ) : visible && analisis ? (
        <div className="mt-6">
          <ResultadoDelAnalisis
            key={`${visible.id}-${analisis.fecha}`}
            curriculum={visible}
            analisis={analisis}
            onAnalizarOtro={analizarOtro}
            onSubirOtro={subirOtro}
            estadoDeRevision={revision.estado}
            onReintentarRevision={revision.reintentar}
          />
        </div>
      ) : (
        <div className="mt-6 flex max-w-3xl flex-col gap-6">
          {idEnLaUrl !== null && noEncontrado === idEnLaUrl && (
            <Alerta>No encontramos ese análisis. Puedes abrir otro de tu historial o analizar tu CV.</Alerta>
          )}
          <EntradaDelAnalisis
            archivo={archivo}
            convocatoria={convocatoria}
            archivoConvocatoria={archivoConvocatoria}
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
            onArchivoConvocatoria={(valor) => {
              setArchivoConvocatoria(valor)
              limpiarErrorDeCampo('archivoConvocatoria')
            }}
            onAnalizar={() => void analizar()}
            refZonaDelCv={zonaDelCv}
          />
          <HistorialDeAnalisis
            analisis={historial ?? []}
            cargando={cargandoHistorial}
            onAbrir={(id) => navigate(`/mi-cv/${id}`)}
          />
        </div>
      )}
    </div>
  )
}
