import type { InputHTMLAttributes, ReactNode } from 'react'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'> {
  /** Obligatorio: es lo que enlaza la etiqueta con el campo vía htmlFor. */
  id: string
  etiqueta: ReactNode
  /** Texto de ayuda bajo el campo, por ejemplo "Mínimo 8 caracteres". */
  ayuda?: string
  opcional?: boolean
}

export default function Input({ id, etiqueta, ayuda, opcional = false, ...props }: Props) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-tinta-700">
        {etiqueta} {opcional && <span className="text-tinta-500">(opcional)</span>}
      </label>
      <input
        id={id}
        className="w-full rounded-control border border-tinta-300 px-3 py-2 text-sm text-tinta-950 focus:border-iris-600 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iris-600"
        {...props}
      />
      {ayuda && <p className="mt-1 text-xs text-tinta-500">{ayuda}</p>}
    </div>
  )
}
