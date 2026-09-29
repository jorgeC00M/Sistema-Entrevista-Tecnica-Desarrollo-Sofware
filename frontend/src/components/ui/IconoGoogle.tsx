interface Props {
  className?: string
}

/**
 * Logotipo de Google, con sus colores oficiales.
 *
 * No entra en el catálogo de `Icono.tsx` porque nada de eso le aplica: son
 * cuatro trazos rellenos con colores de marca ajena, no un trazo monocromo
 * que herede `currentColor`. Los valores son los del botón oficial y no
 * deben tocarse: son condición de uso de la marca.
 */
export default function IconoGoogle({ className = 'h-[18px] w-[18px]' }: Props) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className={className}>
      <path
        fill="#4285F4"
        d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2-1.9 3.2-4.7 3.2-8z"
      />
      <path
        fill="#34A853"
        d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z"
      />
      <path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7H2.1a11 11 0 0 0 0 10l3.7-2.8z" />
      <path
        fill="#EA4335"
        d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7l3.7 2.9C6.7 7.3 9.1 5.4 12 5.4z"
      />
    </svg>
  )
}
