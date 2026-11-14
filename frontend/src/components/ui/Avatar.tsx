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

const TONOS = {
  /** Sobre el sidebar oscuro. */
  oscuro: 'bg-white/15 text-white',
  /** Sobre superficies claras: junto a las burbujas del chat. */
  claro: 'bg-vidrio-acento-suave text-vidrio-acento',
} as const

interface Props {
  nombre: string
  tamano?: keyof typeof TAMANOS
  tono?: keyof typeof TONOS
}

/** Las iniciales del usuario: en el sidebar y junto a sus mensajes del chat. */
export default function Avatar({ nombre, tamano = 'md', tono = 'oscuro' }: Props) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${TONOS[tono]} ${TAMANOS[tamano]}`}
    >
      {iniciales(nombre)}
    </span>
  )
}
