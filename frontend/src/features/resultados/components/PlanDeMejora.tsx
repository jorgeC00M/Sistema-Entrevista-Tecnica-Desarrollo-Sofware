import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import Icono from '@/components/ui/Icono'
import { clasesDeBoton } from '@/components/ui/estilosDeBoton'
import Tarjeta from '@/components/ui/Tarjeta'
import { consejoDeComunicacion, practicaRecomendada, temasARepasar } from '@/features/resultados/reporte'
import type { NombreDeIcono } from '@/components/ui/trazosDeIconos'
import type { Nivel } from '@/types/catalogos'
import type { Entrevista, Intercambio, ResumenEntrevista } from '@/types/entrevista'

interface Props {
  entrevista: Entrevista
  intercambios: Intercambio[]
  resumen: ResumenEntrevista
  /** Del catálogo, para sugerir el nivel siguiente; vacío si no llegó. */
  niveles: Nivel[]
}

function Bloque({ icono, titulo, children }: { icono: NombreDeIcono; titulo: string; children: ReactNode }) {
  return (
    <Tarjeta como="section" className="flex min-w-0 flex-col gap-3 p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-vidrio-ink">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-control bg-vidrio-acento-suave text-vidrio-acento">
          <Icono nombre={icono} className="h-4 w-4" />
        </span>
        {titulo}
      </h3>
      {children}
    </Tarjeta>
  )
}

/**
 * «Tareas para tu próxima entrevista»: tres bloques armados por reglas con las
 * evaluaciones guardadas (`reporte.ts`), sin llamar a la IA. Los temas son las 2
 * respuestas más bajas; el consejo sale del criterio más débil; la práctica
 * repite puesto y nivel, o sube un nivel con «Sólido».
 */
export default function PlanDeMejora({ entrevista, intercambios, resumen, niveles }: Props) {
  const temas = temasARepasar(intercambios)
  const practica = practicaRecomendada(entrevista, resumen.banda, niveles)

  return (
    <section className="flex flex-col gap-4 lg:gap-6">
      <h2 className="font-serif text-headline-md font-semibold text-vidrio-ink">Tareas para tu próxima entrevista</h2>
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <Bloque icono="documento" titulo="Temas a repasar">
          <ol className="flex flex-col gap-3">
            {temas.map((tema) => (
              <li key={tema.numero} className="text-sm">
                <p className="font-medium text-vidrio-ink">
                  {tema.area}{' '}
                  <span className="font-mono-vidrio text-meta text-vidrio-muted">
                    · Pregunta {tema.numero} · {tema.puntuacion}/100
                  </span>
                </p>
                {tema.puntos.length > 0 ? (
                  <ul className="mt-1 list-disc space-y-0.5 pl-5 text-vidrio-texto marker:text-vidrio-tenue">
                    {tema.puntos.map((punto) => (
                      <li key={punto}>{punto}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-vidrio-texto">{tema.sugerencia}</p>
                )}
              </li>
            ))}
          </ol>
        </Bloque>

        <Bloque icono="respuesta" titulo="Cómo mejorar tu comunicación">
          <p className="text-sm leading-relaxed text-vidrio-texto">
            {consejoDeComunicacion(resumen.criterio_mas_debil?.codigo ?? null)}
          </p>
        </Bloque>

        <Bloque icono="repetir" titulo="Práctica recomendada">
          <p className="text-sm text-vidrio-texto">
            {practica.subeDeNivel
              ? `Te fue bien: prueba ${practica.puestoNombre} en el nivel ${practica.nivelNombre}.`
              : `Repite ${practica.puestoNombre} en el nivel ${practica.nivelNombre} y compara tu nota.`}
          </p>
          {/* Solo preselecciona puesto y nivel: la entrevista no arranca sola. */}
          <Link
            to={`/simular-entrevista?${new URLSearchParams({ puesto: practica.puesto, nivel: practica.nivel })}`}
            className={clasesDeBoton({ variante: 'secundario', tamano: 'sm', className: 'mt-auto self-start' })}
          >
            Practicar
          </Link>
        </Bloque>
      </div>
    </section>
  )
}
