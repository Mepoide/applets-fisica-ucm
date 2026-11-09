# Transformaciones del panadero y de Arnold

## Qué se observa

Una figura (la cara de un gato, un círculo o una nube de puntos) en el cuadrado unidad, que es nuestro espacio de fases. Cada iteración aplica una transformación que **conserva el área**: la del panadero estira la figura al doble en $x$, la aplasta a la mitad en $y$ y apila la mitad derecha sobre la izquierda; la del gato de Arnold la deforma linealmente y la envuelve en el toro. Tras unas pocas iteraciones la figura es irreconocible y los puntos cubren el cuadrado uniformemente: la gráfica de la derecha mide esa uniformidad. Tras muchas más, la aritmética finita del ordenador hace que los puntos colapsen.

## Modelo físico

Son los modelos más sencillos de dinámica **ergódica y mezclante** en un espacio de fases. La transformación del panadero,

$$x' = 2x \bmod 1,\qquad y' = \tfrac12\big(y + \lfloor 2x\rfloor\big),$$

y el automorfismo toral de Arnold,

$$\begin{pmatrix} x' \\ y' \end{pmatrix} = T\begin{pmatrix} x \\ y \end{pmatrix} \bmod 1,\qquad T = \begin{pmatrix} t_{11} & t_{12} \\ t_{21} & t_{22}\end{pmatrix},\quad \det T = 1,$$

tienen jacobiano unidad (teorema de Liouville: el volumen del espacio de fases se conserva) y, si los autovalores de $T$ son reales y distintos de 1, una dirección que se estira en un factor $\lambda_+ > 1$ y otra que se contrae en $\lambda_- = 1/\lambda_+$. El estiramiento y plegado repetido es el mecanismo del **mixing**: cualquier región acaba repartida uniformemente, y la entropía de Kolmogorov–Sinai, $h_{KS} = \ln\lambda_+$ ($\ln 2$ para el panadero, $\ln\tfrac{3+\sqrt5}{2} \approx 0.96$ para el gato clásico), mide a qué ritmo se pierde la información sobre la condición inicial. Con elementos enteros y $\det T = 1$ el mapa es una biyección del toro; otras matrices (autovalores complejos, por ejemplo $t_{11} = 0$) rotan sin mezclar.

El colapso tras ~50 iteraciones no es física: los números de coma flotante de 53 bits forman un conjunto finito y el gato de Arnold, como aplicación entera, acaba enviando todos los puntos representables a órbitas periódicas cortas y al origen.

## Algoritmo

Puntos de doble precisión; la cara de gato se genera por rechazo dentro de un disco con orejas, ojos y boca. Uniformidad: $\chi^2/{\rm dof}$ de las cuentas en una rejilla $10\times10$ frente a $n/100$. Para el gato, el cuarto elemento $t_{22} = (1 + t_{12}t_{21})/t_{11}$ se fija con $\det T = 1$.

## Preguntas

1. Dibuja un cuadrado pequeño de puntos y aplica la transformación del panadero paso a paso: ¿cuántas iteraciones tarda en llenar el cuadrado de forma uniforme? ¿Depende del tamaño inicial?
2. La transformación es biyectiva y conserva el área. ¿Cómo es posible entonces que una mancha compacta termine repartida por todas partes? ¿Qué diferencia hay entre mezcla y pérdida de información?
3. Invierte la transformación tras unas iteraciones con una pequeña perturbación: ¿se recupera la mancha inicial? Relaciónalo con el exponente de Lyapunov.

## Cambios respecto al applet original

| Original (`BakerApplet`, `ArnoldApplet`, 2002) | Aquí | Motivo |
|---|---|---|
| Dos applets, iteración manual con botón | Un experimento con las dos transformaciones, iteración manual o automática | Comparar con la misma figura |
| Sin medida de la uniformidad ni de los autovalores | $\chi^2$ en vivo, $\lambda_\pm$ y $h_{KS}$ en el panel | Cuantificar "mezclante" |

## Pruebas

`tests/fises1.test.js`: una nube uniforme sigue uniforme bajo el panadero ($\chi^2/{\rm dof} < 1.6$); la matriz de Arnold completada es $[[1,1],[1,2]]$ con $\lambda_+ = (3+\sqrt5)/2$; un disco de radio 0.3 acaba con la fracción $\pi r^2$ de puntos dentro de su contorno inicial tras 12 iteraciones del gato; el panadero mapea $(1/4,1/2) \to (1/2,1/4)$ exactamente.

## Evaluación didáctica

Visualiza Liouville, ergodicidad, mixing y sensibilidad a condiciones iniciales en segundos, y de regalo un ejemplo real de artefacto numérico. Fuente: curso *Experimentos Interactivos* (UCM), experimento 3 de Física Estadística, R. Brito; J. R. Dorfman, *An Introduction to Chaos in Nonequilibrium Statistical Mechanics* (1999).
