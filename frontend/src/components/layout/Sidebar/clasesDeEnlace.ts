/**
 * Las clases de un enlace del sidebar según su estado: activo con relleno
 * translúcido, hover más tenue y el anillo claro (el de acento no se ve sobre
 * la tinta). Las usan los destinos y el bloque de usuario, para que "estoy
 * aquí" se vea igual en todo el sidebar.
 */
export function clasesDeEnlace(activo: boolean): string {
  return [
    'group flex items-center rounded-control transition-colors duration-150 foco-claro',
    activo ? 'bg-white/[0.12] text-white' : 'text-vidrio-sidebar-muted hover:bg-white/[0.08] hover:text-white',
  ].join(' ')
}
