import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { colorDePuesto } from './puestos'

describe('colorDePuesto', () => {
  it('un puesto conocido usa su token', () => {
    expect(colorDePuesto('backend')).toBe('var(--color-puesto-backend)')
    expect(colorDePuesto('full_stack')).toBe('var(--color-puesto-full_stack)')
  })

  it('un puesto sin token cae en un gris neutro', () => {
    expect(colorDePuesto('devops')).toBe('var(--color-vidrio-muted)')
  })

  it('cada puesto con color tiene su token declarado', () => {
    const tokens = readFileSync(fileURLToPath(new URL('../styles/tokens.css', import.meta.url)), 'utf-8')
    for (const puesto of ['backend', 'frontend', 'full_stack', 'movil', 'escritorio', 'qa', 'videojuegos']) {
      expect(tokens).toContain(`--color-puesto-${puesto}:`)
    }
  })
})
