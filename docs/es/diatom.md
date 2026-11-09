# Moléculas diatómicas

## Qué se observa

El calor específico por molécula de un gas ideal diatómico frente a la temperatura (escala logarítmica), descompuesto en traslación, rotación y vibración, para moléculas reales (H₂, N₂, CO, O₂, Cl₂…) o para temperaturas características a elegir. Un cursor recorre la temperatura y el panel muestra las tres contribuciones; a la derecha, la población de los niveles rotacionales y vibracionales a esa temperatura.

## Modelo físico

El hamiltoniano de la molécula se separa en centro de masas (traslación), rotación y vibración, y la función de partición factoriza: $Z = Z_{\rm tr}Z_{\rm rot}Z_{\rm vib}$, de modo que $c_v = c_{\rm tr} + c_{\rm rot} + c_{\rm vib}$. La traslación da $3/2$ siempre. La vibración, un oscilador armónico de frecuencia $\omega$ con $\Theta_v = \hbar\omega/k_B$:

$$c_{\rm vib} = \frac{x^2e^x}{(e^x-1)^2},\quad x = \frac{\Theta_v}{T},$$

que tiende a 1 para $T \gg \Theta_v$ y se congela exponencialmente para $T \ll \Theta_v$. La rotación, con niveles $\varepsilon_J = J(J+1)k_B\Theta_r$ de degeneración $2J+1$ y $\Theta_r = \hbar^2/2Ik_B$,

$$Z_{\rm rot} = \sum_J (2J+1)e^{-J(J+1)\Theta_r/T},\qquad c_{\rm rot} = \frac{\langle\varepsilon^2\rangle - \langle\varepsilon\rangle^2}{k_B^2T^2},$$

tiende a 1 para $T \gg \Theta_r$ (equipartición clásica de dos grados de libertad) con un pequeño máximo cerca de $0.8\,\Theta_r$ debido a la degeneración. Las mesetas $3/2$, $5/2$ y $7/2$ se ven bien cuando $\Theta_r \ll \Theta_v$, como en todas las moléculas diatómicas reales. (Para el H₂ a baja temperatura habría que distinguir orto- y para-hidrógeno; aquí se ignora.)

## Algoritmo

$c_{\rm rot}$ por suma directa de la serie hasta que los términos son despreciables ($J_{\max} \sim 8\sqrt{T/\Theta_r}$); $c_{\rm vib}$ analítica. Temperaturas características de Lee, Sears y Turcotte (1963). Las poblaciones dibujadas son $p_J = (2J+1)e^{-\varepsilon_J/k_BT}/Z_{\rm rot}$ y $p_n = e^{-n\Theta_v/T}(1-e^{-\Theta_v/T})$.

## Preguntas

1. Identifica en la curva de c_V las tres mesetas (3/2, 5/2, 7/2 k_B). ¿A qué temperaturas se activan los grados rotacionales y vibracionales del H₂? ¿Y del Cl₂?
2. ¿Por qué las temperaturas características de rotación y vibración difieren en dos órdenes de magnitud? Relaciónalo con el momento de inercia y la constante de fuerza.
3. Compara el c_V rotacional exacto (suma sobre niveles) con el límite clásico. ¿Por debajo de qué temperatura el error supera el 10 %?

## Cambios respecto al applet original

| Original (`DiatomicApplet`, 2002) | Aquí | Motivo |
|---|---|---|
| Curva total y líneas de referencia | Igual, más las tres contribuciones por separado, el cursor con valores y las poblaciones de niveles | Ver qué grados de libertad se "descongelan" y por qué |
| Temperaturas tecleadas | Selector de moléculas reales más valores personalizados | Comparar moléculas |

## Pruebas

`tests/fises2.test.js`: límites $3/2$, $5/2$, $7/2$ para N₂ a 0.05 K, 300 K y 10⁵ K; el máximo rotacional está entre 1.05 y 1.15 y entre $0.6$ y $1.0\,\Theta_r$.

## Evaluación didáctica

Es el ejemplo canónico de congelación cuántica de grados de libertad, y el que explica por qué el calor específico del aire es $5/2\,k_B$ por molécula. Fuente: curso *Experimentos Interactivos* (UCM), experimento 6 de Física Estadística, R. Brito.
