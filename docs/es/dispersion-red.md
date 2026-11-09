# Dispersión de electrones en una red lineal

## Qué se observa

Un electrón incide sobre una cadena de $N$ átomos representados por potenciales δ de intensidad $\lambda$ separados $L$. Se calcula el coeficiente de transmisión $T(E)$ por el método de la matriz de transferencia y se compara con las bandas de la cadena infinita (relación de Kronig–Penney). Con pocos átomos se ven resonancias; con muchos, la transmisión es prácticamente 1 en las bandas y 0 en los gaps.

## Modelo físico

En unidades $\hbar^2/2m = 1$, $-\psi'' + \lambda\sum_n \delta(x - nL)\psi = E\psi$, $E = q^2$. Entre átomos $\psi = a_n e^{iqx} + b_n e^{-iqx}$; en cada δ la función es continua y su derivada salta en $\lambda\psi$, lo que da una matriz $2\times2$ que conecta $(a_n, b_n)$ con $(a_{n+1}, b_{n+1})$. Con onda incidente unidad y solo transmitida a la derecha, $T = |t|^2$. Para la cadena infinita el teorema de Bloch da

$$\cos kL = \cos qL + \frac{\lambda}{2q}\sin qL,$$

con solución real $k$ solo donde el miembro derecho está en $[-1, 1]$: esas son las **bandas**; fuera, **gaps**, centrados cerca de $qL = n\pi$ (reflexión de Bragg). Para $N$ finito hay $N - 1$ resonancias de transmisión perfecta por banda (estados cuasiestacionarios), y en los gaps $T \sim e^{-2\mu NL}$ con $k = n\pi/L + i\mu$.

## Algoritmo

`applets/_schrod/delta.js`: propagación de amplitudes complejas de derecha a izquierda (estado final $(1,0)$, $T = 1/|a_{\rm izq}|^2$), 1200 energías calculadas por tramos; bordes de banda por bisección de $|\cos qL + (\lambda/2q)\sin qL| = 1$. Potenciales atractivos ($\lambda < 0$) incluidos.

## Cambios respecto al applet original

| Original (2002) | Aquí | Motivo |
|---|---|---|
| $T(E)$ y energías permitidas | Igual, más $E(k)$ en la zona de Brillouin, bandas sombreadas, recuento de resonancias y $T$ en el gap | Conectar la cadena finita con el teorema de Bloch |

## Pruebas

`tests/fes2.test.js`: una δ reproduce $T = 1/(1 + \lambda^2/4E)$ exactamente; 40 átomos con $\lambda = 3$ transmiten $T > 0.99$ en la primera banda y $T < 10^{-4}$ en el primer gap; los bordes de banda coinciden con la condición de Kronig–Penney.

## Evaluación didáctica

Hace aparecer las bandas de energía "sumando átomos" uno a uno, que es la mejor forma de entenderlas. Fuente: curso *Experimentos Interactivos* (UCM), experimento 5 de Física del Estado Sólido, F. Domínguez-Adame.
