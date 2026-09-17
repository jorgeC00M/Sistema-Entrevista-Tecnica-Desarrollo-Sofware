interface Props {
  actual: number
  total: number
}

export default function BarraProgreso({ actual, total }: Props) {
  const porcentaje = Math.min(100, Math.round((actual / total) * 100))
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
        <span>
          Pregunta {actual} de {total}
        </span>
        <span>{porcentaje}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all"
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  )
}
