/**
 * El catálogo es dato en tiempo de ejecución, no un tipo.
 *
 * `codigo` se tipa como `string` y no como unión literal a propósito: las áreas
 * viven en una tabla y se dan de alta desde el admin. Una unión literal aquí
 * obligaría a desplegar el frontend para añadir un área, que es justo el
 * acoplamiento que se eliminó al normalizar el catálogo.
 */
export interface ElementoDeCatalogo {
  codigo: string
  nombre: string
  descripcion: string
  orden: number
}

export type Area = ElementoDeCatalogo
export type Nivel = ElementoDeCatalogo

export interface Catalogos {
  areas: Area[]
  niveles: Nivel[]
  /** Fuente única de la duración de una entrevista; el cliente no la asume. */
  preguntas_por_entrevista: number
}

/**
 * Lo que devuelve el catálogo público que consume la landing.
 *
 * Hoy tiene la misma forma que el autenticado porque lo sirve la misma vista
 * con otro permiso. Se declara aparte para que la landing no dependa de que
 * eso siga siendo cierto: si el catálogo autenticado crece con algo que no
 * deba publicarse, solo cambia `Catalogos`.
 */
export type CatalogosPublicos = Catalogos
