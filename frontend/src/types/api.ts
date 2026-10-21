/** Formas de error que produce DRF, normalizadas por `extraerMensaje` en api/client.ts. */

/** Error con un único mensaje: permisos, 404, conflictos, fallos del proveedor de IA. */
interface ErrorConDetalle {
  detail: string
}

/** Error de validación de un serializer: una lista de mensajes por campo. */
export type ErrorDeValidacion = Record<string, string[]>

export type CuerpoDeError = ErrorConDetalle | ErrorDeValidacion

/** Fecha ISO 8601 con zona horaria, tal como la serializa DRF. */
export type FechaISO = string
