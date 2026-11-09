# Ondas sonoras en un fluido

## Qué se observa

Dos vistas. **A**: un gas reticular FHP con un hueco circular de densidad en el centro. La materia de alrededor se precipita hacia el hueco, lo sobrepasa y crea una corona de rarefacción que se aleja a la velocidad del sonido de la red, $c_s = \sqrt{3/7} \approx 0.655$ nodos por paso. Sobre el perfil radial medido se dibuja la predicción de la teoría acústica lineal para ese mismo hueco. **B**: la solución analítica de la hidrodinámica linealizada para una perturbación de densidad en un fluido real, con sus dos pulsos sonoros y su pico térmico. Esta es la física de las fichas `onda-lgca` y `modos-lineales`, reunida en el experimento 4 del curso original.

## Modelo físico

Linealizando las ecuaciones de Navier–Stokes alrededor del reposo y pasando a Fourier, la densidad obedece

$$n(k,t) = \Big[\tfrac{c_v}{c_p}\cos(c_s k t)\,e^{-\Gamma_s k^2 t} + \tfrac{c_p - c_v}{c_p}\,e^{-\kappa k^2 t/(n c_p)}\Big]\,n(k,0),$$

dos modos sonoros amortiguados (peso $1/\gamma$) y un modo térmico difusivo (peso $1 - 1/\gamma$). Son los pesos de Landau–Placzek. En la vista B se recorren en el espacio real: $\delta\rho$, la velocidad $u$ (por continuidad) y $\delta T$, que en $t = 0$ se anula porque el sonido es adiabático y el modo térmico isobaro.

El gas reticular FHP conserva masa y momento pero no tiene energía independiente (todas las partículas móviles tienen la misma velocidad): es **atérmico**. No hay modo térmico, $c_p = c_v$, y la ecuación anterior se reduce a $n(k,t) = \cos(c_s k t)\,e^{-\Gamma k^2 t}\,n(k,0)$. Para el hueco de radio $R$ en un gas de ocupación $n_0 = 7f$, la transformada de Hankel de la condición inicial es $-n_0\,2\pi R\,J_1(kR)/k$ y

$$\delta n(r,t) = -n_0 R \int_0^\infty J_1(kR)\,J_0(kr)\,\cos(c_s k t)\,e^{-\Gamma k^2 t}\,dk,$$

que es la curva azul. La velocidad del sonido del FHP-III es exacta, $c_s^2 = 3/7$; la atenuación $\Gamma$ se toma igual a la viscosidad cinemática $\nu(f)$ de Boltzmann, que es su orden de magnitud correcto (la viscosidad de volumen del modelo con partícula en reposo es comparable a $\nu$). El hueco es una perturbación del 100 %, así que la teoría lineal acierta la posición y la forma del frente pero solo aproxima su amplitud; la discrepancia es una medida del efecto no lineal.

## Algoritmo

Vista A: `applets/onda-lgca` (autómata FHP con partícula en reposo, perfil radial por anillos, frente como mínimo del perfil). La predicción lineal se integra numéricamente en $k$ con funciones de Bessel racionales (`lib/bessel.js`), 600 nodos hasta $k_{\max} = 40/R$. Vista B: `applets/modos-lineales` (solución analítica, gaussianas de varianza $\sigma^2 + 2\Gamma t$ y $\sigma^2 + 2 D_T t$).

## Cambios respecto al applet original

| Original (`ejerc2`/`ejerc23`, 2003) | Aquí | Motivo |
|---|---|---|
| Densidad en un "cuadradito rojo" fijo frente al tiempo | Perfil radial completo y posición del frente frente a $c_s t$ | La magnitud que la teoría predice es el perfil |
| Sin comparación cuantitativa con la ecuación (1) del curso | Predicción lineal superpuesta, $c_s$, $\nu$ y $\Gamma$ en el panel | Ver la ecuación y la simulación a la vez |
| Teoría con modo térmico aplicada a un modelo atérmico | Se explica la diferencia y la vista B muestra el modo térmico donde sí existe | Coherencia física |
| Hueco elíptico (condición $\tfrac32(i_y - y_c)^2$) | Disco en coordenadas físicas | Corrección de la fase 1 |

## Pruebas

`tests/ondas.test.js`: $J_0$, $J_1$ frente a valores tabulados; la predicción lineal reproduce el hueco en $t = 0$ y su mínimo avanza a $c_s$ entre $t = 15$ y $t = 30$; el frente medido en la simulación ($N = 160^2$, $f = 0.3$) avanza a $c_s$ dentro del 15 %. Además `tests/onda.test.js` y `tests/modos.test.js` de la fase 1.

## Evaluación didáctica

Une el "experimento numérico" con la teoría que lo describe en la misma gráfica, y hace explícita una limitación del modelo (atérmico) que suele pasar desapercibida. La vista B permite jugar con $\gamma$, $\Gamma$ y $D_T$ y ver los pesos de Landau–Placzek. Fuente: curso *Experimentos Interactivos* (UCM), experimento 4 de Sistemas fuera del Equilibrio, R. Brito; applet FHP de Mario Encinar (TAD 2003).
