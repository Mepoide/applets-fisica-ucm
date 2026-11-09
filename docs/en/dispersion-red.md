# Electron scattering in a linear lattice

## What you see

An electron hits a chain of $N$ atoms represented by δ potentials of strength $\lambda$ spaced $L$. The transmission coefficient $T(E)$ is computed by the transfer-matrix method and compared with the bands of the infinite chain (Kronig–Penney relation). With few atoms resonances show; with many, the transmission is practically 1 in the bands and 0 in the gaps.

## Physical model

In units $\hbar^2/2m = 1$, $-\psi'' + \lambda\sum_n \delta(x - nL)\psi = E\psi$, $E = q^2$. Between atoms $\psi = a_n e^{iqx} + b_n e^{-iqx}$; at each δ the function is continuous and its derivative jumps by $\lambda\psi$, giving a $2\times2$ matrix connecting $(a_n, b_n)$ with $(a_{n+1}, b_{n+1})$. With unit incident wave and only a transmitted one on the right, $T = |t|^2$. For the infinite chain Bloch's theorem gives

$$\cos kL = \cos qL + \frac{\lambda}{2q}\sin qL,$$

with a real solution $k$ only where the right-hand side lies in $[-1, 1]$: the **bands**; elsewhere, **gaps**, centred near $qL = n\pi$ (Bragg reflection). For finite $N$ there are $N - 1$ perfect-transmission resonances per band (quasi-stationary states), and in the gaps $T \sim e^{-2\mu NL}$ with $k = n\pi/L + i\mu$.

## Algorithm

`applets/_schrod/delta.js`: complex amplitudes propagated right to left (final state $(1,0)$, $T = 1/|a_{\rm left}|^2$), 1200 energies computed in chunks; band edges by bisection of $|\cos qL + (\lambda/2q)\sin qL| = 1$. Attractive potentials ($\lambda < 0$) included.

## Changes with respect to the original applet

| Original (2002) | Here | Reason |
|---|---|---|
| $T(E)$ and allowed energies | Same, plus $E(k)$ in the Brillouin zone, shaded bands, resonance count and $T$ in the gap | Connect the finite chain with Bloch's theorem |

## Tests

`tests/fes2.test.js`: one δ reproduces $T = 1/(1 + \lambda^2/4E)$ exactly; 40 atoms with $\lambda = 3$ transmit $T > 0.99$ in the first band and $T < 10^{-4}$ in the first gap; band edges match the Kronig–Penney condition.

## Didactic assessment

It makes energy bands appear by "adding atoms" one by one, the best way to understand them. Source: *Experimentos Interactivos* course (UCM), Solid State Physics experiment 5, F. Domínguez-Adame.
