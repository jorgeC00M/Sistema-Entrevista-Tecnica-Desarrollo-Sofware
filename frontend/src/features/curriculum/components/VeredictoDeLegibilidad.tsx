import type { ReactNode } from 'react'

import Boton from '@/components/ui/Boton'
import Icono from '@/components/ui/Icono'
import Tarjeta from '@/components/ui/Tarjeta'
import {
  SEVERIDADES,
  VEREDICTOS,
  correccionesPrioritarias,
  estadoDelCampo,
  veredictoDeLegibilidad,
} from '@/features/curriculum/hallazgos'
import type { AnalisisATS } from '@/types/curriculum'

interface Props {
  analisis: AnalisisATS
  /** Abre «Plan de Mejora» en esa corrección. */
  onIrA: (codigo: string) => void
  /** Abre «Plan de Mejora». */
  onVerTodo: () => void
  /** En el dirigido, el bloque «Requisitos de la oferta», al lado de «Formato». No toca el estado. */
  requisitos?: ReactNode
}

/**
 * El estado del CV, en palabras y sin puntaje, en dos paneles: lo que el ATS
 * extrae y lo que eso significa.
 *
 * A la izquierda, una dona con los datos en sus tres estados medidos
 * (`estadoDelCampo`): extraídos, incompletos y no extraídos. En el centro va el
 * total («8 datos revisados»), nunca una fracción, y debajo, una leyenda en
 * texto con cada cantidad, para que el color no sea la única señal.
 *
 * A la derecha, el estado (`veredictoDeLegibilidad`, que lo deriva de los datos
 * clave) con su etiqueta, su título y la regla que lo activó (`VEREDICTOS`), y
 * «Formato»: las correcciones con más efecto (`correccionesPrioritarias`), cada
 * una un enlace a su corrección en «Plan de Mejora», que es donde se arreglan.
 * En el dirigido, `requisitos` se pone al lado de «Formato» (apilados por debajo
 * de 768 px); el estado y la dona siguen saliendo solo de los datos extraídos.
 */
export default function VeredictoDeLegibilidad({ analisis, onIrA, onVerTodo, requisitos }: Props) {
  const nivel = veredictoDeLegibilidad(analisis)
  const aspecto = VEREDICTOS[nivel]
  const total = analisis.campos.length
  const cuenta = { extraido: 0, incompleto: 0, no_extraido: 0 }
  for (const campo of analisis.campos) cuenta[estadoDelCampo(campo)] += 1
  const porcentaje = (n: number) => (total > 0 ? (n / total) * 100 : 0)
  const corteExtraidos = porcentaje(cuenta.extraido)
  const corteIncompletos = corteExtraidos + porcentaje(cuenta.incompleto)
  const errores = correccionesPrioritarias(analisis.debilidades)

  return (
    <Tarjeta como="section" className="grid gap-5 p-5 sm:grid-cols-[auto_1fr]">
      <div className="flex flex-col items-center gap-3">
        {/* El lector de pantalla oye esta frase; la dona y la leyenda son su
            dibujo. Los colores salen de los tokens de estado. */}
        <p className="sr-only">
          {total} datos revisados: {cuenta.extraido} extraídos, {cuenta.incompleto} incompletos,{' '}
          {cuenta.no_extraido} no extraídos.
        </p>
        <div
          aria-hidden="true"
          className="grid h-32 w-32 place-items-center rounded-full"
          style={{
            background: `conic-gradient(var(--color-exito-texto) 0 ${corteExtraidos}%, var(--color-progreso-texto) ${corteExtraidos}% ${corteIncompletos}%, var(--color-error-texto) ${corteIncompletos}% 100%)`,
          }}
        >
          <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center">
            <span className="flex flex-col items-center">
              <span className="font-mono-vidrio text-metric-counter text-vidrio-ink">{total}</span>
              <span className="text-meta leading-tight text-vidrio-muted">
                datos
                <br />
                revisados
              </span>
            </span>
          </div>
        </div>
        <ul aria-hidden="true" className="flex flex-col gap-1 text-meta text-vidrio-texto">
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-chip bg-exito-texto" />
            {cuenta.extraido} extraídos
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-chip bg-progreso-texto" />
            {cuenta.incompleto} incompletos
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-chip bg-error-texto" />
            {cuenta.no_extraido} no extraídos
          </li>
        </ul>
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-chip px-2 py-0.5 font-mono-vidrio text-label-mono uppercase ${aspecto.clases}`}
        >
          <Icono nombre={aspecto.icono} className="h-3.5 w-3.5 shrink-0" />
          {aspecto.etiqueta}
        </span>
        <h3 className="font-serif text-headline-md font-semibold text-vidrio-ink">{aspecto.titulo}</h3>
        <p className="text-sm text-vidrio-texto">{aspecto.regla}</p>

        <div className={`mt-2 border-t border-vidrio-linea pt-3 ${requisitos ? 'grid gap-4 md:grid-cols-2' : ''}`}>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-vidrio-ink">Formato</h4>
            {errores.length === 0 ? (
              <p className="mt-1 flex items-center gap-2 text-sm text-exito-texto">
                <Icono nombre="fortaleza" className="h-4 w-4 shrink-0" />
                No hay errores que le impidan leer tu CV.
              </p>
            ) : (
              <ul className="mt-1.5 flex flex-col gap-1">
                {errores.map((hallazgo) => (
                  <li key={hallazgo.codigo} className="flex items-start gap-2">
                    <span className={`mt-1.5 shrink-0 ${SEVERIDADES[hallazgo.severidad].icono}`}>
                      <Icono nombre="mejora" className="h-4 w-4" />
                    </span>
                    {/* El diagnóstico lleva a su arreglo: la corrección en «Plan de Mejora». */}
                    <Boton variante="texto" tamano="sm" onClick={() => onIrA(hallazgo.codigo)} className="text-left">
                      {SEVERIDADES[hallazgo.severidad].etiqueta && (
                        <span className="sr-only">{SEVERIDADES[hallazgo.severidad].etiqueta}: </span>
                      )}
                      {hallazgo.titulo}
                    </Boton>
                  </li>
                ))}
              </ul>
            )}
            <Boton variante="texto" tamano="sm" onClick={onVerTodo} className="mt-2">
              Ver el plan de mejora
            </Boton>
          </div>
          {requisitos}
        </div>
      </div>
    </Tarjeta>
  )
}
