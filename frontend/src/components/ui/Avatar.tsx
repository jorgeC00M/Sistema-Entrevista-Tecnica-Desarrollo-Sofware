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
}

// Su único sitio es el bloque de perfil del sidebar, siempre oscuro: la
// variante clara nunca se renderizó.
export default function Avatar({ nombre, tamano = 'md' }: Props) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-white/15 font-semibold text-white ${TAMANOS[tamano]}`}
    >
      {iniciales(nombre)}
    </span>
  )
}
