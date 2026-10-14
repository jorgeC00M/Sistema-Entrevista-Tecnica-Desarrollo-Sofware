const CONFIG = {
  fortalezas: { etiqueta: 'Fortalezas', texto: 'text-exito-texto' },
  debilidades: {
    etiqueta: 'Debilidades',
    texto: 'text-progreso-texto',
  },
  // Sugerencias no es un estado de evaluación — es una recomendación, así
  // que usa el acento del producto y no un semántico.
  sugerencias: {
    etiqueta: 'Sugerencias',
    texto: 'text-vidrio-acento',
  },
} as const

interface Props {
  variante: keyof typeof CONFIG
  texto: string
}

/**
 * Caja con la etiqueta en color semántico. Sin filete de acento: un borde
 * grueso de color sobre una esquina redondeada choca con el radio. Unifica las tres cajas de fortalezas/debilidades/sugerencias que antes se
 * escribían a mano en cada lugar que las mostraba.
 */
export default function ListaRetroalimentacion({ variante, texto }: Props) {
  const { etiqueta, texto: colorTexto } = CONFIG[variante]
  return (
    <div className="flex flex-col gap-1.5 rounded-vidrio bg-vidrio-field p-3">
      <dt className={`text-label-mono uppercase ${colorTexto}`}>{etiqueta}</dt>
      <dd className="text-sm text-vidrio-texto">{texto}</dd>
    </div>
  )
}
