import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

import Boton from '@/components/ui/Boton'
import Icono from '@/components/ui/Icono'

interface Props {
  children: ReactNode
  /** Qué ofrecer para salir del error. */
  recuperacion?: 'recargar' | 'volver'
}

interface Estado {
  fallo: boolean
}

/**
 * Captura los errores de render de su subárbol.
 *
 * Sin esto, cualquier excepción durante el render desmonta toda la aplicación
 * y deja la pantalla en blanco: React 19 no tiene una red por defecto y no
 * existe ningún hook equivalente, así que sigue teniendo que ser una clase.
 *
 * No sustituye al manejo de errores de red — esos ya llegan como estado a
 * través de `usePeticion` y se pintan con `Alerta`. Esto es para lo que no se
 * puede prever: un dato con una forma inesperada, un `NaN` en un cálculo de
 * gráfico, una propiedad ausente.
 */
export default class LimiteDeError extends Component<Props, Estado> {
  state: Estado = { fallo: false }

  static getDerivedStateFromError(): Estado {
    return { fallo: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // La consola es el único destino disponible: el proyecto no tiene un
    // servicio de telemetría y añadir uno queda fuera de este alcance.
    console.error('Error de render capturado:', error, info.componentStack)
  }

  render(): ReactNode {
    if (!this.state.fallo) return this.props.children

    const volver = this.props.recuperacion === 'volver'

    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error-fondo text-error-texto">
          <Icono nombre="info" />
        </span>
        <h2 className="font-serif text-headline-md font-semibold text-vidrio-ink">
          Algo salió mal al mostrar esta sección
        </h2>
        <p className="mt-2 text-sm text-vidrio-muted">
          El error no afecta a lo que ya guardaste: tus entrevistas y sus evaluaciones siguen en el
          servidor.
        </p>
        <div className="mt-5 flex justify-center">
          {volver ? (
            <Boton
              variante="vidrio"
              forma="pildora"
              onClick={() => this.setState({ fallo: false })}
            >
              Reintentar
            </Boton>
          ) : (
            <Boton variante="vidrio" forma="pildora" onClick={() => window.location.reload()}>
              Recargar la página
            </Boton>
          )}
        </div>
      </div>
    )
  }
}

/**
 * El mismo límite, pero atado a la ruta actual.
 *
 * La `key` es lo importante: un límite que ya falló se queda en su estado de
 * error para siempre, así que sin remontarlo al cambiar de ruta el usuario
 * arrastraría la pantalla de fallo por toda la aplicación. Con la `key`,
 * navegar a otra sección ya es de por sí la recuperación.
 */
export function LimiteDeErrorDeRuta({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  return (
    <LimiteDeError key={pathname} recuperacion="volver">
      {children}
    </LimiteDeError>
  )
}
