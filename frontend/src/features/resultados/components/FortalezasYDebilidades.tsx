import Icono from '@/components/ui/Icono'
import Tarjeta from '@/components/ui/Tarjeta'
import { fortalezasYDebilidades } from '@/features/resultados/reporte'
import type { Intercambio } from '@/types/entrevista'

const COLUMNAS = [
  { clave: 'fortalezas', titulo: 'Fortalezas', icono: 'fortaleza', color: 'text-exito-texto' },
  { clave: 'debilidades', titulo: 'Debilidades', icono: 'mejora', color: 'text-progreso-texto' },
] as const

/**
 * Lo mejor y lo más flojo de la entrevista, en dos columnas: la primera frase de
 * las fortalezas de las 2 respuestas mejor calificadas y de las debilidades de
 * las 2 peor calificadas (`reporte.ts`). Lo escribió el evaluador en cada
 * respuesta; aquí solo se elige.
 */
export default function FortalezasYDebilidades({ intercambios }: { intercambios: Intercambio[] }) {
  const puntos = fortalezasYDebilidades(intercambios)

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
      {COLUMNAS.map(({ clave, titulo, icono, color }) => (
        <Tarjeta key={clave} como="section" className="p-5">
          <h2 className={`flex items-center gap-2 text-sm font-semibold uppercase ${color}`}>
            <Icono nombre={icono} className="h-4 w-4 shrink-0" />
            {titulo}
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-vidrio-texto marker:text-vidrio-tenue">
            {puntos[clave].map((punto) => (
              <li key={punto}>{punto}</li>
            ))}
          </ul>
        </Tarjeta>
      ))}
    </div>
  )
}
