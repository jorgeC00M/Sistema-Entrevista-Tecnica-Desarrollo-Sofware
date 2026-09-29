interface Props {
  texto?: string
}

// El sistema "vidrio" es el único que existe hoy: la variante `claro`, que
// seguía en la paleta antigua, no la pedía ninguna pantalla.
export default function Spinner({ texto = 'Cargando…' }: Props) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-vidrio-muted">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-vidrio-linea border-t-vidrio-acento" />
      <p className="text-sm">{texto}</p>
    </div>
  )
}
