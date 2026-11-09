# Conductividad térmica de una cadena desordenada

## Qué se observa

Un segmento de $N$ átomos con masas desordenadas (fracción $C$ de impurezas de masa $\alpha m$) insertado entre dos cadenas perfectas semi-infinitas. Para cada frecuencia se calcula el **coeficiente de transmisión** $T(\omega)$ de un fonón incidente, promediando $\ln T$ sobre varias realizaciones del desorden, y con él la **conductividad térmica** relativa a la cadena perfecta en función de la temperatura. Al alargar el segmento la transmisión se hunde para todo $\omega > 0$: los modos están localizados y no transportan calor.

## Modelo físico

La ecuación de movimiento en forma matricial, $(U_{n+1}, U_n)^T = P_n (U_n, U_{n-1})^T$ con $P_n = \begin{pmatrix} 2 - m_n\omega^2/k & -1 \\ 1 & 0\end{pmatrix}$, da la **matriz de transferencia** del segmento $T(N) = \prod_n P_n$. En las cadenas perfectas las soluciones son ondas de Bloch $e^{\pm iqn}$ con $\cos q = 1 - m\omega^2/2k$; imponiendo onda incidente más reflejada a la izquierda y solo transmitida a la derecha se obtiene $|t|^2 = T(\omega)$. En el transporte de calor por fonones (fórmula de Landauer),

$$\kappa(T) \propto \int_0^{\omega_D} T(\omega)\,\hbar\omega\,\frac{\partial n_B}{\partial T}\,\omega\,d\omega \propto \int_0^{\omega_D} T(\omega)\,\frac{x^2e^x}{(e^x-1)^2}\,d\omega,\quad x = \frac{\hbar\omega}{k_BT},$$

con $\hbar\omega_D = k_B\Theta_D$ y $\omega_D = 2\sqrt{k/m}$; se representa $\kappa/\kappa_0$, el cociente con la cadena perfecta ($T = 1$). En una dimensión cualquier desorden produce **localización de Anderson**: $T(\omega) \sim e^{-N/\xi(\omega)}$ con longitud de localización $\xi \propto 1/\omega^2$ a bajas frecuencias, de modo que solo los modos de longitud de onda larga sobreviven y la conductividad cae con $N$ y crece su peso relativo a baja temperatura.

## Algoritmo

`transmission` y `conductivity` en `applets/_chain/chain.js`: producto de matrices $2\times2$ reales con corte si los elementos superan $10^{150}$ (transmisión despreciable) y resolución del sistema complejo $2\times2$ para $t$; integral de Landauer por trapecios en 161 frecuencias y 60 temperaturas. Promedio de $\ln T$, la variable autopromediante.

## Preguntas

1. Mide la conductividad térmica de la cadena ordenada frente a su longitud: ¿crece, decrece o se mantiene? ¿Es un conductor normal (ley de Fourier)?
2. Añade desorden: ¿cómo decae la transmisión con la longitud a frecuencia fija? Relaciónalo con la longitud de localización.
3. ¿Por qué las frecuencias bajas siguen transmitiendo bien con desorden? ¿Qué longitud de onda comparada con el desorden hace falta?

## Cambios respecto al applet original

| Original (2002) | Aquí | Motivo |
|---|---|---|
| $T(\omega)$ y $\kappa(T)$ "lentos de calcular" | Cálculo por realizaciones visible, promedio de $\ln T$, $\kappa$ normalizada a la cadena perfecta | Interpretación directa |

## Pruebas

`tests/fes1.test.js`: el segmento perfecto transmite $T = 1$ dentro de la banda y 0 fuera; una impureza reduce $T$; 400 masas desordenadas dan $T(1.5) < 0.05$ pero $T(0.1) > 0.5$; $\kappa/\kappa_0 > 0.98$ para la cadena perfecta y $< 0.5$ para la desordenada a $T = 0.3\,\Theta_D$.

## Evaluación didáctica

Une tres ideas: matriz de transferencia, localización y fórmula de Landauer para el transporte. Fuente: curso *Experimentos Interactivos* (UCM), experimento 4 de Física del Estado Sólido, F. Domínguez-Adame.
