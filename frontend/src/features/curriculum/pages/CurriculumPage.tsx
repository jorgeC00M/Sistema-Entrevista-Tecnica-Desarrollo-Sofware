import { useState } from 'react'

import { ErrorAPI } from '@/api/client'
import {
  analizarCurriculum,
  campoDeCurriculum,
  obtenerCurriculum,
  obtenerHistorialDeCurriculums,
} from '@/api/curriculums'
import { repartirErrores } from '@/api/errores'
import Alerta from '@/components/ui/Alerta'
import EtiquetaMono from '@/components/ui/EtiquetaMono'
import AvisoDeRevision from '@/features/curriculum/components/AvisoDeRevision'
import BrechaDeRequisitos from '@/features/curriculum/components/BrechaDeRequisitos'
import CampoConvocatoria from '@/features/curriculum/components/CampoConvocatoria'
import EspejoDelATS from '@/features/curriculum/components/EspejoDelATS'
import HistorialDeAnalisis from '@/features/curriculum/components/HistorialDeAnalisis'
import InventarioDeTerminos from '@/features/curriculum/components/InventarioDeTerminos'
import ListaDeHallazgos, {
  ResumenDeSeveridad,
} from '@/features/curriculum/components/ListaDeHallazgos'
import PreguntasProbables from '@/features/curriculum/components/PreguntasProbables'
import RevisionDeRedaccion from '@/features/curriculum/components/RevisionDeRedaccion'
import SubirArchivo from '@/features/curriculum/components/SubirArchivo'
import VinetasDeLogro from '@/features/curriculum/components/VinetasDeLogro'
import { usePeticion } from '@/hooks/usePeticion'
import type { Curriculum, CurriculumEnLista } from '@/types/curriculum'

/**
 * Diagnóstico de un currículum contra los filtros de un ATS.
 *
 * Dos rutas, y la convocatoria es lo único que las separa. Sin ella se responde
 * "¿puede el ATS leer mi CV?" —parseabilidad, inventario de tecnologías legibles y
 * redacción de las viñetas—. Con ella se responde además "¿mi CV sirve para esta
 * convocatoria?", y solo una de las cuatro secciones del resultado cambia: el
 * inventario pasa a ser el mapa de evidencia.
 *
 * No se pide un puesto. Lo hubo y no afectaba al análisis: `ats.analizar()` no lo
 * recibía, así que elegir backend, frontend o full-stack daba el mismo resultado.
 * Era un paso obligatorio sin consecuencia.
 */
export default function CurriculumPage() {
  const [archivo, setArchivo] = useState<File | null>(null)
  const [convocatoria, setConvocatoria] = useState('')
  const [archivoConvocatoria, setArchivoConvocatoria] = useState<File | null>(null)
  const [resultado, setResultado] = useState<Curriculum | null>(null)
  const [analizando, setAnalizando] = useState(false)
  const [error, setError] = useState('')
  // Por campo del formulario (archivo, convocatoria, archivoConvocatoria),
  // igual que en el registro: el servidor valida tres cosas independientes y
  // cada mensaje debe ir junto al control que lo causó, no los tres
  // amontonados arriba.
  const [erroresPorCampo, setErroresPorCampo] = useState<Record<string, string>>({})
  // Con el hook propio del proyecto y no con un `useEffect` a mano: trae el
  // abortado al desmontar y una cache corta, y `recargar()` la invalida, que es
  // justo lo que hace falta tras analizar.
  //
  // Su `error` se ignora a proposito. El historial es una ayuda, no un requisito:
  // si el listado falla, `datos` queda nulo, la seccion no se renderiza y el
  // usuario puede analizar igual. Mostrar una alerta por algo que no le impide
  // nada solo lo distraeria de lo que vino a hacer.
  const {
    datos: historial,
    cargando: cargandoHistorial,
    recargar: refrescarHistorial,
  } = usePeticion<CurriculumEnLista[]>('curriculums', (signal) =>
    obtenerHistorialDeCurriculums(signal),
  )

  const analizar = async () => {
    if (!archivo) return
    setError('')
    setErroresPorCampo({})
    setAnalizando(true)
    try {
      setResultado(await analizarCurriculum({ archivo, convocatoria, archivoConvocatoria }))
      // Para que el analisis nuevo este en la lista al volver a entrar.
      refrescarHistorial()
    } catch (err) {
      const { general, porCampo } = repartirErrores(
        err,
        'No se pudo analizar el currículum.',
        campoDeCurriculum,
      )
      setError(general)
      setErroresPorCampo(porCampo)
    } finally {
      setAnalizando(false)
    }
  }

  // Si el usuario cambia cualquiera de los tres campos tras un error, ese
  // error deja de describir lo que hay ahora escrito: mostrarlo seguiría
  // sería afirmar algo que ya no es cierto.
  const limpiarErrorDeCampo = (campo: string) => {
    setErroresPorCampo((previos) => {
      if (!(campo in previos)) return previos
      const { [campo]: _descartado, ...resto } = previos
      return resto
    })
  }

  const abrir = async (id: number) => {
    setError('')
    try {
      // Va al mismo estado que un analisis nuevo: asi la zona de resultados no
      // necesita saber de donde vino lo que muestra, y no hay dos caminos de
      // renderizado que puedan divergir.
      setResultado(await obtenerCurriculum(id))
    } catch (err) {
      setError(err instanceof ErrorAPI ? err.message : 'No se pudo abrir el analisis.')
    }
  }

  const analisis = resultado?.analisis ?? null
  // Las sugerencias de IA se indexan por lo que el usuario ya ve —la viñeta, el
  // término— para colgarlas bajo su fila. Lo medido no depende de ellas.
  const revision = analisis?.revision_ia ?? null
  const sugerenciasDeVinetas = Object.fromEntries(
    (revision?.vinetas ?? []).map(({ original, sugerida }) => [original, sugerida]),
  )
  const sugerenciasDeRequisitos = Object.fromEntries(
    (revision?.requisitos ?? []).map(({ termino, sugerencia }) => [termino, sugerencia]),
  )

  return (
    <div className="mx-auto max-w-3xl">
      <EtiquetaMono tono="marca">Antes de la entrevista</EtiquetaMono>
      <h1 className="mt-1 mb-1 font-serif text-headline-xl font-semibold text-vidrio-ink">
        Revisa tu CV contra los filtros ATS
      </h1>
      <p className="text-base text-vidrio-texto">
        Un ATS no te rechaza con una nota: parsea tu CV a campos que el reclutador busca y filtra.
        Si algo no parsea, no apareces en su búsqueda. Aquí ves exactamente qué lee de tu
        currículum.
      </p>

      <Alerta>{error}</Alerta>

      <div className="mt-6 space-y-6">
        <CampoConvocatoria
          texto={convocatoria}
          archivo={archivoConvocatoria}
          deshabilitado={analizando}
          onTexto={(valor) => {
            setConvocatoria(valor)
            limpiarErrorDeCampo('convocatoria')
          }}
          onArchivo={(valor) => {
            setArchivoConvocatoria(valor)
            limpiarErrorDeCampo('archivoConvocatoria')
          }}
          error={erroresPorCampo.convocatoria ?? erroresPorCampo.archivoConvocatoria}
        />

        <SubirArchivo
          archivo={archivo}
          analizando={analizando}
          onElegir={(valor) => {
            setArchivo(valor)
            limpiarErrorDeCampo('archivo')
          }}
          onAnalizar={() => void analizar()}
          error={erroresPorCampo.archivo}
        />

        {/* Solo mientras no haya resultado en pantalla. La pagina ya es larga;
            una seccion al final quedaria fuera de vista justo cuando el usuario
            acaba de analizar. */}
        {!analisis && (
          <HistorialDeAnalisis
            analisis={historial ?? []}
            cargando={cargandoHistorial}
            onAbrir={(id) => void abrir(id)}
          />
        )}

        {analisis && (
          <>
            <section className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-vidrio-linea pt-6">
                <h2 className="font-serif text-headline-lg font-semibold text-vidrio-ink">
                  Qué ve el ATS
                </h2>
                <ResumenDeSeveridad debilidades={analisis.debilidades} />
              </div>

              <AvisoDeRevision revision={revision} />

              <EspejoDelATS analisis={analisis} />

              {/* Una sola de las secciones depende de la ruta. Si se aportó
                  convocatoria pero no tenía términos reconocibles, `brecha` viene
                  nula: se dice, en vez de caer al inventario como si no se hubiera
                  aportado nada. */}
              {resultado?.con_convocatoria ? (
                analisis.brecha ? (
                  <BrechaDeRequisitos brecha={analisis.brecha} sugerencias={sugerenciasDeRequisitos} />
                ) : (
                  <Alerta>
                    No se reconoció ningún requisito técnico en la convocatoria que enviaste, así
                    que no hay nada que comparar. Revisa que incluya la lista de tecnologías.
                  </Alerta>
                )
              ) : (
                <InventarioDeTerminos terminos={analisis.inventario} />
              )}

              <ListaDeHallazgos
                titulo="Qué corregir"
                hallazgos={analisis.debilidades}
                vacio="No se encontró ningún problema de parseo en tu CV."
              />

              <ListaDeHallazgos
                titulo="Qué conservar"
                hallazgos={analisis.fortalezas}
                favorable
                vacio="Corrige lo anterior y vuelve a analizarlo para ver qué ya funciona."
              />
            </section>

            {/* Rotulado aparte dentro del propio componente: a un ATS le da igual
                si las viñetas traen métricas. */}
            {analisis.vinetas && (
              <VinetasDeLogro vinetas={analisis.vinetas} sugerencias={sugerenciasDeVinetas} />
            )}

            <RevisionDeRedaccion revision={revision} />

            <PreguntasProbables revision={revision} />
          </>
        )}
      </div>
    </div>
  )
}
