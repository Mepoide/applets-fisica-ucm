# Plane waves for band-structure calculations

## What you see

The band structure $E(k)$ of an electron in the Mathieu potential $V(x) = V_0\cos 2x$, computed by expanding the wave function in $2M+1$ plane waves and diagonalising the resulting matrix. Varying $V_0$ moves from the free electron (folded parabolas) to narrow tight-binding bands; varying $M$ shows which bands are converged and which are not.

## Physical model

With $\hbar^2/2m = 1$ (energies in Rydberg) and $\psi_k = \sum_l b_l e^{i(k+2l)x}$ (period $L = \pi$, reciprocal-lattice vectors $k_l = 2l$), the Schrödinger equation becomes

$$\big[(k+2l)^2 - E\big]b_l + \sum_m V(k_m)\,b_{l-m} = 0,$$

and since the only Fourier coefficients of the cosine are $V(\pm2) = V_0/2$, the matrix is tridiagonal: diagonal $(k+2l)^2$, off-diagonal $V_0/2$. Its eigenvalues for each $k \in [-1, 1]$ (first Brillouin zone, units of $\pi/L$) are the bands. In the nearly-free-electron limit the zone-boundary gap equals $2|V(2)| = V_0$ (degenerate perturbation theory); for large $V_0$ the low bands flatten towards the oscillator levels in each well. Truncating the basis to $|l| \le M$ only converges bands with $E \ll (2M)^2$.

## Algorithm

Eigenvalues of the symmetric tridiagonal matrix by bisection on the Sturm sequence (`lib/linalg.js`), 121 values of $k$, $M \le 20$. The convergence indicator compares the first gap with that obtained with $M + 4$.

## Questions

1. How many plane waves are needed for the lowest gap to converge to 1 %? And the third one?
2. With a weak potential, compare the width of the first gap with the perturbative prediction 2|V₁|. Up to which V₁ does perturbation theory hold?
3. Make the potential very strong: what do the bands look like? Relate it to the tight-binding limit.

## Changes with respect to the original applet

| Original (2002) | Here | Reason |
|---|---|---|
| $E(k)$ for given $V_0$ and number of plane waves | Same, with the folded free electron behind, the gap compared with the $V_0$ prediction and the convergence test | Understand what each parameter approximates |

## Tests

`tests/fes2.test.js`: with $V_0 = 0$ the parabolas $(k + 2l)^2$ are recovered; the first gap with $V_0 = 0.4$ equals $0.4 \pm 0.03$; the gap does not change from $M = 5$ to $M = 12$; the tridiagonal solver reproduces known eigenvalues.

## Didactic assessment

The plane-wave method underlies modern band calculations; here it appears in its minimal version, convergence limits included. Source: *Experimentos Interactivos* course (UCM), Solid State Physics experiment 7, F. Domínguez-Adame.
