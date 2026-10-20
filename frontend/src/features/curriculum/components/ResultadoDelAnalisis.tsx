import { useEffect, useId, useRef, useState } from 'react'

import Boton from '@/components/ui/Boton'
import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Icono from '@/components/ui/Icono'
import Pestanas from '@/components/ui/Pestanas'
import Tarjeta from '@/components/ui/Tarjeta'
import BrechaDeRequisitos from '@/features/curriculum/components/BrechaDeRequisitos'
import AvisoDeRevision from '@/features/curriculum/components/AvisoDeRevision'
import InventarioDeTerminos from '@/features/curriculum/components/InventarioDeTerminos'
import ListaDeHallazgos from '@/features/curriculum/components/ListaDeHallazgos'
import PreguntasProbables from '@/features/curriculum/components/PreguntasProbables'
import ResumenDelAnalisis from '@/features/curriculum/components/ResumenDelAnalisis'
import RevisionDeRedaccion from '@/features/curriculum/components/RevisionDeRedaccion'
import VinetasDeLogro from '@/features/curriculum/components/VinetasDeLogro'
import {
  CODIGO_SIN_CAPA_DE_TEXTO,
  correccionesMedidas,
  esIlegible,
  idDeHallazgo,
  sugerenciasDeIA,
} from '@/features/curriculum/hallazgos'
import type { EstadoDeLaRevision } from '@/features/curriculum/hooks/useRevisionDelCv'
import type { AnalisisATS, Curriculum } from '@/types/curriculum'

type Pestana = 'resumen' | 'mejorar' | 'requisitos' | 'entrevista'

interface Props {
  curriculum: Curriculum
  analisis: AnalisisATS
  /** Vuelve a la entrada, con el archivo y la convocatoria aún elegidos. */
  onAnalizarOtro: () => void
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

function fechaLegible(iso: string): string {
  return new Date(iso).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' })
}

/**
 * El resultado del análisis: una barra que dice qué se analizó y, debajo, el
 * contenido.
 *
 * Un CV legible se reparte en cuatro pestañas: Resumen (el espejo, lo primero
 * que mejorar y lo que ya funciona), Qué mejorar (todas las correcciones: las
 * del ATS, las viñetas y la redacción), Requisitos o Tecnologías, y Para la
 * entrevista.
 *
 * Un CV ilegible (sin capa de texto) no tiene pestañas: el resto del análisis
 * está vacío por construcción, y mostrarlo culparía a la causa equivocada —"tu
 * convocatoria no tiene requisitos", "tus habilidades están en barras"—. Se
 * muestra solo el espejo vacío, la causa y el arreglo.
 *
 * La página monta esto con una `key` por análisis, así que cada resultado
 * nuevo empieza en "Resumen".
 */
export default function ResultadoDelAnalisis({
  curriculum,
  analisis,
  onAnalizarOtro,
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
        <EtiquetaMono tono="suelto">
          {curriculum.con_convocatoria ? 'Con convocatoria' : 'Sin convocatoria'} · {fechaLegible(curriculum.fecha)}
        </EtiquetaMono>
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
    (revision?.requisitos ?? []).map(({ termino, sugerencia }) => [termino, sugerencia]),
  )
  // Rótulos cortos: en un celular las cuatro pestañas tienen que caber.
  const pestanas: { valor: Pestana; etiqueta: string }[] = [
    { valor: 'resumen', etiqueta: 'Resumen' },
    // Sin número: lo medido y lo sugerido se cuentan por separado, dentro.
    { valor: 'mejorar', etiqueta: 'Mejorar' },
    { valor: 'requisitos', etiqueta: curriculum.con_convocatoria ? 'Requisitos' : 'Tecnologías' },
    { valor: 'entrevista', etiqueta: 'Entrevista' },
  ]

  // El mismo aviso en cada pestaña que depende de la IA: quien entra directo a
  // "Entrevista" tiene que saber que las preguntas todavía vienen.
  const aviso = (
    <AvisoDeRevision revision={revision} estado={estadoDeRevision} onReintentar={onReintentarRevision} />
  )

  const verTodo = () => {
    setPestana('mejorar')
    window.requestAnimationFrame(() => document.getElementById(`${idPestanas}-mejorar`)?.focus())
  }

  // Desde el Resumen, a una corrección concreta: se abre "Mejorar" y el foco va
  // a ella (el `scroll-mt` de la fila la deja por debajo de las pestañas fijas).
  const irA = (codigo: string) => {
    setPestana('mejorar')
    window.requestAnimationFrame(() => {
      const fila = document.getElementById(idDeHallazgo(codigo))
      fila?.focus({ preventScroll: true })
      fila?.scrollIntoView({ block: 'start' })
    })
  }

  const medidas = correccionesMedidas(analisis)
  const sugeridas = sugerenciasDeIA(analisis)

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
          <ResumenDelAnalisis analisis={analisis} onVerTodo={verTodo} onIrA={irA} aviso={aviso} />
        )}

        {pestana === 'mejorar' && (
          <>
            {aviso}
            {/* Lo medido y lo sugerido, contados por separado y nunca sumados.
                El espejo no se repite aquí: vive en el Resumen. */}
            <p>
              <EtiquetaMono tono="suelto">
                {medidas} {medidas === 1 ? 'corrección medida' : 'correcciones medidas'}
                {sugeridas > 0 && ` · ${sugeridas} ${sugeridas === 1 ? 'sugerencia de IA' : 'sugerencias de IA'}`}
              </EtiquetaMono>
            </p>
            <ListaDeHallazgos
              titulo="Qué corregir para el ATS"
              hallazgos={analisis.debilidades}
              vacio="No se encontró ningún problema de parseo en tu CV."
            />
            {/* Rotulado aparte dentro del propio componente: a un ATS le da
                igual si las viñetas traen métricas. */}
            {analisis.vinetas && <VinetasDeLogro vinetas={analisis.vinetas} sugerencias={sugerenciasDeVinetas} />}
            <RevisionDeRedaccion revision={revision} />
          </>
        )}

        {/* Si se aportó convocatoria pero no tenía términos reconocibles,
            `brecha` viene nula: se dice, en vez de caer al inventario como si
            no se hubiera aportado nada. (Un CV ilegible no llega aquí.) */}
        {pestana === 'requisitos' &&
          (curriculum.con_convocatoria ? (
            analisis.brecha ? (
              <>
                {aviso}
                <BrechaDeRequisitos brecha={analisis.brecha} sugerencias={sugerenciasDeRequisitos} />
              </>
            ) : (
              // No es un error: se dice sin interrumpir, como los demás avisos.
              <p className="flex items-start gap-1.5 text-sm text-vidrio-muted">
                <Icono nombre="info" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>
                  No se reconoció ningún requisito técnico en la convocatoria que enviaste, así que no
                  hay nada que comparar. Revisa que incluya la lista de tecnologías.
                </span>
              </p>
            )
          ) : (
            <InventarioDeTerminos terminos={analisis.inventario} />
          ))}

        {pestana === 'entrevista' && (
          <>
            {aviso}
            <PreguntasProbables revision={revision} />
          </>
        )}
      </div>
    </div>
  )
}
