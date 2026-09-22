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
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-tinta-700">
          {etiqueta}
        </label>
      )}
      <textarea
        id={id}
        value={value}
        className="w-full resize-none rounded-control border border-tinta-300 px-3 py-2 text-sm text-tinta-950 focus:border-iris-600 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iris-600 disabled:bg-tinta-50"
        {...props}
      />
      {maximoCaracteres !== undefined && (
        <p className="mt-1 text-right font-mono text-xs text-tinta-500">
          {longitud} / {maximoCaracteres}
        </p>
      )}
    </div>
  )
}
