import Boton from '@/components/ui/Boton'
import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Tarjeta from '@/components/ui/Tarjeta'
import ZonaDeArchivo from '@/features/curriculum/components/ZonaDeArchivo'

interface Props {
  archivo: File | null
  analizando: boolean
  onElegir: (archivo: File | null) => void
  onAnalizar: () => void
  /** Error de validación del backend sobre el campo `archivo`. */
  error?: string
}

/**
 * El paso del currículum: elegir el archivo y lanzar el análisis.
 *
 * La lógica de arrastre, validación y borrado vive en `ZonaDeArchivo`, que la
 * convocatoria reutiliza: dos copias divergirían en el primer arreglo que se le
 * hiciera a una.
 *
 * Se aceptan PDF y DOCX. Admitir PDF es deliberado y no una concesión: los fallos
 * de parseo viven ahí, así que rechazarlo dejaría al módulo sin poder diagnosticar
 * el caso más común, que es justo lo que vale.
 */
export default function SubirArchivo({
  archivo,
  analizando,
  onElegir,
  onAnalizar,
  error,
}: Props) {
  return (
    <Tarjeta className="p-5">
      <div className="flex items-center gap-2">
        <span className="text-headline-sm font-semibold text-vidrio-ink">Tu currículum</span>
        <EtiquetaMono>PDF o DOCX</EtiquetaMono>
      </div>

      <div className="mt-3">
        <ZonaDeArchivo
          que="tu CV"
          archivo={archivo}
          deshabilitado={analizando}
          onElegir={onElegir}
          errorDelServidor={error}
        />
      </div>

      <Boton
        variante="vidrio"
        forma="pildora"
        className="mt-4 w-full sm:w-auto"
        disabled={!archivo}
        cargando={analizando}
        onClick={onAnalizar}
      >
        Analizar mi CV
      </Boton>
    </Tarjeta>
  )
}
