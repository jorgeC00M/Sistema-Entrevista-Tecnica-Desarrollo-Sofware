import type { ReactNode } from 'react'

interface Props {
  activo: boolean
  onClick: () => void
  children: ReactNode
  className?: string
}

export default function TarjetaArea({ activo, onClick, children, className = '' }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`rounded-lg border px-4 py-3 text-sm font-medium transition ${
        activo
          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
      } ${className}`}
    >
      {children}
    </button>
  )
}
