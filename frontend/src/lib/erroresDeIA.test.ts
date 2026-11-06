import { describe, expect, it } from 'vitest'

import { ErrorAPI } from '@/api/client'
import { TITULO_DE_ERROR_DE_IA, errorDeIA } from '@/lib/erroresDeIA'

const conCodigo = (codigo: string, status = 503) =>
  new ErrorAPI('detalle', status, { detail: 'detalle', codigo } as unknown as { detail: string })

describe('errorDeIA', () => {
  it.each(Object.keys(TITULO_DE_ERROR_DE_IA))('reconoce %s y le da su título', (codigo) => {
    const error = errorDeIA(conCodigo(codigo))
    expect(error?.codigo).toBe(codigo)
    expect(error?.titulo).toBe(TITULO_DE_ERROR_DE_IA[codigo as keyof typeof TITULO_DE_ERROR_DE_IA])
  })

  it('un error de la API sin código de IA no es de IA', () => {
    expect(errorDeIA(new ErrorAPI('No encontrado', 404, { detail: 'No encontrado' }))).toBeNull()
  })

  it('un código desconocido no es de IA', () => {
    expect(errorDeIA(conCodigo('otra_cosa'))).toBeNull()
  })

  it('un fallo de red (no es ErrorAPI) no es de IA', () => {
    expect(errorDeIA(new TypeError('Failed to fetch'))).toBeNull()
  })

  it('ningún título nombra a un proveedor', () => {
    for (const titulo of Object.values(TITULO_DE_ERROR_DE_IA)) {
      expect(titulo).not.toMatch(/claude|gemini|anthropic|deepseek|openrouter/i)
    }
  })
})
