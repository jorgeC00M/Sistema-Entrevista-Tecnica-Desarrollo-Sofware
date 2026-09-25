const TONOS = {
  claro: { texto: 'text-tinta-500', anillo: 'border-tinta-300 border-t-iris-600' },
  // Reservado al sistema "vidrio" (dashboard): la landing/entrada raíz sigue
  // usando `claro` por defecto, así que este componente no puede cambiar de
  // paleta por defecto sin reskinear también esas pantallas.
  vidrio: { texto: 'text-vidrio-muted', anillo: 'border-vidrio-linea border-t-vidrio-acento' },
} as const

interface Props {
  texto?: string
  tono?: keyof typeof TONOS
}

export default function Spinner({ texto = 'Cargando…', tono = 'claro' }: Props) {
  const estilo = TONOS[tono]
  return (
    <div className={`flex min-h-[40vh] flex-col items-center justify-center gap-3 ${estilo.texto}`}>
      <span className={`h-8 w-8 animate-spin rounded-full border-2 ${estilo.anillo}`} />
      <p className="text-sm">{texto}</p>
    </div>
  )
}
