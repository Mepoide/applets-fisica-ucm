# Modelo de Ising

## Qué se observa

Una red cuadrada de espines $\pm1$ (amarillo/azul) que evoluciona por Monte Carlo a un acoplamiento $K = J/k_BT$ que se cambia con el deslizador. A la derecha, la magnetización por espín $m(t)$, su promedio en valor absoluto y la magnetización espontánea exacta de Onsager para ese $K$. Por encima de la temperatura crítica ($K < K_c$) los dominios son pequeños y $m$ fluctúa en torno a cero; por debajo aparece un dominio mayoritario y $|m|$ se acerca a la curva exacta.

## Modelo físico

$H = -J\sum_{\langle ij\rangle}s_is_j$ con $J > 0$ favorece espines paralelos; la temperatura los desordena. La competencia produce una **transición de fase** ferromagnética en dimensión $d \ge 2$. Onsager (1944) resolvió la red cuadrada: $K_c = \tfrac12\ln(1+\sqrt2) \approx 0.4407$, es decir $k_BT_c/J \approx 2.269$, y Yang (1952) obtuvo la magnetización espontánea

$$m_0 = \big(1 - \sinh^{-4}2K\big)^{1/8}\quad (K > K_c),\qquad m_0 = 0\quad (K < K_c),$$

con exponente crítico $\beta = 1/8$. En una red finita no hay transición estricta: $m$ cambia de signo de vez en cuando (más raramente cuanto mayor $L$), por eso se promedia $|m|$. Cerca de $K_c$ la longitud de correlación y el tiempo de relajación divergen (ralentización crítica): los dominios tienen todos los tamaños y la simulación tarda mucho en equilibrarse.

## Algoritmo

Metrópolis con inversiones de un espín: se elige un sitio al azar, $\Delta E = 2Js_ih_i$ con $h_i$ la suma de los cuatro vecinos, y se acepta con $\min(1,e^{-\Delta E/kT})$ (tabla de nueve valores precalculada). Un paso de la animación es un barrido de $L^2$ intentos. Condiciones periódicas; $L$ de 16 a 128.

## Preguntas

1. Mide la magnetización a T = 2.0, 2.2, 2.4 (en unidades de J/k_B) con L = 32 y compárala con la curva de Onsager. ¿Dónde es peor el acuerdo y por qué?
2. Cerca de T_c la simulación tarda mucho en equilibrarse (ralentización crítica). Mide cuántos barridos necesita |m| para estabilizarse a T = 2.27 frente a T = 1.5.
3. Comprueba el efecto del tamaño: con L = 8 la magnetización no se anula por encima de T_c. ¿Por qué? ¿Qué cantidad sería mejor medir en un sistema finito?

## Cambios respecto al applet original

| Original (`IsingApplet`, 2002) | Aquí | Motivo |
|---|---|---|
| Magnetización frente a $K$ con una línea en $K_c$ | $m(t)$, $\langle|m|\rangle$ y la curva exacta de Onsager–Yang para el $K$ actual | Comparación cuantitativa con la solución exacta |
| Tamaños hasta $50\times50$ | Hasta $128\times128$ con tabla de aceptación | Ver mejor los dominios críticos |

## Pruebas

`tests/fises3.test.js`: $m_0(K_c) = 0$ y $m_0(5) \approx 1$; a $K = 0.6$ en $32\times32$ el promedio de $|m|$ coincide con Onsager en 0.02; a $K = 0.3$ es menor que 0.15; la energía por espín a baja temperatura está cerca de $-2J$.

## Evaluación didáctica

El modelo más estudiado de la física estadística, con su solución exacta al lado para contrastar; complementa al experimento 5 (calor específico exacto). Fuente: curso *Experimentos Interactivos* (UCM), experimento 11 de Física Estadística, R. Brito.
