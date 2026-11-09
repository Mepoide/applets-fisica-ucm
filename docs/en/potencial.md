# Diffusion in an external potential

## What you see

Many independent Brownian particles move on a one-dimensional lattice under a potential $V(x)$ that can be a parabola or a symmetric or asymmetric sawtooth. On the left, the particles sit on the potential next to a bar measuring $kT$ on the same energy scale. On the right, the time-accumulated position histogram against the Boltzmann state $p_i \propto e^{-V_i/kT}$. Lowering the temperature concentrates the particles in the minimum; raising it a lot makes them ignore the potential.

## Physical model

A random walker jumping left or right with probability $1/2$ is the minimal model of free Brownian motion. In a potential, the jump probabilities from $i$ to $i \pm 1$ are modified by the **Metropolis** rule:

$$P(i \to i\pm1) = \tfrac12 \min\!\big(1,\, e^{-[V(i\pm1)-V(i)]/kT}\big).$$

Going down in energy is always accepted; going up, with the Boltzmann probability of the jump. The rule satisfies detailed balance with the state

$$p_i^{\rm st} = \frac{e^{-V_i/kT}}{Z},\qquad Z = \sum_j e^{-V_j/kT},$$

which is therefore the stationary distribution, and the dynamics describes relaxation to thermal equilibrium. With $N$ independent particles the mean number at site $i$ is $N p_i$. Thermal fluctuations let a particle gain energies of order $kT$, and very few exceed that value: the $kT$ bar next to the potential makes it visible.

## Algorithm

`applets/_walkers/metropolis.js`: `L = 81` sites on $x \in [-1, 1]$, $V_{\max} = 4$ at the edges; each step every particle proposes $\pm1$ at random and accepts by Metropolis; the ends are reflecting (a jump outside is rejected). The histogram accumulates the instantaneous occupation at every step and is normalised. $\chi^2/{\rm dof}$ is computed over sites with expected count $\ge 5$ and, since consecutive samples are correlated, it is only indicative (green if $< 3$).

## Changes with respect to the original applet

| Original (`ejerc1`, 2002) | Here | Reason |
|---|---|---|
| Histogram over 200 steps | Unbounded accumulation with a clear button | Arbitrary statistics and control of the transient |
| Vertical axis set by the Boltzmann maximum | Same, plus $\chi^2/{\rm dof}$ and $Z$ in the panel | Quantitative comparison |
| $kT$ by a linear scrollbar | Logarithmic slider ($10^{-2}$ to $16$) | Explore the limits $kT \to 0$ and $kT \gg V$ |

## Tests

`tests/metropolis.test.js`: Boltzmann normalised and a delta at the minimum for $kT = 0$; with $kT = 0$ every particle ends at the parabola minimum; for the three potentials with $kT = 1$ the accumulated histogram is indistinguishable from the Boltzmann state ($\chi^2$, $p > 0.01$ with thinned samples); with $kT = 10^6$ the occupation is uniform.

## Didactic assessment

It is the basis of experiments 8 (Arrhenius) and 9 (stochastic resonance), which use the same module. The main interactivity is the real-time temperature: watching the histogram rebuild as it moves teaches what "equilibrium state" means. Source: *Experimentos Interactivos* course (UCM), experiment 7 of Non-equilibrium Systems, R. Brito and J. M. R. Parrondo.
