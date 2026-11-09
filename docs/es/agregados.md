# Absorción óptica en agregados moleculares

## Qué se observa

Un agregado de $N$ moléculas de dos niveles acopladas por la integral de transferencia $J$ (excitones de Frenkel). Se diagonaliza el hamiltoniano, se calcula la fuerza de oscilador de cada autoestado y el espectro de absorción como suma de Lorentzianas. En el agregado ordenado toda la absorción se concentra en un solo estado del borde inferior de la banda; con desorden en las energías de sitio se reparte y el estado brillante se localiza.

## Modelo físico

$$H = \sum_n \varepsilon_n|n\rangle\langle n| - J\sum_n\big(|n\rangle\langle n+1| + {\rm h.c.}\big),$$

donde $|n\rangle$ es el estado con la molécula $n$ excitada. En la aproximación dipolar con todos los dipolos paralelos, el acoplamiento del autoestado $j$ a la luz es $d_j = d_0\sum_n a_{jn}$ y el espectro

$$A(E) = \sum_j d_j^2\,\frac{\Gamma/\pi}{(E - E_j)^2 + \Gamma^2},$$

con la regla de suma $\sum_j d_j^2 = N d_0^2$. Para la cadena periódica $E_k = \varepsilon - 2J\cos k$ (banda de anchura $4J$) y solo el estado $k = 0$, de energía $\varepsilon - 2J$, tiene $d^2 = N d_0^2$: la absorción del agregado J está desplazada al rojo y es $N$ veces más intensa (superradiancia). Con desorden diagonal $W$ los autoestados se localizan en segmentos de $N^*$ moléculas, la fuerza de oscilador se reparte y la línea se ensancha de forma no homogénea.

## Algoritmo

Diagonalización completa (Jacobi, `lib/linalg.js`) del hamiltoniano $N\times N$, $N \le 80$; razón de participación $1/\sum_n a_{jn}^4$ del estado brillante. Energías en unidades de $J$ con $\varepsilon = 0$.

## Cambios respecto al applet original

| Original (2002) | Aquí | Motivo |
|---|---|---|
| Espectro del agregado ordenado con anchura ajustable | Igual, más desorden diagonal, fuerzas de oscilador y autoestados dibujados | Ver de dónde sale la línea y cómo se rompe la superradiancia |

## Pruebas

`tests/fes3.test.js`: energías de la cadena periódica iguales a $-2\cos(2\pi k/N)$; toda la fuerza en $k = 0$ con $d^2 = N$ y participación $N$; regla de suma conservada con desorden y fuerza del brillante reducida; el solucionador simétrico satisface $Av = \lambda v$.

## Evaluación didáctica

Explica una espectroscopía real (agregados J y H, antenas fotosintéticas) con un modelo de enlace fuerte de una línea. Fuente: curso *Experimentos Interactivos* (UCM), experimento 10 de Física del Estado Sólido, F. Domínguez-Adame.
