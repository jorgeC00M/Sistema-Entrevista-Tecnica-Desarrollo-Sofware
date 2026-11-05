import Tarjeta from '@/components/ui/Tarjeta'

interface Props {
  rotulo: string
  /** Ya formateado: «5», «1 h 40 min». */
  valor: string
  /** Una línea en gris bajo el número, si aporta: «+2 sin terminar». */
  detalle?: string
}

/**
 * Una cifra con su rótulo: el bloque de las tarjetas de resumen del Inicio.
 * Es un `div` con `dt`/`dd` dentro de una lista de definiciones que arma quien
 * la usa, así el lector de pantalla lee «rótulo: valor».
 */
export default function TarjetaDeCifra({ rotulo, valor, detalle }: Props) {
  return (
    <Tarjeta className="flex flex-col gap-1 p-4">
      <dt className="text-label-mono text-vidrio-muted uppercase">{rotulo}</dt>
      <dd className="font-mono-vidrio text-headline-xl font-semibold text-vidrio-ink">{valor}</dd>
      {detalle && <dd className="text-meta text-vidrio-muted">{detalle}</dd>}
    </Tarjeta>
  )
}
