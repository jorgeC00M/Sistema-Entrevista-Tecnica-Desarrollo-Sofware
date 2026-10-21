import type { CodigoDeCriterio } from './evaluacion'

/**
 * El catálogo es dato en tiempo de ejecución, no un tipo.
 *
 * `codigo` se tipa como `string` y no como unión literal a propósito: los
 * puestos, niveles, tecnologías y áreas viven en tablas y se dan de alta desde
 * el admin. Una unión literal aquí obligaría a desplegar el frontend para
 * añadir una opción, que es justo el acoplamiento que se eliminó al normalizar
 * el catálogo.
 */
interface ElementoDeCatalogo {
  codigo: string
  nombre: string
  descripcion: string
}

export type Area = ElementoDeCatalogo
export type Nivel = ElementoDeCatalogo

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
  /** Nombre de un icono de `components/ui/Icono.tsx`; viene del catálogo. */
  icono: string
}

/**
 * Capa de una tecnología. Un puesto con capas (Full Stack) se practica con una
 * de frontend y una de backend; en los demás todas tienen la capa vacía y se
 * elige una sola. Lo decide el catálogo, no la interfaz.
 */
export type Capa = '' | 'frontend' | 'backend'

/** Una tecnología siempre pertenece a un puesto: "C# .NET" de Backend y de Escritorio son dos. */
export interface TecnologiaDePuesto {
  codigo: string
  nombre: string
  capa: Capa
  /** Rótulo con que se agrupa en pantalla ("Python" para Django); vacío si no agrupa. */
  grupo: string
}

/** El puesto con sus tecnologías, para la pantalla de selección. */
export interface PuestoConTecnologias extends Puesto {
  tecnologias: TecnologiaDePuesto[]
}

/** Respuesta de `GET /api/catalogos/puestos/`. */
export interface CatalogoDePuestos {
  puestos: PuestoConTecnologias[]
  /** `nombre` es el nivel ("Semi-Senior"); `descripcion`, su grado ("Intermedio"). */
  niveles: Nivel[]
  /** Para mostrar por nombre las áreas que cubre cada puesto. */
  areas: Area[]
  preguntas_por_entrevista: number
}

/**
 * Respuesta de `GET /api/entrevistas/ultima-configuracion/`. Cada tecnología
 * es `null` si la última entrevista no tenía o si ya no se ofrece; la segunda
 * solo existe en un puesto con capas (la de backend en Full Stack).
 */
export interface UltimaConfiguracion {
  puesto: string
  puesto_nombre: string
  nivel: string
  nivel_nombre: string
  tecnologia: string | null
  tecnologia_nombre: string | null
  segunda_tecnologia: string | null
  segunda_tecnologia_nombre: string | null
}

export interface Catalogos {
  puestos: Puesto[]
  niveles: Nivel[]
  /** Se publican aunque no se elijan: cada puesto declara las que cubre. */
  areas: Area[]
  /** Fuente única de la duración de una entrevista; el cliente no la asume. */
  preguntas_por_entrevista: number
  /** La rúbrica con la que se califica, con los mismos descriptores que lee el evaluador. */
  rubrica: Rubrica
}

interface CriterioDeRubrica {
  codigo: CodigoDeCriterio
  nombre: string
  peso: number
  /** Uno por nivel: `descriptores[n]` describe el nivel `n`. */
  descriptores: string[]
}

export interface Rubrica {
  nivel_maximo: number
  criterios: CriterioDeRubrica[]
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

/**
 * Lo que la IA detectó en una convocatoria, ya anclado al catálogo: puesto y
 * nivel son códigos activos o `null`; las tecnologías, códigos del puesto, a
 * lo sumo una por capa (dos en Full Stack).
 */
export interface PerfilDetectado {
  identificado: boolean
  puesto: string | null
  puesto_nombre: string | null
  tecnologias: string[]
  /** En el mismo orden que `tecnologias`. */
  tecnologias_nombres: string[]
  nivel: string | null
  nivel_nombre: string | null
  /** El aviso no dejaba claro el nivel y se supuso el inicial. */
  nivel_supuesto: boolean
  /** Lo que pide el aviso y orientará las preguntas. */
  requisitos: string[]
  /** Lo que pide el aviso y el simulador no evalúa. */
  fuera_de_alcance: string[]
}

/** Respuesta de `POST /api/entrevistas/convocatoria/`. */
export interface ConvocatoriaAnalizada {
  id: number
  perfil: PerfilDetectado
}
