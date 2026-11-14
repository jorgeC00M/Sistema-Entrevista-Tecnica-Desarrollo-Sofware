## Why

Al empezar una entrevista, el chat ocupa una columna de 768 px pegada a la izquierda (`max-w-3xl`). En una pantalla de 1440 px quedan unos 550 px vacíos a la derecha, mientras las demás pantallas («Simular entrevista», el reporte, el CV) usan todo el contenedor de 1280 px. La pantalla más importante del sistema parece la que menos espacio tiene.

El límite estaba para que las líneas fueran cortas y legibles. Esa legibilidad se puede conservar limitando cada mensaje en lugar de toda la columna.

## What Changes

- La pantalla de entrevista ocupa el mismo ancho que las demás pantallas: la cabecera, el historial de mensajes y el campo de respuesta.
- Cada burbuja sigue con un ancho de lectura cómodo, de unos 65 caracteres por línea en pantallas grandes. La de la IA va a la izquierda y la del usuario a la derecha.
- En celular no cambia nada, porque ya usaba todo el ancho.
- **Fuera de alcance:** un panel lateral con el reloj y el progreso, los textos y la lógica de la entrevista.

## Capabilities

### New Capabilities
- `sistema-visual`: suma el ancho de la pantalla de entrevista y de sus mensajes. Es la misma capacidad que crea `forma-suave-sin-vidrio`. Si ese cambio se archiva antes, este delta solo agrega su requisito a la spec ya creada.

### Modified Capabilities
<!-- ninguna -->

## Impact

- **Frontend, solo clases:**
  - `features/entrevista/pages/EntrevistaPage.tsx`;
  - `components/ui/BurbujaPregunta.tsx`.
- **Sin cambios** en el backend, la API ni la lógica.
