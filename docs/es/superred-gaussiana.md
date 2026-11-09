# Superredes gaussianas de GaAs-AlGaAs

## Qué se observa

El coeficiente de transmisión de una superred cuyas barreras tienen alturas moduladas por una gaussiana centrada en la barrera central, comparado con el de la superred uniforme. La modulación transforma la minibanda llena de resonancias en una ventana de transmisión lisa.

## Modelo físico

En la aproximación de enlace fuerte la superred equivale a una cadena en la que los nodos pares (pozos) tienen energía 0 y los impares (barreras) $E_n = E_0\exp(-n^2/2S^2)$, con $n$ el número de periodos desde la barrera central. Conectada a dos contactos (cadenas semiinfinitas con $\varepsilon = 0$, $E = -2T\cos k$), la transmisión se obtiene con la matriz de transferencia

$$\begin{pmatrix} C_{n+1} \\ C_n \end{pmatrix} = \begin{pmatrix} E_n - E & -1 \\ 1 & 0 \end{pmatrix}\begin{pmatrix} C_n \\ C_{n-1} \end{pmatrix}.$$

En la superred uniforme cada pozo aporta una resonancia y entre ellas la transmisión cae, lo que degrada la razón pico-valle de la I–V; con $S$ del orden de la cuarta parte de la longitud las barreras exteriores son bajas, actúan como acoplamiento adiabático a los contactos y la ventana de transmisión se aplana.

## Algoritmo

Recursión de la amplitud desde una onda saliente pura en el contacto derecho hasta el izquierdo, donde se separan las amplitudes incidente y reflejada; $T = 1/|A|^2$. Inicia para reducir $S$ desde el caso uniforme.

## Cambios respecto al applet original

| Original (2002) | Aquí | Motivo |
|---|---|---|
| T(E) de la superred gaussiana | Igual, superpuesta a la uniforme, con el perfil de barreras, la red equivalente y el conteo de mínimos en la ventana | Medir la mejora de la gaussiana |

## Pruebas

`tests/dc.test.js`: una cadena sin barreras transmite 1; 0 ≤ T ≤ 1 en toda la banda; la superred uniforme de 9 barreras tiene más mínimos de transmisión que la gaussiana con S = N_b/4, y ambas alcanzan T > 0.9.

## Evaluación didáctica

Diseño de dispositivos con la física de ondas: el apodizado gaussiano de la óptica aplicado a electrones. Las superredes gaussianas fueron tema de investigación del grupo de la UCM. Fuente: curso *Experimentos Interactivos* (UCM), experimento 9 de Dispositivos Cuánticos, F. Domínguez-Adame.
