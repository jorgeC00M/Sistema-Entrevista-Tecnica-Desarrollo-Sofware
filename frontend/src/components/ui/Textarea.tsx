import type { ReactNode, Ref, TextareaHTMLAttributes } from 'react'

interface Props extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'className'> {
  id?: string
  /** Para devolverle el foco (React 19: `ref` es una prop más). */
  ref?: Ref<HTMLTextAreaElement>
  etiqueta?: ReactNode
  /** Máximo a mostrar en el contador; no trunca el valor, solo lo informa. */
  maximoCaracteres?: number
  className?: string
}

export default function Textarea({
  id,
  ref,
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
        ref={ref}
        value={value}
        className="campo w-full resize-none px-3 py-2 text-sm text-vidrio-ink"
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
