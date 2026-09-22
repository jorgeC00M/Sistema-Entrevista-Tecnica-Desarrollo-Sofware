interface Props {
  /** `claro` para superficies blancas; `oscuro` para el sidebar. */
  tono?: 'claro' | 'oscuro'
  className?: string
}

export default function Divisor({ tono = 'claro', className = '' }: Props) {
  return (
    <hr
      className={`border-t ${tono === 'oscuro' ? 'border-tinta-800' : 'border-tinta-100'} ${className}`}
    />
  )
}
