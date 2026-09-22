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
      className={`rounded-control border px-4 py-3 text-sm font-medium transition ${
        activo
          ? 'border-iris-600 bg-iris-50 text-iris-700'
          : 'border-tinta-100 bg-white text-tinta-700 hover:border-tinta-300'
      } ${className}`}
    >
      {children}
    </button>
  )
}
