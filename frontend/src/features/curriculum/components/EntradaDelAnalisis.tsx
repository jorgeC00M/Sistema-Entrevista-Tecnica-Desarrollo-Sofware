import type { Ref } from 'react'

import Alerta from '@/components/ui/Alerta'
import Boton from '@/components/ui/Boton'
import Tarjeta from '@/components/ui/Tarjeta'
import CampoConvocatoria from '@/features/curriculum/components/CampoConvocatoria'
import EncabezadoDePaso from '@/features/curriculum/components/EncabezadoDePaso'
import ZonaDeArchivo from '@/features/curriculum/components/ZonaDeArchivo'
import { CAMPOS_QUE_BUSCA_EL_ATS, puedeAnalizar, type TipoDeAnalisis } from '@/features/curriculum/hallazgos'

interface Props {
  /** Lo decide la ruta (el destino del menú): aquí solo elige la tarjeta derecha. */
  tipo: TipoDeAnalisis
  archivo: File | null
  convocatoria: string
  analizando: boolean
  /** Por campo del formulario: `archivo`, `convocatoria`. */
  errores: Record<string, string>
  /** Lo que no es de un campo (red, tiempo agotado): va junto al botón que lo causó. */
  errorGeneral: string
  onArchivo: (archivo: File | null) => void
  onConvocatoria: (texto: string) => void
  onAnalizar: () => void
  /** Tarjeta del CV: la página lleva ahí el foco al volver con "Analizar otro". */
  refZonaDelCv?: Ref<HTMLDivElement>
  /** Tarjeta de la convocatoria: ahí lleva el foco "Compara con una convocatoria". */
  refZonaDeConvocatoria?: Ref<HTMLDivElement>
}

/**
 * Lo que se pide para analizar: el CV y, en «Comparar con oferta», la
 * convocatoria.
 *
 * No hay que elegir el tipo aquí: cada destino del menú tiene su propia entrada
 * (`separar-analisis-de-cv`). Desde 1024 px:
 * - **dirigido** (`comparar-con-oferta-en-dos-pasos`): dos columnas iguales,
 *   «Paso 1 · Sube tu CV» y «Paso 2 · Pega la convocatoria», cada una con
 *   «Listo» al completarse: las dos pesan lo mismo, sin convocatoria no hay
 *   comparación;
 * - **general**: una fila `2fr 1fr`, el CV —la única acción— en unos 2/3 y
 *   «¿Qué revisamos?», que solo informa, en el tercio derecho.
 * En los dos el CV va a la izquierda y arriba, y las tarjetas tienen la misma
 * altura. Por debajo se apila en el mismo orden: el del DOM es el visual. El
 * historial queda fuera, en la página.
 *
 * En el general, el lado derecho lo ocupa «¿Qué revisamos?»: lo que el análisis
 * mide, dicho antes de subir el CV.
 *
 * «Analizar CV» espera hasta que el análisis tenga lo que necesita, sin un aviso
 * de qué falta: las zonas vacías ya lo muestran. En el general la convocatoria no
 * se muestra ni se envía, pero la página la conserva por si el usuario pasa a
 * «Comparar con oferta».
 *
 * Se acepta PDF y DOCX. Admitir PDF es deliberado y no una concesión: los fallos
 * de parseo viven ahí, así que rechazarlo dejaría al módulo sin poder
 * diagnosticar el caso más común, que es justo lo que vale.
 */
export default function EntradaDelAnalisis({
  tipo,
  archivo,
  convocatoria,
  analizando,
  errores,
  errorGeneral,
  onArchivo,
  onConvocatoria,
  onAnalizar,
  refZonaDelCv,
  refZonaDeConvocatoria,
}: Props) {
  const listo = puedeAnalizar(tipo, archivo, convocatoria)
  const dirigido = tipo === 'dirigido'

  return (
    <div className="flex flex-col gap-5">
      {/* Dos pasos del mismo peso en el dirigido; en el general una sola acción
          y el tercio derecho solo informa. */}
      <div className={`grid gap-6 ${dirigido ? 'lg:grid-cols-2' : 'lg:grid-cols-[2fr_1fr]'}`}>
        <Tarjeta>
          <section ref={refZonaDelCv} aria-labelledby="titulo-tu-cv" className="flex min-w-0 flex-col p-5">
            {dirigido ? (
              <EncabezadoDePaso id="titulo-tu-cv" numero={1} titulo="Sube tu CV" listo={archivo !== null} />
            ) : (
              <h2 id="titulo-tu-cv" className="font-serif text-headline-md font-semibold text-vidrio-ink">
                Tu CV
              </h2>
            )}
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
        {!dirigido && (
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

        {dirigido && (
          <Tarjeta>
            <section
              ref={refZonaDeConvocatoria}
              aria-labelledby="titulo-convocatoria"
              className="flex min-w-0 flex-col p-5"
            >
              <EncabezadoDePaso
                id="titulo-convocatoria"
                numero={2}
                titulo="Pega la convocatoria"
                listo={convocatoria.trim() !== ''}
              />
              {/* Se dice antes de pegarla: dónde está y qué gana con ella. */}
              <p className="mt-1 mb-3 text-sm text-vidrio-texto">
                Copia el aviso completo de LinkedIn, Computrabajo o el sitio de la empresa para ver qué
                palabras clave tiene tu CV y si aparecerías cuando el reclutador las busque.
              </p>
              <CampoConvocatoria
                texto={convocatoria}
                deshabilitado={analizando}
                onTexto={onConvocatoria}
                error={errores.convocatoria}
              />
            </section>
          </Tarjeta>
        )}
      </div>

      {/* El error y el progreso, junto al botón: en un celular, un aviso arriba
          de la página queda fuera de la vista justo después de pulsar. */}
      <Alerta variante="enLinea" className="text-sm">
        {errorGeneral}
      </Alerta>

      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
        <p aria-live="polite" className="text-meta text-vidrio-muted sm:mr-auto">
          {analizando ? 'Leyendo tu CV y aplicando las reglas del ATS…' : ''}
        </p>
        <Boton className="w-full sm:w-auto" disabled={!listo} cargando={analizando} onClick={onAnalizar}>
          Analizar CV
        </Boton>
      </div>
    </div>
  )
}
