import { useCallback, useEffect, useRef, useState } from 'react'

import { ErrorAPI } from '@/api/client'

interface Opciones {
  /** Cuánto tiempo se considera fresco el dato ya traído, en milisegundos. */
  vigenciaMs?: number
  /** Si es `false` no se pide nada: para cargas condicionales. */
  activo?: boolean
  /** Mensaje cuando el fallo no viene de la API con uno propio. */
  mensajeDeError?: string
}

export interface EstadoDePeticion<T> {
  datos: T | null
  cargando: boolean
  error: string
  /** Vuelve a pedir ignorando la caché. */
  recargar: () => void
}

interface Entrada {
  valor: unknown
  momento: number
}

/** Caché a nivel de módulo: vive mientras viva la pestaña. */
const cache = new Map<string, Entrada>()

const VIGENCIA_POR_DEFECTO_MS = 30_000

/** Invalida una clave concreta, o toda la caché si no se pasa ninguna. */
export function invalidarCache(clave?: string): void {
  if (clave === undefined) cache.clear()
  else cache.delete(clave)
}

/**
 * Pide datos al backend y expone el estado de esa petición.
 *
 * Reemplaza el ciclo `useEffect` + `useState` + bandera `cancelado` que
 * estaba copiado en siete sitios, y corrige dos cosas que ese patrón hacía
 * mal:
 *
 * - `cargando` es estado explícito y no `!datos && !error`. Con la forma
 *   derivada, una respuesta 200 con cuerpo vacío dejaba el spinner girando
 *   para siempre, porque nunca había ni datos ni error.
 * - La bandera `cancelado` solo ignoraba el resultado; la petición seguía
 *   viva. Aquí se aborta de verdad con `AbortSignal`, así que cambiar de
 *   pantalla deja de descargar lo que ya no se va a mostrar.
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
  const [datos, setDatos] = useState<T | null>(null)
  const [cargando, setCargando] = useState(activo)
  const [error, setError] = useState('')

  // El callback suele ser una función nueva en cada render; guardarlo en una
  // ref evita volver a pedir por ese motivo, sin obligar a cada consumidor a
  // envolverlo en useCallback.
  const pedirRef = useRef(pedir)
  pedirRef.current = pedir

  const [intento, setIntento] = useState(0)

  const recargar = useCallback(() => {
    invalidarCache(clave)
    setIntento((n) => n + 1)
  }, [clave])

  useEffect(() => {
    if (!activo) {
      setCargando(false)
      return
    }

    const enCache = cache.get(clave)
    if (enCache && Date.now() - enCache.momento < vigenciaMs) {
      setDatos(enCache.valor as T)
      setError('')
      setCargando(false)
      return
    }

    const controlador = new AbortController()
    setCargando(true)
    setError('')

    pedirRef
      .current(controlador.signal)
      .then((valor) => {
        if (controlador.signal.aborted) return
        cache.set(clave, { valor, momento: Date.now() })
        setDatos(valor)
        setCargando(false)
      })
      .catch((err: unknown) => {
        if (controlador.signal.aborted) return
        setError(
          err instanceof ErrorAPI
            ? err.message
            : (mensajeDeError ?? 'No se pudo completar la operación.'),
        )
        setCargando(false)
      })

    return () => controlador.abort()
  }, [clave, activo, vigenciaMs, intento, mensajeDeError])

  return { datos, cargando, error, recargar }
}
