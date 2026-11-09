# Minibandas en una superred de semiconductores

## Qué se observa

Las minibandas de energía permitidas de una superred GaAs/Al_xGa_{1−x}As (pozos de espesor $d_p$ separados por barreras de espesor $d_b$) y su relación de dispersión $E(K)$ en la minizona de Brillouin. Se compara el modelo de Kronig–Penney con masas efectivas con el de barreras δ de la misma área.

## Modelo físico

Con el teorema de Bloch, $\chi(z + L) = e^{iKL}\chi(z)$, $L = d_p + d_b$, y las condiciones de continuidad de $\chi$ y $\chi'/m$, la relación de dispersión para $0 < E < V_0$ es

$$\cos KL = \cos kd_p\cosh\kappa d_b + \frac12\left(\frac{\kappa m_A}{k m_B} - \frac{k m_B}{\kappa m_A}\right)\sin kd_p\sinh\kappa d_b,$$

con $k = \sqrt{2m_AE}/\hbar$, $\kappa = \sqrt{2m_B(V_0 - E)}/\hbar$ (y $\kappa \to ik_B$ por encima de la barrera). Las energías con $|\cos KL| \le 1$ forman minibandas, centradas cerca de los niveles del pozo aislado y de anchura que crece exponencialmente al estrechar las barreras. Si $d_b \ll d_p$ la barrera se puede sustituir por una δ de área $V_0d_b$: $\cos KL = \cos kL + (m_AV_0d_b/\hbar^2k)\sin kL$.

## Algoritmo

Se evalúa el lado derecho en una malla fina de energías y se detectan los cruces de $|{\rm rhs}| = 1$; $K = \arccos({\rm rhs})/L$. Inicia para barrer $d_b$ y construir el diagrama de minibandas.

## Cambios respecto al applet original

| Original (2002) | Aquí | Motivo |
|---|---|---|
| Minibandas y dispersión de ambos modelos | Igual, más el diagrama minibandas–espesor animado y el nivel aislado de referencia | Ver cómo los niveles se ensanchan en bandas |

## Pruebas

`tests/dc.test.js`: la función de Kronig–Penney coincide (10⁻⁹) con la semitraza de la matriz de transferencia de un periodo construida con las condiciones de contorno de masa; la primera minibanda contiene el nivel del pozo aislado; con barreras de 4 Å los bordes de banda de ambos modelos difieren menos de 4 meV.

## Evaluación didáctica

Cristal artificial con periodicidad a medida: conecta directamente el modelo de Kronig–Penney de la Física del Estado Sólido con dispositivos reales. Fuente: curso *Experimentos Interactivos* (UCM), experimento 7 de Dispositivos Cuánticos, F. Domínguez-Adame.
