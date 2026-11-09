# Evaluation of the Madelung constant

## What you see

The electrostatic energy of an ion in an ionic crystal such as NaCl is $-\alpha e^2/4\pi\varepsilon_0 R$, where the **Madelung constant** $\alpha$ sums over all the other ions. The experiment adds the series over growing cubes of side $2kR$ around the reference ion in two ways: counting every ion of the whole cube (direct sum) or with Evjen's weights (1/2 on faces, 1/4 on edges, 1/8 at corners). The first oscillates without visible convergence; the second converges in three or four cubes to the exact value $\alpha = 1.747565$.

## Physical model

$$\alpha = \sum_{l,m,n}{}' \frac{(-1)^{l+m+n+1}}{\sqrt{l^2+m^2+n^2}},$$

the prime excluding the origin. The series is **conditionally convergent**: the result depends on the order of summation. A whole cube of side $2k$ carries a net charge $\pm e$ (one more ion of one sign than the other), and the potential of that surface charge at distance $\sim k$ gives an error $\sim 1/k$ alternating in sign with $k$. Evjen's method assigns each surface ion the fraction belonging to the cube (shared with 2, 4 or 8 neighbouring cubes), so that every cube is electrically neutral with no dipole moment; the error then decays as a high power of $1/k$.

## Algorithm

Direct sums over $(2k+1)^3 - 1$ terms for $k = 1,\dots,k_{\max} \le 14$, with and without Evjen weights; the cube charge is computed separately. The cube view shows one face with the ions, opacity proportional to their Evjen weight.

## Changes with respect to the original applet

| Original (2002) | Here | Reason |
|---|---|---|
| Partial sums of both methods | Same, plus the net cube charge and relative errors in the panel | Explain the oscillation |

## Tests

`tests/fes1.test.js`: Evjen at $k = 6$ is within $2\cdot10^{-4}$ of the exact value and within 0.01 at $k = 2$; the direct sum at $k = 6$ is off by more than 0.03 and alternates the sign of its error; cube charges are $\pm1$.

## Didactic assessment

A clean example that "summing to infinity" requires saying how, and of why ionic crystals are stable. Source: *Experimentos Interactivos* course (UCM), Solid State Physics experiment 1, F. Domínguez-Adame.
