/**
 * El catálogo es dato en tiempo de ejecución, no un tipo.
 *
 * `codigo` se tipa como `string` y no como unión literal a propósito: los
 * puestos, niveles, tecnologías y áreas viven en tablas y se dan de alta desde
 * el admin. Una unión literal aquí obligaría a desplegar el frontend para
 * añadir una opción, que es justo el acoplamiento que se eliminó al normalizar
 * el catálogo.
 */
export interface ElementoDeCatalogo {
  codigo: string
  nombre: string
  descripcion: string
}

export type Area = ElementoDeCatalogo
export type Nivel = ElementoDeCatalogo
export type Tecnologia = ElementoDeCatalogo

/**
 * El rol al que se postula: lo que de verdad se elige al empezar.
 *
 * `areas` son los códigos de los temas que recorren sus preguntas. El backend
 * los calcula desde la composición del puesto; la pantalla los muestra en la
 * tarjeta para que se vea qué entra antes de empezar. Vienen como códigos
 * porque la misma respuesta ya trae el catálogo de áreas con sus nombres.
 */
export interface Puesto extends ElementoDeCatalogo {
  areas: string[]
}

export interface Catalogos {
  puestos: Puesto[]
  niveles: Nivel[]
  tecnologias: Tecnologia[]
  /** Se publican aunque no se elijan: cada puesto declara las que cubre. */
  areas: Area[]
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
