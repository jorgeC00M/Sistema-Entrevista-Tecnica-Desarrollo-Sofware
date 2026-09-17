const VARIANTES = {
  primario: 'bg-indigo-600 text-white hover:bg-indigo-700',
  secundario: 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50',
  peligro: 'bg-red-600 text-white hover:bg-red-700',
}

export default function Boton({
  children,
  variante = 'primario',
  cargando = false,
  disabled,
  className = '',
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTES[variante]} ${className}`}
      disabled={disabled || cargando}
      {...props}
    >
      {cargando && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
}
