# Vibraciones en sólidos cristalinos: teoría de Debye

## Qué se observa

El calor específico por átomo de un sólido según el modelo de Debye, frente a $T/\Theta_D$, para sólidos reales (K, Cu, Al, Fe, diamante…) o una temperatura de Debye a elegir. Se comparan la ley de Dulong–Petit (3 a alta temperatura), la ley $T^3$ de bajas temperaturas y el modelo de Einstein. A la derecha, la densidad de modos $g(\omega) \propto \omega^2$ y, sombreados, los modos excitados a la temperatura del cursor.

## Modelo físico

En la aproximación armónica el sólido de $N$ átomos equivale a $3N$ osciladores independientes (los modos normales o fonones) con $\ln Z = -\sum_k \ln(2\sinh\hbar\omega_k/2k_BT)$. Debye sustituye el espectro real por el de un medio elástico continuo, $\omega = v k$, lo que da $g(\omega) = 9N\omega^2/\omega_D^3$ hasta una frecuencia de corte $\omega_D$ fijada por el número total de modos, $\int g = 3N$. Con $\Theta_D = \hbar\omega_D/k_B$,

$$\frac{c}{k_B} = 9\Big(\frac{T}{\Theta_D}\Big)^3\int_0^{\Theta_D/T}\frac{x^4e^x}{(e^x-1)^2}\,dx,$$

función universal de $T/\Theta_D$. Para $T \gg \Theta_D$ tiende a 3 (ley de Dulong–Petit, equipartición); para $T \ll \Theta_D$ la integral tiende a $4\pi^4/15$ y $c \to (12\pi^4/5)(T/\Theta_D)^3$: solo se excitan los fonones acústicos de baja frecuencia, cuyo número crece como $T^3$. El modelo de Einstein (todos los modos con la misma frecuencia) acierta a alta temperatura pero predice una caída exponencial a baja, en desacuerdo con los experimentos: fue la primera evidencia de la cuantización en un sistema macroscópico (1907) y la teoría de Debye (1912) la corrigió.

## Algoritmo

Integral de Debye por Simpson compuesto con paso adaptado a $\Theta_D/T$; para $\Theta_D/T > 60$ se usa el límite analítico. Temperaturas de Debye tabuladas (Kittel). Los modos excitados se representan como $g(\omega)\min(1,\langle n\rangle)$ con $\langle n\rangle = 1/(e^{\hbar\omega/k_BT}-1)$.

## Preguntas

1. Compara Einstein y Debye a baja temperatura: ¿cuál da la ley T³? ¿Por qué el modelo de Einstein cae exponencialmente?
2. Ajusta θ_D para que la curva pase por los datos del cobre. ¿Qué valor obtienes y cómo se compara con el tabulado (343 K)?
3. ¿A qué temperatura, en unidades de θ_D, el calor específico alcanza el 90 % del valor de Dulong–Petit?

## Cambios respecto al applet original

| Original (`DebyeApplet`, 2002) | Aquí | Motivo |
|---|---|---|
| Curva $c(T)$ para una $\Theta_D$ tecleada (integración gaussiana de 10 puntos) | Curva universal en $T/\Theta_D$ con cursor, leyes límite, Einstein y densidad de modos | Ver por qué falla Einstein y de dónde sale el $T^3$ |

## Pruebas

`tests/fises2.test.js`: $c \to 3$ para $T = 50\,\Theta_D$; cociente con la ley $T^3$ igual a 1 dentro del 1 % para $T = 0.02\,\Theta_D$; $c(\Theta_D) = 2.856$.

## Evaluación didáctica

Conecta la cuantización de los fonones con una medida macroscópica clásica y muestra el papel de la densidad de estados. Fuente: curso *Experimentos Interactivos* (UCM), experimento 7 de Física Estadística, R. Brito.
