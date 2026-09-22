const CONFIG = {
  fortalezas: { etiqueta: 'Fortalezas', color: 'text-exito-texto' },
  debilidades: { etiqueta: 'Debilidades', color: 'text-progreso-texto' },
  sugerencias: { etiqueta: 'Sugerencias', color: 'text-iris-600' },
} as const

interface Props {
  variante: keyof typeof CONFIG
  texto: string
}

export default function ListaRetroalimentacion({ variante, texto }: Props) {
  const { etiqueta, color } = CONFIG[variante]
  return (
    <div>
      <dt className={`text-xs font-semibold uppercase ${color}`}>{etiqueta}</dt>
      <dd className="mt-1 text-sm text-tinta-500">{texto}</dd>
    </div>
  )
}
