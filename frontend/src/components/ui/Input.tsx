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
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {etiqueta} {opcional && <span className="text-slate-400">(opcional)</span>}
      </label>
      <input
        id={id}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        {...props}
      />
      {ayuda && <p className="mt-1 text-xs text-slate-400">{ayuda}</p>}
    </div>
  )
}
