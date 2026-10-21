/** Puestos con color propio en `styles/tokens.css` (`--color-puesto-<codigo>`). */
const CON_COLOR = new Set(['backend', 'frontend', 'full_stack', 'movil', 'escritorio', 'qa', 'videojuegos'])

/**
 * El color fijo de un puesto, como referencia a su token: el mismo en todas las
 * tarjetas y con cualquier filtro, para que la asociación se aprenda una vez.
 * Los atributos `fill`/`stroke` de un SVG no aceptan clases, por eso se
 * devuelve la variable y no una clase. Un puesto nuevo sin token cae en un
 * gris neutro en lugar de quedar invisible.
 */
export function colorDePuesto(codigo: string): string {
  return CON_COLOR.has(codigo) ? `var(--color-puesto-${codigo})` : 'var(--color-vidrio-muted)'
}
