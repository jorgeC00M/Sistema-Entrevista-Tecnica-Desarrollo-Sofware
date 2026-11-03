import { useEffect, useId, useRef, useState } from 'react'

import Boton from '@/components/ui/Boton'
import EtiquetaConvocatoria from '@/components/ui/EtiquetaConvocatoria'
import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Icono from '@/components/ui/Icono'
import Pestanas from '@/components/ui/Pestanas'
import Tarjeta from '@/components/ui/Tarjeta'
import ArreglosDeFormato from '@/features/curriculum/components/ArreglosDeFormato'
import AvisoDeRevision from '@/features/curriculum/components/AvisoDeRevision'
import ColumnasDeMatch from '@/features/curriculum/components/ColumnasDeMatch'
import LecturaGeneral from '@/features/curriculum/components/LecturaGeneral'
import PalabrasClaveNoDetectadas from '@/features/curriculum/components/PalabrasClaveNoDetectadas'
import RequisitosDelPuesto from '@/features/curriculum/components/RequisitosDelPuesto'
import ResumenDelAnalisis from '@/features/curriculum/components/ResumenDelAnalisis'
import RevisionDeRedaccion from '@/features/curriculum/components/RevisionDeRedaccion'
import SinRequisitosReconocidos from '@/features/curriculum/components/SinRequisitosReconocidos'
import VinetasDeLogro from '@/features/curriculum/components/VinetasDeLogro'
import {
  CODIGO_SIN_CAPA_DE_TEXTO,
  esIlegible,
  idDeHallazgo,
  tipoDeRevision,
} from '@/features/curriculum/hallazgos'
import type { EstadoDeLaRevision } from '@/features/curriculum/hooks/useRevisionDelCv'
import { fechaLegible } from '@/lib/fechas'
import type { AnalisisATS, Curriculum } from '@/types/curriculum'

type Pestana = 'resumen' | 'match' | 'mejorar'

interface Props {
  curriculum: Curriculum
  analisis: AnalisisATS
  /** Vuelve a la entrada, con el archivo y la convocatoria aún elegidos. */
  onAnalizarOtro: () => void
  /** Sin convocatoria: vuelve a la entrada con el foco en la convocatoria. */
  onCompararConConvocatoria: () => void
  /** Para un CV ilegible: vuelve a la entrada soltando ese archivo. */
  onSubirOtro: () => void
  /** Las sugerencias de IA llegan después del diagnóstico: en qué punto están. */
  estadoDeRevision: EstadoDeLaRevision
  onReintentarRevision: () => void
}

/** Lo que el lector de pantalla oye cuando cambia el estado de las sugerencias. */
const ANUNCIO: Record<EstadoDeLaRevision, string> = {
  pidiendo: 'Pidiendo sugerencias a la IA.',
  lista: '',
  fallo: 'No se pudieron obtener las sugerencias de IA.',
}

/**
 * El resultado del análisis: una barra que dice qué se analizó y, debajo, el
 * contenido.
 *
 * Las pestañas de un CV legible dependen del tipo. El general tiene «Resumen y
 * Formato» (el estado, el espejo, las tecnologías y la práctica) y «Plan de
 * Mejora» (los arreglos del ATS, las viñetas y la redacción). El dirigido dice
 * en la barra frente a qué oferta se compara, su «Resumen» pone en el banner los
 * requisitos no detectados al lado del formato, agrega «Match con la Oferta»
 * (las dos columnas, la lectura general de la IA y los requisitos del puesto) y
 * su «Plan de Mejora» suma las palabras clave no detectadas con sus dos caminos.
 * Los valores internos (`resumen`, `mejorar`) siguen nombrando las mismas
 * vistas; solo cambian las etiquetas.
 *
 * Un CV ilegible (sin capa de texto) no tiene pestañas: el resto del análisis
 * está vacío por construcción, y mostrarlo culparía a la causa equivocada —"tu
 * convocatoria no tiene requisitos", "tus habilidades están en barras"—. Se
 * muestra solo el espejo vacío, la causa y el arreglo.
 *
 * La página monta esto con una `key` por análisis, así que cada resultado
 * nuevo empieza en la primera pestaña.
 */
export default function ResultadoDelAnalisis({
  curriculum,
  analisis,
  onAnalizarOtro,
  onCompararConConvocatoria,
  onSubirOtro,
  estadoDeRevision,
  onReintentarRevision,
}: Props) {
  const [pestana, setPestana] = useState<Pestana>('resumen')
  const titulo = useRef<HTMLHeadingElement>(null)
  const idPestanas = useId()
  const idPanel = useId()

  // Al llegar el resultado, el foco va a su encabezado: el usuario sabe que
  // terminó y el lector de pantalla anuncia qué se analizó.
  useEffect(() => {
    titulo.current?.focus()
  }, [])

  const barra = (
    <div className="flex flex-col gap-3 border-t border-vidrio-linea pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h2
          ref={titulo}
          tabIndex={-1}
          className="truncate font-serif text-headline-md font-semibold text-vidrio-ink outline-none"
          title={curriculum.nombre_archivo}
        >
          {curriculum.nombre_archivo}
          <span className="sr-only">. El ATS lee {analisis.parseabilidad} campos.</span>
        </h2>
        {/* Frente a qué se compara: el cargo que el aviso nombra, o nada inventado.
            La empresa no se mide, así que no se muestra. */}
        {curriculum.con_convocatoria && (
          <p className="mt-0.5 truncate text-sm text-vidrio-texto">
            frente a {analisis.brecha?.cargo?.termino ?? 'la convocatoria'}
          </p>
        )}
        {/* El tipo con nombre, el mismo que en el historial: qué pregunta responde
            este análisis. */}
        <p className="mt-1 flex flex-wrap items-center gap-2">
          {curriculum.con_convocatoria ? (
            <EtiquetaConvocatoria>{tipoDeRevision(true)}</EtiquetaConvocatoria>
          ) : (
            <EtiquetaMono>{tipoDeRevision(false)}</EtiquetaMono>
          )}
          <EtiquetaMono tono="suelto">{fechaLegible(curriculum.fecha)}</EtiquetaMono>
        </p>
      </div>
      <Boton variante="secundario" tamano="sm" onClick={onAnalizarOtro} className="self-start sm:self-auto">
        Analizar otro
      </Boton>
    </div>
  )

  if (esIlegible(analisis)) {
    const hallazgo = analisis.debilidades.find((h) => h.codigo === CODIGO_SIN_CAPA_DE_TEXTO)
    return (
      <div className="flex flex-col gap-5">
        {barra}
        <Tarjeta className="flex flex-col gap-3 p-5">
          <h3 className="flex items-center gap-2 font-serif text-headline-md font-semibold text-vidrio-ink">
            <Icono nombre="documento" className="h-5 w-5 shrink-0 text-error-texto" />
            {/* Un DOCX no se escanea: llega sin texto porque vive en cuadros de
                texto o en una imagen. El detalle, que redacta el backend según
                el formato, dice cuál. */}
            {curriculum.formato === 'pdf' ? 'Tu PDF es una imagen' : 'Tu documento no tiene texto que el ATS pueda leer'}
          </h3>
          <p className="max-w-prose text-sm leading-relaxed text-vidrio-texto">{hallazgo?.detalle}</p>
          <EtiquetaMono tono="suelto">El ATS extrae {analisis.parseabilidad} campos</EtiquetaMono>
          {/* Reanalizar el mismo archivo daría lo mismo: se suelta y se pide otro. */}
          <Boton onClick={onSubirOtro} className="self-start">
            Subir otro archivo
          </Boton>
        </Tarjeta>
      </div>
    )
  }

  const revision = analisis.revision_ia
  const sugerenciasDeVinetas = Object.fromEntries(
    (revision?.vinetas ?? []).map(({ original, sugerida }) => [original, sugerida]),
  )
  const sugerenciasDeRequisitos = Object.fromEntries(
    (revision?.requisitos ?? []).map((sugerencia) => [sugerencia.termino, sugerencia]),
  )
  const pestanas: { valor: Pestana; etiqueta: string }[] = curriculum.con_convocatoria
    ? [
        { valor: 'resumen', etiqueta: 'Resumen' },
        { valor: 'match', etiqueta: 'Match con la Oferta' },
        { valor: 'mejorar', etiqueta: 'Plan de Mejora' },
      ]
    : [
        { valor: 'resumen', etiqueta: 'Resumen y Formato' },
        { valor: 'mejorar', etiqueta: 'Plan de Mejora' },
      ]

  // El mismo aviso en todas las pestañas: todas muestran sugerencias de IA, y
  // quien pasa a otra tiene que saber que todavía vienen.
  const aviso = (
    <AvisoDeRevision revision={revision} estado={estadoDeRevision} onReintentar={onReintentarRevision} />
  )

  // Abre una pestaña y le da el foco, para que el lector de pantalla anuncie el cambio.
  const abrir = (destino: Pestana) => {
    setPestana(destino)
    window.requestAnimationFrame(() => document.getElementById(`${idPestanas}-${destino}`)?.focus())
  }

  // Desde el Resumen, a una corrección concreta: se abre «Plan de Mejora» y el foco va
  // a ella (el `scroll-mt` de la fila la deja por debajo de las pestañas fijas).
  const irA = (id: string) => {
    setPestana('mejorar')
    window.requestAnimationFrame(() => {
      const fila = document.getElementById(id)
      fila?.focus({ preventScroll: true })
      fila?.scrollIntoView({ block: 'start' })
    })
  }

  return (
    <div className="flex flex-col gap-5">
      {barra}

      {/* Una sola región anuncia el estado de las sugerencias; los avisos
          visibles de cada pestaña no repiten el anuncio al cambiar de pestaña. */}
      <p className="sr-only" aria-live="polite">
        {ANUNCIO[estadoDeRevision]}
      </p>

      {/* Fijas bajo la cabecera: en un panel largo, cambiar de parte no obliga
          a volver arriba. */}
      <div className="sticky top-16 z-10 -mx-1 bg-vidrio-bg px-1">
        <Pestanas
          etiqueta="Partes del análisis"
          pestanas={pestanas}
          seleccionada={pestana}
          onSeleccionar={(valor) => setPestana(valor as Pestana)}
          idBase={idPestanas}
          idPanel={idPanel}
          repartir
        />
      </div>

      <div
        role="tabpanel"
        id={idPanel}
        aria-labelledby={`${idPestanas}-${pestana}`}
        tabIndex={0}
        className="foco-anillo flex flex-col gap-6 rounded-control"
      >
        {pestana === 'resumen' && (
          <ResumenDelAnalisis
            curriculum={curriculum}
            analisis={analisis}
            onVerTodo={() => abrir('mejorar')}
            onIrA={(codigo) => irA(idDeHallazgo(codigo))}
            onCompararConConvocatoria={onCompararConConvocatoria}
            aviso={aviso}
          />
        )}

        {/* Lo que coincide y lo que no, su resumen y lo que el aviso exige aparte. */}
        {pestana === 'match' && (
          <>
            {aviso}
            {analisis.brecha ? (
              <>
                <ColumnasDeMatch brecha={analisis.brecha} />
                <LecturaGeneral revision={revision} estado={estadoDeRevision} />
                <RequisitosDelPuesto brecha={analisis.brecha} sugerencias={sugerenciasDeRequisitos} />
              </>
            ) : (
              <SinRequisitosReconocidos />
            )}
          </>
        )}

        {pestana === 'mejorar' && (
          <>
            {aviso}
            {/* Primero el formato: si el ATS no lee un dato, tampoco lo compara. */}
            <ArreglosDeFormato hallazgos={analisis.debilidades} />
            {/* Después, lo que el aviso pide y el CV no escribe, con dos caminos. */}
            {curriculum.con_convocatoria && analisis.brecha && (
              <PalabrasClaveNoDetectadas brecha={analisis.brecha} sugerencias={sugerenciasDeRequisitos} />
            )}
            {/* Rotulado aparte dentro del propio componente: a un ATS le da
                igual si las viñetas traen métricas. */}
            {analisis.vinetas && <VinetasDeLogro vinetas={analisis.vinetas} sugerencias={sugerenciasDeVinetas} />}
            <RevisionDeRedaccion revision={revision} />
          </>
        )}
      </div>
    </div>
  )
}
