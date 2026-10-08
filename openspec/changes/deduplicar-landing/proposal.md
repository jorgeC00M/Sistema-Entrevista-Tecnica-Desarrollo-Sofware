## Why

`actualizar-landing-funcionalidades` eliminó código muerto (`CarruselAreas`,
`AreasTecnicas`, `ICONO_POR_AREA`, `PUNTOS_MAXIMOS`) y generalizó el carrusel,
pero una revisión posterior encontró duplicación que ese mismo cambio introdujo o
dejó en pie. Con cada sección nueva de la landing, esa duplicación crece: el
mismo marcado escrito tres veces diverge en el primer ajuste de estilo.

## What Changes

Refactor sin cambio de comportamiento ni de aspecto:

- **Tarjeta "icono + título + texto"** escrita a mano en `QueRecibes` (dos
  veces sueltas y una en un `map`) y copiada en `RevisaTuCV` → componente
  `TarjetaDeFuncion`.
- **Nota aclaratoria con icono de info**, copiada de `QueRecibes` a
  `RevisaTuCV` → componente `NotaAclaratoria`.
- **Mapa código → nombre de área**, duplicado en `PuestosDisponibles` y
  `SeleccionPuestoPage` → función `nombresDeAreas()` en `lib/`.
- **Par de botones "Crear cuenta / Ya tengo cuenta"**, duplicado en `Hero` y
  `CierreCTA` → componente `AccionesDeRegistro`.
- **Docstring desactualizado** de `EncabezadoSeccion` (menciona la sección
  "Áreas", que ya no existe).

## Capabilities

### New Capabilities

### Modified Capabilities

(Ninguna: refactor puro. `.openspec.yaml` declara `skip_specs: true`.)

## Impact

- `frontend/src/features/landing/` (secciones Hero, CierreCTA, QueRecibes,
  RevisaTuCV, PuestosDisponibles; componentes nuevos), `frontend/src/lib/`,
  `features/seleccion/pages/SeleccionPuestoPage.tsx`.
- Sin cambios de backend, de API ni de aspecto visual.
