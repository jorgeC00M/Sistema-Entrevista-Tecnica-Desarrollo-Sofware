import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import Boton from '@/components/ui/Boton'
import { clasesDeBoton } from '@/components/ui/estilosDeBoton'
import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Icono from '@/components/ui/Icono'
import Tarjeta from '@/components/ui/Tarjeta'
import EspejoDelATS from '@/features/curriculum/components/EspejoDelATS'
import { ChipDeSeveridad } from '@/features/curriculum/components/ListaDeHallazgos'
import { debilidadesPorGravedad } from '@/features/curriculum/hallazgos'
import { destinoDePractica } from '@/features/curriculum/practica'
import type { AnalisisATS } from '@/types/curriculum'

/** Cuántas correcciones se muestran aquí; el resto vive en "Mejorar". */
const PRIMERAS = 3

interface Props {
  analisis: AnalisisATS
  /** Lleva a la pestaña "Mejorar". */
  onVerTodo: () => void
  /** Lleva a una corrección concreta dentro de "Mejorar". */
  onIrA: (codigo: string) => void
  /** El estado de las sugerencias de IA, que llegan después del diagnóstico. */
  aviso: ReactNode
}

/**
 * Lo primero que se ve tras analizar, y empieza por lo que solo Antesala puede
 * mostrar: qué lee el ATS de **tu** CV, campo por campo. Es el único sitio
 * donde aparece; "Mejorar" no lo repite. Al lado (debajo en móvil), las tres
 * correcciones con más efecto, cada una con un enlace a su detalle; al final,
 * lo que ya funciona y el paso a practicar.
 *
 * Todo sale de la medición y las cifras son "5/8", nunca un puntaje. Bajo el
 * espejo solo va la cobertura de requisitos (también es del ATS); las viñetas
 * van con las correcciones, porque a un ATS le da igual si traen métricas.
 */
export default function ResumenDelAnalisis({ analisis, onVerTodo, onIrA, aviso }: Props) {
  const debilidades = debilidadesPorGravedad(analisis.debilidades)
  const primeras = debilidades.slice(0, PRIMERAS)

  return (
    <div className="flex flex-col gap-5">
      {aviso}

      <div className="grid items-start gap-5 lg:grid-cols-5">
        <div className="min-w-0 lg:col-span-3">
          <EspejoDelATS
            analisis={analisis}
            meta={
              analisis.brecha && (
                <p className="mt-1.5">
                  <EtiquetaMono tono="suelto">
                    {analisis.brecha.obligatorios.cobertura} requisitos obligatorios cubiertos
                  </EtiquetaMono>
                </p>
              )
            }
          />
        </div>

        <Tarjeta como="section" className="flex min-w-0 flex-col gap-3 p-5 lg:col-span-2">
          <h3 className="font-serif text-headline-md font-semibold text-vidrio-ink">Lo primero que mejorar</h3>
          {primeras.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-exito-texto">
              <Icono nombre="fortaleza" className="h-4 w-4 shrink-0" />
              El ATS lee bien tu CV: no encontramos nada que corregir.
            </p>
          ) : (
            <ol className="flex flex-col gap-3">
              {primeras.map((hallazgo, indice) => (
                <li key={hallazgo.codigo} className="flex items-start gap-3 text-sm">
                  <span className="font-mono-vidrio text-vidrio-muted">{indice + 1}.</span>
                  <span className="flex min-w-0 flex-col items-start gap-1">
                    {/* Lleva a esta misma corrección en "Mejorar", con su detalle. */}
                    <Boton variante="texto" tamano="sm" onClick={() => onIrA(hallazgo.codigo)} className="text-left">
                      {hallazgo.titulo}
                    </Boton>
                    <ChipDeSeveridad hallazgo={hallazgo} />
                  </span>
                </li>
              ))}
            </ol>
          )}
          {analisis.vinetas && (
            <p className="text-meta text-vidrio-muted">
              {analisis.vinetas.logros} de {analisis.vinetas.total} viñetas muestran un resultado.
            </p>
          )}
          <Boton variante="texto" tamano="sm" onClick={onVerTodo} className="self-start">
            Ver todo en Mejorar
          </Boton>
        </Tarjeta>
      </div>

      {analisis.fortalezas.length > 0 && (
        <section aria-labelledby="titulo-funciona" className="flex flex-col gap-2">
          <h3 id="titulo-funciona" className="flex items-center gap-2 text-sm font-semibold text-exito-texto">
            <Icono nombre="fortaleza" className="h-4 w-4 shrink-0" />
            Qué ya funciona
          </h3>
          {/* Solo los títulos a la vista; el detalle, a un clic. Así lo que
              funciona no compite con lo que hay que mejorar. */}
          <ul className="flex flex-col gap-1.5">
            {analisis.fortalezas.map((fortaleza) => (
              <li key={fortaleza.codigo} className="text-sm text-vidrio-texto">
                <details>
                  <summary className="cursor-pointer rounded-control foco-anillo">{fortaleza.titulo}</summary>
                  <p className="mt-1 pl-4 text-vidrio-muted">{fortaleza.detalle}</p>
                </details>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* El paso a practicar también aquí: es el cierre natural del análisis. */}
      <div className="flex flex-col items-start gap-2 border-t border-vidrio-linea pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-vidrio-texto">Con el CV listo, el siguiente paso es practicar la entrevista técnica.</p>
        <Link
          to={destinoDePractica(analisis.revision_ia)}
          className={clasesDeBoton({ tamano: 'sm', className: 'shrink-0' })}
        >
          Practicar la entrevista
        </Link>
      </div>
    </div>
  )
}
