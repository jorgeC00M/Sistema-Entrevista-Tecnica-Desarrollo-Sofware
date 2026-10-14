interface Props {
  titulo: string
  descripcion: string
}

/**
 * Titular y entrada de una sección de la landing, alineados a la izquierda.
 *
 * Sin número de sección ni rótulo encima: las secciones no son pasos y el
 * "01 / 02 / 03" era decoración sin significado, el patrón más reconocible de
 * una landing de plantilla. El titular se sostiene solo.
 */
export default function EncabezadoSeccion({ titulo, descripcion }: Props) {
  return (
    <div className="mb-10 max-w-[62ch]">
      <h2 className="font-serif text-seccion text-balance text-vidrio-ink">{titulo}</h2>
      <p className="mt-4 text-entrada text-pretty text-vidrio-texto">{descripcion}</p>
    </div>
  )
}
