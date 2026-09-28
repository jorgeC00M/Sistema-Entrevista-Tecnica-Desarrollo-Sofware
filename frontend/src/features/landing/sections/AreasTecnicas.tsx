import CarruselAreas from '@/features/landing/components/CarruselAreas'
import EncabezadoSeccion from '@/features/landing/components/EncabezadoSeccion'
import Wrap from '@/features/landing/components/Wrap'
import { clasesRevelado, useRevelarAlEntrar } from '@/features/landing/hooks/useRevelarAlEntrar'
import type { Area, Nivel } from '@/types/catalogos'

interface Props {
  areas: Area[]
  niveles: Nivel[]
}

export default function AreasTecnicas({ areas, niveles }: Props) {
  const { ref, visible } = useRevelarAlEntrar<HTMLElement>()

  return (
    <section id="areas" ref={ref} className="scroll-mt-24 py-[clamp(64px,8vw,100px)]">
      <Wrap className={clasesRevelado(visible)}>
        <EncabezadoSeccion
          indice="03"
          titulo="Áreas que puedes practicar"
          descripcion="Elige una y decide el nivel al que quieres que te exijan."
        />

        <CarruselAreas areas={areas} niveles={niveles} />
      </Wrap>
    </section>
  )
}
