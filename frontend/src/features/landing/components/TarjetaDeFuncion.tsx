import { CLASES_TARJETA_ELEVADA } from '@/components/ui/Tarjeta'
import Icono from '@/components/ui/Icono'
import type { NombreDeIcono } from '@/components/ui/Icono'

export interface Funcion {
  icono: NombreDeIcono
  /** Fondo y color del icono, como clases de Tailwind. */
  colorIcono: string
  titulo: string
  texto: string
}

/**
 * Tarjeta "icono + título + texto" de la landing.
 *
 * Estaba escrita a mano cuatro veces en "Qué recibes" y copiada en "Revisa tu
 * CV". Una sección nueva describe sus funciones como datos (`Funcion[]`) y las
 * recorre, en vez de pegar el marcado otra vez.
 *
 * No cubre la tarjeta de "Cómo funciona", que lleva número de paso, ni la grande
 * del medidor: son distintas, y forzarlas aquí llenaría esto de opciones.
 */
export default function TarjetaDeFuncion({ icono, colorIcono, titulo, texto }: Funcion) {
  return (
    <article className={CLASES_TARJETA_ELEVADA}>
      <span className={`mb-4 flex h-11 w-11 items-center justify-center rounded-control ${colorIcono}`}>
        <Icono nombre={icono} />
      </span>
      <h3 className="text-[1.15rem] font-semibold text-vidrio-ink">{titulo}</h3>
      <p className="mt-2 text-[0.96rem] leading-[1.6] text-vidrio-texto">{texto}</p>
    </article>
  )
}
