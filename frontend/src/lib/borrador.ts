/**
 * Borrador de la respuesta en curso, por entrevista y pregunta.
 *
 * Vive solo en el navegador (`localStorage`, que sobrevive a cerrar la
 * pestaña) y nunca viaja al servidor. Se borra al enviar la respuesta y, todos
 * a la vez, al cerrar sesión: en un equipo compartido el siguiente usuario no
 * debe encontrar respuestas ajenas.
 *
 * Todo va en try/catch: en modo privado o con el almacenamiento bloqueado el
 * acceso lanza, y entonces la entrevista sigue igual, sin borrador.
 */

const PREFIJO = 'borrador:'

export function claveDeBorrador(idEntrevista: string | number, numero: number): string {
  return `${PREFIJO}${idEntrevista}:${numero}`
}

export function leerBorrador(clave: string, almacen: Storage = localStorage): string {
  try {
    return almacen.getItem(clave) ?? ''
  } catch {
    return ''
  }
}

/** Un texto vacío borra la clave: no se guardan borradores en blanco. */
export function guardarBorrador(clave: string, texto: string, almacen: Storage = localStorage): void {
  try {
    if (texto) almacen.setItem(clave, texto)
    else almacen.removeItem(clave)
  } catch {
    // Sin almacenamiento disponible, simplemente no hay borrador.
  }
}

export function borrarBorrador(clave: string, almacen: Storage = localStorage): void {
  guardarBorrador(clave, '', almacen)
}

export function borrarTodosLosBorradores(almacen: Storage = localStorage): void {
  try {
    const claves: string[] = []
    for (let i = 0; i < almacen.length; i++) {
      const clave = almacen.key(i)
      if (clave?.startsWith(PREFIJO)) claves.push(clave)
    }
    for (const clave of claves) almacen.removeItem(clave)
  } catch {
    // Igual que arriba.
  }
}
