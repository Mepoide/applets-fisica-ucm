# Resonancia magnética nuclear

## Qué se observa

La dinámica de la imanación nuclear $\mathbf m = \mathbf M/M_0$ según las ecuaciones de Bloch: en un campo estático $B_0\hat z$ precesa a la frecuencia de Larmor $\omega_0 = \gamma B_0$ y se amortigua con los tiempos $T_2$ (transversal) y $T_1$ (longitudinal); con un campo rotatorio $B_1$ a la frecuencia adecuada, la imanación se inclina y absorbe energía: resonancia. Se dibujan la trayectoria en el plano transversal, las componentes frente al tiempo, el decaimiento analítico $e^{-t/T_2}$ y la línea de absorción Lorentziana.

## Modelo físico

Un núcleo de espín $1/2$ en un campo $B_0$ tiene dos niveles separados $\hbar\omega_0 = \hbar\gamma B_0$. Semiclásicamente, el par sobre el momento magnético da $\dot{\mathbf M} = \gamma\mathbf M\times\mathbf B$; las interacciones con la red (fonones, otros espines) se añaden fenomenológicamente:

$$\dot m_x = \gamma(\mathbf m\times\mathbf B)_x - \frac{m_x}{T_2},\quad \dot m_y = \gamma(\mathbf m\times\mathbf B)_y - \frac{m_y}{T_2},\quad \dot m_z = \gamma(\mathbf m\times\mathbf B)_z - \frac{m_z - 1}{T_1}.$$

Con $B_1 = 0$ y $m_z$ en equilibrio, en tiempo reducido $\tau = t/T_2$ y $\alpha = \omega_0 T_2$: $m_x = e^{-\tau}\cos\alpha\tau$, $m_y = -e^{-\tau}\sin\alpha\tau$, $|m_\perp| = e^{-\tau}$, el **decaimiento de inducción libre** (FID), cuya transformada de Fourier es una Lorentziana de semianchura $1/T_2$ centrada en $\omega_0$: la línea de absorción. Un campo $B_1$ que rota en el mismo sentido que la precesión y a su misma frecuencia es estático en el sistema giratorio y hace nutar la imanación a la frecuencia de Rabi $\omega_1 = \gamma B_1$; desintonizado, su efecto se promedia a cero.

## Algoritmo

Ecuaciones de Bloch completas (con $B_1$ co-rotatorio) integradas por Runge–Kutta de orden 4 con paso $0.005\,T_2$; la Lorentziana se dibuja normalizada en un recuadro. Controles: $\alpha$, $\omega_1T_2$, $\omega/\omega_0$, $T_1/T_2$ y estado inicial (tras un pulso $\pi/2$ o en equilibrio).

## Cambios respecto al applet original

| Original (2002) | Aquí | Motivo |
|---|---|---|
| $m_x(t)$, $m_y(t)$ y módulo para un $\alpha$ dado, sin $B_1$ | Igual, más el campo rotatorio con desintonía, $T_1$, la trayectoria y la línea de absorción | Mostrar la *resonancia*, no solo la precesión |

## Pruebas

`tests/fes3.test.js`: la integración reproduce el FID analítico con error $< 10^{-6}$; un $B_1$ resonante reduce $m_z$ por debajo de 0.3 en $\omega_1 t = 1.6$ y uno desintonizado un 50 % lo reduce menos; la Lorentziana vale 1 en $\omega_0$ y 0.2 a dos anchuras.

## Evaluación didáctica

Base de la RMN y de la imagen por resonancia magnética; aquí se ve la relación entre señal temporal y espectro. Fuente: curso *Experimentos Interactivos* (UCM), experimento 9 de Física del Estado Sólido, F. Domínguez-Adame.
