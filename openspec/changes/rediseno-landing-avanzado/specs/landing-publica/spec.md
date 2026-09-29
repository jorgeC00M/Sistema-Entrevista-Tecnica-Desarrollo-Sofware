## ADDED Requirements

### Requirement: Las áreas técnicas se exploran mediante un carrusel navegable

La presentación SHALL ofrecer las áreas técnicas en un carrusel que el
visitante puede recorrer de varias formas, en vez de una lista estática
completa. El carrusel MUST seguir mostrando únicamente las áreas y niveles
reales que expone el catálogo público — no debe incluir áreas de ejemplo ni
inventadas.

#### Scenario: Avance automático

- **WHEN** el visitante llega a la sección de áreas y no interactúa
- **THEN** el carrusel avanza solo a un ritmo constante hasta volver a la
  primera área tras recorrer todas

#### Scenario: Navegación manual

- **WHEN** el visitante usa las flechas o los indicadores del carrusel
- **THEN** el carrusel se mueve al grupo de áreas correspondiente
- **AND** el avance automático se reinicia desde ese punto

#### Scenario: Pausa al interactuar

- **WHEN** el puntero del visitante está sobre el carrusel
- **THEN** el avance automático se detiene
- **AND** se reanuda al retirar el puntero

#### Scenario: Deslizamiento táctil

- **WHEN** el visitante desliza el dedo sobre el carrusel en una pantalla
  táctil
- **THEN** el carrusel avanza o retrocede un grupo según la dirección del
  gesto

#### Scenario: Cantidad de áreas visibles según el ancho

- **WHEN** el visitante abre la sección de áreas
- **THEN** ve tres áreas a la vez en una pantalla de escritorio, dos en una
  tableta y una en un teléfono

#### Scenario: Solo áreas reales

- **WHEN** el catálogo público expone un número de áreas menor al usado como
  referencia visual del carrusel
- **THEN** el carrusel muestra exactamente esas áreas, sin rellenar con
  áreas de ejemplo ni de otro origen

### Requirement: Las animaciones respetan la preferencia de movimiento reducido

Toda animación introducida en la presentación (contadores, barras de
progreso, el carrusel de áreas, la vista previa animada del hero, la
aparición progresiva de contenido al hacer scroll) SHALL desactivarse o
mostrar directamente su estado final cuando el visitante tiene activada la
preferencia de sistema de movimiento reducido.

#### Scenario: Visitante con movimiento reducido activado

- **WHEN** un visitante con `prefers-reduced-motion: reduce` activado abre
  la presentación
- **THEN** los contadores, barras y medidores muestran directamente su valor
  final sin animar la transición
- **AND** el carrusel de áreas no avanza automáticamente por sí solo
- **AND** el contenido de cada sección aparece ya visible, sin efecto de
  aparición al hacer scroll
