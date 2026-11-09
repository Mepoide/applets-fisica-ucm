# Boson and fermion statistics

## What you see

$N$ bosons (left) and $N$ fermions (right) on a ladder of equally spaced levels $\varepsilon_i = i$ in contact with a bath at temperature $kT$, simulated by Monte Carlo. Each dot is a particle; red bars are the accumulated mean occupation of each level; in blue, the exact canonical-ensemble occupation; in dotted grey, the grand-canonical Bose–Einstein and Fermi–Dirac formulas. At low temperature bosons pile up in the ground level and fermions fill the first $N$ levels up to the Fermi level.

## Physical model

The symmetry of the wave function under permutations separates particles into **fermions** (antisymmetric: at most one per state, Pauli exclusion) and **bosons** (symmetric: any number per state). In the grand canonical ensemble the grand partition function factorises over levels and the mean occupations are

$$\langle n_i\rangle_{\rm BE} = \frac{1}{z^{-1}e^{\varepsilon_i/kT}-1},\qquad \langle n_i\rangle_{\rm FD} = \frac{1}{z^{-1}e^{\varepsilon_i/kT}+1},$$

with the fugacity $z = e^{\mu/kT}$ fixed by $\sum_i\langle n_i\rangle = N$. The $+1$ guarantees $\langle n\rangle_{\rm FD} \le 1$; the $-1$ allows huge ground-state occupations as $z \to 1$: **Bose condensation**. At $T = 0$ fermions occupy levels $0,\dots,N-1$ and the Fermi level is $\varepsilon_F = N-1$. At $kT \gg N$ both tend to Boltzmann.

With few particles the grand canonical ensemble is not equivalent to the canonical one: for fixed $N$ the exact occupations follow from the recursion of canonical partition functions $Z_N = \frac1N\sum_{k=1}^N (\pm1)^{k+1} Z_1(k\beta) Z_{N-k}$ ($+$ bosons, $-$ fermions). For bosons the grand-canonical formula overstates the ground-state occupation, because in that ensemble its fluctuations are of order $N$. The Monte Carlo, which conserves $N$, reproduces the canonical result.

## Algorithm

Markov chain over occupation configurations $\{n_i\}$, which are the quantum states of the identical-particle system: a particle is picked at random (level $i$ with probability $n_i/N$), a uniform level $j$ is proposed and accepted with $\min(1, e^{-(\varepsilon_j-\varepsilon_i)/kT}\,(n_j+1)/n_i)$ for bosons (Metropolis–Hastings correction for the asymmetric proposal) and $\min(1, e^{-\Delta\varepsilon/kT})$ for fermions if the level is empty. 30 levels; $N \le 20$.

## Changes with respect to the original applet

| Original (`BEFDApplet`, 2002) | Here | Reason |
|---|---|---|
| Monte Carlo compared with the grand-canonical formulas (3) | Exact canonical and grand canonical both drawn, their small-$N$ difference explained | The MC conserves $N$: the right comparison is the canonical one |
| Exchanges with Boltzmann probability and no proposal correction | Metropolis–Hastings with the factor $(n_j+1)/n_i$ | Without it the chain does not sample the bosonic equilibrium distribution |

## Tests

`tests/fises3.test.js`: grand-canonical occupations are normalised and respect Pauli; at $kT = 0.2$ more than 8 of 10 bosons sit in the ground level and the fermionic staircase drops at $\varepsilon_F = 9$; canonical and grand canonical agree for fermions and differ for bosons at $N = 10$; the Monte Carlo reproduces the canonical occupations with maximum error $< 0.12$ for both statistics.

## Didactic assessment

It makes the exclusion principle and Bose condensation visible particle by particle, and along the way the non-equivalence of ensembles in small systems. Source: *Experimentos Interactivos* course (UCM), Statistical Physics experiment 10, R. Brito.
