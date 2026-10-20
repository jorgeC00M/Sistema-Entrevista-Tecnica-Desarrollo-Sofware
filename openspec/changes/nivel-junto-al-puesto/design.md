## Context

`FormularioDeEntrevista` pinta una rejilla `grid-cols-1 sm:grid-cols-2` en este orden:
- Puesto, en `col-span-2`;
- Tecnología: un campo en `col-span-2`, o dos de media columna;
- Nivel, en `col-span-2`.

La página enfoca el primer `<select>` vacío del DOM, y eso solo coincide con el campo que falta porque el orden del DOM es el de `campoFaltante`, que hoy es puesto → tecnología → nivel.

## Goals / Non-Goals

**Goals:** Puesto | Nivel en una fila, y un solo orden para la pantalla, el aviso y el foco.

**Non-Goals:** cambiar los campos, las reglas, los textos o la convocatoria.

## Decisions

### D1. Reordenar el DOM, no solo la vista
Los campos se escriben en el orden Puesto, Nivel, Tecnología:
- Puesto y Nivel, cada uno en una columna;
- Tecnología en `sm:col-span-2`, o dos campos de una columna.

Se usa el orden del DOM y no `order-*` de CSS porque el orden de tabulación y el del lector de pantalla siguen al DOM. Si la vista y el DOM divergen, el teclado salta de forma visualmente errática (WCAG 2.4.3).

### D2. `campoFaltante` sigue el mismo orden
Pasa a ser puesto → nivel → tecnología. Así la regla de foco ("el primer `<select>` vacío es el que falta") sigue siendo cierta sin tocar la página, y la barra anuncia lo que el usuario ve primero.
- **Alternativa descartada:** mantener el orden puesto → tecnología → nivel en la lógica. El foco saltaría a Tecnología, abajo, pasando por encima de Nivel, que está vacío en la misma fila de Puesto.

### D3. Alineación
La rejilla usa `items-start`. Las etiquetas tienen la misma altura, así que los desplegables de Puesto y Nivel quedan a la misma altura. La ayuda bajo Puesto (su descripción) solo agrega alto por debajo y no desplaza el desplegable de Nivel.

## Risks / Trade-offs

- [Con Puesto vacío, Nivel queda junto a él y se puede elegir primero] → es válido: el nivel no depende del puesto, y cambiar de puesto lo conserva.
- [La descripción del puesto puede hacer más alta la columna izquierda] → con `items-start` la diferencia queda abajo, sin desalinear los controles.
