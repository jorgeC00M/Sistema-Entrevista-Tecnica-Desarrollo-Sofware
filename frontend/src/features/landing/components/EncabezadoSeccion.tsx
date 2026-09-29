import EtiquetaMono from '@/components/ui/EtiquetaMono'

interface Props {
  indice: string
  titulo: string
  descripcion: string
}

/**
 * Encabezado compacto compartido por las secciones de contenido de la
 * landing (Cómo funciona / Qué recibes / Áreas): número de fase en píldora,
 * título en Fraunces y descripción, cerrado con una línea inferior.
 */
export default function EncabezadoSeccion({ indice, titulo, descripcion }: Props) {
  return (
    <div className="mb-9 grid grid-cols-[auto_1fr] items-baseline gap-x-[18px] gap-y-[6px] border-b border-vidrio-linea pb-[22px] text-left">
      <EtiquetaMono tono="marca" className="row-span-2 mt-1 self-start">
        {indice}
      </EtiquetaMono>
      <h2 className="font-serif text-[clamp(1.5rem,2.2vw,1.9rem)] leading-[1.2] font-semibold tracking-[-0.01em] text-vidrio-ink">
        {titulo}
      </h2>
      <p className="max-w-[640px] text-base leading-[1.55] text-vidrio-texto">{descripcion}</p>
    </div>
  )
}
