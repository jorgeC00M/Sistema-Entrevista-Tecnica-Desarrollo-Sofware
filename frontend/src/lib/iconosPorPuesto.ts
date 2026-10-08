import type { NombreDeIcono } from '@/components/ui/Icono'

/**
 * `codigo` es texto libre de una tabla (ver `types/catalogos.ts`), no una
 * unión cerrada: un puesto nuevo dado de alta en el admin no tiene por qué
 * tener entrada aquí, así que siempre cae al ícono por defecto en vez de
 * romper. Compartido entre la pantalla de selección y el carrusel de la landing.
 */
export const ICONO_POR_PUESTO: Record<string, NombreDeIcono> = {
  backend: 'datos',
  frontend: 'web',
  full_stack: 'seleccion',
}

export const ICONO_POR_DEFECTO: NombreDeIcono = 'area'
