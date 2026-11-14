import { describe, expect, it } from 'vitest'

import {
  borrarBorrador,
  borrarTodosLosBorradores,
  claveDeBorrador,
  guardarBorrador,
  leerBorrador,
} from '@/lib/borrador'

/** Un `Storage` en memoria: los tests no dependen de un DOM. */
function almacenEnMemoria(): Storage {
  const datos = new Map<string, string>()
  return {
    get length() {
      return datos.size
    },
    clear: () => datos.clear(),
    getItem: (clave) => datos.get(clave) ?? null,
    key: (i) => [...datos.keys()][i] ?? null,
    removeItem: (clave) => void datos.delete(clave),
    setItem: (clave, valor) => void datos.set(clave, valor),
  }
}

/** Un `Storage` que lanza en todo, como en modo privado o bloqueado. */
const almacenQueFalla = new Proxy({} as Storage, {
  get() {
    throw new Error('almacenamiento no disponible')
  },
})

describe('borrador', () => {
  it('arma la clave con la entrevista y la pregunta', () => {
    expect(claveDeBorrador(42, 3)).toBe('borrador:42:3')
  })

  it('guarda y lee el texto', () => {
    const almacen = almacenEnMemoria()
    guardarBorrador('borrador:1:1', 'Una pila es LIFO', almacen)
    expect(leerBorrador('borrador:1:1', almacen)).toBe('Una pila es LIFO')
  })

  it('un texto vacío borra la clave', () => {
    const almacen = almacenEnMemoria()
    guardarBorrador('borrador:1:1', 'algo', almacen)
    guardarBorrador('borrador:1:1', '', almacen)
    expect(almacen.getItem('borrador:1:1')).toBeNull()
  })

  it('borrarBorrador quita solo esa pregunta', () => {
    const almacen = almacenEnMemoria()
    guardarBorrador('borrador:1:1', 'a', almacen)
    guardarBorrador('borrador:1:2', 'b', almacen)
    borrarBorrador('borrador:1:1', almacen)
    expect(leerBorrador('borrador:1:1', almacen)).toBe('')
    expect(leerBorrador('borrador:1:2', almacen)).toBe('b')
  })

  it('borra todos los borradores y deja las demás claves', () => {
    const almacen = almacenEnMemoria()
    guardarBorrador('borrador:1:1', 'a', almacen)
    guardarBorrador('borrador:2:4', 'b', almacen)
    almacen.setItem('entrevistas_access', 'token')
    borrarTodosLosBorradores(almacen)
    expect(almacen.length).toBe(1)
    expect(almacen.getItem('entrevistas_access')).toBe('token')
  })

  it('sin almacenamiento disponible se comporta como vacío', () => {
    expect(leerBorrador('borrador:1:1', almacenQueFalla)).toBe('')
    expect(() => guardarBorrador('borrador:1:1', 'a', almacenQueFalla)).not.toThrow()
    expect(() => borrarTodosLosBorradores(almacenQueFalla)).not.toThrow()
  })
})
