const ESTILOS = {
  error: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  exito: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  info: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
}

export default function Alerta({ tipo = 'error', children }) {
  if (!children) return null
  return (
    <div className={`rounded-lg px-4 py-3 text-sm ${ESTILOS[tipo]}`} role={tipo === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  )
}
