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
      // jsx-a11y sugiere <progress> nativo en vez de role="progressbar". No
      // se adopta: el relleno redondeado y coloreado dependería de pseudo-
      // elementos con prefijo de fabricante (::-webkit-progress-value,
      // ::-moz-progress-bar) que no se pueden verificar visualmente aquí, y
      // el patrón ARIA ya está completo — no hay hueco de accesibilidad real.
      // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="progressbar"
      aria-valuenow={porcentaje}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progreso de la entrevista: pregunta ${actual} de ${total}`}
      className="h-1.5 w-full overflow-hidden rounded-full bg-vidrio-field"
    >
      <div
        className="h-full rounded-full bg-vidrio-acento transition-all"
        style={{ width: `${porcentaje}%` }}
      />
    </div>
  )
}
