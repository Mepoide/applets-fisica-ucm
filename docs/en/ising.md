# Ising model

## What you see

A square lattice of $\pm1$ spins (yellow/blue) evolving by Monte Carlo at a coupling $K = J/k_BT$ set with the slider. On the right, the magnetisation per spin $m(t)$, its absolute-value average and Onsager's exact spontaneous magnetisation for that $K$. Above the critical temperature ($K < K_c$) domains are small and $m$ fluctuates around zero; below it a majority domain appears and $|m|$ approaches the exact curve.

## Physical model

$H = -J\sum_{\langle ij\rangle}s_is_j$ with $J > 0$ favours parallel spins; temperature disorders them. The competition produces a ferromagnetic **phase transition** in dimension $d \ge 2$. Onsager (1944) solved the square lattice: $K_c = \tfrac12\ln(1+\sqrt2) \approx 0.4407$, i.e. $k_BT_c/J \approx 2.269$, and Yang (1952) obtained the spontaneous magnetisation

$$m_0 = \big(1 - \sinh^{-4}2K\big)^{1/8}\quad (K > K_c),\qquad m_0 = 0\quad (K < K_c),$$

with critical exponent $\beta = 1/8$. On a finite lattice there is no strict transition: $m$ changes sign now and then (more rarely the larger $L$), hence $|m|$ is averaged. Near $K_c$ the correlation length and the relaxation time diverge (critical slowing down): domains come in all sizes and the simulation takes long to equilibrate.

## Algorithm

Metropolis single-spin flips: a random site, $\Delta E = 2Js_ih_i$ with $h_i$ the sum of the four neighbours, accepted with $\min(1,e^{-\Delta E/kT})$ (precomputed nine-entry table). One animation step is a sweep of $L^2$ attempts. Periodic boundaries; $L$ from 16 to 128.

## Changes with respect to the original applet

| Original (`IsingApplet`, 2002) | Here | Reason |
|---|---|---|
| Magnetisation versus $K$ with a line at $K_c$ | $m(t)$, $\langle|m|\rangle$ and the exact Onsager–Yang curve for the current $K$ | Quantitative comparison with the exact solution |
| Sizes up to $50\times50$ | Up to $128\times128$ with an acceptance table | Better view of critical domains |

## Tests

`tests/fises3.test.js`: $m_0(K_c) = 0$ and $m_0(5) \approx 1$; at $K = 0.6$ on $32\times32$ the average of $|m|$ matches Onsager within 0.02; at $K = 0.3$ it is below 0.15; the low-temperature energy per spin is near $-2J$.

## Didactic assessment

The most studied model of statistical physics, with its exact solution alongside for comparison; it complements experiment 5 (exact specific heat). Source: *Experimentos Interactivos* course (UCM), Statistical Physics experiment 11, R. Brito.
