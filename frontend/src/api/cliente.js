const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

const CLAVE_ACCESS = 'entrevistas_access'
const CLAVE_REFRESH = 'entrevistas_refresh'

// Los tokens se guardan en localStorage por simplicidad del piloto — es una
// limitación conocida (expuesta a XSS) y no la alternativa original (refresh
// en cookie httpOnly): esa opción exigiría que el backend fije una cookie
// entre dominios distintos (Vercel/Render), reintroduciendo exactamente el
// problema de SameSite/CSRF que la elección de JWT sobre sesiones buscaba
// evitar en primer lugar.

export function guardarTokens({ access, refresh }) {
  localStorage.setItem(CLAVE_ACCESS, access)
  if (refresh) localStorage.setItem(CLAVE_REFRESH, refresh)
}

export function limpiarTokens() {
  localStorage.removeItem(CLAVE_ACCESS)
  localStorage.removeItem(CLAVE_REFRESH)
}

export function haySesion() {
  return Boolean(localStorage.getItem(CLAVE_ACCESS))
}

export class ErrorAPI extends Error {
  constructor(mensaje, status, datos) {
    super(mensaje)
    this.name = 'ErrorAPI'
    this.status = status
    this.datos = datos
  }
}

function extraerMensaje(datos) {
  if (!datos) return 'Ocurrió un error inesperado.'
  if (typeof datos.detail === 'string') return datos.detail

  // Errores de validación de DRF: { campo: ["mensaje", ...], ... }
  const primerCampo = Object.keys(datos)[0]
  if (primerCampo && Array.isArray(datos[primerCampo]) && datos[primerCampo].length) {
    return datos[primerCampo][0]
  }
  return 'Ocurrió un error inesperado.'
}

async function refrescarAccess() {
  const refresh = localStorage.getItem(CLAVE_REFRESH)
  if (!refresh) return null

  const respuesta = await fetch(`${API_URL}/api/auth/token/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })
  if (!respuesta.ok) {
    limpiarTokens()
    return null
  }
  const datos = await respuesta.json()
  localStorage.setItem(CLAVE_ACCESS, datos.access)
  return datos.access
}

/**
 * Envoltorio de fetch: adjunta el token, renueva el access y reintenta una
 * vez si el servidor responde 401, y normaliza los errores en `ErrorAPI`.
 */
export async function peticion(ruta, { method = 'GET', body, autenticado = true } = {}) {
  const hacer = async (access) => {
    const headers = { 'Content-Type': 'application/json' }
    if (autenticado && access) headers.Authorization = `Bearer ${access}`

    return fetch(`${API_URL}${ruta}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
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
  let datos = null
  if (texto) {
    try {
      datos = JSON.parse(texto)
    } catch {
      datos = null
    }
  }

  if (!respuesta.ok) {
    throw new ErrorAPI(extraerMensaje(datos), respuesta.status, datos)
  }

  return datos
}
