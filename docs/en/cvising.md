# Dimensionality and thermodynamic limit in the Ising model

## What you see

The exact specific heat of the Ising model on finite $N_x\times N_y$ lattices with periodic boundaries, computed point by point by transfer matrix, against two analytic curves: the infinite one-dimensional chain (smooth) and Onsager's infinite two-dimensional lattice (divergent at $T_c$). Changing $N_x$ and $N_y$ moves from one-dimensional to two-dimensional behaviour, and shows the maximum of $c$ growing and approaching $T_c$ without ever diverging while the lattice is finite.

## Physical model

The Hamiltonian is $H = -J\sum_{\langle ij\rangle} s_i s_j$ with $s_i = \pm1$ (here $J = k_B = 1$). A **phase transition** is a non-analyticity of a thermodynamic potential; for the Ising model it exists in dimension $d \ge 2$ (ferromagnetic phase below $T_c$) and not in $d = 1$. Since the partition function of a finite system is a finite sum of exponentials, it is analytic: the non-analyticity only appears in the **thermodynamic limit** $N \to \infty$ at fixed density. On a finite lattice the specific heat $c = \beta^2\partial^2\ln Z/\partial\beta^2/N$ has a rounded maximum whose height grows (logarithmically in 2D) and whose position tends to $T_c = 2/\ln(1+\sqrt2) \approx 2.269$ as the size grows.

For the infinite chain $c = (J/k_BT)^2/\cosh^2(J/k_BT)$. For the infinite square lattice, Onsager (1944):

$$c = \frac{2}{\pi}\big(K\coth 2K\big)^2\Big[2K_1(\kappa) - 2E_1(\kappa) - (1-\kappa')\Big(\tfrac{\pi}{2} + \kappa' K_1(\kappa)\Big)\Big],$$

with $K = J/k_BT$, $\kappa = 2\sinh 2K/\cosh^2 2K$, $\kappa' = 2\tanh^2 2K - 1$ and $K_1$, $E_1$ the complete elliptic integrals; it diverges logarithmically at $T_c$.

## Algorithm

The symmetric transfer matrix $\mathbf T = H^{1/2}VH^{1/2}$ of dimension $2^{N_x}$ (in-row bond weights in $H$, inter-row bonds in $V$) is diagonalised by Jacobi rotations; $Z = \sum_i\lambda_i^{N_y}$ and $c$ follows from a three-point finite difference in $\beta$. The cost grows as $8^{N_x}$: $N_x \le 7$. Elliptic integrals by the arithmetic–geometric mean.

## Changes with respect to the original applet

| Original (`CalorEspecificoApplet`, 2002) | Here | Reason |
|---|---|---|
| Precomputed matrices and exact curves (tables of constants in the bytecode) | Exact computation in the browser, visible point by point | The student can ask for any $N_x \le 7$, $N_y \le 64$ |
| No indication of $T_c$ or of the maximum | $T_c$, $T_{\max}$ and $c_{\max}$ in the panel; previous curves can be kept | Compare sizes |

## Tests

`tests/fises2.test.js`: $N_x = 1$ reproduces exactly $Z = \lambda_+^N + \lambda_-^N$ of the 60-spin ring and matches the infinite chain for $T \ge 1$; $\ln Z$ of the $2\times2$ torus matches the direct sum over the 16 states; the $6\times6$ maximum is closer to $T_c$ and higher than the $4\times4$ one; Onsager's formula matches the $6\times32$ lattice at $T = 1.6$ and $3.5$ within 0.03, and $K(0) = E(0) = \pi/2$.

## Didactic assessment

It teaches two abstract ideas (critical dimension, thermodynamic limit) with an exact computation, not a simulation: no noise to confuse. It complements experiment 11 (Monte Carlo). Source: *Experimentos Interactivos* course (UCM), Statistical Physics experiment 5, R. Brito.
