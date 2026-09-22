const CONFIG = {
  fortalezas: { etiqueta: 'Fortalezas', texto: 'text-exito-texto', acento: 'border-t-exito-texto' },
  debilidades: {
    etiqueta: 'Debilidades',
    texto: 'text-progreso-texto',
    acento: 'border-t-progreso-texto',
  },
  // Sugerencias no es un estado de evaluación — es una recomendación, así
  // que usa iris (el color de acción/marca) y no un semántico.
  sugerencias: { etiqueta: 'Sugerencias', texto: 'text-iris-600', acento: 'border-t-iris-600' },
} as const

interface Props {
  variante: keyof typeof CONFIG
  texto: string
}

/**
 * Tarjeta con acento superior de color semántico, al estilo de la maqueta:
 * unifica las tres cajas de fortalezas/debilidades/sugerencias que antes se
 * escribían a mano en cada lugar que las mostraba.
 */
export default function ListaRetroalimentacion({ variante, texto }: Props) {
  const { etiqueta, texto: colorTexto, acento } = CONFIG[variante]
  return (
    <div className={`flex flex-col gap-1.5 rounded-control border-t-2 bg-tinta-50 p-3 ${acento}`}>
      <dt className={`text-label-mono uppercase ${colorTexto}`}>{etiqueta}</dt>
      <dd className="text-sm text-tinta-700">{texto}</dd>
    </div>
  )
}
