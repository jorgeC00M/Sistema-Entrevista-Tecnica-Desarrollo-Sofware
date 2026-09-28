import Icono from '@/components/ui/Icono'
import { clasesRevelado, useRevelarAlEntrar } from '@/features/landing/hooks/useRevelarAlEntrar'
import type { Area, Nivel } from '@/types/catalogos'

interface Props {
  areas: Area[]
  niveles: Nivel[]
}

export default function AreasTecnicas({ areas, niveles }: Props) {
  const { ref, visible } = useRevelarAlEntrar<HTMLElement>()

  return (
    <section id="areas" ref={ref} className="scroll-mt-20">
      <div className={`mx-auto max-w-5xl px-4 py-16 sm:py-20 ${clasesRevelado(visible)}`}>
        <h2 className="text-center font-serif text-2xl font-semibold text-vidrio-ink sm:text-3xl">
          Áreas que puedes practicar
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-vidrio-texto">
          Elige una y decide el nivel al que quieres que te exijan.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {areas.map((area) => (
            <div
              key={area.codigo}
              className="rounded-vidrio border border-vidrio-borde bg-vidrio-card p-6 shadow-[0_8px_24px_-12px_rgba(28,47,94,0.18)] backdrop-blur-[18px]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-control bg-vidrio-acento-suave text-vidrio-acento">
                <Icono nombre="area" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-vidrio-ink">{area.nombre}</h3>
              <p className="mt-1 text-sm text-vidrio-texto">{area.descripcion}</p>
            </div>
          ))}
        </div>

        {niveles.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-vidrio-texto">
              Niveles disponibles:{' '}
              {niveles.map((n, i) => (
                <span key={n.codigo}>
                  <span className="font-medium text-vidrio-ink">{n.nombre}</span>
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
