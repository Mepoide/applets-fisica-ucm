# Estadísticas de bosones y fermiones

## Qué se observa

$N$ bosones (izquierda) y $N$ fermiones (derecha) sobre una escalera de niveles equiespaciados $\varepsilon_i = i$ en contacto con un baño a temperatura $kT$, simulados por Monte Carlo. Cada punto es una partícula; las barras rojas son la ocupación media acumulada de cada nivel; en azul, la ocupación exacta de la colectividad canónica; en gris punteado, las fórmulas de Bose–Einstein y Fermi–Dirac de la colectividad macrocanónica. A baja temperatura los bosones se apilan en el nivel fundamental y los fermiones llenan los $N$ primeros niveles hasta el nivel de Fermi.

## Modelo físico

La simetría de la función de onda bajo permutaciones separa las partículas en **fermiones** (antisimétrica: a lo sumo una por estado, principio de exclusión de Pauli) y **bosones** (simétrica: cualquier número por estado). En la colectividad macrocanónica la función de macropartición factoriza por niveles y las ocupaciones medias son

$$\langle n_i\rangle_{\rm BE} = \frac{1}{z^{-1}e^{\varepsilon_i/kT}-1},\qquad \langle n_i\rangle_{\rm FD} = \frac{1}{z^{-1}e^{\varepsilon_i/kT}+1},$$

con la fugacidad $z = e^{\mu/kT}$ fijada por $\sum_i\langle n_i\rangle = N$. El $+1$ garantiza $\langle n\rangle_{\rm FD} \le 1$; el $-1$ permite ocupaciones enormes del fundamental cuando $z \to 1$: la **condensación de Bose**. A $T = 0$ los fermiones ocupan los niveles $0,\dots,N-1$ y el nivel de Fermi es $\varepsilon_F = N-1$. A $kT \gg N$ ambas tienden a Boltzmann.

Con pocas partículas la colectividad macrocanónica no es equivalente a la canónica: para $N$ fijo las ocupaciones exactas se obtienen de la recursión de las funciones de partición canónicas $Z_N = \frac1N\sum_{k=1}^N (\pm1)^{k+1} Z_1(k\beta) Z_{N-k}$ (signo $+$ bosones, $-$ fermiones). Para bosones la fórmula gran canónica sobreestima la ocupación del fundamental, porque en esa colectividad sus fluctuaciones son del orden de $N$. El Monte Carlo, que conserva $N$, reproduce la canónica.

## Algoritmo

Cadena de Markov sobre las configuraciones de ocupación $\{n_i\}$, que son los estados cuánticos del sistema de partículas idénticas: se elige una partícula al azar (nivel $i$ con probabilidad $n_i/N$), se propone un nivel $j$ uniforme y se acepta con $\min(1, e^{-(\varepsilon_j-\varepsilon_i)/kT}\,(n_j+1)/n_i)$ para bosones (corrección de Metropolis–Hastings por la asimetría de la propuesta) y $\min(1, e^{-\Delta\varepsilon/kT})$ para fermiones si el nivel está vacío. 30 niveles; $N \le 20$.

## Cambios respecto al applet original

| Original (`BEFDApplet`, 2002) | Aquí | Motivo |
|---|---|---|
| Monte Carlo comparado con las fórmulas gran canónicas (3) | Se dibujan la canónica exacta y la gran canónica, y se explica su diferencia a $N$ pequeño | El MC conserva $N$: la comparación correcta es con la canónica |
| Intercambios con probabilidad de Boltzmann sin corrección de propuesta | Metropolis–Hastings con el factor $(n_j+1)/n_i$ | Sin él la cadena no muestrea la distribución de equilibrio bosónica |

## Pruebas

`tests/fises3.test.js`: las ocupaciones gran canónicas están normalizadas y respetan Pauli; a $kT = 0.2$ más de 8 de 10 bosones están en el fundamental y la escalera fermiónica cae en $\varepsilon_F = 9$; canónica y gran canónica coinciden para fermiones y difieren para bosones a $N = 10$; el Monte Carlo reproduce las ocupaciones canónicas con error máximo $< 0.12$ para ambas estadísticas.

## Evaluación didáctica

Hace visible el principio de exclusión y la condensación de Bose partícula a partícula, y de paso la no equivalencia de colectividades en sistemas pequeños. Fuente: curso *Experimentos Interactivos* (UCM), experimento 10 de Física Estadística, R. Brito.
