# Estados electrónicos en pozos cuánticos

## Qué se observa

Los niveles confinados de un electrón en una lámina de GaAs entre barreras de Al_xGa_{1−x}As, resueltos gráficamente: las curvas tan θ y −cot θ frente a la función raíz (m_A/m_B)κ/k, cuyas intersecciones son los niveles. A la derecha, el pozo con los niveles y sus funciones envolventes, junto a los niveles del pozo infinito para comparar.

## Modelo físico

En la aproximación de masa efectiva (modelo de Ben Daniel–Duke), la función envolvente obedece

$$-\frac{\hbar^2}{2}\frac{d}{dz}\left[\frac{1}{m(z)}\frac{d\chi}{dz}\right] + V(z)\chi = E\chi,$$

con $V = 0$, $m = m_A$ en el pozo y $V = V_0$, $m = m_B$ en las barreras. Integrando en la intercara se ve que $\chi$ y $\chi'/m$ son continuas: la discontinuidad de masa produce un salto en la derivada. Con $k^2 = 2m_AE/\hbar^2$, $\kappa^2 = 2m_B(V_0 - E)/\hbar^2$ y $\theta = ka/2$, los estados pares cumplen $\tan\theta = (m_A/m_B)\kappa/k$ y los impares $-\cot\theta = (m_A/m_B)\kappa/k$. El número de niveles es $\lceil 2\theta_0/\pi\rceil$ con $\theta_0 = (a/2)\sqrt{2m_AV_0}/\hbar$: siempre hay al menos uno. Parámetros: $m_A = 0.067m$, $m_B = m_A(1 + 1.24x)$, $V_0 = 0.773x$ eV.

## Algoritmo

Las ecuaciones trascendentes se escriben en forma de fase, $\theta - \arctan g(\theta) = n\pi$ (pares) o $n\pi + \pi/2$ (impares), monótonas en $\theta$, y se resuelven por bisección rama a rama. Las envolventes son $\cos kz$ / $\sin kz$ dentro y exponenciales $e^{-\kappa(|z| - a/2)}$ fuera. Inicia para barrer el espesor del pozo.

## Cambios respecto al applet original

| Original (2002) | Aquí | Motivo |
|---|---|---|
| Solución gráfica y envolventes para x y a dados | Igual, más los niveles del pozo infinito, el conteo de estados y el barrido de espesor | Ver cómo nacen los niveles |

## Pruebas

`tests/dc.test.js`: los niveles quedan por debajo de los del pozo infinito y de V₀, coinciden con la diagonalización en diferencias finitas del mismo pozo con masas distintas dentro de 1 meV, y un pozo de 20 Å tiene exactamente un estado.

## Evaluación didáctica

El problema básico de toda la sección: cómo el confinamiento cuantiza la energía y cómo la masa efectiva distinta de las barreras entra en las condiciones de contorno. Fuente: curso *Experimentos Interactivos* (UCM), experimento 1 de Dispositivos Cuánticos, F. Domínguez-Adame.
