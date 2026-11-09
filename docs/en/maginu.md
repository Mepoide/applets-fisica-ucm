# Chemical reactions: Maginu model

## What you see

A stochastic cellular automaton of two chemical species that react and diffuse. On the left, the map of the local concentration of one species (or of their difference); on the right, the phase plane $(c_1, c_2)$ with the limit cycle of the macroscopic equations and, on top, the trajectory of the lattice-mean concentration. The scale parameter $s$ sets how much diffusion happens per reaction step: with large $s$ the lattice oscillates in unison and the mean travels along the cycle; with small $s$ cells oscillate out of phase, the map fills with patches and the mean stays near the centre.

## Physical model

The concentrations $c_i(\mathbf x, t)$ of a reaction–diffusion system obey $\partial_t c_i = \phi_i(\{c\}) + D_i\nabla^2 c_i$. If diffusion is fast compared with reaction the system stays homogeneous and the stationary states solve $\phi_i = 0$; depending on $\phi_i$ there may be several, periodic oscillations or chaos. If diffusion is slow, local fluctuations are not averaged out and rings, spirals, chemical turbulence or, with $D_1 \ne D_2$, Turing patterns appear.

The Maginu model is

$$\partial_t c_1 = c_1 - \tfrac13 c_1^3 - c_2 + D\nabla^2 c_1,\qquad \partial_t c_2 = \frac{c_1 - k\,c_2}{c} + D\nabla^2 c_2,$$

with $c > 0$ and $0 < k < 1$ (here $k = 0.9$, $c = 2$, $D_1 = D_2$). It is a FitzHugh–Nagumo-type relaxation oscillator: the homogeneous system has a single unstable fixed point surrounded by a stable limit cycle, the blue curve.

The automaton treats every cell as a small reactor with an integer number of particles $n_i \le n_{\max}$ of each species ($c_i$ is a linear function of $n_i$). **Diffusion** exchanges particles between random neighbouring cells, conserving the total; **reaction** changes $n_i$ by a random amount of mean $\phi_i\,\Delta t$ in particle units (Poisson sampling, *τ-leaping*). The noise is that of a finite number of molecules per cell: with small $n_{\max}$ fluctuations are large and the mean cycle blurs.

## Algorithm

Periodic lattice of $n\times n$ cells (20–120). Each step: $s$ diffusion sweeps (every cell hands a random neighbour up to half of its excess) and one reaction with $\Delta t = 0.1$. Limit cycle by 4th-order Runge–Kutta of the homogeneous system (discarding $t < 300$); period from the zero crossings of $c_1$. The indicator compares the amplitude of $\langle c_1\rangle$ over the last period with that of the cycle.

## Changes with respect to the original applet

| Original (`ejerc5`, 2002) | Here | Reason |
|---|---|---|
| Automaton with precomputed transition tables (`trans[][][][]`) | Poisson stochastic reaction on the Maginu equations | Direct traceability between equation and simulation |
| Limit cycle drawn as a fixed figure | Cycle integrated with the same $k$, $c$ and the live mean trajectory | See the convergence (or not) to the cycle |
| Scale $s$ 1–20 and species/tone selectors | Same, plus $n_{\max}$ (noise level) and variable lattice | Explore the role of fluctuations |

## Tests

`tests/maginu.test.js`: the homogeneous system converges to a limit cycle of stable amplitude (< 2 % drift) and period between 2 and 40; diffusion conserves the particle number exactly; the Poisson sampler has the right mean; with $s = 15$ the spatial mean oscillates with amplitude > 0.8 and follows the ODE integrated from the same initial state.

## Didactic assessment

It is the only experiment of the block with emergent spatial structure, and connects chemical kinetics with fluctuations (the number of molecules per cell). Source: *Experimentos Interactivos* course (UCM), experiment 5 of Non-equilibrium Systems, R. Brito and J. M. R. Parrondo.
