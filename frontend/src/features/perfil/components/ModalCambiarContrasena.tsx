import { useId, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

import { cambiarContrasena } from '@/api/auth'
import { repartirErrores } from '@/api/errores'
import Alerta from '@/components/ui/Alerta'
import Boton from '@/components/ui/Boton'
import Icono from '@/components/ui/Icono'
import Modal from '@/components/ui/Modal'
import CampoAuth from '@/features/auth/components/CampoAuth'

type Campo = 'actual' | 'nueva' | 'repetida'

interface Props {
  /** Tras un cambio exitoso: la página cierra el modal y lo anuncia. */
  onCambiada: () => void
  onCancelar: () => void
  /** Adónde va el foco al cerrar tras guardar; al cancelar vuelve solo al botón. */
  focoAlCerrar: () => HTMLElement | null
}

const ETIQUETAS: Record<Campo, string> = {
  actual: 'Contraseña actual',
  nueva: 'Nueva contraseña',
  repetida: 'Repite la nueva contraseña',
}

/**
 * Cambiar la contraseña con la actual como prueba.
 *
 * Usa `Modal` y no `ModalDeConfirmacion` porque necesita un `<form>`: Enter
 * envía y los gestores de contraseñas reconocen los campos por su
 * `autoComplete`. Guardar está en el pie del modal, fuera del formulario, y
 * lo envía con el atributo `form`.
 *
 * Aquí solo se comprueba que la nueva coincida con su repetición; si es
 * suficientemente fuerte lo decide el servidor, con los mismos validadores
 * que el registro, y su mensaje se muestra junto al campo.
 */
export default function ModalCambiarContrasena({ onCambiada, onCancelar, focoAlCerrar }: Props) {
  const [valores, setValores] = useState<Record<Campo, string>>({ actual: '', nueva: '', repetida: '' })
  const [errores, setErrores] = useState<Partial<Record<Campo, string>>>({})
  const [general, setGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)
  const idFormulario = useId()

  const actualizar = (campo: Campo) => (evento: ChangeEvent<HTMLInputElement>) => {
    setValores((previos) => ({ ...previos, [campo]: evento.target.value }))
    setErrores((previos) => ({ ...previos, [campo]: undefined }))
  }

  const guardar = async (evento: FormEvent) => {
    evento.preventDefault()
    setGeneral('')
    if (valores.nueva !== valores.repetida) {
      setErrores({ repetida: 'Las contraseñas no coinciden.' })
      return
    }
    setErrores({})
    setGuardando(true)
    try {
      await cambiarContrasena({ actual: valores.actual, nueva: valores.nueva })
      onCambiada()
    } catch (err) {
      const repartidos = repartirErrores(err, 'No se pudo cambiar la contraseña.', (campo) =>
        campo === 'actual' || campo === 'nueva' ? campo : undefined,
      )
      setErrores(repartidos.porCampo)
      setGeneral(repartidos.general)
      setGuardando(false)
    }
  }

  const campo = (nombre: Campo, autoComplete: string, ayuda?: string) => (
    <div>
      <p aria-hidden="true" className="mb-1.5 text-sm font-medium text-vidrio-ink">
        {ETIQUETAS[nombre]}
      </p>
      <CampoAuth
        icono={<Icono nombre="candado" />}
        ariaLabel={ETIQUETAS[nombre]}
        type="password"
        conAlternarPassword
        autoComplete={autoComplete}
        required
        value={valores[nombre]}
        onChange={actualizar(nombre)}
        disabled={guardando}
        error={errores[nombre]}
      />
      {ayuda && !errores[nombre] && <p className="-mt-2.5 mb-3.5 text-meta text-vidrio-muted">{ayuda}</p>}
    </div>
  )

  return (
    <Modal
      titulo="Cambiar contraseña"
      onCerrar={onCancelar}
      focoAlCerrar={focoAlCerrar}
      acciones={
        <>
          <Boton variante="secundario" onClick={onCancelar} disabled={guardando}>
            Cancelar
          </Boton>
          <Boton type="submit" form={idFormulario} cargando={guardando}>
            Guardar
          </Boton>
        </>
      }
    >
      <form id={idFormulario} onSubmit={guardar}>
        {campo('actual', 'current-password')}
        {campo('nueva', 'new-password', 'Al menos 8 caracteres; que no se parezca a tus datos.')}
        {campo('repetida', 'new-password')}
        <p className="text-meta text-vidrio-muted">Al guardar cerraremos tu sesión en otros dispositivos.</p>
        {general && (
          <Alerta variante="enLinea" className="mt-3">
            {general}
          </Alerta>
        )}
      </form>
    </Modal>
  )
}
