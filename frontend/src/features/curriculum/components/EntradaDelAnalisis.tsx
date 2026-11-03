import { useId, type Ref } from 'react'

import Boton from '@/components/ui/Boton'
import Pestanas from '@/components/ui/Pestanas'
import Tarjeta from '@/components/ui/Tarjeta'
import CampoConvocatoria from '@/features/curriculum/components/CampoConvocatoria'
import ZonaDeArchivo from '@/features/curriculum/components/ZonaDeArchivo'
import {
  CAMPOS_QUE_BUSCA_EL_ATS,
  puedeAnalizar,
  tipoDeRevision,
  type TipoDeAnalisis,
} from '@/features/curriculum/hallazgos'

const TIPOS: { valor: TipoDeAnalisis; etiqueta: string }[] = [
  { valor: 'general', etiqueta: tipoDeRevision(false) },
  { valor: 'dirigido', etiqueta: tipoDeRevision(true) },
]

interface Props {
  tipo: TipoDeAnalisis
  archivo: File | null
  convocatoria: string
  archivoConvocatoria: File | null
  analizando: boolean
  /** Por campo del formulario: `archivo`, `convocatoria`, `archivoConvocatoria`. */
  errores: Record<string, string>
  /** Lo que no es de un campo (red, tiempo agotado): va junto al botón que lo causó. */
  errorGeneral: string
  onTipo: (tipo: TipoDeAnalisis) => void
  onArchivo: (archivo: File | null) => void
  onConvocatoria: (texto: string) => void
  onArchivoConvocatoria: (archivo: File | null) => void
  onAnalizar: () => void
  /** Tarjeta del CV: la página lleva ahí el foco al volver con "Analizar otro". */
  refZonaDelCv?: Ref<HTMLDivElement>
  /** Tarjeta de la convocatoria: ahí lleva el foco "Compara con una convocatoria". */
  refZonaDeConvocatoria?: Ref<HTMLDivElement>
}

/**
 * Lo que se pide para analizar: primero el tipo de análisis, luego el CV y, en
 * el dirigido, la convocatoria.
 *
 * El tipo son dos pestañas (`Pestanas`, las mismas de «Nueva entrevista», que
 * resuelve la misma decisión: con o sin convocatoria). En el panel, desde 1024 px,
 * una fila `2fr 1fr`: el CV, que es la acción, ocupa siempre unos 2/3, y el tercio
 * derecho es el contexto —la convocatoria del dirigido o «¿Qué revisamos?»—, con
 * la misma altura. Así el CV no se mueve al cambiar de pestaña. Por debajo se apila en el mismo
 * orden: el del DOM es el visual. El historial queda fuera, en la página.
 *
 * En el general, el lado derecho lo ocupa «¿Qué revisamos?»: lo que el análisis
 * mide, dicho antes de subir el CV.
 *
 * El general viene elegido y «Analizar CV» espera hasta que el análisis tenga
 * lo que necesita, sin un aviso de qué falta: las zonas vacías ya lo muestran. En el
 * general la convocatoria no se muestra ni se envía, pero la página la conserva
 * por si el usuario vuelve al dirigido.
 *
 * Se acepta PDF y DOCX. Admitir PDF es deliberado y no una concesión: los fallos
 * de parseo viven ahí, así que rechazarlo dejaría al módulo sin poder
 * diagnosticar el caso más común, que es justo lo que vale.
 */
export default function EntradaDelAnalisis({
  tipo,
  archivo,
  convocatoria,
  archivoConvocatoria,
  analizando,
  errores,
  errorGeneral,
  onTipo,
  onArchivo,
  onConvocatoria,
  onArchivoConvocatoria,
  onAnalizar,
  refZonaDelCv,
  refZonaDeConvocatoria,
}: Props) {
  const listo = puedeAnalizar(tipo, archivo, convocatoria, archivoConvocatoria)
  const idPestanas = useId()
  const idPanel = useId()

  return (
    <div className="flex flex-col gap-5">
      <Pestanas
        etiqueta="Tipo de análisis"
        pestanas={TIPOS}
        seleccionada={tipo}
        onSeleccionar={(valor) => onTipo(valor as TipoDeAnalisis)}
        idBase={idPestanas}
        idPanel={idPanel}
        repartir
      />

      <div
        role="tabpanel"
        id={idPanel}
        aria-labelledby={`${idPestanas}-${tipo}`}
        tabIndex={0}
        className="foco-anillo flex flex-col gap-5 rounded-control"
      >
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Tarjeta>
            <section ref={refZonaDelCv} aria-labelledby="titulo-tu-cv" className="flex min-w-0 flex-col p-5">
              <h2 id="titulo-tu-cv" className="font-serif text-headline-md font-semibold text-vidrio-ink">
                Tu CV
              </h2>
              <p className="mt-1 text-sm text-vidrio-texto">PDF o DOCX: lo leemos como lo leería un ATS.</p>
              <div className="mt-3">
                <ZonaDeArchivo
                  que="tu CV"
                  archivo={archivo}
                  deshabilitado={analizando}
                  onElegir={onArchivo}
                  errorDelServidor={errores.archivo}
                />
              </div>
            </section>
          </Tarjeta>

          {/* Todo lo que dice se mide: la ficha (`CAMPOS_DE_LA_FICHA`), las
              reglas de formato de `ats.py` y las viñetas de `vinetas.py`. */}
          {tipo === 'general' && (
            <Tarjeta>
              <section aria-labelledby="titulo-que-revisamos" className="flex min-w-0 flex-col p-5">
                <h2 id="titulo-que-revisamos" className="font-serif text-headline-md font-semibold text-vidrio-ink">
                  ¿Qué revisamos?
                </h2>
                {/* Tres niveles con los tokens de siempre: título, qué se mira
                    (dt) y su detalle (dd). */}
                <dl className="mt-3 flex flex-col gap-3">
                  <div>
                    <dt className="text-sm font-semibold text-vidrio-ink">Tus datos</dt>
                    <dd className="mt-0.5 text-meta text-vidrio-muted">
                      Si el ATS extrae los {CAMPOS_QUE_BUSCA_EL_ATS.length}:{' '}
                      {CAMPOS_QUE_BUSCA_EL_ATS.join(', ').toLowerCase()}.
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-semibold text-vidrio-ink">El formato</dt>
                    <dd className="mt-0.5 text-meta text-vidrio-muted">
                      Si le impide leer: columnas, tablas, imágenes, encabezados y pies.
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-semibold text-vidrio-ink">Tus viñetas</dt>
                    <dd className="mt-0.5 text-meta text-vidrio-muted">Si muestran logros o solo tareas.</dd>
                  </div>
                </dl>
              </section>
            </Tarjeta>
          )}

          {tipo === 'dirigido' && (
            <Tarjeta>
              <section
                ref={refZonaDeConvocatoria}
                aria-labelledby="titulo-convocatoria"
                className="flex min-w-0 flex-col p-5"
              >
                <h2 id="titulo-convocatoria" className="font-serif text-headline-md font-semibold text-vidrio-ink">
                  Convocatoria
                </h2>
                {/* Se dice antes de pegarla: el usuario ve qué gana con ella. */}
                <p className="mt-1 mb-3 text-sm text-vidrio-texto">
                  Pégala o súbela para ver qué palabras clave del aviso tiene tu CV y si aparecerías
                  cuando el reclutador las busque.
                </p>
                <CampoConvocatoria
                  texto={convocatoria}
                  archivo={archivoConvocatoria}
                  deshabilitado={analizando}
                  onTexto={onConvocatoria}
                  onArchivo={onArchivoConvocatoria}
                  error={errores.convocatoria ?? errores.archivoConvocatoria}
                />
              </section>
            </Tarjeta>
          )}
        </div>

        {/* El error y el progreso, junto al botón: en un celular, un aviso arriba
            de la página queda fuera de la vista justo después de pulsar. */}
        {errorGeneral && (
          <p role="alert" className="rounded-control bg-error-fondo px-3 py-2 text-sm text-error-texto">
            {errorGeneral}
          </p>
        )}

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
          <p aria-live="polite" className="text-meta text-vidrio-muted sm:mr-auto">
            {analizando ? 'Leyendo tu CV y aplicando las reglas del ATS…' : ''}
          </p>
          <Boton className="w-full sm:w-auto" disabled={!listo} cargando={analizando} onClick={onAnalizar}>
            Analizar CV
          </Boton>
        </div>
      </div>
    </div>
  )
}
