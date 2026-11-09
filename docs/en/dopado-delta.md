# Electronic states in δ-doped GaAs

## What you see

The Thomas–Fermi potential created by an atomic sheet of ionised Si donors in GaAs and the electronic subbands confined in it, computed by finite differences. As the density N_D varies the well deepens and more subbands appear below the Fermi level.

## Physical model

In effective units ($a^* = 100$ Å, Ry$^* = 5.8$ meV) and with $E_F = 0$, the Thomas–Fermi equation for the electron potential is

$$\frac{d^2V}{dz^2} = -\frac{8}{3\pi}[E_F - V]^{3/2} + 8\pi N_D\,\delta(z),$$

whose exact solution is $V(z) = -a^2/(a|z| + z_0)^4$ with $a = 2/15\pi$ and $z_0 = (a^3/\pi N_D)^{1/5}$: the derivative jump at $z = 0$ is $8\pi N_D$ and the potential decays as $|z|^{-4}$. Levels follow from $-\chi'' + V\chi = E\chi$. Since each 2D subband holds $(E_F - E_i)/2\pi$ electrons per $a^{*2}$, the sum of populations should approach $N_D$ (neutrality), the better the more subbands there are: that is the limit in which Thomas–Fermi is exact.

## Algorithm

Grid of $N$ points on $[-c, c]$ with infinite walls at the ends; tridiagonal matrix with diagonal $V_n + 2/s^2$ and off-diagonal $-1/s^2$; eigenvalues by bisection on the Sturm sequence and eigenvectors by inverse iteration (`lib/linalg.js`). Start to sweep $N_D$ and build the level curve.

## Questions

1. How many subbands are occupied for N_D = 1, 5, 10 × 10¹² cm⁻²? How does the well depth scale with N_D?
2. Check neutrality: add the subband populations and compare with N_D. Does the agreement improve as N_D grows? Why?
3. Change the interval c and the grid N: when do the levels stop depending on them? Which level converges worst?

## Changes with respect to the original applet

| Original (2002) | Here | Reason |
|---|---|---|
| Levels for a given N_D | Same, plus wave functions, the E(N_D) curve and the neutrality check | See Thomas–Fermi self-consistency |

## Tests

`tests/dc.test.js`: the potential satisfies the differential equation pointwise (relative error < 10⁻⁴) and the jump condition; levels are increasing and drop as N_D grows.

## Didactic assessment

A nonlinear equation with a closed solution and a transparent numerical eigenvalue calculation; it also shows the physics of high-density quasi-2D electron gases. Source: *Experimentos Interactivos* course (UCM), Quantum Devices experiment 2, F. Domínguez-Adame.
