import Icono from '@/components/ui/Icono'

interface Props {
  id: string
  numero: number
  titulo: string
  listo: boolean
}

/**
 * El encabezado de un paso de «Comparar con oferta»: «Paso N» y, cuando está
 * completo, un check con «Listo» —texto real, no solo color—; debajo, el título.
 *
 * El `h2` lleva el texto completo («Paso 1 · Sube tu CV»): la sección lo usa en
 * `aria-labelledby`, y un lector de pantalla oye el paso, el título y si está
 * listo. Cambiar de estado no se anuncia: lo causó el propio usuario.
 */
export default function EncabezadoDePaso({ id, numero, titulo, listo }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p aria-hidden="true" className="text-label-mono text-vidrio-muted uppercase">
          Paso {numero}
        </p>
        {listo && (
          <p className="flex items-center gap-1 text-sm font-semibold text-exito-texto">
            <Icono nombre="fortaleza" className="h-4 w-4" />
            Listo
          </p>
        )}
      </div>
      <h2 id={id} className="mt-1 font-serif text-headline-md font-semibold text-vidrio-ink">
        <span className="sr-only">Paso {numero} · </span>
        {titulo}
      </h2>
    </div>
  )
}
