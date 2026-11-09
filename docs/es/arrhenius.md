# Procesos de activación: ley de Arrhenius

## Qué se observa

Partículas brownianas (caminantes Metrópolis) en un doble pozo inclinado, $V(x) = (x^2-1)^2 + A\,x$. Todas empiezan en el pozo **metaestable**, el más alto, y solo pueden salir de él gracias a las fluctuaciones térmicas que las suben hasta la barrera. A la derecha, el número de partículas que quedan en el pozo, $N_{\rm meta}(t)$, frente a tres predicciones exponenciales $N_0 e^{-kt}$: la tasa de Kramers exacta en la red (azul), su aproximación armónica de Arrhenius (gris) y la estimación del curso original (punteada).

## Modelo físico

Si cada partícula abandona el pozo con probabilidad $k$ por unidad de tiempo, $\dot N_{\rm meta} = -k N_{\rm meta}$ y $N_{\rm meta}(t) = N_0 e^{-kt}$. El problema es calcular $k$. Para una partícula sobreamortiguada (difusión con coeficiente $D$ en el potencial $V$), el tiempo medio de primer paso da el resultado exacto de **flujo sobre población**:

$$k = \frac{D}{\displaystyle\int_{\rm pozo} e^{-V/kT}\,dx\;\int_{\rm barrera} e^{+V/kT}\,dx}.$$

Aproximando el pozo por una parábola de frecuencia $\omega_{\rm m} = \sqrt{V''(x_{\rm m})}$ y la barrera por una parábola invertida de curvatura $\omega_{\rm M} = \sqrt{|V''(x_{\rm M})|}$ (válido si $kT \ll \Delta E$), las dos integrales son gaussianas y se obtiene la fórmula de **Kramers–Arrhenius**

$$k_{\rm Arr} = \frac{\omega_{\rm m}\,\omega_{\rm M}}{2\pi\gamma}\,e^{-\Delta E/kT},\qquad \gamma = \frac{kT}{D},$$

con $\Delta E = V(x_{\rm M}) - V(x_{\rm m})$: el factor de Arrhenius $e^{-\Delta E/kT}$ gobierna la dependencia con la temperatura de innumerables reacciones químicas y procesos biológicos.

El caminante Metrópolis con paso $\Delta x$ es una discretización de esa difusión con $D = \Delta x^2/2$. La estimación del curso original, $k = e^{-V(x_{\rm M})/kT}/(2\Delta t \sum_{\rm pozo} e^{-V/kT})$, cuenta como escapada a toda partícula que, estando en lo alto de la barrera, da un paso hacia fuera; en una red fina la mayoría vuelve a caer en el pozo, así que esa fórmula sobreestima $k$ (en un factor $\approx \Delta x\int_{\rm barrera} e^{(V-V_{\rm M})/kT}dx$ inverso). Por eso se muestran las tres.

## Algoritmo

Red de 161 sitios en $[-2, 2]$ ($\Delta x = 0.025$), `applets/_walkers/metropolis.js`. $N_{\rm meta}$ cuenta las partículas a la derecha del máximo (para $A > 0$). La tasa ajustada es la pendiente de la regresión de $\ln N_{\rm meta}$ frente a $t$ mientras $N_{\rm meta} > N_0 e^{-3}$. Las integrales de Kramers se evalúan como sumas sobre la red.

## Cambios respecto al applet original

| Original (`ejerc6`, 2002) | Aquí | Motivo |
|---|---|---|
| Una sola curva teórica, con la tasa de la ec. (2) del curso | Tres curvas: Kramers exacta en la red, Arrhenius armónica y la del curso | La ec. (2) sobreestima $k$ en una red fina; la comparación enseña de dónde sale cada factor |
| Temperatura y amplitud por campos de texto | Deslizadores logarítmico (kT) y lineal (A) con la teoría recalculada al vuelo | Explorar $kT/\Delta E$ |
| Sin ajuste de la simulación | $k$ ajustada y cociente con Kramers en el panel | Comparación cuantitativa |

## Pruebas

`tests/arrhenius.test.js`: posición de la barrera y de los mínimos; las tasas crecen con $kT$ y la del curso es mayor que la de Kramers; con $kT = 0.2$, $A = 0.5$ y 1000 partículas la tasa ajustada coincide con la de Kramers dentro del 30 %; con $A = 0$ el pozo derecho acaba con la mitad de las partículas.

## Evaluación didáctica

Muestra la ley exponencial emergiendo de una dinámica estocástica y el papel de cada factor de la fórmula de Kramers, y advierte de una aproximación habitual (contar llegadas a la barrera como escapes). Fuente: curso *Experimentos Interactivos* (UCM), experimento 8 de Sistemas fuera del Equilibrio, R. Brito y J. M. R. Parrondo.
