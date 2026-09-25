import type { TextareaHTMLAttributes, ReactNode } from 'react'

interface Props extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'className'> {
  id?: string
  etiqueta?: ReactNode
  /** Máximo a mostrar en el contador; no trunca el valor, solo lo informa. */
  maximoCaracteres?: number
  className?: string
}

export default function Textarea({
  id,
  etiqueta,
  maximoCaracteres,
  value,
  className = '',
  ...props
}: Props) {
  const longitud = typeof value === 'string' ? value.length : 0

  return (
    <div className={className}>
      {etiqueta && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-vidrio-ink">
          {etiqueta}
        </label>
      )}
      <textarea
        id={id}
        value={value}
        className="w-full resize-none rounded-vidrio border border-vidrio-linea bg-vidrio-field px-3 py-2 text-sm text-vidrio-ink focus:border-vidrio-acento focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vidrio-acento disabled:opacity-60"
        {...props}
      />
      {maximoCaracteres !== undefined && (
        <p className="mt-1 text-right font-mono-vidrio text-xs text-vidrio-muted">
          {longitud} / {maximoCaracteres}
        </p>
      )}
    </div>
  )
}
