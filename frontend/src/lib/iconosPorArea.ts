import type { NombreDeIcono } from '@/components/ui/Icono'

/**
 * `codigo` es texto libre de una tabla (ver `types/catalogos.ts`), no una
 * unión cerrada: un área nueva dada de alta en el admin no tiene por qué
 * tener entrada aquí, así que siempre cae al ícono por defecto en vez de
 * romper. Compartido entre `SeleccionAreaPage` y el carrusel de la landing.
 */
export const ICONO_POR_AREA: Record<string, NombreDeIcono> = {
  programacion: 'area',
  bases_de_datos: 'datos',
  estructuras_de_datos: 'arbol',
  desarrollo_web: 'web',
}

export const ICONO_POR_DEFECTO: NombreDeIcono = 'area'
