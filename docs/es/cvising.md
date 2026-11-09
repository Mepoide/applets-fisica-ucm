# Dimensionalidad y límite termodinámico en el modelo de Ising

## Qué se observa

El calor específico exacto del modelo de Ising en redes finitas $N_x\times N_y$ con condiciones periódicas, calculado punto a punto por matriz de transferencia, frente a dos curvas analíticas: la cadena unidimensional infinita (suave) y la red bidimensional infinita de Onsager (divergente en $T_c$). Cambiando $N_x$ y $N_y$ se pasa de un comportamiento unidimensional a uno bidimensional, y se ve que el máximo de $c$ crece y se acerca a $T_c$ pero nunca diverge mientras la red sea finita.

## Modelo físico

El hamiltoniano es $H = -J\sum_{\langle ij\rangle} s_i s_j$ con $s_i = \pm1$ (aquí $J = k_B = 1$). Una **transición de fase** es una no analiticidad de un potencial termodinámico; para el modelo de Ising existe en dimensión $d \ge 2$ (fase ferromagnética bajo $T_c$) y no en $d = 1$. Como la función de partición de un sistema finito es una suma finita de exponenciales, es analítica: la no analiticidad solo aparece en el **límite termodinámico** $N \to \infty$ a densidad fija. En la red finita el calor específico $c = \beta^2\partial^2\ln Z/\partial\beta^2/N$ tiene un máximo redondeado cuya altura crece (logarítmicamente, en 2D) y cuya posición tiende a $T_c = 2/\ln(1+\sqrt2) \approx 2.269$ al crecer el tamaño.

Para la cadena infinita $c = (J/k_BT)^2/\cosh^2(J/k_BT)$. Para la red cuadrada infinita, Onsager (1944):

$$c = \frac{2}{\pi}\big(K\coth 2K\big)^2\Big[2K_1(\kappa) - 2E_1(\kappa) - (1-\kappa')\Big(\tfrac{\pi}{2} + \kappa' K_1(\kappa)\Big)\Big],$$

con $K = J/k_BT$, $\kappa = 2\sinh 2K/\cosh^2 2K$, $\kappa' = 2\tanh^2 2K - 1$ y $K_1$, $E_1$ las integrales elípticas completas; diverge logarítmicamente en $T_c$.

## Algoritmo

La matriz de transferencia simétrica $\mathbf T = H^{1/2}VH^{1/2}$ de dimensión $2^{N_x}$ (pesos de los enlaces de una fila en $H$, de los enlaces entre filas en $V$) se diagonaliza por rotaciones de Jacobi; $Z = \sum_i\lambda_i^{N_y}$ y $c$ se obtiene con una diferencia finita de tres puntos en $\beta$. El coste crece como $8^{N_x}$: $N_x \le 7$. Las integrales elípticas se calculan por la media aritmético-geométrica.

## Preguntas

1. Compara la curva de c_V de una tira de N_x = 2 con la de N_x = 7. ¿Hacia dónde se desplaza el máximo y cuánto crece? ¿Tiende hacia la divergencia logarítmica de Onsager?
2. ¿Por qué en una tira estrecha (1D efectiva) no hay transición de fase, y sin embargo hay un máximo redondeado de c_V?
3. Estima a partir de las curvas cómo escala la altura del pico con N_x. ¿Es compatible con ln N_x?

## Cambios respecto al applet original

| Original (`CalorEspecificoApplet`, 2002) | Aquí | Motivo |
|---|---|---|
| Matrices y curvas exactas precalculadas (tablas de constantes en el bytecode) | Cálculo exacto en el navegador, visible punto a punto | El estudiante puede pedir cualquier $N_x \le 7$, $N_y \le 64$ |
| Sin indicación de $T_c$ ni del máximo | $T_c$, $T_{\max}$ y $c_{\max}$ en el panel; curvas anteriores conservables | Comparar tamaños |

## Pruebas

`tests/fises2.test.js`: $N_x = 1$ reproduce exactamente $Z = \lambda_+^N + \lambda_-^N$ del anillo de 60 espines y coincide con la cadena infinita para $T \ge 1$; $\ln Z$ del toro $2\times2$ coincide con la suma directa sobre los 16 estados; el máximo de $6\times6$ está más cerca de $T_c$ y es más alto que el de $4\times4$; la fórmula de Onsager coincide con la red $6\times32$ en $T = 1.6$ y $3.5$ dentro de 0.03, y $K(0) = E(0) = \pi/2$.

## Evaluación didáctica

Enseña dos ideas abstractas (dimensionalidad crítica, límite termodinámico) con un cálculo exacto, no una simulación: no hay ruido que confunda. Complementa al experimento 11 (Monte Carlo). Fuente: curso *Experimentos Interactivos* (UCM), experimento 5 de Física Estadística, R. Brito.
