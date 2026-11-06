import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { ErrorAPI } from '@/api/client'

interface Opciones {
  /** Cuánto tiempo se considera fresco el dato ya traído, en milisegundos. */
  vigenciaMs?: number
  /** Si es `false` no se pide nada: para cargas condicionales. */
  activo?: boolean
  /** Mensaje cuando el fallo no viene de la API con uno propio. */
  mensajeDeError?: string
}

interface EstadoDePeticion<T> {
  datos: T | null
  cargando: boolean
  error: string
  /**
   * `performance.now()` de cuando el dato llegó del servidor (no de cuando se
   * leyó de la caché); `null` sin dato. Lo usa el reloj de la entrevista: una
   * hora del servidor que viene de la caché ya envejeció.
   */
  recibidoEn: number | null
  /** Vuelve a pedir ignorando la caché. */
  recargar: () => void
}

interface Entrada {
  valor: unknown
  momento: number
  recibidoEn: number
  /** `momento` más la vigencia con que se guardó: pasado esto se recorta. */
  vence: number
}

interface Llegada<T> {
  valor: T
  recibidoEn: number
}

interface PeticionEnCurso {
  promesa: Promise<Llegada<unknown>>
  controlador: AbortController
  suscriptores: number
}

/** Caché a nivel de módulo: vive mientras viva la pestaña. */
const cache = new Map<string, Entrada>()

/**
 * Las peticiones en vuelo, por clave. El sidebar y la pantalla piden el
 * `historial` a la vez al entrar: sin esto salían dos peticiones iguales.
 */
const enCurso = new Map<string, PeticionEnCurso>()

const VIGENCIA_POR_DEFECTO_MS = 30_000

/**
 * Las instancias montadas de cada clave, para avisarles cuando su dato cambió.
 * Sin esto, borrar la caché no le llegaba a quien ya tenía el dato en su
 * estado: el sidebar se quedaba con el historial de cuando se cargó la sesión.
 */
const oyentes = new Map<string, Set<() => void>>()

/** Si una entrada de la caché sigue sirviendo para quien la lee con `vigenciaMs`. */
export function estaVigente(entrada: Pick<Entrada, 'momento'>, ahora: number, vigenciaMs: number): boolean {
  return ahora - entrada.momento < vigenciaMs
}

/** Quita de la caché lo que ya venció: sin esto, `curriculum-<id>` se acumulaba sin fin. */
export function recortarVencidas(entradas: Map<string, Pick<Entrada, 'vence'>>, ahora: number): void {
  for (const [clave, entrada] of entradas) {
    if (entrada.vence <= ahora) entradas.delete(clave)
  }
}

/**
 * Se suma a la petición en curso de `clave` o la empieza. `soltar` se retira;
 * cuando se retira el último interesado, la petición se aborta de verdad.
 * Guarda el resultado en la caché una sola vez, la reciba quien la reciba.
 */
export function suscribirPeticion<T>(
  clave: string,
  pedir: (signal: AbortSignal) => Promise<T>,
  vigenciaMs: number,
): { promesa: Promise<Llegada<T>>; soltar: () => void } {
  let peticion = enCurso.get(clave)
  if (!peticion) {
    const controlador = new AbortController()
    const nueva: PeticionEnCurso = {
      controlador,
      suscriptores: 0,
      promesa: pedir(controlador.signal)
        .then((valor) => {
          const llegada = performance.now()
          const momento = Date.now()
          recortarVencidas(cache, momento)
          cache.set(clave, { valor, momento, recibidoEn: llegada, vence: momento + vigenciaMs })
          return { valor: valor as unknown, recibidoEn: llegada }
        })
        .finally(() => {
          if (enCurso.get(clave) === nueva) enCurso.delete(clave)
        }),
    }
    enCurso.set(clave, nueva)
    peticion = nueva
  }

  const propia = peticion
  propia.suscriptores += 1
  let suelta = false
  return {
    promesa: propia.promesa as Promise<Llegada<T>>,
    soltar: () => {
      if (suelta) return
      suelta = true
      propia.suscriptores -= 1
      if (propia.suscriptores === 0) {
        propia.controlador.abort()
        if (enCurso.get(clave) === propia) enCurso.delete(clave)
      }
    },
  }
}

/**
 * Invalida una clave concreta y avisa a las pantallas montadas con ella, que
 * vuelven a pedirla. Sin clave (al cerrar sesión) borra toda la caché sin
 * avisar: no tiene sentido pedir nada mientras la sesión se cierra.
 */
export function invalidarCache(clave?: string): void {
  if (clave === undefined) {
    cache.clear()
    return
  }
  cache.delete(clave)
  // Una petición que salió antes de invalidar trae el dato viejo: quien vuelva
  // a pedir empieza otra. La vieja se aborta sola cuando la sueltan todos.
  enCurso.delete(clave)
  oyentes.get(clave)?.forEach((avisar) => avisar())
}

/** Todo el estado de una petición, atado a la clave a la que pertenece. */
interface EstadoDeClave<T> {
  clave: string
  datos: T | null
  recibidoEn: number | null
  cargando: boolean
  error: string
}

/**
 * Pide datos al backend y expone el estado de esa petición.
 *
 * Reemplaza el ciclo `useEffect` + `useState` + bandera `cancelado` que
 * estaba copiado en siete sitios, y corrige lo que ese patrón hacía mal:
 *
 * - `cargando` es estado explícito y no `!datos && !error`. Con la forma
 *   derivada, una respuesta 200 con cuerpo vacío dejaba el spinner girando
 *   para siempre, porque nunca había ni datos ni error.
 * - Se aborta de verdad con `AbortSignal`, así que cambiar de pantalla deja de
 *   descargar lo que ya no se va a mostrar; si otra pantalla montada espera la
 *   misma clave, la petición se comparte y no se aborta hasta que la suelten
 *   todas (`suscribirPeticion`).
 * - Los datos van atados a su clave: al cambiar de clave no se ve, ni un
 *   instante, el dato de la anterior.
 *
 * La caché es corta y por clave, no permanente: basta para que navegar entre
 * secciones no vuelva a pedir lo mismo, sin llegar a ocultar un área dada de
 * baja desde el admin más allá de unos segundos.
 */
export function usePeticion<T>(
  clave: string,
  pedir: (signal: AbortSignal) => Promise<T>,
  { vigenciaMs = VIGENCIA_POR_DEFECTO_MS, activo = true, mensajeDeError }: Opciones = {},
): EstadoDePeticion<T> {
  const [estado, setEstado] = useState<EstadoDeClave<T>>({
    clave,
    datos: null,
    recibidoEn: null,
    cargando: activo,
    error: '',
  })

  // El callback suele ser una función nueva en cada render; guardarlo en una
  // ref evita volver a pedir por ese motivo, sin obligar a cada consumidor a
  // envolverlo en useCallback. Se actualiza tras el render, no durante.
  const pedirRef = useRef(pedir)
  useLayoutEffect(() => {
    pedirRef.current = pedir
  })

  const [intento, setIntento] = useState(0)

  // Esta instancia también se suscribe: recargar es invalidar su clave.
  const recargar = useCallback(() => invalidarCache(clave), [clave])

  useEffect(() => {
    const avisar = () => setIntento((n) => n + 1)
    const deLaClave = oyentes.get(clave) ?? new Set()
    deLaClave.add(avisar)
    oyentes.set(clave, deLaClave)
    return () => {
      deLaClave.delete(avisar)
      if (deLaClave.size === 0) oyentes.delete(clave)
    }
  }, [clave])

  useEffect(() => {
    if (!activo) {
      setEstado((previo) => ({ ...previo, clave, cargando: false }))
      return
    }

    const enCache = cache.get(clave)
    if (enCache && estaVigente(enCache, Date.now(), vigenciaMs)) {
      setEstado({ clave, datos: enCache.valor as T, recibidoEn: enCache.recibidoEn, cargando: false, error: '' })
      return
    }

    let vigente = true
    // Una recarga de la misma clave conserva el dato mientras llega el nuevo;
    // otra clave empieza vacía.
    setEstado((previo) =>
      previo.clave === clave
        ? { ...previo, cargando: true, error: '' }
        : { clave, datos: null, recibidoEn: null, cargando: true, error: '' },
    )

    const { promesa, soltar } = suscribirPeticion(clave, (signal) => pedirRef.current(signal), vigenciaMs)
    promesa
      .then(({ valor, recibidoEn }) => {
        if (!vigente) return
        setEstado({ clave, datos: valor, recibidoEn, cargando: false, error: '' })
      })
      .catch((err: unknown) => {
        if (!vigente) return
        const mensaje =
          err instanceof ErrorAPI ? err.message : (mensajeDeError ?? 'No se pudo completar la operación.')
        setEstado((previo) => ({ ...previo, clave, cargando: false, error: mensaje }))
      })

    return () => {
      vigente = false
      soltar()
    }
  }, [clave, activo, vigenciaMs, intento, mensajeDeError])

  // Recién cambiada la clave, antes de que el efecto la pida, no se muestra
  // nada de la anterior: ni sus datos ni su error.
  if (estado.clave !== clave) {
    return { datos: null, cargando: activo, error: '', recibidoEn: null, recargar }
  }
  return {
    datos: estado.datos,
    cargando: estado.cargando,
    error: estado.error,
    recibidoEn: estado.recibidoEn,
    recargar,
  }
}
