# Teorema del límite central

## Qué se observa

Se generan $N$ variables aleatorias independientes con la misma distribución (un dado de 1 a 6, un número uniforme en $[0,1]$ o una moneda 0/1) y se suman. A la izquierda, la última tirada: los $N$ valores y su suma $S$. A la derecha, el histograma de las sumas acumuladas frente a la gaussiana que predice el teorema del límite central. Con $N = 1$ el histograma es la distribución de partida; a medida que $N$ crece se parece cada vez más a una campana, sea cual sea la variable original.

## Modelo físico

Si $x_1,\dots,x_N$ son independientes, con media $\mu$ y varianza $\sigma^2$, la suma $S = \sum_i x_i$ tiene media $N\mu$ y varianza $N\sigma^2$ exactamente, y el **teorema del límite central** afirma que su distribución tiende, para $N \to \infty$, a la gaussiana

$$P(S) = \frac{1}{\sqrt{2\pi N\sigma^2}}\,\exp\!\left[-\frac{(S-N\mu)^2}{2N\sigma^2}\right],$$

independientemente de la forma de la distribución de las $x_i$ (basta que tengan varianza finita). La anchura relativa $\sigma_S/\langle S\rangle = (\sigma/\mu)/\sqrt N$ decrece con $N$: de aquí sale el $1/\sqrt N$ de las fluctuaciones relativas en todos los sistemas macroscópicos. Para variables discretas la gaussiana es una envolvente de las probabilidades de los valores enteros; para $N$ pequeño se ven las correcciones (el triángulo de $N = 2$, la asimetría de la binomial sesgada).

## Algoritmo

Cada paso genera $N$ muestras con el generador pseudoaleatorio, suma y acumula en un histograma: bins enteros para dado y moneda, 60 bins en $[\mu_S - 5\sigma_S, \mu_S + 5\sigma_S]$ para la uniforme. Se calculan la media y la varianza muestrales y un $\chi^2/{\rm dof}$ sobre los bins con cuenta esperada $\ge 5$.

## Cambios respecto al applet original

| Original (`TLCApplet`, 2002; inspirado en uno de T. Ogden) | Aquí | Motivo |
|---|---|---|
| Histograma y gaussiana | Igual, más la vista de la última tirada y media/varianza/χ² medidas | Ver de dónde sale cada suma y cuantificar la convergencia |
| $N \le N_{\max}$ | $N$ hasta 200 | Ver el $1/\sqrt N$ |

## Pruebas

`tests/fises1.test.js`: sumas de 12 dados tienen la media y varianza predichas y pasan el $\chi^2$ frente a la gaussiana; con $N = 1$ la uniforme es plana; sumas de 4 monedas tienen forma binomial.

## Evaluación didáctica

Primer experimento del bloque: introduce el histograma, la comparación con una predicción y la idea de que lo colectivo borra los detalles microscópicos. Fuente: curso *Experimentos Interactivos* (UCM), experimento 1 de Física Estadística, R. Brito.
