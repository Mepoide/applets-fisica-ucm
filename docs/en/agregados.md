# Optical absorption in molecular aggregates

## What you see

An aggregate of $N$ two-level molecules coupled by the transfer integral $J$ (Frenkel excitons). The Hamiltonian is diagonalised, the oscillator strength of each eigenstate computed and the absorption spectrum built as a sum of Lorentzians. In the ordered aggregate all absorption concentrates in a single state at the lower band edge; with disorder in the site energies it spreads and the bright state localises.

## Physical model

$$H = \sum_n \varepsilon_n|n\rangle\langle n| - J\sum_n\big(|n\rangle\langle n+1| + {\rm h.c.}\big),$$

where $|n\rangle$ is the state with molecule $n$ excited. In the dipole approximation with all dipoles parallel, the coupling of eigenstate $j$ to light is $d_j = d_0\sum_n a_{jn}$ and the spectrum

$$A(E) = \sum_j d_j^2\,\frac{\Gamma/\pi}{(E - E_j)^2 + \Gamma^2},$$

with the sum rule $\sum_j d_j^2 = N d_0^2$. For the periodic chain $E_k = \varepsilon - 2J\cos k$ (band of width $4J$) and only the $k = 0$ state, of energy $\varepsilon - 2J$, has $d^2 = N d_0^2$: the J-aggregate absorption is red-shifted and $N$ times more intense (superradiance). With diagonal disorder $W$ the eigenstates localise on segments of $N^*$ molecules, the oscillator strength spreads and the line broadens inhomogeneously.

## Algorithm

Full diagonalisation (Jacobi, `lib/linalg.js`) of the $N\times N$ Hamiltonian, $N \le 80$; participation ratio $1/\sum_n a_{jn}^4$ of the bright state. Energies in units of $J$ with $\varepsilon = 0$.

## Changes with respect to the original applet

| Original (2002) | Here | Reason |
|---|---|---|
| Spectrum of the ordered aggregate with adjustable width | Same, plus diagonal disorder, oscillator strengths and drawn eigenstates | See where the line comes from and how superradiance breaks |

## Tests

`tests/fes3.test.js`: periodic-chain energies equal $-2\cos(2\pi k/N)$; all strength in $k = 0$ with $d^2 = N$ and participation $N$; sum rule preserved with disorder and bright strength reduced; the symmetric solver satisfies $Av = \lambda v$.

## Didactic assessment

It explains a real spectroscopy (J and H aggregates, photosynthetic antennae) with a one-line tight-binding model. Source: *Experimentos Interactivos* course (UCM), Solid State Physics experiment 10, F. Domínguez-Adame.
