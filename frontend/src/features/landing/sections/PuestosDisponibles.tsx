import Icono from '@/components/ui/Icono'
import CarruselDeTarjetas from '@/features/landing/components/CarruselDeTarjetas'
import EncabezadoSeccion from '@/features/landing/components/EncabezadoSeccion'
import Wrap from '@/features/landing/components/Wrap'
import { clasesRevelado, useRevelarAlEntrar } from '@/features/landing/hooks/useRevelarAlEntrar'
import { nombresDeAreas } from '@/lib/catalogos'
import { ICONO_POR_DEFECTO, ICONO_POR_PUESTO } from '@/lib/iconosPorPuesto'
import type { Area, Nivel, Puesto } from '@/types/catalogos'

interface Props {
  puestos: Puesto[]
  areas: Area[]
  niveles: Nivel[]
}

/**
 * Los puestos a los que se puede practicar, cada uno con las áreas que recorre su
 * entrevista.
 *
 * Antes la sección mostraba áreas sueltas ("elige una"), de cuando la entrevista
 * se armaba por área. Hoy se elige un puesto y el sistema decide qué área toca en
 * cada pregunta, así que mostrar áreas como opción describía algo que ya no
 * existe. Los nombres de las áreas salen del mismo catálogo, igual que en la
 * pantalla de selección; un código sin nombre se muestra tal cual para que el
 * desajuste se note.
 */
export default function PuestosDisponibles({ puestos, areas, niveles }: Props) {
  const { ref, visible } = useRevelarAlEntrar<HTMLElement>()
  const nombrePorArea = nombresDeAreas(areas)

  const pieDeNiveles =
    niveles.length > 0 ? (
      <div className="flex flex-wrap items-center gap-2.5 text-[0.95rem]">
        <span className="text-vidrio-texto">Niveles disponibles:</span>
        {niveles.map((nivel) => (
          <span
            key={nivel.codigo}
            className="rounded-full border border-vidrio-borde bg-vidrio-field px-3.5 py-1.5 font-medium text-vidrio-ink"
          >
            {nivel.nombre}
          </span>
        ))}
      </div>
    ) : undefined

  return (
    <section id="puestos" ref={ref} className="scroll-mt-24 py-[clamp(64px,8vw,100px)]">
      <Wrap className={clasesRevelado(visible)}>
        <EncabezadoSeccion
          indice="04"
          titulo="Puestos que puedes practicar"
          descripcion="Eliges el puesto y el nivel; cada pregunta de la entrevista toca una de sus áreas."
        />

        <CarruselDeTarjetas
          elementos={puestos}
          clave={(puesto) => puesto.codigo}
          etiqueta="Puestos"
          nombreDelElemento="puesto"
          pie={pieDeNiveles}
          renderTarjeta={(puesto, actual) => (
            <>
              <span
                className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-control transition-colors duration-500 ${
                  actual ? 'bg-vidrio-acento text-white' : 'bg-vidrio-acento-suave text-vidrio-acento'
                }`}
              >
                <Icono nombre={ICONO_POR_PUESTO[puesto.codigo] ?? ICONO_POR_DEFECTO} />
              </span>
              <h3 className="relative z-10 mt-4 text-[1.15rem] font-semibold text-vidrio-ink">
                {puesto.nombre}
              </h3>
              <p className="relative z-10 mt-2 text-[0.96rem] leading-[1.6] text-vidrio-texto">
                {puesto.descripcion}
              </p>
              {puesto.areas.length > 0 && (
                <ul className="relative z-10 mt-4 flex flex-wrap gap-1.5" aria-label="Áreas que cubre">
                  {puesto.areas.map((codigo) => (
                    <li
                      key={codigo}
                      className="rounded-chip bg-vidrio-field px-2 py-0.5 text-xs text-vidrio-muted"
                    >
                      {nombrePorArea.get(codigo) ?? codigo}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        />
      </Wrap>
    </section>
  )
}
