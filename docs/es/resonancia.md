# Resonancia estocástica

## Qué se observa

Una partícula browniana (o unas pocas) en un doble pozo cuya inclinación oscila con el tiempo, $V(x,t) = (x^2-1)^2 + A\,x\cos\omega t$. La señal es demasiado débil para eliminar uno de los pozos, así que la partícula solo puede cambiar de pozo por activación térmica. A la derecha, su posición frente a la del mínimo global del potencial, que salta entre $-1$ y $+1$ con la señal. A temperatura baja la partícula no sale de su pozo; a temperatura alta salta al azar; a una temperatura intermedia salta **sincronizada** con la señal. El botón "Barrer kT" mide la amplitud de la respuesta a $\omega$ para una serie de temperaturas y dibuja la curva de resonancia.

## Modelo físico

Sin señal, el tiempo medio entre saltos es el de Kramers, $\tau_K(kT) = 1/k$ (experimento 8), que crece exponencialmente al bajar la temperatura. Con la señal, el pozo favorable cambia cada medio periodo $T/2$. Si $\tau_K \gg T/2$ la partícula no llega a saltar; si $\tau_K \ll T/2$ salta muchas veces en cada semiperiodo y el promedio sigue adiabáticamente al mínimo con poca amplitud. Cuando

$$\tau_K(kT) \approx \frac{T}{2}$$

los saltos ocurren, estadísticamente, una vez por semiperiodo y en fase con la señal: la componente de $x(t)$ a la frecuencia $\omega$ es máxima. Ese máximo de la respuesta **en función del ruido** es la resonancia estocástica. Aquí se cuantifica con la amplitud de la primera componente de Fourier, $A_\omega = 2|\langle x(t) e^{-i\omega t}\rangle|$, que vale $\approx 2$ si la partícula salta de $-1$ a $+1$ en fase y $\approx A/V''$ si solo oscila dentro del pozo. El fenómeno se ha propuesto como mecanismo en climatología (ciclos glaciales), en neuronas y en percepción.

## Algoritmo

Red de 41 sitios en $[-2, 2]$ ($\Delta x = 0.1$) para que el tiempo de difusión sea corto frente a los periodos; en cada paso se recalcula $V$ y se aplica Metrópolis (`applets/_walkers/metropolis.js`). $\tau_K$ se evalúa con la tasa de Kramers en la red del experimento 8 sobre el pozo sin inclinar, y la temperatura de resonancia resolviendo $\tau_K(kT) = T/2$ por bisección. El barrido simula 20 partículas durante 8 periodos en 15 temperaturas y calcula $A_\omega$ descartando los dos primeros periodos.

## Preguntas

1. Lanza el barrido en kT y localiza el máximo de la amplitud de respuesta. Compáralo con la condición τ_K(kT) = T/2. ¿Cuánto se desvía?
2. Cambia el periodo T de la señal: ¿hacia dónde se mueve kT de resonancia? Razónalo con la ley de Arrhenius de τ_K.
3. Aumenta la amplitud A de la señal hasta que el pozo deje de ser doble en algún instante: ¿sigue habiendo resonancia estocástica?

## Cambios respecto al applet original

| Original (`ejerc3`, 2002) | Aquí | Motivo |
|---|---|---|
| Solo la traza $x(t)$ frente al mínimo | Además, amplitud de respuesta a $\omega$ y barrido automático en $kT$ | Hacer medible el "máximo frente al ruido" |
| Sin predicción de la temperatura de resonancia | $\tau_K(kT)$, $T/2$ y $kT_{\rm res}$ en el panel | Conectar con el experimento 8 |
| Frecuencia en unidades ×0.01 | Periodo $T$ en pasos, deslizador logarítmico | Interpretación directa |

## Pruebas

`tests/resonancia.test.js`: el mínimo global sigue el signo de $-\cos\omega t$; la respuesta de un coseno perfecto tiene amplitud 1 y fase correcta, la de ruido blanco es pequeña; $\tau_K$ decrece con $kT$ y la temperatura de resonancia invierte $\tau_K = T/2$ al 5 %; en un barrido con semilla fija la amplitud en $kT_{\rm res}$ supera a la de $kT_{\rm res}/4$ y $4kT_{\rm res}$.

## Evaluación didáctica

Cierra la secuencia 7–8–9: Boltzmann, Kramers y su consecuencia menos intuitiva, que el ruido puede mejorar la respuesta a una señal. El barrido convierte una observación cualitativa en una curva medida. Fuente: curso *Experimentos Interactivos* (UCM), experimento 9 de Sistemas fuera del Equilibrio, R. Brito y J. M. R. Parrondo.
