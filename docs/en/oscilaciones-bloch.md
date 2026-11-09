# Time evolution of electrons under electric fields

## What you see

An electron on a one-dimensional tight-binding lattice, initially on a single atom, under a uniform electric field. Without field the packet spreads ballistically; with field it oscillates: it widens up to a maximum extent $4T/F$ and refocuses on the starting atom every Bloch period $T_B = 2\pi/F$. $|\psi_n(t)|^2$ and the rms radius versus time are drawn.

## Physical model

Semiclassically, $\hbar\dot k = -eE$: the crystal momentum grows up to the zone edge, where the electron is Bragg-reflected and reverses its velocity; the motion is periodic (**Bloch oscillation**) with period $T_B = 2\pi\hbar/eEa$. Quantum mechanically, the discrete Schrödinger equation ($\hbar = a = 1$)

$$i\,\dot\psi_n = (\varepsilon_n + Fn)\psi_n - T(\psi_{n+1} + \psi_{n-1})$$

has as stationary states the Wannier–Stark ladder $E_j = Fj$, with eigenfunctions localised over $\sim 4T/F$ sites (Bessel functions $J_{n-j}(2T/F)$). A localised initial state spreads without field as $r(t) = \sqrt2\,Tt$ (coherent, linear in $t$) and with field "breathes" periodically without escaping: **dynamic localisation**. If the initial state is symmetric the centroid does not move; a packet with non-zero mean momentum would oscillate in position. Diagonal disorder adds Anderson localisation even at zero field.

## Algorithm

Exact diagonalisation of the tridiagonal $N\times N$ Hamiltonian ($N \le 241$) and evolution $\psi(t) = \sum_j c_j e^{-iE_jt}v_j$, exact for any $t$ (no integration error). Radius $r = \sqrt{\sum_n (n-n_0)^2|\psi_n|^2}$.

## Questions

1. With F = 0 check that the radius grows linearly in time, not as √t. What distinguishes this motion from diffusion?
2. With F = 0.2, measure the period of the radius oscillations and compare it with 2π/F. What is the maximum extent? Compare with 4T/F.
3. Add disorder with F = 0: does the radius saturate? Estimate the localisation length and compare it with Solid State experiment 6.

## Changes with respect to the original applet

| Original (2002) | Here | Reason |
|---|---|---|
| $|\psi_n(t)|^2$ and rms radius for a given field | Same, plus the ballistic law $\sqrt2 Tt$, the marked Bloch period, the extent $4T/F$ and optional disorder | Compare with the analytic predictions |

## Tests

`tests/fes3.test.js`: $|\psi_{n_0}(0)|^2 = 1$; without field $r(10) = \sqrt2\cdot10$ within 0.2; with $F = 0.25$ the centroid does not move, the radius returns below 0.2 after $T_B$ and reaches a maximum between $T/F$ and $4.8T/F$.

## Didactic assessment

Bloch oscillations, predicted in 1929 and observed in superlattices in the nineties, connect semiclassical motion with the Wannier–Stark ladder. Source: *Experimentos Interactivos* course (UCM), Solid State Physics experiment 11, F. Domínguez-Adame.
