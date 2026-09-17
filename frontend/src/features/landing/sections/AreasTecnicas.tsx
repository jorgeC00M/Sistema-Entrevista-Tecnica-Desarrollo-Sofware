import Icono from '@/features/landing/components/Icono'
import { clasesRevelado, useRevelarAlEntrar } from '@/features/landing/hooks/useRevelarAlEntrar'
import type { Area, Nivel } from '@/types/catalogos'

interface Props {
  areas: Area[]
  niveles: Nivel[]
}

export default function AreasTecnicas({ areas, niveles }: Props) {
  const { ref, visible } = useRevelarAlEntrar<HTMLElement>()

  return (
    <section id="areas" ref={ref} className="scroll-mt-20 bg-slate-50">
      <div className={`mx-auto max-w-5xl px-4 py-16 sm:py-20 ${clasesRevelado(visible)}`}>
        <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
          Áreas que puedes practicar
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">
          Elige una y decide el nivel al que quieres que te exijan.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {areas.map((area) => (
            <div key={area.codigo} className="rounded-xl bg-white p-6 ring-1 ring-slate-200">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Icono nombre="area" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{area.nombre}</h3>
              <p className="mt-1 text-sm text-slate-600">{area.descripcion}</p>
            </div>
          ))}
        </div>

        {niveles.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Niveles disponibles:{' '}
              {niveles.map((n, i) => (
                <span key={n.codigo}>
                  <span className="font-medium text-slate-700">{n.nombre}</span>
                  {i < niveles.length - 1 && ' · '}
                </span>
              ))}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
