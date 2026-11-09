# Estados electrónicos en GaAs con dopado delta

## Qué se observa

El potencial de Thomas–Fermi creado por una lámina atómica de donadores de Si ionizados en GaAs y las subbandas electrónicas confinadas en él, calculadas por diferencias finitas. Al variar la densidad N_D el pozo se hace más profundo y aparecen más subbandas bajo el nivel de Fermi.

## Modelo físico

En unidades efectivas ($a^* = 100$ Å, Ry$^* = 5.8$ meV) y con $E_F = 0$, la ecuación de Thomas–Fermi para el potencial de los electrones es

$$\frac{d^2V}{dz^2} = -\frac{8}{3\pi}[E_F - V]^{3/2} + 8\pi N_D\,\delta(z),$$

cuya solución exacta es $V(z) = -a^2/(a|z| + z_0)^4$ con $a = 2/15\pi$ y $z_0 = (a^3/\pi N_D)^{1/5}$: el salto de la derivada en $z = 0$ es $8\pi N_D$ y el potencial decae como $|z|^{-4}$. Los niveles se obtienen de $-\chi'' + V\chi = E\chi$. Como cada subbanda 2D aloja $(E_F - E_i)/2\pi$ electrones por $a^{*2}$, la suma de poblaciones debe aproximarse a $N_D$ (neutralidad), tanto mejor cuantas más subbandas haya: es el límite en que Thomas–Fermi es exacto.

## Algoritmo

Malla de $N$ puntos en $[-c, c]$ con paredes infinitas en los extremos; matriz tridiagonal con diagonal $V_n + 2/s^2$ y codiagonal $-1/s^2$; autovalores por bisección sobre la secuencia de Sturm y autovectores por iteración inversa (`lib/linalg.js`). Inicia para barrer $N_D$ y construir la curva de niveles.

## Cambios respecto al applet original

| Original (2002) | Aquí | Motivo |
|---|---|---|
| Niveles para una N_D dada | Igual, más las funciones de onda, la curva E(N_D) y la comprobación de neutralidad | Ver la autoconsistencia de Thomas–Fermi |

## Pruebas

`tests/dc.test.js`: el potencial satisface la ecuación diferencial punto a punto (error relativo < 10⁻⁴) y la condición de salto; los niveles son crecientes y bajan al aumentar N_D.

## Evaluación didáctica

Una ecuación no lineal con solución cerrada y un cálculo numérico transparente de autovalores; además muestra la física de los gases de electrones casi bidimensionales con alta densidad. Fuente: curso *Experimentos Interactivos* (UCM), experimento 2 de Dispositivos Cuánticos, F. Domínguez-Adame.
