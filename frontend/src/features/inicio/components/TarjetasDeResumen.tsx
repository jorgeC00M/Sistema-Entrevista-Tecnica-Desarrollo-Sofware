import TarjetaDeCifra from '@/components/ui/TarjetaDeCifra'
import { type CifrasDeResumen, tiempoDePractica } from '@/features/inicio/inicio'

interface Props {
  cifras: CifrasDeResumen
}

/**
 * Las cuatro cifras de práctica. Sin promedios ni porcentajes: mezclarían
 * puestos y niveles que no se comparan. Cuatro en fila desde 1024 px, dos por
 * fila debajo.
 */
export default function TarjetasDeResumen({ cifras }: Props) {
  return (
    <dl aria-label="Tu práctica en cifras" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <TarjetaDeCifra
        rotulo="Entrevistas realizadas"
        valor={String(cifras.finalizadas)}
        detalle={cifras.sinTerminar > 0 ? `+${cifras.sinTerminar} sin terminar` : undefined}
      />
      <TarjetaDeCifra rotulo="Preguntas respondidas" valor={String(cifras.preguntas)} />
      <TarjetaDeCifra rotulo="Tiempo de práctica" valor={tiempoDePractica(cifras.segundosDePractica)} />
      <TarjetaDeCifra
        rotulo="Análisis de CV"
        valor={String(cifras.analisis)}
        detalle={cifras.analisis > 0 ? `${cifras.generales} generales · ${cifras.conOferta} con oferta` : undefined}
      />
    </dl>
  )
}
