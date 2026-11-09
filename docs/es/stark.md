# Efecto Stark confinado

## Qué se observa

Un pozo cuántico de barreras infinitas sometido a un campo eléctrico perpendicular: la función de onda se desplaza hacia un lado, la energía del estado fundamental baja cuadráticamente con el campo y la fuerza de oscilador de la transición 1→2 disminuye. Se compara el cálculo numérico con la teoría de perturbaciones.

## Modelo físico

Con $u = z/a$, $E_0 = \hbar^2/2m^*a^2$ y $v = eFa/E_0$,

$$-\chi''(u) - v\,u\,\chi(u) = \varepsilon\chi(u),\qquad \chi(\pm\tfrac12) = 0.$$

A campo nulo $\varepsilon_n = n^2\pi^2$. La corrección de primer orden se anula por paridad; la de segundo orden suma $\sum_{n\,\rm par}|v\,u_{1n}|^2/(\varepsilon_1 - \varepsilon_n)$ con $u_{1n} = \int\chi_1 u\chi_n du$ y da

$$\varepsilon_1 \simeq \pi^2 - \frac{15 - \pi^2}{48\pi^4}v^2 \approx \pi^2 - 1.10\times10^{-3}v^2$$

(la hoja original la aproxima por $\pi^2 - (v/10\pi)^2$, un 8 % menor). La perturbación vale mientras $v \ll 3\pi^2$. La fuerza de oscilador $f_{12} = (\varepsilon_2 - \varepsilon_1)|u_{12}|^2$ vale $3\pi^2(16/9\pi^2)^2 = 0.9607$ a campo nulo y baja con él.

## Algoritmo

Diferencias finitas con $N + 1$ segmentos: matriz tridiagonal con diagonal $2/s^2 - vu_n$; autovalores por Sturm y autovectores por iteración inversa; $u_{12}$ por suma directa. Inicia para barrer el campo.

## Preguntas

1. Para a = 150 Å, ¿hasta qué campo coinciden el cálculo numérico y la perturbación de segundo orden al 1 %? Exprésalo en v = eFa/E₀.
2. Comprueba que el desplazamiento Stark escala como a⁴ comparando a = 100 y 200 Å al mismo campo.
3. Mide f₁₂ frente al campo: ¿a qué campo ha caído a la mitad? ¿A dónde va la fuerza de oscilador que falta?

## Cambios respecto al applet original

| Original (2002) | Aquí | Motivo |
|---|---|---|
| E₁(F) numérica y perturbativa, f₁₂ | Igual, con el coeficiente exacto de segundo orden y la curva f₁₂(F) | Cuantificar el rango de validez |

## Pruebas

`tests/dc.test.js`: a campo nulo ε₁ = π² y f₁₂ = 0.9607 (error < 2·10⁻³); para v = 5, 15 y 30 el resultado numérico coincide con la perturbación de segundo orden dentro del 2 % del desplazamiento; f₁₂ decrece con el campo.

## Evaluación didáctica

Base de los moduladores electroópticos de pozo cuántico; muestra la teoría de perturbaciones frente a un cálculo exacto. Fuente: curso *Experimentos Interactivos* (UCM), experimento 5 de Dispositivos Cuánticos, F. Domínguez-Adame.
