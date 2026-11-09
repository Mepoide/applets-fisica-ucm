# Estados electrónicos superficiales

## Qué se observa

Un cristal unidimensional semi-infinito terminado en una superficie: potenciales δ de intensidad $P$ en $z = -a, -2a, \dots$ y un escalón de altura $V_0$ (el vacío) para $z > 0$. Se calculan los niveles del sistema y se dibujan sobre las bandas del cristal infinito. Los niveles dentro de las bandas son estados extendidos; cuando aparece un nivel en un gap, su función de onda decae hacia el interior del cristal y hacia el vacío: es un **estado superficial** (de Tamm).

## Modelo físico

Sin superficie, el teorema de Bloch exige momento cristalino real y la relación de Kronig–Penney $\cos ka = \cos qa + (P/2q)\sin qa$ (con $q = \sqrt E$, $\hbar^2/2m = 1$) define bandas y gaps. La superficie rompe la periodicidad y admite soluciones con $k = n\pi/a + i\mu$ complejo: en el cristal la función de onda crece hacia la superficie como $e^{\mu z}$ y en el vacío decae como $e^{-\kappa z}$ con $\kappa = \sqrt{V_0 - E}$. Imponer continuidad de $\psi$ y $\psi'$ en $z = 0$ da una ecuación trascendente cuyas raíces reales en los gaps son las energías de los estados superficiales, sujetas además a la **condición de existencia** $\mu > 0$ (decaimiento hacia el interior). Dependiendo del signo de $P$, de $a$ y de $V_0$ el estado existe o no; con pozos atractivos ($P < 0$) hay uno en el primer gap para una amplia gama de $V_0$.

## Algoritmo

En lugar de resolver la ecuación trascendente del cristal semi-infinito, se diagonaliza por disparo un cristal largo pero finito ($N$ celdas, pared dura al fondo): se integra desde la pared con $\psi = 0$, $\psi' = 1$, a través de los δ (salto de $\psi'$ en $P\psi$) hasta $z = 0$ y se exige $\psi'(0)/\psi(0) = -\kappa$. Las raíces se buscan por barrido y bisección. Los niveles de banda se densifican al crecer $N$; el superficial no depende de $N$. La función de onda se dibuja normalizada y se mide el peso de $|\psi|^2$ cerca de la superficie.

## Preguntas

1. Con P = −3 y V₀ = 12, localiza el estado de Tamm en el gap y dibuja su función de onda. ¿Cuántas celdas penetra en el cristal? ¿Y en el vacío?
2. Sube V₀ hasta que el nivel salga del gap: ¿en qué se convierte el estado?
3. Cambia el signo de P: ¿por qué desaparece el estado superficial en este modelo? ¿Qué terminación lo recuperaría?

## Cambios respecto al applet original

| Original (2002) | Aquí | Motivo |
|---|---|---|
| Raíces de la ecuación (8) y condición de existencia | Espectro completo del cristal finito, con los estados de gap resaltados y su función de onda | Ver a la vez bandas, gaps y estado superficial |

## Pruebas

`tests/fes2.test.js`: con $P = -3$, $a = 1$, $V_0 = 12$, $N = 30$ aparecen más de $N$ niveles, al menos uno en un gap con más del 30 % de $|\psi|^2$ a menos de $2a$ de la superficie, mientras un estado de banda tiene menos del 30 %.

## Evaluación didáctica

Explica por qué las superficies tienen estados propios, relevantes en catálisis y crecimiento epitaxial, y muestra el uso de momento cristalino complejo. Fuente: curso *Experimentos Interactivos* (UCM), experimento 8 de Física del Estado Sólido, F. Domínguez-Adame.
