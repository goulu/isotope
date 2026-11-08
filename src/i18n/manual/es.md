# Manual de usuario — ISOThOPE

Bienvenido a **ISOThOPE**, el juego de puzles y transmutación nuclear basado en datos científicos reales del OIEA (NUBASE / LiveChart).

## 🎯 1. Objetivo del juego

Controlas un núcleo atómico representado en el centro de la **carta de Segrè** (la tabla periódica de los físicos nucleares):
- El eje horizontal representa el **número de neutrones (`N`)**.
- El eje vertical representa el **número de protones (`Z`)**, que define el elemento químico.

En cada nivel, partes de un **isótopo inicial** y debes alcanzar un **isótopo objetivo** (marcado con un borde dorado en la cuadrícula) combinando con astucia el bombardeo de partículas y las desintegraciones radiactivas naturales.

> **Consejo:** ¡A veces deja que la naturaleza trabaje por ti! Una desintegración radiactiva natural ahorra tus valiosas partículas.

## ⚡ 2. Acciones y controles

Usa los botones situados debajo de la cuadrícula para bombardear tu núcleo antes de que se desintegre:

| Acción | Efecto en el núcleo | Movimiento en la cuadrícula | Atajo en PC |
| :--- | :--- | :--- | :--- |
| **⚛ +n** (Neutrón) | Añade 1 neutrón (`N + 1`) | **➔ Derecha** (mismo elemento, más pesado) | `N` o `→` |
| **⚡ +e⁻** (Electrón) | Captura electrónica (`Z - 1, N + 1`) | **↘ Diagonal abajo-derecha** | `E` o `↓` |
| **🔴 +p** (Protón) | Añade 1 protón (`Z + 1`) | **↑ Arriba** (elemento siguiente) | `P` o `↑` |
| **Reiniciar** | Reinicia el nivel actual | Vuelve al núcleo inicial | `R` |

## ☢️ 3. Estabilidad y desintegraciones radiactivas

Cada casilla de la cuadrícula está coloreada según el comportamiento físico real del isótopo:

- **⬛ Negro (Estable)**: El núcleo no se desintegra. El cronómetro se detiene y tienes todo el tiempo para pensar. *Atención: ¡si aterrizas en un isótopo estable que no es tu objetivo y te quedas sin partículas, pierdes la partida!*
- **🟦 Azul cielo (β⁻ — Beta menos)**: Exceso de neutrones. Un neutrón se transforma en protón (`Z + 1, N - 1` ➔ movimiento en **↖ diagonal arriba-izquierda**).
- **🟥 Rosa (β⁺ — Beta más o Captura electrónica)**: Exceso de protones. Un protón se transforma en neutrón (`Z - 1, N + 1` ➔ movimiento en **↘ diagonal abajo-derecha**).
- **🟨 Amarillo (α — Alfa)**: Núcleo pesado que expulsa una partícula alfa (`⁴He`) compuesta por 2 protones y 2 neutrones (`Z - 2, N - 2` ➔ retrocede **↙ 2 casillas abajo y 2 a la izquierda**).
- **🟧 Naranja (p — Emisión de protón)**: Núcleo extremadamente rico en protones que expulsa directamente 1 protón (`Z - 1` ➔ **↓ 1 casilla hacia abajo**).
- **🟪 Morado (n — Emisión de neutrón)**: Núcleo extremadamente rico en neutrones que expulsa directamente 1 neutrón (`N - 1` ➔ **← 1 casilla hacia la izquierda**).

## 🧭 4. Niveles y Modo Libre (Nivel 0)

- **Explicación del nivel**: Haz clic en cualquier lugar del **bloque de descripción del nivel** (situado debajo de la barra de título) para abrir el informe científico e histórico de la misión.
- **Selector de niveles**: Haz clic en el botón numerado (ej. `1/13`) a la izquierda del bloque de nivel para cambiar de misión.
- **Nivel 0 — Modo Libre (Sandbox)**: Situado en la parte superior de la lista de niveles, te ofrece partículas ilimitadas (`∞`) y te permite hacer clic directamente en cualquier casilla de la cuadrícula o del título `ISOThOPE` para explorar la carta de nucleidos.

## 📈 5. La Ley Logarítmica del Tiempo

En la naturaleza, las semividas (`T½`) de los isótopos abarcan desde microsegundos (`10⁻⁶ s`) hasta miles de millones de años (`10¹⁷ s`). Para comprimir estos 23 órdenes de magnitud en unos pocos segundos de juego respetando la jerarquía de estabilidad real de cada isótopo, **ISOThOPE** aplica una ley logarítmica:

`Tiempo_Juego = clamp(Base + Pendiente × log10(T½), Mín, Máx)`

Puedes visualizar la curva a continuación (los parámetros de desintegración se ajustan en las Opciones):
