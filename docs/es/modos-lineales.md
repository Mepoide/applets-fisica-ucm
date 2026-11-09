# Modos de la hidrodinámica linealizada

## Qué se observa

La evolución analítica de una pequeña perturbación de densidad en un fluido en reposo.
Un pulso gaussiano inicial se descompone en **dos pulsos sonoros** que viajan en sentidos
opuestos a la velocidad del sonido $c_s$ y se amortiguan, y **un pulso térmico** que se
queda en el sitio y se difunde. Se muestran la densidad $\delta\rho(x,t)$, la velocidad
$u(x,t)$ y la temperatura $\delta T(x,t)$. El tiempo se puede arrastrar hacia delante y
hacia atrás porque la solución es cerrada.

## Modelo físico

Las ecuaciones de la hidrodinámica (continuidad, Navier–Stokes y energía) linealizadas en
torno al equilibrio $\rho,\,T,\,u=0$ admiten, para número de onda $k$, cinco modos: dos
sonoros con frecuencia $\omega = \pm c_s k - i\Gamma k^2$, uno térmico con $\omega = -iD_T
k^2$ y dos de cizalla (que no acoplan con la densidad en 1D). Aquí

- $c_s$ es la velocidad adiabática del sonido,
- $\Gamma = \tfrac12\left[\nu_\ell + (\gamma-1)D_T\right]$ es el coeficiente de atenuación
  del sonido ($\nu_\ell$ viscosidad cinemática longitudinal),
- $D_T = \kappa/(\rho c_p)$ es la difusividad térmica,
- $\gamma = c_p/c_v$.

Para la condición inicial **isoterma** $\delta\rho(x,0) = G_\sigma(x)$, $u=0$, $\delta T=0$,
la solución al orden hidrodinámico es

$$ \delta\rho(x,t) = \frac{1}{2\gamma}\Big[G_s(x-c_st,t)+G_s(x+c_st,t)\Big] + \Big(1-\frac1\gamma\Big)\,G_T(x,t), $$

con $G_s$ y $G_T$ gaussianas normalizadas de varianzas $\sigma^2 + 2\Gamma t$ y
$\sigma^2 + 2D_Tt$. Los pesos son los de **Landau y Placzek**: la fracción sonora
(Brillouin) es $1/\gamma = c_v/c_p$ y la térmica (Rayleigh) es $1-1/\gamma = (c_p-c_v)/c_p$,
de modo que el **cociente** Rayleigh/Brillouin es $(c_p-c_v)/c_v = \gamma - 1$. La suma de
pesos es 1: la masa se conserva.

¿De dónde salen esos pesos? El sonido es adiabático, $\delta T_s = (\gamma-1)(T/\rho)\,\delta\rho_s$
(gas ideal), mientras que el modo térmico es isobaro, $\delta T_T = -(T/\rho)\,\delta\rho_T$.
Exigir $\delta T(x,0) = 0$ con $\delta\rho_s + \delta\rho_T = G_\sigma$ da precisamente
$\delta\rho_s = G_\sigma/\gamma$ y $\delta\rho_T = (1-1/\gamma)G_\sigma$. La temperatura es

$$ \delta T(x,t) = \frac{T}{\rho}\Big[(\gamma-1)\,\delta\rho_s - \delta\rho_T\Big], $$

que se anula en $t=0$ y después muestra pulsos calientes viajando con el sonido y un pozo
frío que difunde en el centro.

La velocidad se obtiene de la ecuación de continuidad, $\partial_t\delta\rho + \rho\,\partial_x u = 0$,
integrada en $x$:

$$ u(x,t) = \frac{1}{\rho}\left\{\frac{1}{2\gamma}\Big[c_s\,(G_s^- - G_s^+) - \Gamma\,\partial_x(G_s^-+G_s^+)\Big] - \Big(1-\frac1\gamma\Big)D_T\,\partial_xG_T\right\}, $$

con $G_s^\mp = G_s(x\mp c_st,t)$. El primer término es el que domina: el fluido se mueve
hacia fuera con cada pulso. Los términos con $\Gamma$ y $D_T$ son correcciones difusivas
pequeñas (de orden $\Gamma/c_s\sigma$) que garantizan la conservación exacta de la masa;
su precio es que $u(x,0)$ no es estrictamente cero sino de ese orden. Es la limitación
habitual del ansatz de modos hidrodinámicos con gaussianas que se ensanchan.

## Algoritmo

No hay integración numérica: las tres funciones se evalúan en 601 puntos en cada
fotograma. El bucle de animación sólo avanza $t$.

## Preguntas

1. Separa el modo térmico de los acústicos: ¿qué fracción de la perturbación inicial de densidad se queda sin propagar? Compárala con 1 − 1/γ (Landau–Placzek).
2. Haz γ = 1: ¿qué ocurre con el modo térmico? ¿Qué fluido tiene γ = 1?
3. Aumenta la difusividad térmica D_T: ¿qué modo se ensancha más deprisa? ¿Y al aumentar Γ?

## Cambios respecto al applet original

| Original | Aquí | Motivo |
|---|---|---|
| Peso térmico $(c_p-c_v)/c_v$ con $c_v=1,\,c_p=2$: pesos que suman 1.5 | $(c_p-c_v)/c_p = 1-1/\gamma$; suman 1 | El cociente de Landau–Placzek es Rayleigh/Brillouin, no la fracción de Rayleigh |
| Gaussianas $\propto \sqrt{1/\Gamma t}\,e^{-x^2/\Gamma t}$: varianza $\Gamma t/2$, singulares en $t=0$ | Varianza $\sigma^2 + 2\Gamma t$, normalizadas | Anchura inicial finita y convención estándar $\langle x^2\rangle = 2Dt$ |
| $u$ sin los términos difusivos | $u$ exacta por continuidad | Conservación de masa verificable |
| $\delta T$ con pesos $1/(2\rho c_p)$ y $(c_p-c_v)/c_v$ sin relación clara con los modos | $\delta T$ derivada de sonido adiabático y modo térmico isobaro (gas ideal); $\delta T(x,0)=0$ | Consistencia con la condición inicial |
| Botones D(x), Ux(x), T(x) sin función; las tres curvas apiladas en un mismo marco con desplazamientos arbitrarios | Tres paneles con ejes propios, activables; modos por separado punteados | |
| $\kappa$ como parámetro con $\rho=1,\,c_p=2$ | $D_T$ y $\Gamma$ directamente, más $\gamma$ y $\sigma$ | Son las combinaciones que entran en la física |
| Sólo animación hacia delante | Deslizador de tiempo | La solución es analítica |

## Pruebas

`tests/modos.test.js`: pesos que suman 1 y modo térmico nulo para $\gamma=1$; conservación
de $\int\delta\rho\,dx$ en el tiempo y perfil inicial gaussiano; $\delta T(x,0)=0$,
$u(x,0)$ igual al residuo difusivo previsto y pequeño frente a la amplitud sonora;
antisimetría de $u$; ecuación de continuidad satisfecha numéricamente; comprobación de que
los pesos del original sumaban 1.5.

## Evaluación didáctica

**Qué aporta.** Visualiza de golpe el espectro de Rayleigh–Brillouin de la dispersión de
luz: el pico central (térmico) y los dos laterales (sonoros), sus anchuras ($D_Tk^2$ y
$\Gamma k^2$) y sus pesos relativos $\gamma-1$. Ver $\delta T$ ayuda a entender por qué el
sonido es adiabático y el modo térmico isobaro.

**Mejoras.** Añadir la transformada de Fourier espacial para enseñar literalmente el
espectro $S(k,\omega)$; permitir condición inicial de temperatura (pulso de calor) y de
velocidad (pistón), que reparten los pesos de otra manera; y una versión no lineal
numérica (esquema de Lax–Wendroff) para ver la formación de ondas de choque cuando la
amplitud deja de ser pequeña.
