# Ondas planas para el cálculo de estructuras de bandas

## Qué se observa

La estructura de bandas $E(k)$ de un electrón en el potencial de Mathieu $V(x) = V_0\cos 2x$, calculada desarrollando la función de onda en $2M+1$ ondas planas y diagonalizando la matriz resultante. Al variar $V_0$ se pasa del electrón libre (parábolas plegadas) a bandas estrechas de enlace fuerte; al variar $M$ se ve qué bandas están convergidas y cuáles no.

## Modelo físico

Con $\hbar^2/2m = 1$ (energías en Rydberg) y $\psi_k = \sum_l b_l e^{i(k+2l)x}$ (periodo $L = \pi$, vectores de la red recíproca $k_l = 2l$), la ecuación de Schrödinger se convierte en

$$\big[(k+2l)^2 - E\big]b_l + \sum_m V(k_m)\,b_{l-m} = 0,$$

y como los únicos coeficientes de Fourier del coseno son $V(\pm2) = V_0/2$, la matriz es tridiagonal: diagonal $(k+2l)^2$, fuera de la diagonal $V_0/2$. Sus autovalores para cada $k \in [-1, 1]$ (primera zona de Brillouin, en unidades de $\pi/L$) son las bandas. En el límite de electrones casi libres el gap en el borde de zona vale $2|V(2)| = V_0$ (teoría de perturbaciones degenerada); para $V_0$ grande las bandas bajas se aplanan hacia los niveles del oscilador en cada pozo. Truncar la base a $|l| \le M$ solo converge las bandas con $E \ll (2M)^2$.

## Algoritmo

Autovalores de la matriz tridiagonal simétrica por bisección sobre la secuencia de Sturm (`lib/linalg.js`), 121 valores de $k$, $M \le 20$. El indicador de convergencia compara el primer gap con el obtenido con $M + 4$.

## Preguntas

1. ¿Cuántas ondas planas hacen falta para que el gap más bajo converja al 1 %? ¿Y el tercero?
2. Con potencial débil, compara la anchura del primer gap con la predicción perturbativa 2|V₁|. ¿Hasta qué V₁ vale la perturbación?
3. Haz el potencial muy fuerte: ¿a qué se parecen las bandas? Relaciónalo con el límite de enlace fuerte.

## Cambios respecto al applet original

| Original (2002) | Aquí | Motivo |
|---|---|---|
| $E(k)$ para $V_0$ y número de ondas planas dados | Igual, con el electrón libre plegado de fondo, el gap comparado con la predicción $V_0$ y el test de convergencia | Entender qué aproxima cada parámetro |

## Pruebas

`tests/fes2.test.js`: con $V_0 = 0$ se recuperan las parábolas $(k + 2l)^2$; el primer gap con $V_0 = 0.4$ vale $0.4 \pm 0.03$; el gap no cambia al pasar de $M = 5$ a $M = 12$; el solucionador tridiagonal reproduce autovalores conocidos.

## Evaluación didáctica

El método de ondas planas es la base de los cálculos de bandas modernos; aquí se ve en su versión mínima, incluidos sus límites de convergencia. Fuente: curso *Experimentos Interactivos* (UCM), experimento 7 de Física del Estado Sólido, F. Domínguez-Adame.
