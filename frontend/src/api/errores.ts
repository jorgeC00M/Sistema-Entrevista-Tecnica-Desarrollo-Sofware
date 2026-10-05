import { ErrorAPI } from '@/api/client'
import type { ErrorDeValidacion } from '@/types/api'

/**
 * Un error de la API, repartido entre lo que va en la alerta general y lo que
 * va debajo de cada campo.
 *
 * Existe porque `ErrorAPI.mensaje` solo trae el primer mensaje del primer
 * campo que falló: suficiente para un error de permisos o un 404, pero no
 * para un formulario con varios campos — si fallan tres, el usuario solo
 * veía uno, y descolgado del campo que lo causó.
 */
export interface ErroresDeFormulario {
  /** Lo que va arriba, en la Alerta del formulario. */
  general: string
  /** Por nombre de campo del formulario, no del backend — ver `nombreDelCampo`. */
  porCampo: Record<string, string>
}

/**
 * Reparte un error de la API entre la alerta general y los campos del formulario.
 *
 * No se tocó `extraerMensaje` en `client.ts` para no cambiar el camino por el
 * que pasan todos los errores del sistema por algo que solo afecta a los
 * formularios. `ErrorAPI.datos` ya trae el cuerpo crudo de DRF; esto es el
 * primer lector que lo aprovecha.
 *
 * `nombreDelCampo` traduce la clave del backend (snake_case) al nombre que
 * usa el formulario (camelCase, o el mismo nombre). Un campo que no se puede
 * traducir **no se descarta**: su mensaje se suma a `general`, para que un
 * campo que el formulario no pinta no deje un error invisible para el
 * usuario. Es justo el tipo de fallo silencioso que este lector existe para
 * evitar — si el backend empieza a validar un campo nuevo y nadie actualiza
 * el mapa de nombres, el mensaje sigue llegando, aunque sea en el lugar
 * menos preciso.
 */
export function repartirErrores(
  err: unknown,
  mensajePorDefecto: string,
  nombreDelCampo?: (campoDelBackend: string) => string | undefined,
): ErroresDeFormulario {
  if (!(err instanceof ErrorAPI) || !err.datos) {
    return { general: mensajePorDefecto, porCampo: {} }
  }

  const datos = err.datos

  if ('detail' in datos && typeof datos.detail === 'string') {
    return { general: datos.detail, porCampo: {} }
  }

  const validacion = datos as ErrorDeValidacion
  const generales: string[] = []
  const porCampo: Record<string, string> = {}

  for (const [campo, mensajes] of Object.entries(validacion)) {
    if (!Array.isArray(mensajes) || mensajes.length === 0) continue
    const mensaje = mensajes[0]

    // La clave que DRF usa para errores que no pertenecen a ningún campo
    // concreto (p. ej. una validación cruzada en el serializer).
    if (campo === 'non_field_errors') {
      generales.push(mensaje)
      continue
    }

    const campoDelFormulario = nombreDelCampo?.(campo) ?? (nombreDelCampo ? undefined : campo)
    if (campoDelFormulario) {
      porCampo[campoDelFormulario] = mensaje
    } else {
      // Sin traducción: no se pierde, se acumula en general.
      generales.push(mensaje)
    }
  }

  return {
    general: generales.length > 0 ? generales.join(' ') : '',
    porCampo,
  }
}
