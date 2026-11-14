## Context

- **El shell** (`router/RutaProtegida.tsx`) envuelve cada página en `max-w-7xl` (1280 px) sin `mx-auto`. Las páginas no se limitan solas.
- **`features/entrevista/pages/EntrevistaPage.tsx:79`** es la excepción: `flex h-[calc(100dvh-8rem)] max-w-3xl flex-col`. El `max-w-3xl` (768 px) se puso para que el chat no se estirara.
- **`components/ui/BurbujaPregunta.tsx`:** la burbuja ya se limita a sí misma con `max-w-[85%] sm:max-w-[75%]` y se alinea con `items-start` / `items-end` según el autor.
- **`ChatEntrevista.tsx` y `CampoRespuesta.tsx`** no tienen un ancho propio: ocupan el de su contenedor.

## Goals / Non-Goals

**Goals:**
- la entrevista con el mismo ancho que las demás pantallas;
- mensajes legibles en pantallas anchas.

**Non-Goals:**
- un panel lateral;
- cambiar el alto (`100dvh`);
- cambiar el celular;
- tocar textos o lógica.

## Decisions

### 1. Quitar el límite de la columna
`EntrevistaPage` deja de usar `max-w-3xl` y hereda los 1280 px del `main`. La cabecera de la entrevista (`Tarjeta`) y el campo de respuesta se estiran con él.

### 2. Limitar cada burbuja
A la burbuja se le suma `lg:max-w-prose`, que equivale a 65ch. Así queda:
- en celular, 85 % del ancho;
- desde 640 px, 75 %;
- desde 1024 px, como mucho 65 caracteres.

**Por qué 65ch y no un porcentaje:** al 75 % de 1280 px una línea tendría unos 140 caracteres, demasiado para leer. El límite tiene que estar en caracteres, no en proporción de la pantalla.

### 3. Lo que no se toca
`ChatEntrevista` y `CampoRespuesta` heredan el ancho, y «Enviar» sigue a la derecha del campo. La burbuja de la vista previa de la landing tiene su propio ancho y no cambia.

## Risks / Trade-offs

- **[Campo de respuesta muy ancho en 1440 px]** → Escribir en un campo ancho no estorba: el texto vuelve a la línea y el área de texto ya tiene alto fijo. Si en las capturas se ve mal, el campo se limita aparte, sin limitar la columna.
- **[Mucho espacio entre la burbuja de la IA y la del usuario]** → Es el patrón habitual de los chats de escritorio. Cada autor queda en su lado.

## Migration Plan

Solo clases. Para revertir, se vuelve a poner `max-w-3xl`.
