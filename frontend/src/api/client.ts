import type { CuerpoDeError } from '@/types/api'
import type { ParDeTokens } from '@/types/usuario'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

const CLAVE_ACCESS = 'entrevistas_access'
const CLAVE_REFRESH = 'entrevistas_refresh'

// Los tokens se guardan en localStorage por simplicidad del piloto — es una
// limitación conocida (expuesta a XSS) y no la alternativa original (refresh
// en cookie httpOnly): esa opción exigiría que el backend fije una cookie
// entre dominios distintos (Vercel/Render), reintroduciendo exactamente el
// problema de SameSite/CSRF que la elección de JWT sobre sesiones buscaba
// evitar en primer lugar.

export function guardarTokens({ access, refresh }: Partial<ParDeTokens>): void {
  if (access) localStorage.setItem(CLAVE_ACCESS, access)
  if (refresh) localStorage.setItem(CLAVE_REFRESH, refresh)
}

export function limpiarTokens(): void {
  localStorage.removeItem(CLAVE_ACCESS)
  localStorage.removeItem(CLAVE_REFRESH)
}

export function haySesion(): boolean {
  return Boolean(localStorage.getItem(CLAVE_ACCESS))
}

export class ErrorAPI extends Error {
  readonly status: number
  readonly datos: CuerpoDeError | null

  constructor(mensaje: string, status: number, datos: CuerpoDeError | null) {
    super(mensaje)
    this.name = 'ErrorAPI'
    this.status = status
    this.datos = datos
  }
}

function extraerMensaje(datos: CuerpoDeError | null): string {
  if (!datos) return 'Ocurrió un error inesperado.'
  if ('detail' in datos && typeof datos.detail === 'string') return datos.detail

  // Errores de validación de DRF: { campo: ["mensaje", ...], ... }
  const primerCampo = Object.keys(datos)[0]
  if (primerCampo) {
    const valor = (datos as Record<string, unknown>)[primerCampo]
    if (Array.isArray(valor) && valor.length > 0 && typeof valor[0] === 'string') {
      return valor[0]
    }
  }
  return 'Ocurrió un error inesperado.'
}

type EscuchaDeSesion = () => void

let alPerderSesionCallback: EscuchaDeSesion | null = null

/**
 * Registra a quién avisar cuando la sesión deja de ser válida.
 *
 * `client.ts` no puede importar el contexto de autenticación sin crear un
 * ciclo, así que el proveedor se registra aquí al montarse. Sin este canal,
 * al fallar el refresh se borraban los tokens pero nadie actualizaba el
 * estado: el usuario se quedaba en el dashboard viendo errores en cada panel
 * hasta que recargaba a mano.
 */
export function alPerderSesion(callback: EscuchaDeSesion | null): void {
  alPerderSesionCallback = callback
}

/** Refresco en vuelo, para que dos 401 simultáneos no disparen dos refrescos. */
let refrescoEnVuelo: Promise<string | null> | null = null

async function pedirRefresco(): Promise<string | null> {
  const refresh = localStorage.getItem(CLAVE_REFRESH)
  if (!refresh) return null

  const respuesta = await fetch(`${API_URL}/api/auth/token/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })
  if (!respuesta.ok) {
    limpiarTokens()
    alPerderSesionCallback?.()
    return null
  }
  const datos = (await respuesta.json()) as { access?: string }
  if (!datos.access) {
    // Un cuerpo sin `access` dejaría "Bearer undefined" en cada petición
    // siguiente; es más honesto tratarlo como sesión perdida.
    limpiarTokens()
    alPerderSesionCallback?.()
    return null
  }
  localStorage.setItem(CLAVE_ACCESS, datos.access)
  return datos.access
}

async function refrescarAccess(): Promise<string | null> {
  // Varias peticiones en paralelo pueden recibir 401 a la vez (el historial
  // pide dos endpoints con Promise.all). Sin esta compartición, la segunda
  // llamada usaría un refresh ya consumido y cerraría la sesión sin motivo.
  refrescoEnVuelo ??= pedirRefresco().finally(() => {
    refrescoEnVuelo = null
  })
  return refrescoEnVuelo
}

interface OpcionesPeticion {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  autenticado?: boolean
  /** Para cancelar desde fuera (cambio de pantalla, por ejemplo). */
  signal?: AbortSignal
  /** Tope propio, además del que traiga `signal`. */
  timeoutMs?: number
}

/**
 * Evaluar una respuesta implica una llamada a un modelo de lenguaje, que
 * puede tardar bastante; el resto de endpoints responde de inmediato. El tope
 * es generoso a propósito: sin ninguno, una petición colgada deja la interfaz
 * en "Evaluando…" para siempre.
 */
const TIMEOUT_POR_DEFECTO_MS = 45_000

/**
 * Envoltorio de fetch: adjunta el token, renueva el access y reintenta una
 * vez si el servidor responde 401, y normaliza los errores en `ErrorAPI`.
 *
 * `T` es una aserción, no una validación: describe lo que el backend promete
 * devolver, no lo que devolvió. El contrato lo sostienen los tests del backend.
 */
export async function peticion<T>(
  ruta: string,
  {
    method = 'GET',
    body,
    autenticado = true,
    signal,
    timeoutMs = TIMEOUT_POR_DEFECTO_MS,
  }: OpcionesPeticion = {},
): Promise<T> {
  // El timeout propio se combina con el `signal` del llamador: aborta el
  // primero que se dispare.
  const porTiempo = AbortSignal.timeout(timeoutMs)
  const señal = signal ? AbortSignal.any([signal, porTiempo]) : porTiempo

  // Un `FormData` (subir el currículum) viaja como multipart y **no** se
  // serializa ni lleva Content-Type propio: el navegador tiene que fijarlo él
  // para incluir el `boundary`, y ponerlo a mano rompe el parseo en el
  // servidor. Se gestiona aquí, dentro del envoltorio, para no duplicar la
  // lógica de token, refresco y timeout en una segunda función de subida.
  const esFormulario = body instanceof FormData

  const hacer = async (access: string | null): Promise<Response> => {
    const headers: Record<string, string> = {}
    if (!esFormulario) headers['Content-Type'] = 'application/json'
    if (autenticado && access) headers.Authorization = `Bearer ${access}`

    let cuerpo: BodyInit | undefined
    if (esFormulario) cuerpo = body
    else if (body !== undefined) cuerpo = JSON.stringify(body)

    return fetch(`${API_URL}${ruta}`, {
      method,
      headers,
      body: cuerpo,
      signal: señal,
    })
  }

  let access = localStorage.getItem(CLAVE_ACCESS)
  let respuesta = await hacer(access)

  if (respuesta.status === 401 && autenticado) {
    access = await refrescarAccess()
    if (access) {
      respuesta = await hacer(access)
    }
  }

  const texto = await respuesta.text()
  let datos: CuerpoDeError | null = null
  if (texto) {
    try {
      datos = JSON.parse(texto) as CuerpoDeError
    } catch {
      datos = null
    }
  }

  if (!respuesta.ok) {
    throw new ErrorAPI(extraerMensaje(datos), respuesta.status, datos)
  }

  return datos as T
}
