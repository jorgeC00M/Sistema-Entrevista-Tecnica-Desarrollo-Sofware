import Alerta from '@/components/ui/Alerta'
import Boton from '@/components/ui/Boton'

interface Props {
  /** Qué pasó, según el código del error (`lib/erroresDeIA.ts::TITULO_DE_ERROR_DE_IA`). */
  titulo: string
  /** Qué se conserva en esta pantalla: «Tu respuesta está guardada; no la pierdes.» */
  detalle: string
  /** Qué hacer ahora, si hay algo que hacer desde el aviso. */
  accion?: { texto: string; onClick: () => void; deshabilitada?: boolean }
}

/**
 * El único aviso de un fallo del servicio de IA: qué pasó, qué se conserva y
 * qué hacer, en el rojo de `Alerta` (`role="alert"`). No nombra al proveedor.
 */
export default function AlertaDeIA({ titulo, detalle, accion }: Props) {
  return (
    <Alerta>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">{titulo}</p>
          <p>{detalle}</p>
        </div>
        {accion && (
          <Boton variante="texto" tamano="sm" onClick={accion.onClick} disabled={accion.deshabilitada}>
            {accion.texto}
          </Boton>
        )}
      </div>
    </Alerta>
  )
}
