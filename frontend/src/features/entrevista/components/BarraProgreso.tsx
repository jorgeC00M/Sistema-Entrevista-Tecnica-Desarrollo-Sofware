interface Props {
  actual: number
  total: number
}

export default function BarraProgreso({ actual, total }: Props) {
  const porcentaje = Math.min(100, Math.round((actual / total) * 100))
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-xs text-tinta-500">
        <span>
          Pregunta{' '}
          <span className="font-mono">
            {String(actual).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        </span>
        <span className="font-mono">{porcentaje}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-tinta-100">
        <div
          className="h-full rounded-full bg-iris-600 transition-all"
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  )
}
