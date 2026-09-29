## Why

El restyle de login/registro (rama `adoptar-consola-tecnica`, commit
`ede1305`) ya adoptó los tokens del proyecto y la técnica de vidrio
(`bg-white/90` + `backdrop-blur`), pero dos cosas no llegaron a igualar el
mockup de referencia (`login.html`, raíz del repo):

1. La tarjeta se ve como un rectángulo blanco claramente distinto del fondo
   (`bg-tinta-50`), en vez de fundirse con él como en el mockup — ahí la
   tarjeta y el fondo comparten la misma base de color y solo se separan
   por transparencia y desenfoque, nunca por ser dos tonos distintos.
2. Los campos de formulario (`Input.tsx`) no tienen relleno propio: son
   solo un borde transparente. En el mockup, cada campo es una "píldora"
   con su propio fondo translúcido (`rgba(255,255,255,.72)`), más opaco
   que la tarjeta — esa capa de profundidad falta hoy. Como el formulario
   de registro tiene más campos que el de login (5 contra 2), la ausencia
   se nota mucho más ahí, que es la pantalla que el usuario señaló como
   "no se parece nada" al mockup.

## What Changes

- **Fondo de página y tarjeta fundidos**: ambos parten de la misma base
  `tinta-50`; la tarjeta se distingue solo por transparencia + desenfoque +
  borde + sombra, no por un blanco fuertemente contrastante.
- **Campos con relleno translúcido**: nueva variante visual en `Input.tsx`,
  opcional (no cambia el aspecto de ningún campo existente en el resto de
  la app), que agrega un fondo tipo "chip" a los campos de login/registro.
- **Ícono propio para "Carnet de identidad"**: hoy reutiliza el mismo
  ícono que "Nombre completo" (`usuario`), lo que hace que los campos se
  vean repetidos/genéricos. Se agrega un ícono de identificación dedicado.
- **Refactor: layout compartido de tarjeta de auth**: `LoginPage.tsx` y
  `RegistroPage.tsx` duplican casi al carácter el marcado de la tarjeta
  (fondo, logo, título, divisor, botón de Google, enlace de cambio de
  vista). Se extrae a un componente compartido para que ambas pantallas no
  puedan volver a divergir visualmente por accidente — la causa raíz
  concreta del reporte "el registro no se parece en nada" a pesar de usar
  el mismo patrón que login.

No se introduce ningún endpoint, campo de formulario ni comportamiento
nuevo — es una corrección/pulido visual sobre una pantalla que ya fue
aprobada e implementada.

## Capabilities

### New Capabilities

Ninguna — no cambia comportamiento observable, solo presentación. Ver
`.openspec.yaml` (`skip_specs: true`).

### Modified Capabilities

Ninguna.

## Impact

- **Frontend**: `frontend/src/features/auth/pages/{LoginPage,RegistroPage}.tsx`
  (se reducen a usar el nuevo layout compartido), nuevo
  `frontend/src/features/auth/components/TarjetaAuth.tsx`,
  `frontend/src/components/ui/Input.tsx` (nueva variante opcional),
  `frontend/src/components/ui/Icono.tsx` (un ícono nuevo),
  `frontend/src/features/auth/components/{FormularioLogin,FormularioRegistro}.tsx`
  (usan la nueva variante de `Input` y el ícono nuevo en Carnet).
- **Backend**: sin cambios.
- **Contrato de API**: sin cambios.
- **Dependencias**: ninguna nueva.
