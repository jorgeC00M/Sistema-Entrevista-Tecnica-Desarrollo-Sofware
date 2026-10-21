/**
 * Un texto listo para compararlo en una búsqueda: minúsculas, sin tildes ni
 * diéresis y sin espacios en los extremos. Así «Móvil», «movil» y «MOVIL»
 * encuentran lo mismo, que es lo que cualquiera espera al escribir rápido.
 */
export function normalizarParaBuscar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}
