import type {
  DatosIniciarEntrevista,
  Entrevista,
  RespuestaEstadoEntrevista,
  RespuestaIniciarEntrevista,
  RespuestaResponder,
  RespuestaResultados,
  Veredicto,
} from '@/types/entrevista'

import type { ConvocatoriaAnalizada, UltimaConfiguracion } from '@/types/catalogos'

import { peticion } from './client'

// Estas rutas SÍ llevan barra final, a diferencia de las de auth.

export function iniciarEntrevista({
  puesto,
  nivel,
  tecnologia,
  segunda_tecnologia,
  convocatoria,
  abandonar_en_curso,
}: DatosIniciarEntrevista): Promise<RespuestaIniciarEntrevista> {
  return peticion<RespuestaIniciarEntrevista>('/api/entrevistas/', {
    method: 'POST',
    // Puesto, nivel y tecnología son obligatorios; el servidor valida además que
    // las tecnologías sean del puesto y, en Full Stack, una por capa. La segunda
    // y la convocatoria solo viajan si las hay. Con otra entrevista en curso
    // responde 409 (`entrevista_en_curso` en el cuerpo), salvo que se pida
    // abandonarla en el mismo paso.
    body: {
      puesto,
      nivel,
      tecnologia,
      ...(segunda_tecnologia ? { segunda_tecnologia } : {}),
      ...(convocatoria ? { convocatoria } : {}),
      ...(abandonar_en_curso ? { abandonar_en_curso } : {}),
    },
  })
}

// El endpoint no está paginado: devuelve el array desnudo. Si algún día se
// pagina, este tipo pasa a ser falso en silencio y `historial.find(...)`
// reventaría en tiempo de ejecución — habría que cambiarlo aquí también.
export function obtenerHistorial(signal?: AbortSignal): Promise<Entrevista[]> {
  return peticion<Entrevista[]>('/api/entrevistas/', { signal })
}

export function obtenerEstado(
  id: number | string,
  signal?: AbortSignal,
): Promise<RespuestaEstadoEntrevista> {
  return peticion<RespuestaEstadoEntrevista>(`/api/entrevistas/${id}/`, { signal })
}

/**
 * La última respuesta hace dos llamadas seguidas a la IA —la evaluación y el
 * veredicto—, así que el plazo es el doble del de cualquier otra petición.
 */
const TIEMPO_DE_RESPUESTA_MS = 90_000

export function responder(id: number | string, respuesta: string): Promise<RespuestaResponder> {
  return peticion<RespuestaResponder>(`/api/entrevistas/${id}/responder/`, {
    method: 'POST',
    body: { respuesta },
    timeoutMs: TIEMPO_DE_RESPUESTA_MS,
  })
}

/** El guardado si ya existe; si falta o falló, el servidor lo redacta ahora. */
export function pedirVeredicto(id: number | string, signal?: AbortSignal): Promise<Veredicto> {
  return peticion<Veredicto>(`/api/entrevistas/${id}/veredicto/`, {
    method: 'POST',
    signal,
    timeoutMs: TIEMPO_DE_RESPUESTA_MS,
  })
}

export function obtenerResultados(
  id: number | string,
  signal?: AbortSignal,
): Promise<RespuestaResultados> {
  return peticion<RespuestaResultados>(`/api/entrevistas/${id}/resultados/`, { signal })
}

/**
 * Puesto, tecnología y nivel de la última entrevista, o `null` si el usuario no
 * tiene ninguna: el servidor responde 204 sin cuerpo y `peticion` lo entrega
 * como `null`.
 */
export function obtenerUltimaConfiguracion(signal?: AbortSignal): Promise<UltimaConfiguracion | null> {
  return peticion<UltimaConfiguracion | null>('/api/entrevistas/ultima-configuracion/', { signal })
}

/**
 * Deja la entrevista a medias. La pantalla lo llama solo tras confirmarlo en un
 * modal; responde 409 si ya no estaba en curso.
 */
export function abandonarEntrevista(id: number | string): Promise<Entrevista> {
  return peticion<Entrevista>(`/api/entrevistas/${id}/abandonar/`, { method: 'POST' })
}

/**
 * Analiza la convocatoria pegada (`texto`) o subida (`archivo` PDF/DOCX). El
 * archivo viaja como `FormData`; `peticion` no fija el Content-Type para que el
 * navegador ponga el `boundary`. Responde 422 si no se identifica un puesto de
 * desarrollo de software y 400 si el archivo no se puede leer.
 */
export function analizarConvocatoria(entrada: { texto: string } | { archivo: File }): Promise<ConvocatoriaAnalizada> {
  let body: FormData | { texto: string }
  if ('archivo' in entrada) {
    body = new FormData()
    body.append('archivo', entrada.archivo)
  } else {
    body = { texto: entrada.texto }
  }
  return peticion<ConvocatoriaAnalizada>('/api/entrevistas/convocatoria/', { method: 'POST', body })
}
