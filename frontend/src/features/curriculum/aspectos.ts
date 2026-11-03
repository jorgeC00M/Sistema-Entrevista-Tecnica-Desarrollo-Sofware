import type { NombreDeIcono } from '@/components/ui/Icono'
import type { EstadoDeExperiencia, EstadoDeFiltro, EstadoDeRequisito } from '@/types/curriculum'

/** Cómo se pinta un estado: un ícono y su color. El color nunca va solo. */
export interface Aspecto {
  icono: NombreDeIcono
  clases: string
}

const ACIERTO: Aspecto = { icono: 'fortaleza', clases: 'bg-exito-texto/12 text-exito-texto' }
// El estado intermedio necesita su propio color: no es un acierto ni un fallo,
// es "lo tienes pero no lo estás aprovechando". Se usa el ámbar que el sistema ya
// reserva para lo intermedio, en vez de introducir una escala nueva.
const INTERMEDIO: Aspecto = { icono: 'mejora', clases: 'bg-progreso-fondo text-progreso-texto' }
const FALLO: Aspecto = { icono: 'cerrar', clases: 'bg-error-fondo text-error-texto' }

/**
 * Los aspectos de los requisitos en «Frente a este aviso»: los chips, el cargo
 * y las sugerencias usan los mismos colores para el mismo estado.
 */
export const ASPECTO_POR_ESTADO: Record<EstadoDeRequisito, Aspecto> = {
  demostrado: ACIERTO,
  declarado: INTERMEDIO,
  presente: ACIERTO,
  ausente: FALLO,
}

export const NOTA_DE_TECNOLOGIA: Record<EstadoDeRequisito, string> = {
  demostrado: 'demostrado en tu experiencia',
  declarado: 'solo en tu lista de habilidades',
  presente: 'aparece en tu CV',
  ausente: 'no aparece en tu CV',
}

// El cargo usa los mismos estados, pero "declarado" significa otra cosa: no está
// en la lista de habilidades, sino como titular bajo el nombre.
export const NOTA_DE_CARGO: Record<EstadoDeRequisito, string> = {
  demostrado: 'lo ejerciste en tu experiencia',
  declarado: 'lo nombras, pero no aparece en tu experiencia',
  presente: 'aparece en tu CV',
  ausente: 'no aparece en tu CV',
}

export const ASPECTO_DE_EXPERIENCIA: Record<EstadoDeExperiencia, Aspecto> = {
  cumple: ACIERTO,
  no_alcanza: FALLO,
  no_calculable: INTERMEDIO,
}

/** Lo mismo que dice cada estado de experiencia, en una palabra para el Resumen. */
export const ETIQUETA_DE_EXPERIENCIA: Record<EstadoDeExperiencia, string> = {
  cumple: 'Cumple',
  no_alcanza: 'No alcanza',
  no_calculable: 'No se puede calcular',
}

/**
 * Las preguntas de filtro. `no_aparece` va en rojo porque el reclutador filtra
 * por eso y el CV no lo dice; el texto, en cambio, nunca dice «no cumples».
 */
export const ASPECTO_DE_FILTRO: Record<EstadoDeFiltro, Aspecto> = {
  cumple: ACIERTO,
  no_verificable: INTERMEDIO,
  no_aparece: FALLO,
}

export const ETIQUETA_DE_FILTRO: Record<EstadoDeFiltro, string> = {
  cumple: 'Cumple',
  no_verificable: 'Revisa',
  no_aparece: 'No aparece en tu CV',
}
