import Icono from '@/components/ui/Icono'

/**
 * Se aportó convocatoria pero no tenía términos reconocibles, así que `brecha`
 * viene nula. Se dice, en vez de caer al inventario como si no se hubiera
 * aportado nada. No es un error: se dice sin interrumpir.
 */
export default function SinRequisitosReconocidos() {
  return (
    <p className="flex items-start gap-1.5 text-sm text-vidrio-muted">
      <Icono nombre="info" className="mt-0.5 h-4 w-4 shrink-0" />
      <span>
        No se reconoció ningún requisito técnico en la convocatoria que enviaste, así que no hay
        nada que comparar. Revisa que incluya la lista de tecnologías.
      </span>
    </p>
  )
}
