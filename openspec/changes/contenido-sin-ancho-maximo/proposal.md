## Why

Todas las pantallas autenticadas comparten un contenedor de hasta 1280 px (`max-w-7xl`). Con el sidebar abierto, en una pantalla de 1440 px quedan 1120 px útiles y el contenido los llena. Al plegar el sidebar quedan 1368 px, pero el contenido se detiene en 1280 y deja una franja vacía a la derecha: unos 88 px en 1440 px y unos 550 px en 1920 px. Jorge lo notó en el chat, aunque pasa en todas las pantallas.

## What Changes

- El contenido de las pantallas autenticadas llena siempre el ancho que deja el sidebar, esté abierto, plegado o sea un cajón en celular, menos los márgenes laterales actuales (16, 24 o 32 px según el ancho).
- Lo que no debe estirarse conserva su propio límite: las burbujas del chat (unos 65 caracteres) y los párrafos de introducción (`max-w-prose`).
- **Fuera de alcance:** centrar el contenido, cambiar los márgenes, la landing y el login.

## Capabilities

### New Capabilities
- `sistema-visual`: suma el requisito del ancho del contenido. Es la misma capacidad que crean `forma-suave-sin-vidrio` y `chat-a-ancho-completo`. El que se archive primero la crea y los demás le agregan su requisito.

### Modified Capabilities
<!-- ninguna -->

## Impact

- **Frontend:** `router/RutaProtegida.tsx`, en el contenedor del `main` y su comentario.
- **Riesgo:** en monitores muy anchos (más de 1920 px), las rejillas de varias columnas (Inicio, Resumen del CV, reporte) se ensanchan. Se revisan con capturas.
- **Sin cambios** en el backend, la API ni la lógica.
