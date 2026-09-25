function iniciales(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

const TAMANOS = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-9 w-9 text-sm',
} as const

interface Props {
  nombre: string
  tamano?: keyof typeof TAMANOS
  /** `oscuro` se usa sobre el sidebar; `claro` sobre superficies blancas. */
  tono?: 'claro' | 'oscuro'
}

export default function Avatar({ nombre, tamano = 'md', tono = 'claro' }: Props) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${TAMANOS[tamano]} ${
        tono === 'oscuro' ? 'bg-white/15 text-white' : 'bg-iris-50 text-iris-700'
      }`}
    >
      {iniciales(nombre)}
    </span>
  )
}
