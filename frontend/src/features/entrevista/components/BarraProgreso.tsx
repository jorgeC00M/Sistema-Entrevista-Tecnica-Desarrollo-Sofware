interface Props {
  actual: number
  total: number
}

/**
 * Solo la barra: el contador "PREGUNTA 03 / 05" vive en la cabecera de
 * sesión de `EntrevistaPage`, junto al cronómetro — aquí queda únicamente el
 * indicador visual de avance.
 */
export default function BarraProgreso({ actual, total }: Props) {
  const porcentaje = Math.min(100, Math.round((actual / total) * 100))
  return (
    <div
      role="progressbar"
      aria-valuenow={porcentaje}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progreso de la entrevista: pregunta ${actual} de ${total}`}
      className="h-1.5 w-full overflow-hidden rounded-full bg-tinta-100"
    >
      <div
        className="h-full rounded-full bg-iris-600 transition-all"
        style={{ width: `${porcentaje}%` }}
      />
    </div>
  )
}
