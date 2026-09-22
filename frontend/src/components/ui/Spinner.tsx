interface Props {
  texto?: string
}

export default function Spinner({ texto = 'Cargando…' }: Props) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-tinta-500">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-tinta-300 border-t-iris-600" />
      <p className="text-sm">{texto}</p>
    </div>
  )
}
