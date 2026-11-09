# Evolución temporal de electrones bajo campos eléctricos

## Qué se observa

Un electrón en una red unidimensional de enlace fuerte, inicialmente en un solo átomo, bajo un campo eléctrico uniforme. Sin campo el paquete se expande balísticamente; con campo oscila: se ensancha hasta una extensión máxima $4T/F$ y vuelve a concentrarse en el átomo de partida cada periodo de Bloch $T_B = 2\pi/F$. Se dibujan $|\psi_n(t)|^2$ y el radio cuadrático medio frente al tiempo.

## Modelo físico

Semiclásicamente, $\hbar\dot k = -eE$: el momento cristalino crece hasta el borde de zona, donde el electrón sufre reflexión de Bragg e invierte su velocidad; el movimiento es periódico (**oscilación de Bloch**) con periodo $T_B = 2\pi\hbar/eEa$. Cuánticamente, la ecuación de Schrödinger discreta ($\hbar = a = 1$)

$$i\,\dot\psi_n = (\varepsilon_n + Fn)\psi_n - T(\psi_{n+1} + \psi_{n-1})$$

tiene como estados estacionarios la escalera de Wannier–Stark $E_j = Fj$, con autofunciones localizadas en $\sim 4T/F$ sitios (funciones de Bessel $J_{n-j}(2T/F)$). Un estado inicial localizado se expande sin campo como $r(t) = \sqrt2\,Tt$ (coherente, lineal en $t$) y con campo "respira" periódicamente sin escapar: **localización dinámica**. Si el estado inicial es simétrico el centroide no se mueve; un paquete con momento medio no nulo sí oscilaría en posición. El desorden diagonal añade localización de Anderson incluso a campo nulo.

## Algoritmo

Diagonalización exacta del hamiltoniano tridiagonal $N\times N$ ($N \le 241$) y evolución $\psi(t) = \sum_j c_j e^{-iE_jt}v_j$, exacta para cualquier $t$ (sin error de integración). Radio $r = \sqrt{\sum_n (n-n_0)^2|\psi_n|^2}$.

## Cambios respecto al applet original

| Original (2002) | Aquí | Motivo |
|---|---|---|
| $|\psi_n(t)|^2$ y radio cuadrático medio para un campo dado | Igual, más la ley balística $\sqrt2 Tt$, el periodo de Bloch marcado, la extensión $4T/F$ y desorden opcional | Comparar con las predicciones analíticas |

## Pruebas

`tests/fes3.test.js`: $|\psi_{n_0}(0)|^2 = 1$; sin campo $r(10) = \sqrt2\cdot10$ dentro de 0.2; con $F = 0.25$ el centroide no se mueve, el radio vuelve por debajo de 0.2 tras $T_B$ y alcanza un máximo entre $T/F$ y $4.8T/F$.

## Evaluación didáctica

Las oscilaciones de Bloch, predichas en 1929 y observadas en superredes en los años noventa, conectan el movimiento semiclásico con la escalera de Wannier–Stark. Fuente: curso *Experimentos Interactivos* (UCM), experimento 11 de Física del Estado Sólido, F. Domínguez-Adame.
